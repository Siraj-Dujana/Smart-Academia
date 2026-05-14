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

// ─────────────────────────────────────────────────────────────
// TEACHER: Generate Course Report PDF
// GET /api/teacher/courses/:courseId/report
// ─────────────────────────────────────────────────────────────
const generateCourseReport = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
    
    // Verify the course belongs to this teacher
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (!course.teacher || course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your course" });

      const teacher = await User.findById(course.teacher).select("fullName");
    }

    // Get all students with their progress
    const enrollments = await Enrollment.find({ course: courseId })
      .populate("student", "fullName email studentId")
      .lean();

    if (!enrollments.length) {
      return res.status(404).json({ message: "No students enrolled in this course" });
    }

    const studentIds = enrollments.map(e => e.student._id);

    // Get all progress data
    const [allLessonProgress, allQuizAttempts, allLabSubmissions, lessons, quizzes, labs] = await Promise.all([
      LessonProgress.find({ course: courseId, student: { $in: studentIds } }).lean(),
      QuizAttempt.find({ course: courseId, student: { $in: studentIds } }).lean(),
      LabSubmission.find({ course: courseId, student: { $in: studentIds } }).lean(),
      Lesson.find({ course: courseId, isPublished: true }).lean(),
      Quiz.find({ course: courseId, isPublished: true }).lean(),
      Lab.find({ course: courseId, isPublished: true }).lean(),
    ]);

    const totalLessons = lessons.length || 1;
    const totalQuizzes = quizzes.length;
    const totalLabs = labs.length;

    // Build student performance data
    const studentsData = enrollments.map(enrollment => {
      const student = enrollment.student;
      const sid = student._id.toString();

      const studentLessons = allLessonProgress.filter(lp => lp.student.toString() === sid);
      const completedLessons = studentLessons.filter(lp => lp.isCompleted).length;
      const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      // Check if the student has actually completed the course
      const isCourseCompleted = enrollment.isCompleted === true;
      
      // For quiz scores (only if quizzes exist in the course)
      const studentQuizzes = allQuizAttempts.filter(qa => qa.student.toString() === sid);
      const bestScoresByQuiz = new Map();
      studentQuizzes.forEach(qa => {
        const quizId = qa.quiz.toString();
        const currentBest = bestScoresByQuiz.get(quizId);
        if (!currentBest || qa.score > currentBest) {
          bestScoresByQuiz.set(quizId, qa.score);
        }
      });
      const bestQuizScores = Array.from(bestScoresByQuiz.values());
      const avgQuizScore = bestQuizScores.length 
        ? Math.round(bestQuizScores.reduce((a, b) => a + b, 0) / bestQuizScores.length) 
        : null;
      const uniquePassedQuizzes = new Set(studentQuizzes.filter(qa => qa.passed).map(qa => qa.quiz.toString())).size;

      // For lab scores (only if labs exist in the course)
      const studentLabs = allLabSubmissions.filter(ls => ls.student.toString() === sid);
      const gradedLabs = studentLabs.filter(ls => ls.status === "graded" && ls.marks != null);
      const labScores = gradedLabs.map(ls => Math.round((ls.marks / (ls.lab?.totalMarks || 100)) * 100));
      const avgLabScore = labScores.length 
        ? Math.round(labScores.reduce((a, b) => a + b, 0) / labScores.length) 
        : null;

      // Weighted score calculation (only if quizzes/labs exist)
      let weightedScore = progressPct;
      if (totalQuizzes > 0 && avgQuizScore !== null) {
        weightedScore = Math.round((progressPct * 0.5) + (avgQuizScore * 0.3) + (avgLabScore !== null ? avgLabScore * 0.2 : 0));
      }
      
      // ✅ FIX: If course is completed, give FULL credits (not weighted)
      let creditsEarned;
      if (isCourseCompleted) {
        creditsEarned = course.credits || 3;  // Full credits for completed course
      } else {
        creditsEarned = (weightedScore / 100) * (course.credits || 3);
      }
      
      // Determine student status
      let status = "Not Started";
      if (isCourseCompleted) {
        status = "Completed";
      } else if (progressPct > 0) {
        status = "In Progress";
      }

      return {
        name: student.fullName,
        email: student.email,
        studentId: student.studentId || "N/A",
        progress: progressPct,
        completedLessons,
        totalLessons,
        avgQuizScore: avgQuizScore !== null ? `${avgQuizScore}%` : "N/A",
        passedQuizzes: uniquePassedQuizzes,
        totalQuizzes,
        avgLabScore: avgLabScore !== null ? `${avgLabScore}%` : "N/A",
        submittedLabs: studentLabs.length,
        totalLabs,
        creditsEarned: creditsEarned.toFixed(1),
        status: status,
        isCompleted: isCourseCompleted,
      };
    });

    studentsData.sort((a, b) => b.progress - a.progress);

    const classAvgProgress = studentsData.length ? Math.round(studentsData.reduce((sum, s) => sum + s.progress, 0) / studentsData.length) : 0;
    const completedCount = studentsData.filter(s => s.isCompleted).length;
    const totalCreditsEarned = studentsData.reduce((sum, s) => sum + parseFloat(s.creditsEarned), 0).toFixed(1);

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const pageWidth = 842;
    const pageHeight = 595;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);

    const primary = rgb(0.39, 0.4, 0.94);
    const darkBg = rgb(0.03, 0.05, 0.1);
    const lightText = rgb(0.94, 0.96, 0.98);
    const dimText = rgb(0.58, 0.64, 0.72);
    const mutedText = rgb(0.39, 0.45, 0.55);
    const green = rgb(0.13, 0.77, 0.37);

    // Background
    page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: darkBg });
    
    // Top bar
    page.drawRectangle({ x: 0, y: pageHeight - 12, width: pageWidth, height: 12, color: primary });
    page.drawRectangle({ x: 0, y: pageHeight - 8, width: pageWidth, height: 4, color: primary, opacity: 0.7 });

    // Header
    // Center SMART ACADEMIA
