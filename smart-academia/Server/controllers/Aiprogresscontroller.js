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

    // Parallel data fetch
    const [allAttempts, allSubmissions, allLessons, allQuizzes, allLabs] = await Promise.all([
      QuizAttempt.find({ student: studentId, course: { $in: courseIds } })
        .populate("quiz", "title passingScore")
        .lean(),
      LabSubmission.find({ student: studentId, course: { $in: courseIds } })
        .populate("lab", "title totalMarks difficulty labType")
        .lean(),
      LessonProgress.find({ student: studentId, course: { $in: courseIds } }).lean(),
      Quiz.find({ course: { $in: courseIds }, isPublished: true }).lean(),
      Lab.find({ course: { $in: courseIds }, isPublished: true }).lean(),
    ]);

    // Build performance snapshot per course
    const courseSnapshots = enrollments.map(en => {
      const cId = en.course._id.toString();

      const courseAttempts = allAttempts.filter(a => a.course.toString() === cId);
      const passedAttempts = courseAttempts.filter(a => a.passed);
      const failedAttempts = courseAttempts.filter(a => !a.passed);
      const quizScores = courseAttempts.map(a => a.score);
      const avgQuizScore = quizScores.length
        ? Math.round(quizScores.reduce((s, v) => s + v, 0) / quizScores.length)
        : null;

      const courseSubmissions = allSubmissions.filter(s => s.course.toString() === cId);
      const gradedSubmissions = courseSubmissions.filter(s => s.status === "graded" && s.marks != null);
      const labScores = gradedSubmissions.map(s =>
        Math.round((s.marks / (s.lab?.totalMarks || 100)) * 100)
      );
      const avgLabScore = labScores.length
        ? Math.round(labScores.reduce((s, v) => s + v, 0) / labScores.length)
        : null;

      const courseLessons = allLessons.filter(l => l.course.toString() === cId);
      const completedLessons = courseLessons.filter(l => l.isCompleted).length;
      const totalLessons = allQuizzes.filter(q => q.course.toString() === cId).length || 1;

      // Quiz fail analysis
      const failedQuizTitles = failedAttempts
        .map(a => a.quiz?.title)
        .filter(Boolean)
        .slice(0, 5);

      // Low-scoring labs
      const lowScoreLabs = gradedSubmissions
        .filter(s => {
          const pct = Math.round((s.marks / (s.lab?.totalMarks || 100)) * 100);
          return pct < 60;
        })
        .map(s => s.lab?.title)
        .filter(Boolean)
        .slice(0, 5);

      return {
        course: en.course.title,
        code: en.course.code,
        progress: en.progress || 0,
        isCompleted: en.isCompleted || false,
        avgQuizScore,
        avgLabScore,
        totalAttempts: courseAttempts.length,
        passedQuizzes: passedAttempts.length,
        totalQuizzes: allQuizzes.filter(q => q.course.toString() === cId).length,
        submittedLabs: courseSubmissions.length,
        totalLabs: allLabs.filter(l => l.course.toString() === cId).length,
        completedLessons,
        failedQuizTitles,
        lowScoreLabs,
      };
    });

    // Overall metrics
    const allQuizScores = allAttempts.map(a => a.score);
    const overallQuizAvg = allQuizScores.length
      ? Math.round(allQuizScores.reduce((s, v) => s + v, 0) / allQuizScores.length)
      : 0;
    const gradedLabs = allSubmissions.filter(s => s.status === "graded" && s.marks != null);
    const overallLabAvg = gradedLabs.length
      ? Math.round(gradedLabs.reduce((s, sub) => s + Math.round((sub.marks / (sub.lab?.totalMarks || 100)) * 100), 0) / gradedLabs.length)
      : 0;
    const overallProgress = enrollments.length
      ? Math.round(enrollments.reduce((s, e) => s + (e.progress || 0), 0) / enrollments.length)
      : 0;
    const overallScore = Math.round((overallProgress * 0.4) + (overallQuizAvg * 0.35) + (overallLabAvg * 0.25));

    // Build AI prompt
    const dataForAI = JSON.stringify(courseSnapshots, null, 2);
    const prompt = `You are an expert educational AI analyzer. Analyze this student's performance data and provide actionable insights.

STUDENT PERFORMANCE DATA:
${dataForAI}

OVERALL METRICS:
- Average Quiz Score: ${overallQuizAvg}%
- Average Lab Score: ${overallLabAvg}%
- Average Course Progress: ${overallProgress}%
- Weighted Overall Score: ${overallScore}%

Analyze the data and return ONLY valid JSON (no markdown, no code blocks):
{
  "weakAreas": [
    { "area": "topic/skill name", "reason": "specific explanation based on the data", "severity": "high|medium|low", "course": "course name" }
  ],
  "strengths": [
    { "area": "topic/skill name", "reason": "specific explanation", "course": "course name" }
  ],
  "trends": [
    { "trend": "trend description", "direction": "improving|declining|stable", "detail": "specific data-backed explanation" }
  ],
  "studyPlan": [
    { "action": "specific action to take", "priority": "high|medium|low", "timeframe": "e.g. this week", "reason": "why this helps" }
  ],
  "summary": "2-3 sentence overall assessment of the student's performance"
}

Rules:
- weakAreas: identify specific topics where quiz scores < 60% or failed multiple times, or labs with low scores. Max 6 items.
- strengths: courses/topics where score > 75%. Max 4 items.
- trends: analyze if scores are improving/declining based on attempt patterns. Max 4 items.
- studyPlan: concrete, actionable steps prioritized by impact. Max 5 items.
- Be specific, not generic. Reference actual course names and quiz/lab data.
- If data is limited, still provide insights based on what's available.`;

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
        summary: "Analysis completed. Keep working on your courses consistently for better results.",
      };
    }

    res.status(200).json({
      ...analysis,
      overallScore,
      metrics: {
        overallQuizAvg,
        overallLabAvg,
        overallProgress,
        totalCourses: enrollments.length,
        completedCourses: enrollments.filter(e => e.isCompleted).length,
        totalAttempts: allAttempts.length,
        passedQuizzes: allAttempts.filter(a => a.passed).length,
        gradedLabs: gradedLabs.length,
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

    // Per-quiz analysis
    const quizAnalysis = quizzes.map(quiz => {
      const attempts = allAttempts.filter(a => a.quiz.toString() === quiz._id.toString());
      const scores = attempts.map(a => a.score);
      const passedCount = attempts.filter(a => a.passed).length;
      const uniqueStudents = [...new Set(attempts.map(a => a.student.toString()))].length;
      const avgScore = scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
      const passRate = uniqueStudents > 0 ? Math.round((passedCount / uniqueStudents) * 100) : 0;

      return {
        title: quiz.title,
        totalAttempts: attempts.length,
        uniqueStudents,
        avgScore,
        passRate,
        passedCount,
        lowestScore: scores.length ? Math.min(...scores) : null,
        highestScore: scores.length ? Math.max(...scores) : null,
        notAttempted: enrollments.length - uniqueStudents,
      };
    });

    // Per-lab analysis
    const labAnalysis = labs.map(lab => {
      const submissions = allSubmissions.filter(s => s.lab.toString() === lab._id.toString());
      const graded = submissions.filter(s => s.status === "graded" && s.marks != null);
      const labScores = graded.map(s => Math.round((s.marks / (lab.totalMarks || 100)) * 100));
      const avgScore = labScores.length ? Math.round(labScores.reduce((s, v) => s + v, 0) / labScores.length) : 0;

      return {
        title: lab.title,
        labType: lab.labType,
        difficulty: lab.difficulty,
        submissionCount: submissions.length,
        gradedCount: graded.length,
        avgScore,
        lowestScore: labScores.length ? Math.min(...labScores) : null,
        highestScore: labScores.length ? Math.max(...labScores) : null,
        notSubmitted: enrollments.length - submissions.length,
      };
    });

    // Per-lesson completion
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

    // At-risk students (low progress + low quiz scores)
    const studentScores = studentIds.map(sid => {
      const sidStr = sid.toString();
      const enrollment = enrollments.find(e => e.student.toString() === sidStr);
      const studentAttempts = allAttempts.filter(a => a.student.toString() === sidStr);
      const studentSubs = allSubmissions.filter(s => s.student.toString() === sidStr);
      const scores = studentAttempts.map(a => a.score);
      const avgScore = scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;

      return {
        studentId: sidStr,
        progress: enrollment?.progress || 0,
        avgQuizScore: avgScore,
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
    const allQuizScores = allAttempts.map(a => a.score);
    const classAvgQuiz = allQuizScores.length
      ? Math.round(allQuizScores.reduce((s, v) => s + v, 0) / allQuizScores.length)
      : 0;
    const gradedSubs = allSubmissions.filter(s => s.status === "graded" && s.marks != null);
    const classAvgLab = gradedSubs.length
      ? Math.round(gradedSubs.reduce((s, sub) => {
          const lab = labs.find(l => l._id.toString() === sub.lab.toString());
          return s + Math.round((sub.marks / (lab?.totalMarks || 100)) * 100);
        }, 0) / gradedSubs.length)
      : 0;

    const classMetrics = {
      totalStudents: enrollments.length,
      avgProgress: avgClassProgress,
      completedCount: enrollments.filter(e => e.isCompleted).length,
      avgQuizScore: classAvgQuiz,
      avgLabScore: classAvgLab,
      totalAttempts: allAttempts.length,
      passRate: allAttempts.length
        ? Math.round((allAttempts.filter(a => a.passed).length / allAttempts.length) * 100)
        : 0,
      atRiskStudents: atRiskCount,
      excellentStudents: excellentCount,
    };

    // AI prompt for teacher view
    const dataForAI = JSON.stringify({ quizAnalysis, labAnalysis, lessonAnalysis, classMetrics }, null, 2);
    const prompt = `You are an expert educational AI analyzer for university teachers. Analyze this class performance data and provide actionable insights.

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
- weakAreas: quizzes with avg score < 60%, labs with low scores, lessons with < 50% completion. Max 6.
- strengths: quizzes > 75%, labs with good scores. Max 4.
- recommendations: actionable teaching strategies. Max 5.
- Be data-specific, reference actual quiz/lab names.`;

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
        summary: "Analysis completed. Review quiz and lab performance metrics above.",
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

module.exports = {
  analyzeStudentProgress,
  analyzeClassProgress,
  getTeacherCoursesForAnalysis,
};