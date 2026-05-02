// controllers/teacherProgressController.js
const Course         = require("../models/Course");
const Enrollment     = require("../models/Enrollment");
const Lesson         = require("../models/Lesson");
const LessonProgress = require("../models/LessonProgress");
const QuizAttempt    = require("../models/QuizAttempt");
const LabSubmission  = require("../models/LabSubmission");
const Quiz           = require("../models/Quiz");
const Lab            = require("../models/Lab");
const User           = require("../models/User");

/**
 * GET /api/teacher/courses/:courseId/progress
 * Returns full progress data for all students enrolled in a teacher's course.
 * Includes per-student lesson/quiz/lab breakdown + course-level aggregates.
 */
const getCourseStudentProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify the course belongs to this teacher
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    
    // FIX: Safely check if teacher exists and matches
    if (!course.teacher || course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your course" });
    }

    // Fetch all published lessons for this course
    const lessons = await Lesson.find({ course: courseId, isPublished: true })
      .sort({ order: 1 })
      .lean();

    // Fetch all quizzes and labs for this course
    const [quizzes, labs] = await Promise.all([
      Quiz.find({ course: courseId, isPublished: true }).lean(),
      Lab.find({ course: courseId, isPublished: true }).lean(),
    ]);

    const quizByLesson = {};
    quizzes.forEach(q => { if (q.lesson) quizByLesson[q.lesson.toString()] = q; });
    const labByLesson = {};
    labs.forEach(l => { if (l.lesson) labByLesson[l.lesson.toString()] = l; });

    // Fetch all enrollments for this course with student data
    const enrollments = await Enrollment.find({ course: courseId })
      .populate("student", "fullName email studentId avatar department semester")
      .lean();

    if (enrollments.length === 0) {
      return res.status(200).json({
        course: { _id: course._id, title: course.title, code: course.code, credits: course.credits },
        lessons: lessons.map(l => ({ _id: l._id, title: l.title, order: l.order })),
        students: [],
        summary: {
          totalStudents: 0,
          avgProgress: 0,
          completedCount: 0,
          inProgressCount: 0,
          notStartedCount: 0,
          totalLessons: lessons.length,
          totalQuizzes: quizzes.length,
          totalLabs: labs.length,
          courseAvgQuiz: null,
          courseAvgLab: null,
          progressBuckets: { "0-25": 0, "26-50": 0, "51-75": 0, "76-100": 0 },
          totalCredits: course.credits || 0,
          totalCreditsEarned: 0,
        },
      });
    }

    const studentIds = enrollments.map(e => e.student._id);

    // Parallel fetch all progress data
    const [allLessonProgress, allQuizAttempts, allLabSubmissions] = await Promise.all([
      LessonProgress.find({ course: courseId, student: { $in: studentIds } }).lean(),
      QuizAttempt.find({ course: courseId, student: { $in: studentIds } }).lean(),
      LabSubmission.find({ course: courseId, student: { $in: studentIds } }).lean(),
    ]);

    // Build lookup maps
    const lpByStudentLesson = {};
    allLessonProgress.forEach(lp => {
      const key = `${lp.student}_${lp.lesson}`;
      lpByStudentLesson[key] = lp;
    });

    const attemptsByStudentQuiz = {};
    allQuizAttempts.forEach(a => {
      const key = `${a.student}_${a.quiz}`;
      if (!attemptsByStudentQuiz[key]) attemptsByStudentQuiz[key] = [];
      attemptsByStudentQuiz[key].push(a);
    });

    const subByStudentLab = {};
    allLabSubmissions.forEach(s => {
      const key = `${s.student}_${s.lab}`;
      subByStudentLab[key] = s;
    });

    // Get course credits
    const courseCredits = course.credits || 0;

    // Build per-student data
    const students = enrollments.map(enrollment => {
      const student = enrollment.student;
      const sid = student._id.toString();

      const lessonDetails = lessons.map(lesson => {
        const lid = lesson._id.toString();
        const lp  = lpByStudentLesson[`${sid}_${lid}`];
        const quiz = quizByLesson[lid];
        const lab  = labByLesson[lid];

        let quizDetail = null;
        if (quiz) {
          const attempts = attemptsByStudentQuiz[`${sid}_${quiz._id}`] || [];
          const best = attempts.length
            ? attempts.reduce((a, b) => a.score > b.score ? a : b, attempts[0])
            : null;
          quizDetail = {
            _id:           quiz._id,
            title:         quiz.title,
            totalAttempts: attempts.length,
            maxAttempts:   quiz.maxAttempts,
            passed:        attempts.some(a => a.passed),
            bestScore:     best?.score ?? null,
            passingScore:  quiz.passingScore,
          };
        }

        let labDetail = null;
        if (lab) {
          const sub = subByStudentLab[`${sid}_${lab._id}`];
          labDetail = {
            _id:         lab._id,
            title:       lab.title,
            totalMarks:  lab.totalMarks,
            submitted:   !!sub,
            status:      sub?.status ?? "not_submitted",
            marks:       sub?.marks ?? null,
            scorePercent: sub?.marks != null
              ? Math.round((sub.marks / (lab.totalMarks || 100)) * 100)
              : null,
          };
        }

        return {
          _id:           lesson._id,
          title:         lesson.title,
          order:         lesson.order,
          requiresQuiz:  lesson.requiresQuiz,
          requiresLab:   lesson.requiresLab,
          viewed:        lp?.lessonViewed ?? false,
          quizCompleted: lp?.quizCompleted ?? false,
          labCompleted:  lp?.labCompleted ?? false,
          isCompleted:   lp?.isCompleted ?? false,
          completedAt:   lp?.completedAt ?? null,
          quiz:          quizDetail,
          lab:           labDetail,
        };
      });

      const completedLessons = lessonDetails.filter(l => l.isCompleted).length;
      const viewedLessons    = lessonDetails.filter(l => l.viewed).length;
      const passedQuizzes    = lessonDetails.filter(l => l.quiz?.passed).length;
      const totalQuizzes     = lessonDetails.filter(l => l.quiz).length;
      const submittedLabs    = lessonDetails.filter(l => l.lab?.submitted).length;
      const gradedLabs       = lessonDetails.filter(l => l.lab?.status === "graded").length;
      const totalLabs        = lessonDetails.filter(l => l.lab).length;

      const quizScores = lessonDetails
        .filter(l => l.quiz?.bestScore != null)
        .map(l => l.quiz.bestScore);
      const avgQuizScore = quizScores.length
        ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
        : null;

      const labScores = lessonDetails
        .filter(l => l.lab?.scorePercent != null)
        .map(l => l.lab.scorePercent);
      const avgLabScore = labScores.length
        ? Math.round(labScores.reduce((a, b) => a + b, 0) / labScores.length)
        : null;

      // Weighted score: 50% progress + 30% quiz + 20% lab
      const progressPct = lessons.length > 0
        ? Math.round((completedLessons / lessons.length) * 100)
        : 0;

      let weightedScore = progressPct;
      if (avgQuizScore != null && avgLabScore != null) {
        weightedScore = Math.round(progressPct * 0.5 + avgQuizScore * 0.3 + avgLabScore * 0.2);
      } else if (avgQuizScore != null) {
        weightedScore = Math.round(progressPct * 0.6 + avgQuizScore * 0.4);
      } else if (avgLabScore != null) {
        weightedScore = Math.round(progressPct * 0.7 + avgLabScore * 0.3);
      }

      // Calculate credits earned
      const creditsEarned = (weightedScore / 100) * courseCredits;

      return {
        student: {
          _id:        student._id,
          fullName:   student.fullName,
          email:      student.email,
          studentId:  student.studentId,
          avatar:     student.avatar,
          department: student.department,
          semester:   student.semester,
        },
        enrollment: {
          enrolledAt:  enrollment.enrolledAt,
          progress:    enrollment.progress || 0,
          isCompleted: enrollment.isCompleted || false,
        },
        stats: {
          totalLessons:     lessons.length,
          completedLessons,
          viewedLessons,
          progressPct:      enrollment.progress || 0,
          totalQuizzes,
          passedQuizzes,
          avgQuizScore,
          totalLabs,
          submittedLabs,
          gradedLabs,
          avgLabScore,
          weightedScore,
          creditsEarned,
          totalCredits: courseCredits,
        },
        lessons: lessonDetails,
      };
    });

    // Course-level summary
    const totalStudents   = students.length;
    const completedCount  = students.filter(s => s.enrollment.isCompleted).length;
    const inProgressCount = students.filter(s => !s.enrollment.isCompleted && s.enrollment.progress > 0).length;
    const notStartedCount = students.filter(s => s.enrollment.progress === 0).length;
    const avgProgress     = totalStudents > 0
      ? Math.round(students.reduce((sum, s) => sum + s.enrollment.progress, 0) / totalStudents)
      : 0;

    const allQuizScores = students.flatMap(s =>
      s.lessons.flatMap(l => l.quiz?.bestScore != null ? [l.quiz.bestScore] : [])
    );
    const courseAvgQuiz = allQuizScores.length
      ? Math.round(allQuizScores.reduce((a, b) => a + b, 0) / allQuizScores.length)
      : null;

    const allLabScores = students.flatMap(s =>
      s.lessons.flatMap(l => l.lab?.scorePercent != null ? [l.lab.scorePercent] : [])
    );
    const courseAvgLab = allLabScores.length
      ? Math.round(allLabScores.reduce((a, b) => a + b, 0) / allLabScores.length)
      : null;

    // Calculate total credits earned across all students
    const totalCreditsEarned = students.reduce((sum, s) => sum + (s.stats.creditsEarned || 0), 0);

    // Progress distribution buckets for charts
    const progressBuckets = { "0-25": 0, "26-50": 0, "51-75": 0, "76-100": 0 };
    students.forEach(s => {
      const p = s.enrollment.progress;
      if (p <= 25) progressBuckets["0-25"]++;
      else if (p <= 50) progressBuckets["26-50"]++;
      else if (p <= 75) progressBuckets["51-75"]++;
      else progressBuckets["76-100"]++;
    });

    res.status(200).json({
      course: {
        _id:         course._id,
        title:       course.title,
        code:        course.code,
        department:  course.department,
        credits:     courseCredits,
        semester:    course.semester,
      },
      lessons: lessons.map(l => ({
        _id:   l._id,
        title: l.title,
        order: l.order,
        requiresQuiz: l.requiresQuiz,
        requiresLab:  l.requiresLab,
      })),
      students,
      summary: {
        totalStudents,
        avgProgress,
        completedCount,
        inProgressCount,
        notStartedCount,
        totalLessons:    lessons.length,
        totalQuizzes:    quizzes.length,
        totalLabs:       labs.length,
        courseAvgQuiz,
        courseAvgLab,
        progressBuckets,
        totalCredits: courseCredits,
        totalCreditsEarned,
      },
    });
  } catch (err) {
    console.error("getCourseStudentProgress error:", err.message);
    console.error("Full error:", err);
    res.status(500).json({ message: "Failed to load progress data", error: err.message });
  }
};

/**
 * GET /api/teacher/courses
 * Returns all courses for the logged-in teacher (with enrollment counts).
 */
const getTeacherCoursesWithStats = async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user._id }).sort({ createdAt: -1 }).lean();

    const coursesWithStats = await Promise.all(
      courses.map(async course => {
        const [enrollCount, lessonCount] = await Promise.all([
          Enrollment.countDocuments({ course: course._id }),
          Lesson.countDocuments({ course: course._id, isPublished: true }),
        ]);
        return { ...course, enrolledCount: enrollCount, lessonCount };
      })
    );

    res.status(200).json({ courses: coursesWithStats });
  } catch (err) {
    console.error("getTeacherCoursesWithStats error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getCourseStudentProgress, getTeacherCoursesWithStats };