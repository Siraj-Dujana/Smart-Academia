// controllers/aiProgressController.js
// AI-powered weak area detection + performance trend analysis
// Works for both students (self-view) and teachers (class-view)

const { GoogleGenAI } = require("@google/genai");
const Enrollment     = require("../models/Enrollment");
const LessonProgress = require("../models/LessonProgress");
const QuizAttempt    = require("../models/QuizAttempt");
const LabSubmission  = require("../models/LabSubmission");
const Quiz           = require("../models/Quiz");
const Question       = require("../models/Question");
const Lab            = require("../models/Lab");
const Lesson         = require("../models/Lesson");
const Course         = require("../models/Course");
const User           = require("../models/User");

// Helper function - MUST match the one in analyticsController.js
function computeWeightedScore(progressPct, quizAvg, labAvg) {
  // If we have all three dimensions (course has both quizzes AND labs)
  if (quizAvg != null && labAvg != null) {
    return Math.round(progressPct * 0.5 + quizAvg * 0.3 + labAvg * 0.2);
  }
  // Only quizzes exist in this course
  if (quizAvg != null) {
    return Math.round(progressPct * 0.6 + quizAvg * 0.4);
  }
  // Only labs exist in this course
  if (labAvg != null) {
    return Math.round(progressPct * 0.7 + labAvg * 0.3);
  }
  // Only lessons (no quizzes, no labs)
  return Math.round(progressPct);
}

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ─────────────────────────────────────────────────────────────
// STUDENT: Analyze own weak areas & trends
// GET /api/ai-progress/student
// ─────────────────────────────────────────────────────────────
const analyzeStudentProgress = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Fetch all enrollments
    const enrollments = await Enrollment.find({ student: studentId })
      .populate("course", "title code credits")
      .lean();

    if (!enrollments.length) {
      return res.status(200).json({
        weakAreas: [],
        strengths: [],
        trends: [],
        studyPlan: [],
        summary: "You haven't enrolled in any courses yet. Enroll in a course to get personalized analysis.",
        overallScore: 0,
      });
    }

    const courseIds = enrollments.map(e => e.course._id);

    // Parallel data fetch - same as analyticsController
    const [allLessonProgress, allQuizAttempts, allLabSubmissions, allLessons, allQuizzes, allLabs] = await Promise.all([
      LessonProgress.find({ student: studentId, course: { $in: courseIds } })
        .populate("lesson", "title order duration points requiresQuiz requiresLab")
        .lean(),
      QuizAttempt.find({ student: studentId, course: { $in: courseIds } })
        .populate("quiz", "title passingScore maxAttempts timeLimit lesson")
        .lean(),
      LabSubmission.find({ student: studentId, course: { $in: courseIds } })
        .populate("lab", "title totalMarks lesson difficulty")
        .lean(),
      Lesson.find({ course: { $in: courseIds }, isPublished: true })
        .select("title order course points requiresQuiz requiresLab duration")
        .lean(),
      Quiz.find({ course: { $in: courseIds }, isPublished: true })
        .select("title course lesson passingScore maxAttempts timeLimit")
        .lean(),
      Lab.find({ course: { $in: courseIds }, isPublished: true })
        .select("title course lesson totalMarks difficulty")
        .lean(),
    ]);

    // Build lookup maps
    const progressByLesson = {};
    allLessonProgress.forEach(p => {
      progressByLesson[p.lesson?._id?.toString()] = p;
    });

    const attemptsByQuiz = {};
    allQuizAttempts.forEach(a => {
      const qId = a.quiz?._id?.toString();
      if (!qId) return;
      if (!attemptsByQuiz[qId]) attemptsByQuiz[qId] = [];
      attemptsByQuiz[qId].push(a);
    });

    const submissionByLab = {};
    allLabSubmissions.forEach(s => {
      const lId = s.lab?._id?.toString();
      if (!lId) return;
      submissionByLab[lId] = s;
    });

    // Group lessons/quizzes/labs by course
    const lessonsByCourse = {};
    allLessons.forEach(l => {
      const cId = l.course.toString();
      if (!lessonsByCourse[cId]) lessonsByCourse[cId] = [];
      lessonsByCourse[cId].push(l);
    });

    const quizzesByCourse = {};
    allQuizzes.forEach(q => {
      const cId = q.course.toString();
      if (!quizzesByCourse[cId]) quizzesByCourse[cId] = [];
      quizzesByCourse[cId].push(q);
    });

    const labsByCourse = {};
    allLabs.forEach(l => {
      const cId = l.course.toString();
      if (!labsByCourse[cId]) labsByCourse[cId] = [];
      labsByCourse[cId].push(l);
    });

    // Build per-course analytics (SAME as analyticsController)
    const courseSnapshots = enrollments.map(enrollment => {
      const course = enrollment.course;
      const courseId = course._id.toString();
      const lessons = (lessonsByCourse[courseId] || []).sort((a, b) => a.order - b.order);
      const quizzes = quizzesByCourse[courseId] || [];
      const labs = labsByCourse[courseId] || [];

      const lessonDetails = lessons.map(lesson => {
        const lId = lesson._id.toString();
        const prog = progressByLesson[lId];

        // Find quiz & lab for this lesson (ONLY attached to this lesson)
        const lessonQuiz = quizzes.find(q => q.lesson?.toString() === lId);
        const lessonLab = labs.find(l => l.lesson?.toString() === lId);

        let quizDetail = null;
        if (lessonQuiz) {
          const qId = lessonQuiz._id.toString();
          const attempts = attemptsByQuiz[qId] || [];
          const best = attempts.length
            ? attempts.reduce((a, b) => a.score > b.score ? a : b, attempts[0])
            : null;
          quizDetail = {
            bestScore: best?.score ?? null,
            passed: attempts.some(a => a.passed),
            totalAttempts: attempts.length,
          };
        }

        let labDetail = null;
        if (lessonLab) {
          const sub = submissionByLab[lessonLab._id.toString()];
          labDetail = {
            submitted: !!sub,
            status: sub?.status ?? "not_submitted",
            scorePercent: sub?.marks != null
              ? Math.round((sub.marks / (lessonLab.totalMarks || 100)) * 100)
              : null,
          };
        }

        return {
          lessonId: lesson._id,
          title: lesson.title,
          order: lesson.order,
          requiresQuiz: lesson.requiresQuiz,
          requiresLab: lesson.requiresLab,
          isCompleted: prog?.isCompleted ?? false,
          quiz: quizDetail,
          lab: labDetail,
        };
      });

      // Calculate course-level stats (SAME as analyticsController)
      const totalLessons = lessonDetails.length;
      const completedLessons = lessonDetails.filter(l => l.isCompleted).length;
      const progressScore = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      // Quiz stats - ONLY from lessons that have quizzes
      const quizDetails = lessonDetails.filter(l => l.quiz).map(l => l.quiz);
      const quizScores = quizDetails.filter(q => q.bestScore != null).map(q => q.bestScore);
      const avgQuizScore = quizScores.length
        ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
        : null;

      // Lab stats - ONLY from lessons that have labs
      const labDetails = lessonDetails.filter(l => l.lab).map(l => l.lab);
      const labScores = labDetails.filter(l => l.scorePercent != null).map(l => l.scorePercent);
      const avgLabScore = labScores.length
        ? Math.round(labScores.reduce((a, b) => a + b, 0) / labScores.length)
        : null;

      // Weighted score (using the helper function)
      const weightedScore = computeWeightedScore(progressScore, avgQuizScore, avgLabScore);
      const creditsEarned = ((weightedScore || 0) / 100) * (course.credits || 0);

      return {
        course: course.title,
        code: course.code,
        progress: enrollment.progress || 0,
        isCompleted: enrollment.isCompleted || false,
        avgQuizScore,
        avgLabScore,
        totalQuizzes: quizDetails.length,
        totalLabs: labDetails.length,
        completedLessons,
        totalLessons,
        weightedScore,
        creditsEarned,
      };
    });

    // Overall analytics (SAME as analyticsController)
    const totalCourses = courseSnapshots.length;
    const completedCourses = courseSnapshots.filter(c => c.isCompleted).length;
    const totalCredits = courseSnapshots.reduce((s, c) => s + (c.credits || 0), 0);
    const earnedCredits = courseSnapshots.reduce((s, c) => s + c.creditsEarned, 0);
    const overallProgress = courseSnapshots.length
      ? Math.round(courseSnapshots.reduce((s, c) => s + c.progress, 0) / courseSnapshots.length)
      : 0;

    const allQuizScores = courseSnapshots.flatMap(c => 
      c.avgQuizScore !== null ? [c.avgQuizScore] : []
    );
    const overallQuizAvg = allQuizScores.length
      ? Math.round(allQuizScores.reduce((a, b) => a + b, 0) / allQuizScores.length)
      : null;

    const allLabScores = courseSnapshots.flatMap(c =>
      c.avgLabScore !== null ? [c.avgLabScore] : []
    );
    const overallLabAvg = allLabScores.length
      ? Math.round(allLabScores.reduce((a, b) => a + b, 0) / allLabScores.length)
      : null;

    // Overall weighted score (matches analyticsController logic)
    let overallScore;
    if (overallQuizAvg !== null && overallLabAvg !== null) {
      overallScore = Math.round(overallProgress * 0.4 + overallQuizAvg * 0.35 + overallLabAvg * 0.25);
    } else if (overallQuizAvg !== null) {
      overallScore = Math.round(overallProgress * 0.6 + overallQuizAvg * 0.4);
    } else if (overallLabAvg !== null) {
      overallScore = Math.round(overallProgress * 0.7 + overallLabAvg * 0.3);
    } else {
      overallScore = Math.round(overallProgress);
    }

    // Build AI prompt with the SAME data structure
    const dataForAI = JSON.stringify(courseSnapshots, null, 2);
    const prompt = `You are an expert educational AI analyzer. Analyze this student's performance data and provide actionable insights.

IMPORTANT: 
- Only quizzes and labs that appear in the data are the ones attached to lessons.
- If a course has no quizzes or labs in the data, do NOT mention missing quizzes/labs.
- The student completed the course if isCompleted is true.
- A course with only lessons (no quizzes, no labs) will have avgQuizScore = null and avgLabScore = null.
- For such courses, the weightedScore equals the progressScore (100% if all lessons completed).

STUDENT PERFORMANCE DATA (per course):
${dataForAI}

OVERALL METRICS:
- Average Quiz Score: ${overallQuizAvg !== null ? overallQuizAvg : "No quizzes taken"}
- Average Lab Score: ${overallLabAvg !== null ? overallLabAvg : "No labs taken"}
- Average Course Progress: ${overallProgress}%
- Weighted Overall Score: ${overallScore}%

Analyze the data and return ONLY valid JSON:
{
  "weakAreas": [
    { "area": "topic/skill name", "reason": "specific explanation", "severity": "high|medium|low", "course": "course name" }
  ],
  "strengths": [
    { "area": "topic/skill name", "reason": "specific explanation", "course": "course name" }
  ],
  "trends": [
    { "trend": "trend description", "direction": "improving|declining|stable", "detail": "specific explanation" }
  ],
  "studyPlan": [
    { "action": "specific action", "priority": "high|medium|low", "timeframe": "e.g. this week", "reason": "why this helps" }
  ],
  "summary": "2-3 sentence overall assessment"
}

Rules:
- weakAreas: ONLY if quiz scores < 60% or lab scores < 60% for courses that HAVE them.
- Do NOT mention "0 quizzes attempted" if the course has no quizzes.
- Be specific, reference actual course names.
- If all courses are completed with no quizzes/labs, provide positive reinforcement.`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    let text = (response.text || "").trim()
      .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch {
      analysis = {
        weakAreas: [],
        strengths: [],
        trends: [],
        studyPlan: [],
        summary: "Keep working consistently to improve your performance.",
      };
    }

    res.status(200).json({
      ...analysis,
      overallScore,
      metrics: {
        overallQuizAvg: overallQuizAvg !== null ? overallQuizAvg : 0,
        overallLabAvg: overallLabAvg !== null ? overallLabAvg : 0,
        overallProgress,
        totalCourses,
        completedCourses,
        totalCredits,
        earnedCredits: earnedCredits.toFixed(1),
      },
      courseSnapshots,
    });

  } catch (err) {
    console.error("analyzeStudentProgress error:", err.message);
    res.status(500).json({ message: "Analysis failed: " + err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// TEACHER: Analyze class-wide weak areas for a course
// GET /api/ai-progress/teacher/course/:courseId
// ─────────────────────────────────────────────────────────────
const analyzeClassProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.teacher.toString() !== teacherId.toString())
      return res.status(403).json({ message: "Not your course" });

    const enrollments = await Enrollment.find({ course: courseId }).lean();
    if (!enrollments.length) {
      return res.status(200).json({
        weakAreas: [],
        strengths: [],
        atRiskStudents: [],
        recommendations: [],
        classMetrics: {},
        summary: "No students enrolled yet.",
      });
    }

    const studentIds = enrollments.map(e => e.student);

    const [quizzes, labs, lessons, allAttempts, allSubmissions, allProgress] = await Promise.all([
      Quiz.find({ course: courseId, isPublished: true }).lean(),
      Lab.find({ course: courseId, isPublished: true }).lean(),
      Lesson.find({ course: courseId, isPublished: true }).sort({ order: 1 }).lean(),
      QuizAttempt.find({ course: courseId }).lean(),
      LabSubmission.find({ course: courseId }).lean(),
      LessonProgress.find({ course: courseId }).lean(),
    ]);

    // Get IDs of required quizzes and labs
    const requiredQuizIds = new Set();
    const requiredLabIds = new Set();
    
    lessons.forEach(lesson => {
      if (lesson.requiresQuiz) {
        const quiz = quizzes.find(q => q.lesson?.toString() === lesson._id.toString());
        if (quiz) requiredQuizIds.add(quiz._id.toString());
      }
      if (lesson.requiresLab) {
        const lab = labs.find(l => l.lesson?.toString() === lesson._id.toString());
        if (lab) requiredLabIds.add(lab._id.toString());
      }
    });

    // ✅ FIXED: Per-quiz analysis - using BEST score per student
    const quizAnalysis = quizzes
      .filter(quiz => requiredQuizIds.has(quiz._id.toString()))
      .map(quiz => {
        const attempts = allAttempts.filter(a => a.quiz.toString() === quiz._id.toString());
        
        // Get best score per student
        const bestScoresPerStudent = new Map();
        attempts.forEach(attempt => {
          const studentIdKey = attempt.student.toString();
          const currentBest = bestScoresPerStudent.get(studentIdKey);
          if (!currentBest || attempt.score > currentBest) {
            bestScoresPerStudent.set(studentIdKey, attempt.score);
          }
        });
        
        const bestScores = Array.from(bestScoresPerStudent.values());
        const avgScore = bestScores.length ? Math.round(bestScores.reduce((s, v) => s + v, 0) / bestScores.length) : 0;
        
        // Count students who passed (using best score)
        let passedCount = 0;
        bestScoresPerStudent.forEach((bestScore, studentIdKey) => {
          if (bestScore >= quiz.passingScore) {
            passedCount++;
          }
        });
        
        const uniqueStudents = bestScoresPerStudent.size;
        const passRate = uniqueStudents > 0 ? Math.round((passedCount / uniqueStudents) * 100) : 0;

        return {
          title: quiz.title,
          totalAttempts: attempts.length,
          uniqueStudents,
          avgScore,
          passRate,
          passedCount,
          lowestScore: bestScores.length ? Math.min(...bestScores) : null,
          highestScore: bestScores.length ? Math.max(...bestScores) : null,
          notAttempted: enrollments.length - uniqueStudents,
        };
      });

    // ✅ FIXED: Per-lab analysis - using BEST score per student
    const labAnalysis = labs
      .filter(lab => requiredLabIds.has(lab._id.toString()))
      .map(lab => {
        const submissions = allSubmissions.filter(s => s.lab.toString() === lab._id.toString());
        
        // Get best score per student (only graded submissions)
        const bestScoresPerStudent = new Map();
        submissions.forEach(sub => {
          if (sub.status === "graded" && sub.marks != null) {
            const studentIdKey = sub.student.toString();
            const scorePercent = Math.round((sub.marks / (lab.totalMarks || 100)) * 100);
            const currentBest = bestScoresPerStudent.get(studentIdKey);
            if (!currentBest || scorePercent > currentBest) {
              bestScoresPerStudent.set(studentIdKey, scorePercent);
            }
          }
        });
        
        const bestScores = Array.from(bestScoresPerStudent.values());
        const avgScore = bestScores.length ? Math.round(bestScores.reduce((s, v) => s + v, 0) / bestScores.length) : 0;

        return {
          title: lab.title,
          labType: lab.labType,
          difficulty: lab.difficulty,
          submissionCount: submissions.length,
          gradedCount: submissions.filter(s => s.status === "graded").length,
          avgScore,
          lowestScore: bestScores.length ? Math.min(...bestScores) : null,
          highestScore: bestScores.length ? Math.max(...bestScores) : null,
          notSubmitted: enrollments.length - bestScoresPerStudent.size,
        };
      });

    // Per-lesson completion (same)
    const lessonAnalysis = lessons.map(lesson => {
      const progress = allProgress.filter(p => p.lesson.toString() === lesson._id.toString());
      const viewed = progress.filter(p => p.lessonViewed).length;
      const completed = progress.filter(p => p.isCompleted).length;
      return {
        title: lesson.title,
        order: lesson.order,
        viewedCount: viewed,
        completedCount: completed,
        viewRate: enrollments.length > 0 ? Math.round((viewed / enrollments.length) * 100) : 0,
        completionRate: enrollments.length > 0 ? Math.round((completed / enrollments.length) * 100) : 0,
      };
    });

    // ✅ FIXED: At-risk students (using best quiz scores)
    const studentScores = studentIds.map(sid => {
      const sidStr = sid.toString();
      const enrollment = enrollments.find(e => e.student.toString() === sidStr);
      
      // Get best score per quiz for this student
      const studentAttempts = allAttempts.filter(a => a.student.toString() === sidStr && requiredQuizIds.has(a.quiz.toString()));
      const bestPerQuiz = new Map();
      studentAttempts.forEach(attempt => {
        const quizId = attempt.quiz.toString();
        const currentBest = bestPerQuiz.get(quizId);
        if (!currentBest || attempt.score > currentBest) {
          bestPerQuiz.set(quizId, attempt.score);
        }
      });
      const bestScores = Array.from(bestPerQuiz.values());
      const avgQuizScore = bestScores.length ? Math.round(bestScores.reduce((s, v) => s + v, 0) / bestScores.length) : 0;
      
      const studentSubs = allSubmissions.filter(s => s.student.toString() === sidStr && requiredLabIds.has(s.lab.toString()));

      return {
        studentId: sidStr,
        progress: enrollment?.progress || 0,
        avgQuizScore,
        labsSubmitted: studentSubs.length,
        totalAttempts: studentAttempts.length,
        passedQuizzes: studentAttempts.filter(a => a.passed).length,
        isCompleted: enrollment?.isCompleted || false,
      };
    });

    const atRiskCount = studentScores.filter(s =>
      s.progress < 30 || (s.totalAttempts > 0 && s.avgQuizScore < 50)
    ).length;
    const excellentCount = studentScores.filter(s => s.avgQuizScore >= 80 && s.progress >= 60).length;

    // Class metrics
    const classProgressValues = enrollments.map(e => e.progress || 0);
    const avgClassProgress = classProgressValues.length
      ? Math.round(classProgressValues.reduce((s, v) => s + v, 0) / classProgressValues.length)
      : 0;
    
    // ✅ FIXED: Class average quiz score (using best scores per student per quiz)
    let totalQuizBestScores = 0;
    let quizCount = 0;
    quizAnalysis.forEach(quiz => {
      if (quiz.avgScore > 0) {
        totalQuizBestScores += quiz.avgScore;
        quizCount++;
      }
    });
    const classAvgQuiz = quizCount > 0 ? Math.round(totalQuizBestScores / quizCount) : 0;
    
    // ✅ FIXED: Class average lab score (using best scores per student per lab)
    let totalLabBestScores = 0;
    let labCount = 0;
    labAnalysis.forEach(lab => {
      if (lab.avgScore > 0) {
        totalLabBestScores += lab.avgScore;
        labCount++;
      }
    });
    const classAvgLab = labCount > 0 ? Math.round(totalLabBestScores / labCount) : 0;

    const classMetrics = {
      totalStudents: enrollments.length,
      avgProgress: avgClassProgress,
      completedCount: enrollments.filter(e => e.isCompleted).length,
      avgQuizScore: classAvgQuiz,
      avgLabScore: classAvgLab,
      totalAttempts: allAttempts.filter(a => requiredQuizIds.has(a.quiz.toString())).length,
      passRate: quizAnalysis.length ? Math.round(quizAnalysis.reduce((s, q) => s + q.passRate, 0) / quizAnalysis.length) : 0,
      atRiskStudents: atRiskCount,
      excellentStudents: excellentCount,
    };

    // AI prompt for teacher view
    const dataForAI = JSON.stringify({ quizAnalysis, labAnalysis, lessonAnalysis, classMetrics }, null, 2);
    const prompt = `You are an expert educational AI analyzer for university teachers. Analyze this class performance data and provide actionable insights.

IMPORTANT:
- Quiz scores represent the BEST score per student (highest attempt), NOT the average of all attempts.
- ONLY consider quizzes and labs that were REQUIRED in the course.
- Do NOT flag optional assessments as weaknesses.

COURSE: ${course.title} (${course.code})
CLASS DATA:
${dataForAI}

Return ONLY valid JSON (no markdown):
{
  "weakAreas": [
    { "area": "specific topic or assessment", "description": "what the data shows", "severity": "high|medium|low", "affectedStudents": "estimated number or percentage" }
  ],
  "strengths": [
    { "area": "topic or skill", "description": "what the data shows", "performance": "metric" }
  ],
  "atRiskStudents": {
    "count": ${atRiskCount},
    "indicators": ["indicator 1", "indicator 2"],
    "recommendations": ["what the teacher should do"]
  },
  "recommendations": [
    { "action": "specific teaching action", "priority": "high|medium|low", "target": "e.g. struggling students", "reason": "data-based reason" }
  ],
  "summary": "2-3 sentence class performance overview for the teacher"
}

Rules:
- weakAreas: ONLY include REQUIRED quizzes with avg best score < 60%, REQUIRED labs with low scores, lessons with < 50% completion. Max 6.
- strengths: REQUIRED quizzes > 75%, REQUIRED labs with good scores. Max 4.
- recommendations: actionable teaching strategies. Max 5.
- Be data-specific, reference actual required assessment names.`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    let text = (response.text || "").trim()
      .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch {
      analysis = {
        weakAreas: [],
        strengths: [],
        atRiskStudents: { count: atRiskCount, indicators: [], recommendations: [] },
        recommendations: [],
        summary: "Analysis completed. Review required assessment metrics above.",
      };
    }

    res.status(200).json({
      ...analysis,
      classMetrics,
      quizAnalysis,
      labAnalysis,
      lessonAnalysis,
    });

  } catch (err) {
    console.error("analyzeClassProgress error:", err.message);
    res.status(500).json({ message: "Analysis failed: " + err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// TEACHER: Get all courses for selector
// GET /api/ai-progress/teacher/courses
// ─────────────────────────────────────────────────────────────
const getTeacherCoursesForAnalysis = async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user._id })
      .select("title code enrolledCount")
      .sort({ createdAt: -1 });
    res.status(200).json({ courses });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// TEACHER: Get individual student weak areas for a course
// GET /api/ai-progress/teacher/course/:courseId/students
// ─────────────────────────────────────────────────────────────
const getStudentsWeakAreas = async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.teacher.toString() !== teacherId.toString())
      return res.status(403).json({ message: "Not your course" });

    const enrollments = await Enrollment.find({ course: courseId })
      .populate("student", "fullName email studentId avatar")
      .lean();

    if (!enrollments.length) {
      return res.status(200).json({ students: [] });
    }

    const studentIds = enrollments.map(e => e.student._id);

    const [quizzes, labs, lessons, allAttempts, allSubmissions, allProgress] = await Promise.all([
      Quiz.find({ course: courseId, isPublished: true }).lean(),
      Lab.find({ course: courseId, isPublished: true }).lean(),
      Lesson.find({ course: courseId, isPublished: true }).sort({ order: 1 }).lean(),
      QuizAttempt.find({ course: courseId }).lean(),
      LabSubmission.find({ course: courseId }).lean(),
      LessonProgress.find({ course: courseId }).lean(),
    ]);

    // Get IDs of required quizzes and labs
    const requiredQuizIds = new Set();
    const requiredLabIds = new Set();
    
    lessons.forEach(lesson => {
      if (lesson.requiresQuiz) {
        const quiz = quizzes.find(q => q.lesson?.toString() === lesson._id.toString());
        if (quiz) requiredQuizIds.add(quiz._id.toString());
      }
      if (lesson.requiresLab) {
        const lab = labs.find(l => l.lesson?.toString() === lesson._id.toString());
        if (lab) requiredLabIds.add(lab._id.toString());
      }
    });

    // Build student-wise analysis
    const studentsData = await Promise.all(enrollments.map(async (enrollment) => {
      const student = enrollment.student;
      const sid = student._id.toString();

      // Get student's attempts and submissions
      const studentAttempts = allAttempts.filter(a => a.student.toString() === sid);
      const studentSubmissions = allSubmissions.filter(s => s.student.toString() === sid);
      const studentProgress = allProgress.filter(p => p.student.toString() === sid);

      // Analyze per student
      const weakAreas = [];
      const strengths = [];
      const quizPerformance = [];
      const labPerformance = [];

      // Quiz analysis
      for (const quiz of quizzes) {
        if (!requiredQuizIds.has(quiz._id.toString())) continue;
        
        const attempts = studentAttempts.filter(a => a.quiz.toString() === quiz._id.toString());
        const bestAttempt = attempts.length 
          ? attempts.reduce((a, b) => a.score > b.score ? a : b, attempts[0])
          : null;
        
        const score = bestAttempt?.score || 0;
        const passed = bestAttempt?.passed || false;

        quizPerformance.push({
          quizId: quiz._id,
          title: quiz.title,
          score: score,
          passingScore: quiz.passingScore,
          passed: passed,
          attemptsCount: attempts.length,
          maxAttempts: quiz.maxAttempts,
        });

        if (score < 60 && attempts.length > 0) {
          weakAreas.push({
            type: "quiz",
            title: quiz.title,
            score: score,
            passingScore: quiz.passingScore,
            message: `Scored ${score}% on "${quiz.title}" (need ${quiz.passingScore}% to pass)`,
            suggestion: `Review ${quiz.title} concepts and retake the quiz`
          });
        } else if (score >= 80 && attempts.length > 0) {
          strengths.push({
            type: "quiz",
            title: quiz.title,
            score: score,
            message: `Excellent: ${score}% on "${quiz.title}"`
          });
        } else if (attempts.length === 0) {
          weakAreas.push({
            type: "quiz",
            title: quiz.title,
            score: 0,
            message: `Not attempted: "${quiz.title}"`,
            suggestion: `Take the quiz "${quiz.title}" to assess understanding`
          });
        }
      }

      // Lab analysis
      for (const lab of labs) {
        if (!requiredLabIds.has(lab._id.toString())) continue;
        
        const submission = studentSubmissions.find(s => s.lab.toString() === lab._id.toString());
        const scorePercent = submission?.marks != null 
          ? Math.round((submission.marks / (lab.totalMarks || 100)) * 100)
          : null;

        labPerformance.push({
          labId: lab._id,
          title: lab.title,
          score: scorePercent,
          totalMarks: lab.totalMarks,
          status: submission?.status || "not_submitted",
          submittedAt: submission?.submittedAt,
        });

        if (scorePercent !== null && scorePercent < 60 && submission?.status === "graded") {
          weakAreas.push({
            type: "lab",
            title: lab.title,
            score: scorePercent,
            message: `Scored ${scorePercent}% on "${lab.title}"`,
            suggestion: `Review lab requirements and resubmit for better score`
          });
        } else if (scorePercent !== null && scorePercent >= 80) {
          strengths.push({
            type: "lab",
            title: lab.title,
            score: scorePercent,
            message: `Excellent: ${scorePercent}% on "${lab.title}"`
          });
        } else if (!submission) {
          weakAreas.push({
            type: "lab",
            title: lab.title,
            score: 0,
            message: `Not submitted: "${lab.title}"`,
            suggestion: `Complete and submit "${lab.title}"`
          });
        }
      }

      // Calculate overall progress
      const completedLessons = studentProgress.filter(p => p.isCompleted).length;
      const progressPct = lessons.length > 0 
        ? Math.round((completedLessons / lessons.length) * 100)
        : 0;

      // Calculate average scores
      const quizScores = quizPerformance.filter(q => q.score > 0).map(q => q.score);
      const avgQuizScore = quizScores.length 
        ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
        : null;

      const labScores = labPerformance.filter(l => l.score !== null && l.score > 0).map(l => l.score);
      const avgLabScore = labScores.length 
        ? Math.round(labScores.reduce((a, b) => a + b, 0) / labScores.length)
        : null;

      // Generate AI recommendation for this student
      let aiRecommendation = null;
      if (weakAreas.length > 0) {
        try {
          const ai = getAI();
          const weakAreasText = weakAreas.map(w => `- ${w.message}`).join("\n");
          const strengthsText = strengths.length > 0 ? strengths.map(s => `- ${s.message}`).join("\n") : "None yet";
          
          const prompt = `Based on this student's performance, provide 2-3 specific recommendations.

Student: ${student.fullName}
Overall Progress: ${progressPct}%
Avg Quiz Score: ${avgQuizScore || 'N/A'}%
Avg Lab Score: ${avgLabScore || 'N/A'}%

Weak Areas:
${weakAreasText}

Strengths:
${strengthsText}

Return ONLY JSON: { "recommendations": ["action 1", "action 2", "action 3"] }`;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
          });

          let text = response.text.trim()
            .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
          
          const parsed = JSON.parse(text);
          aiRecommendation = parsed.recommendations;
        } catch (err) {
          aiRecommendation = [`Review ${weakAreas[0]?.title || "course materials"}`];
        }
      }

      return {
        studentId: student._id,
        fullName: student.fullName,
        email: student.email,
        studentIdNumber: student.studentId,
        avatar: student.avatar,
        progress: progressPct,
        avgQuizScore: avgQuizScore,
        avgLabScore: avgLabScore,
        isCompleted: enrollment.isCompleted || false,
        weakAreas: weakAreas,
        strengths: strengths,
        quizPerformance: quizPerformance,
        labPerformance: labPerformance,
        aiRecommendation: aiRecommendation || ["Continue practicing to improve performance"],
      };
    }));

    // Sort by progress (lowest first for at-risk students)
    studentsData.sort((a, b) => a.progress - b.progress);

    res.status(200).json({
      course: {
        _id: course._id,
        title: course.title,
        code: course.code,
      },
      students: studentsData,
      summary: {
        totalStudents: studentsData.length,
        atRiskCount: studentsData.filter(s => s.progress < 40 || (s.avgQuizScore && s.avgQuizScore < 50)).length,
        excellentCount: studentsData.filter(s => s.progress >= 80 && (s.avgQuizScore || 0) >= 80).length,
        avgClassProgress: Math.round(studentsData.reduce((sum, s) => sum + s.progress, 0) / studentsData.length),
      }
    });

  } catch (err) {
    console.error("getStudentsWeakAreas error:", err.message);
    res.status(500).json({ message: "Failed to load student analysis: " + err.message });
  }
};

module.exports = {
  analyzeStudentProgress,
  analyzeClassProgress,
  getTeacherCoursesForAnalysis,
   getStudentsWeakAreas,  // ← ADD THIS
};