const titleWidth = boldFont.widthOfTextAtSize("SMART ACADEMIA", 35);
const titleX = (pageWidth - titleWidth) / 2;
page.drawText("SMART ACADEMIA", { x: titleX, y: pageHeight - 50, size: 35, font: boldFont, color: primary });

// Center Course Performance Report
const subtitleWidth = boldFont.widthOfTextAtSize("Course Performance Report", 18);
const subtitleX = (pageWidth - subtitleWidth) / 2;
page.drawText("Course Performance Report", { x: subtitleX, y: pageHeight - 70, size: 18, font: boldFont, color: lightText });
    // Header
    page.drawText(`Course: ${course.title} (${course.code})`, { x: 30, y: pageHeight - 90, size: 12, font: normalFont, color: lightText });
    
    // Teacher info - centered
const teacher = await User.findById(course.teacher).select("fullName");
const teacherText = `Teacher Name: ${teacher?.fullName || "N/A"}`;
const teacherWidth = normalFont.widthOfTextAtSize(teacherText, 12);
const teacherX = (pageWidth - teacherWidth) -690;
page.drawText(teacherText, { x: teacherX, y: pageHeight - 107, size: 12, font: normalFont, color: lightText });
page.drawText(`Credits: ${course.credits} Credits`, { x: 30, y: pageHeight - 125, size: 12, font: normalFont, color: lightText });

    page.drawText(`Generated on: ${new Date().toLocaleString()}`, { x: 30, y: pageHeight - 143, size: 12, font: italicFont, color: lightText });

    // Summary Cards
    const cardY = pageHeight - 220;
    const cardHeight = 55;
    const cardWidth = 180;
    
    const cards = [
      { label: "Total Students", value: studentsData.length, color: primary, x: 30 },
      { label: "Avg Progress", value: `${classAvgProgress}%`, color: primary, x: 220 },
      { label: "Completed", value: `${completedCount} / ${studentsData.length}`, color: green, x: 410 },
      { label: "Total Credits Earned", value: totalCreditsEarned, color: primary, x: 600 },
    ];

    for (const card of cards) {
      page.drawRectangle({ x: card.x, y: cardY, width: cardWidth, height: cardHeight, borderColor: card.color, borderWidth: 0.5 });
      page.drawText(card.label, { x: card.x + 10, y: cardY + cardHeight - 15, size: 8, font: normalFont, color: mutedText });
      page.drawText(String(card.value), { x: card.x + 10, y: cardY + cardHeight - 38, size: 22, font: boldFont, color: card.color });
    }

    // Table Header (removed Score column)
    let tableY = cardY - 50;
    const headerHeight = 18;
    
    page.drawRectangle({ x: 30, y: tableY - headerHeight, width: 782, height: headerHeight, color: primary, opacity: 0.8 });
    
    // ✅ Removed "Score" column - now 8 columns instead of 9
    const headers = ["#", "Student Name", "ID", "Progress", "Quiz", "Lab", "Credits", "Status"];
    const colWidths = [30, 150, 90, 70, 80, 80, 80, 100];
    let headerX = 35;
    
    for (let i = 0; i < headers.length; i++) {
      page.drawText(headers[i], { x: headerX, y: tableY - 13, size:12, font: boldFont, color: lightText });
      headerX += colWidths[i];
    }

    // Table Rows
    let rowY = tableY - 30;
    const rowHeight = 20;
    
    for (let i = 0; i < Math.min(studentsData.length, 25); i++) {
      const s = studentsData[i];
      if (rowY < 40) break;
      
      if (i % 2 === 0) {
        page.drawRectangle({ x: 30, y: rowY - rowHeight + 4, width: 782, height: rowHeight, color: rgb(0.06, 0.09, 0.16), opacity: 0.5 });
      }
      
      let cellX = 35;
      page.drawText(`${i + 1}`, { x: cellX, y: rowY - 5, size: 12, font: normalFont, color: dimText }); cellX += colWidths[0];
      
      let name = s.name.length > 20 ? s.name.substring(0, 17) + "..." : s.name;
      page.drawText(name, { x: cellX, y: rowY - 5, size: 12, font: normalFont, color: lightText }); cellX += colWidths[1];
      
      page.drawText(s.studentId.toString(), { x: cellX, y: rowY - 5, size: 12, font: monoFont, color: dimText }); cellX += colWidths[2];
      
      page.drawText(`${s.progress}%`, { x: cellX, y: rowY - 5, size: 12, font: normalFont, color: green }); cellX += colWidths[3];
      
      page.drawText(`${s.avgQuizScore}`, { x: cellX, y: rowY - 5, size: 12, font: normalFont, color: dimText }); cellX += colWidths[4];
      
      page.drawText(`${s.avgLabScore}`, { x: cellX, y: rowY - 5, size: 12, font: normalFont, color: dimText }); cellX += colWidths[5];
      
      page.drawText(`${s.creditsEarned}`, { x: cellX, y: rowY - 5, size: 12, font: normalFont, color: lightText }); cellX += colWidths[6];
      
      const statusColor = s.status === "Completed" ? green : s.status === "In Progress" ? primary : mutedText;
      page.drawText(s.status, { x: cellX, y: rowY - 5, size: 12, font: normalFont, color: statusColor });
      
      rowY -= rowHeight;
    }

    // Footer
    page.drawText(`Page 1 of 1`, { x: pageWidth - 100, y: 20, size: 8, font: normalFont, color: mutedText });
    page.drawText("SmartAcademia - AI-Powered Learning Platform", { x: 30, y: 20, size: 8, font: normalFont, color: mutedText });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Course_Report_${course.code}_${new Date().toISOString().slice(0, 10)}.pdf"`);
    res.send(Buffer.from(pdfBytes));
    
  } catch (err) {
    console.error("generateCourseReport error:", err.message);
    console.error("Full error:", err);
    res.status(500).json({ message: "Failed to generate report: " + err.message });
  }
};

module.exports = { getCourseStudentProgress, getTeacherCoursesWithStats, generateCourseReport };
