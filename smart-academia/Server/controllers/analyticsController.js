// controllers/analyticsController.js
const Enrollment     = require("../models/Enrollment");
const LessonProgress = require("../models/LessonProgress");
const QuizAttempt    = require("../models/QuizAttempt");
const LabSubmission  = require("../models/LabSubmission");
const Course         = require("../models/Course");
const Lesson         = require("../models/Lesson");
const Quiz           = require("../models/Quiz");
const Lab            = require("../models/Lab");
const Question       = require("../models/Question");

/**
 * GET /api/analytics/student
 * Returns a full analytics snapshot for the authenticated student.
 *
 * Architecture: Query-time aggregation using parallel Promise.all calls.
 * All source data lives in existing collections — no denormalization needed.
 * Response shape is stable so the frontend can cache it.
 */
const getStudentAnalytics = async (req, res) => {
  try {
    const studentId = req.user._id;

    // ── Layer 0: Fetch all enrollments ───────────────────────────────────────
    const enrollments = await Enrollment.find({ student: studentId })
      .populate({
        path: "course",
        select: "title code department credits semester teacher isPublished totalLessons",
        populate: { path: "teacher", select: "fullName" },
      })
      .lean();

    if (!enrollments.length) {
      return res.status(200).json({ analytics: buildEmptyAnalytics() });
    }

    const courseIds = enrollments.map(e => e.course._id);

    // ── Layer 1–5: Parallel data fetch ───────────────────────────────────────
    const [
      allLessonProgress,
      allQuizAttempts,
      allLabSubmissions,
      allLessons,
      allQuizzes,
      allLabs,
    ] = await Promise.all([
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

    // ── Build lookup maps for O(1) access ────────────────────────────────────
    const progressByLesson = {};
    allLessonProgress.forEach(p => {
      progressByLesson[p.lesson?._id?.toString()] = p;
    });

    // Group quiz attempts by quiz ID — keep all attempts per quiz
    const attemptsByQuiz = {};
    allQuizAttempts.forEach(a => {
      const qId = a.quiz?._id?.toString();
      if (!qId) return;
      if (!attemptsByQuiz[qId]) attemptsByQuiz[qId] = [];
      attemptsByQuiz[qId].push(a);
    });

    // Group lab submissions by lab ID
    const submissionByLab = {};
    allLabSubmissions.forEach(s => {
      const lId = s.lab?._id?.toString();
      if (!lId) return;
      submissionByLab[lId] = s; // one submission per student per lab
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

    // ── Build per-course analytics ────────────────────────────────────────────
    const courses = enrollments.map(enrollment => {
      const course    = enrollment.course;
      const courseId  = course._id.toString();
      const lessons   = (lessonsByCourse[courseId] || []).sort((a, b) => a.order - b.order);
      const quizzes   = quizzesByCourse[courseId] || [];
      const labs      = labsByCourse[courseId] || [];

      // ── Per-lesson detail ──────────────────────────────────────────────────
      const lessonDetails = lessons.map(lesson => {
        const lId     = lesson._id.toString();
        const prog    = progressByLesson[lId];

        // Find quiz & lab for this lesson
        const lessonQuiz = quizzes.find(q => q.lesson?.toString() === lId);
        const lessonLab  = labs.find(l => l.lesson?.toString() === lId);

        // ── Per-quiz detail ────────────────────────────────────────────────
        let quizDetail = null;
        if (lessonQuiz) {
          const qId      = lessonQuiz._id.toString();
          const attempts = attemptsByQuiz[qId] || [];
          const passed   = attempts.find(a => a.passed);
          const bestAttempt = attempts.length
            ? attempts.reduce((best, a) => a.score > best.score ? a : best, attempts[0])
            : null;

          quizDetail = {
            _id:          lessonQuiz._id,
            title:        lessonQuiz.title,
            passingScore: lessonQuiz.passingScore,
            maxAttempts:  lessonQuiz.maxAttempts,
            timeLimit:    lessonQuiz.timeLimit,
            totalAttempts: attempts.length,
            passed:       !!passed,
            bestScore:    bestAttempt?.score ?? null,
            lastScore:    attempts.length ? attempts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].score : null,
            bestTimeTaken: bestAttempt?.timeTaken ?? null,
            attempts:     attempts.map(a => ({
              _id:           a._id,
              attemptNumber: a.attemptNumber,
              score:         a.score,
              passed:        a.passed,
              timeTaken:     a.timeTaken,
              submittedAt:   a.submittedAt,
              flagged:       a.flaggedForCheating,
            })).sort((a, b) => a.attemptNumber - b.attemptNumber),
          };
        }

        // ── Per-lab detail ─────────────────────────────────────────────────
        let labDetail = null;
        if (lessonLab) {
          const labId = lessonLab._id.toString();
          const sub   = submissionByLab[labId];

          labDetail = {
            _id:         lessonLab._id,
            title:       lessonLab.title,
            totalMarks:  lessonLab.totalMarks,
            difficulty:  lessonLab.difficulty,
            submitted:   !!sub,
            status:      sub?.status ?? "not_submitted",
            marks:       sub?.marks ?? null,
            feedback:    sub?.feedback ?? null,
            submittedAt: sub?.submittedAt ?? null,
            gradedAt:    sub?.gradedAt ?? null,
            scorePercent: sub?.marks != null
              ? Math.round((sub.marks / (lessonLab.totalMarks || 100)) * 100)
              : null,
          };
        }

        return {
          _id:           lesson._id,
          title:         lesson.title,
          order:         lesson.order,
          duration:      lesson.duration,
          points:        lesson.points,
          requiresQuiz:  lesson.requiresQuiz,
          requiresLab:   lesson.requiresLab,
          viewed:        prog?.lessonViewed ?? false,
          quizCompleted: prog?.quizCompleted ?? false,
          labCompleted:  prog?.labCompleted ?? false,
          isCompleted:   prog?.isCompleted ?? false,
          completedAt:   prog?.completedAt ?? null,
          quiz:          quizDetail,
          lab:           labDetail,
        };
      });

      // ── Course-level aggregates ────────────────────────────────────────────
      const totalLessons     = lessonDetails.length;
      const completedLessons = lessonDetails.filter(l => l.isCompleted).length;
      const viewedLessons    = lessonDetails.filter(l => l.viewed).length;

      // Quiz aggregates
      const quizDetails  = lessonDetails.filter(l => l.quiz).map(l => l.quiz);
      const totalQuizzes = quizDetails.length;
      const passedQuizzes = quizDetails.filter(q => q.passed).length;
      const quizScores   = quizDetails.filter(q => q.bestScore != null).map(q => q.bestScore);
      const avgQuizScore = quizScores.length
        ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
        : null;

      // Lab aggregates
      const labDetails    = lessonDetails.filter(l => l.lab).map(l => l.lab);
      const totalLabs     = labDetails.length;
      const submittedLabs = labDetails.filter(l => l.submitted).length;
      const gradedLabs    = labDetails.filter(l => l.status === "graded").length;
      const labScores     = labDetails.filter(l => l.scorePercent != null).map(l => l.scorePercent);
      const avgLabScore   = labScores.length
        ? Math.round(labScores.reduce((a, b) => a + b, 0) / labScores.length)
        : null;

      // Compute a weighted course score:
      // 50% progress + 30% quiz avg + 20% lab avg
      const progressScore = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      const weightedScore = computeWeightedScore(progressScore, avgQuizScore, avgLabScore);

      return {
        _id:              course._id,
        title:            course.title,
        code:             course.code,
        department:       course.department,
        credits:          course.credits,
        semester:         course.semester,
        teacher:          course.teacher?.fullName || "Instructor",
        enrolledAt:       enrollment.enrolledAt,
        // Progress
        progress:         enrollment.progress || 0,
        isCompleted:      enrollment.isCompleted || false,
        // Lesson counts
        totalLessons,
        completedLessons,
        viewedLessons,
        // Quiz counts
        totalQuizzes,
        passedQuizzes,
        avgQuizScore,
        // Lab counts
        totalLabs,
        submittedLabs,
        gradedLabs,
        avgLabScore,
        // Composite
        weightedScore,
        creditsEarned:    ((weightedScore || 0) / 100) * (course.credits || 0),
        // Drill-down
        lessons:          lessonDetails,
    };
});

    // ── Overall analytics (Layer 1) ───────────────────────────────────────────
    const totalCourses     = courses.length;
    const completedCourses = courses.filter(c => c.isCompleted).length;
    const inProgressCourses= courses.filter(c => !c.isCompleted && c.progress > 0).length;
    const totalCredits     = courses.reduce((s, c) => s + (c.credits || 0), 0);
    const earnedCredits    = courses.reduce((s, c) => s + c.creditsEarned, 0);
    console.log(earnedCredits)

    const allQuizScores = courses.flatMap(c =>
      c.lessons.flatMap(l => l.quiz?.bestScore != null ? [l.quiz.bestScore] : [])
    );
    const allLabScores = courses.flatMap(c =>
      c.lessons.flatMap(l => l.lab?.scorePercent != null ? [l.lab.scorePercent] : [])
    );

    const overallQuizAvg = allQuizScores.length
      ? Math.round(allQuizScores.reduce((a, b) => a + b, 0) / allQuizScores.length)
      : null;
    const overallLabAvg = allLabScores.length
      ? Math.round(allLabScores.reduce((a, b) => a + b, 0) / allLabScores.length)
      : null;

    const avgProgress = courses.length
      ? Math.round(courses.reduce((s, c) => s + c.progress, 0) / courses.length)
      : 0;

    // Total quiz/lab attempts across platform
    const totalQuizAttempts = allQuizAttempts.length;
    const totalQuizPasses   = allQuizAttempts.filter(a => a.passed).length;
    const totalLabSubmissions = allLabSubmissions.length;
    const totalLabsGraded   = allLabSubmissions.filter(s => s.status === "graded").length;

    // Streak computation: days with any learning activity in last 30 days
    const activityDates = new Set([
      ...allLessonProgress.filter(p => p.lessonViewed).map(p =>
        new Date(p.updatedAt).toISOString().slice(0, 10)
      ),
      ...allQuizAttempts.map(a =>
        new Date(a.submittedAt || a.createdAt).toISOString().slice(0, 10)
      ),
      ...allLabSubmissions.map(s =>
        new Date(s.submittedAt).toISOString().slice(0, 10)
      ),
    ]);
    const currentStreak = computeStreak(activityDates);

    const analytics = {
      overall: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        totalCredits,
        earnedCredits,
        avgProgress,
        overallQuizAvg,
        overallLabAvg,
        totalQuizAttempts,
        totalQuizPasses,
        totalLabSubmissions,
        totalLabsGraded,
        currentStreak,
        generatedAt: new Date().toISOString(),
      },
      courses,
    };

    res.status(200).json({ analytics });
  } catch (err) {
    console.error("getStudentAnalytics error:", err.message);
    res.status(500).json({ message: "Failed to load analytics" });
  }
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function computeWeightedScore(progressPct, quizAvg, labAvg) {
  // If we have all three dimensions
  if (quizAvg != null && labAvg != null) {
    return Math.round(progressPct * 0.5 + quizAvg * 0.3 + labAvg * 0.2);
  }
  // Only quiz
  if (quizAvg != null) {
    return Math.round(progressPct * 0.6 + quizAvg * 0.4);
  }
  // Only lab
  if (labAvg != null) {
    return Math.round(progressPct * 0.7 + labAvg * 0.3);
  }
  // Only progress
  return Math.round(progressPct);
}

function computeStreak(activityDateSet) {
  if (!activityDateSet.size) return 0;
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (activityDateSet.has(key)) {
      streak++;
    } else if (i > 0) {
      break; // gap found
    }
  }
  return streak;
}

function buildEmptyAnalytics() {
  return {
    overall: {
      totalCourses: 0,
      completedCourses: 0,
      inProgressCourses: 0,
      totalCredits: 0,
      earnedCredits: 0,
      avgProgress: 0,
      overallQuizAvg: null,
      overallLabAvg: null,
      totalQuizAttempts: 0,
      totalQuizPasses: 0,
      totalLabSubmissions: 0,
      totalLabsGraded: 0,
      currentStreak: 0,
      generatedAt: new Date().toISOString(),
    },
    courses: [],
  };
}

module.exports = { getStudentAnalytics };