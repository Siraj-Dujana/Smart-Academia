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

    // Fetch recent quiz attempts
    const quizAttempts = await QuizAttempt.find({ student: studentId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("quiz", "title");

    // Fetch recent lab submissions
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
        });
      }
    });

    quizAttempts.forEach(qa => {
      if (qa.quiz) {
        activities.push({
          icon: "quiz",
          title: qa.quiz.title,
          description: `Quiz attempt — ${qa.score}% (${qa.passed ? "Passed" : "Failed"})`,
          time: timeAgo(qa.createdAt),
          timestamp: qa.createdAt,
        });
      }
    });

    labSubmissions.forEach(ls => {
      if (ls.lab) {
        activities.push({
          icon: "science",
          title: ls.lab.title,
          description: `Lab submitted${ls.status === "graded" ? ` — ${ls.marks} marks` : ""}`,
          time: timeAgo(ls.submittedAt),
          timestamp: ls.submittedAt,
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

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

module.exports = router;