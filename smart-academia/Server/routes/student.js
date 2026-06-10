const express      = require("express");
const router       = express.Router();
const LessonProgress = require("../models/LessonProgress");
const QuizAttempt  = require("../models/QuizAttempt");
const LabSubmission = require("../models/LabSubmission");
const { protect, authorize } = require("../middleware/authMiddleware");

// GET /api/student/recent-activities
router.get("/recent-activities", protect, authorize("student"), async (req, res) => {
  try {
    const studentId = req.user._id;

    // Fetch recent lesson views
    const lessonProgress = await LessonProgress.find({
      student: studentId,
      lessonViewed: true,
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("lesson", "title");

    // Fetch recent quiz attempts (include attempt number)
    const quizAttempts = await QuizAttempt.find({ student: studentId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("quiz", "title");

    // Fetch recent lab submissions (include attempt number)
    const labSubmissions = await LabSubmission.find({ student: studentId })
      .sort({ submittedAt: -1 })
      .limit(5)
      .populate("lab", "title");

    // Merge and format activities
    const activities = [];

    lessonProgress.forEach(lp => {
      if (lp.lesson) {
        activities.push({
          icon: "menu_book",
          title: lp.lesson.title,
          description: lp.isCompleted ? "Completed lesson" : "Viewed lesson",
          time: timeAgo(lp.updatedAt),
          timestamp: lp.updatedAt,
          type: "lesson",
        });
      }
    });

    quizAttempts.forEach(qa => {
      if (qa.quiz) {
        activities.push({
          icon: "quiz",
          title: qa.quiz.title,
          description: `Attempt #${qa.attemptNumber || 1} — ${qa.score}% (${qa.passed ? "✓ Passed" : "✗ Failed"})`,
          time: timeAgo(qa.createdAt),
          timestamp: qa.createdAt,
          type: "quiz",
          attemptNumber: qa.attemptNumber,
          score: qa.score,
          passed: qa.passed,
        });
      }
    });

    labSubmissions.forEach(ls => {
      if (ls.lab) {
        let description = `Attempt #${ls.attemptNumber || 1} — `;
        if (ls.status === "graded") {
          description += `Graded: ${ls.marks} marks`;
        } else if (ls.aiSuggestedMarks) {
          description += `AI Score: ${ls.aiSuggestedMarks} marks — Pending review`;
        } else {
          description += `Submitted, awaiting evaluation`;
        }
        
        activities.push({
          icon: "science",
          title: ls.lab.title,
          description: description,
          time: timeAgo(ls.submittedAt),
          timestamp: ls.submittedAt,
          type: "lab",
          attemptNumber: ls.attemptNumber,
          status: ls.status,
          marks: ls.marks || ls.aiSuggestedMarks,
        });
      }
    });

    // Sort by most recent and return top 10
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({ activities: activities.slice(0, 10) });
  } catch (err) {
    console.error("recent-activities error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ NEW: Get ALL quiz attempts for a specific quiz (for analytics)
router.get("/quiz/:quizId/attempts", protect, authorize("student"), async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.user._id;

    const attempts = await QuizAttempt.find({
      quiz: quizId,
      student: studentId,
    })
      .sort({ attemptNumber: 1 })
      .select("attemptNumber score passed submittedAt timeTaken");

    const quiz = await require("../models/Quiz").findById(quizId);
    const passingScore = quiz?.passingScore || 70;

    res.status(200).json({
      attempts: attempts.map(a => ({
        attemptNumber: a.attemptNumber,
        score: a.score,
        passed: a.passed,
        submittedAt: a.submittedAt,
        timeTaken: a.timeTaken,
      })),
      totalAttempts: attempts.length,
      bestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : null,
      passed: attempts.some(a => a.passed),
      passingScore: passingScore,
    });
  } catch (err) {
    console.error("GET /quiz/:quizId/attempts error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ NEW: Get ALL lab attempts for a specific lab (for analytics)
router.get("/lab/:labId/attempts", protect, authorize("student"), async (req, res) => {
  try {
    const { labId } = req.params;
    const studentId = req.user._id;

    const attempts = await LabSubmission.find({
      lab: labId,
      student: studentId,
    })
      .sort({ attemptNumber: 1 })
      .select("attemptNumber submittedAt aiSuggestedMarks marks status feedback");

    const lab = await require("../models/Lab").findById(labId);
    const totalMarks = lab?.totalMarks || 100;

    res.status(200).json({
      attempts: attempts.map(a => ({
        attemptNumber: a.attemptNumber,
        submittedAt: a.submittedAt,
        aiScore: a.aiSuggestedMarks,
        teacherScore: a.marks,
        finalScore: a.marks || a.aiSuggestedMarks,
        percentage: (a.marks || a.aiSuggestedMarks) ? Math.round(((a.marks || a.aiSuggestedMarks) / totalMarks) * 100) : null,
        status: a.status,
        feedback: a.feedback,
      })),
      totalAttempts: attempts.length,
      bestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.marks || a.aiSuggestedMarks || 0)) : null,
      bestAttempt: attempts.length > 0 ? attempts.reduce((best, a) => {
        const score = a.marks || a.aiSuggestedMarks || 0;
        return score > (best.score || 0) ? { attemptNumber: a.attemptNumber, score } : best;
      }, {}) : null,
    });
  } catch (err) {
    console.error("GET /lab/:labId/attempts error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ NEW: Get quiz performance summary across all quizzes
router.get("/quiz-performance-summary", protect, authorize("student"), async (req, res) => {
  try {
    const studentId = req.user._id;

    // Get all quiz attempts grouped by quiz
    const quizStats = await QuizAttempt.aggregate([
      { $match: { student: studentId } },
      { $group: {
        _id: "$quiz",
        attempts: { $sum: 1 },
        bestScore: { $max: "$score" },
        lastAttempt: { $max: "$submittedAt" },
        passed: { $max: { $cond: [{ $eq: ["$passed", true] }, 1, 0] } }
      }}
    ]);

    res.status(200).json({
      quizzes: quizStats,
      totalQuizzes: quizStats.length,
      averageBestScore: quizStats.length > 0 ? Math.round(quizStats.reduce((a, b) => a + b.bestScore, 0) / quizStats.length) : null,
    });
  } catch (err) {
    console.error("quiz-performance-summary error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ NEW: Get lab performance summary across all labs
router.get("/lab-performance-summary", protect, authorize("student"), async (req, res) => {
  try {
    const studentId = req.user._id;

    // Get all lab submissions grouped by lab
    const labStats = await LabSubmission.aggregate([
      { $match: { student: studentId } },
      { $group: {
        _id: "$lab",
        attempts: { $sum: 1 },
        bestScore: { $max: { $ifNull: ["$marks", "$aiSuggestedMarks"] } },
        lastAttempt: { $max: "$submittedAt" },
        status: { $last: "$status" }
      }}
    ]);

    res.status(200).json({
      labs: labStats,
      totalLabs: labStats.length,
      averageBestScore: labStats.length > 0 ? Math.round(labStats.reduce((a, b) => a + (b.bestScore || 0), 0) / labStats.length) : null,
    });
  } catch (err) {
    console.error("lab-performance-summary error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

module.exports = router;