const express = require("express");
const router  = express.Router({ mergeParams: true });
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");

// Ensure /tmp exists for multer disk storage
if (!fs.existsSync("/tmp")) fs.mkdirSync("/tmp");

const {
  createLesson, updateLesson, deleteLesson,
  getTeacherLessons, getStudentLessons,
  getLessonContent, getTeacherLessonById,
  getCourseProgress, uploadFile, uploadMiddleware,
  getLessonLimitInfo
} = require("../controllers/lessonController");

const {
  createLab,
  aiGenerateLab,
  aiExplainLab,
  updateLab,
  deleteLab,
  getLabSubmissions,
  gradeSubmission,
  aiEvaluateSubmission,
  submitLab,
  getMySubmission,
  getLabByLesson,
  getSubmissionPDF,
} = require("../controllers/labController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ✅ IMPORT ALL MODELS NEEDED FOR RESET FUNCTIONALITY
const LessonProgress = require("../models/LessonProgress");
const QuizAttempt = require("../models/QuizAttempt");
const LabSubmission = require("../models/LabSubmission");
const Lesson = require("../models/Lesson");

// ── Multer setup for student PDF submissions ─────────────────
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "/tmp"),
  filename:    (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

const pdfUpload = multer({
  storage: pdfStorage,
  limits:  { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

const handlePdfUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE")
      return res.status(400).json({ message: "PDF is too large. Maximum allowed size is 20MB." });
    return res.status(400).json({ message: "File upload error: " + err.message });
  }
  if (err && err.message === "Only PDF files are allowed")
    return res.status(400).json({ message: "Only PDF files are accepted" });
  next(err);
};

// ════════════════════════════════════════════════════════════
// STATIC lesson routes — MUST come before dynamic /:id routes
// ════════════════════════════════════════════════════════════
router.post("/",         protect, authorize("teacher"), createLesson);
router.get( "/teacher",  protect, authorize("teacher"), getTeacherLessons);
router.get( "/",         protect, authorize("student"), getStudentLessons);
router.get( "/progress", protect, authorize("student"), getCourseProgress);
router.post("/upload",   protect, authorize("teacher"), uploadMiddleware, uploadFile);

// ════════════════════════════════════════════════════════════
// LESSON RESET ROUTE - FULLY WORKING
// ════════════════════════════════════════════════════════════
router.post("/:id/reset", protect, authorize("student"), async (req, res) => {
  try {
    const { id: lessonId } = req.params;
    const { courseId } = req.params;
    const studentId = req.user._id;

    console.log("========== RESET DEBUG ==========");
    console.log("Lesson ID:", lessonId);
    console.log("Course ID:", courseId);
    console.log("Student ID:", studentId);

    // 1. Get the lesson
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    console.log("Lesson found:", lesson.title);

    // 2. Find quiz associated with this lesson
    const Quiz = require("../models/Quiz");
    const quiz = await Quiz.findOne({ lesson: lessonId });
    console.log("Quiz found:", quiz ? quiz.title : "No quiz for this lesson");

    if (quiz) {
      const quizAttemptsBefore = await QuizAttempt.find({
        student: studentId,
        quiz: quiz._id,
        course: courseId,
      });
      console.log("Quiz attempts BEFORE delete:", quizAttemptsBefore.length);

      const quizDeleteResult = await QuizAttempt.deleteMany({
        student: studentId,
        quiz: quiz._id,
        course: courseId,
      });
      console.log("Quiz attempts DELETED:", quizDeleteResult.deletedCount);
    }

    // 3. Find lab associated with this lesson
    const Lab = require("../models/Lab");
    const lab = await Lab.findOne({ lesson: lessonId });
    console.log("Lab found:", lab ? lab.title : "No lab for this lesson");

    if (lab) {
      const labSubmissionsBefore = await LabSubmission.find({
        student: studentId,
        lab: lab._id,
        course: courseId,
      });
      console.log("Lab submissions BEFORE delete:", labSubmissionsBefore.length);

      const labDeleteResult = await LabSubmission.deleteMany({
        student: studentId,
        lab: lab._id,
        course: courseId,
      });
      console.log("Lab submissions DELETED:", labDeleteResult.deletedCount);
    }

    // 4. Reset LessonProgress
    const progress = await LessonProgress.findOne({
      student: studentId,
      lesson: lessonId,
      course: courseId,
    });

    if (progress) {
      progress.lessonViewed = false;
      progress.quizCompleted = false;
      progress.quizScore = null;
      progress.labCompleted = false;
      progress.isCompleted = false;
      progress.completedAt = null;
      await progress.save();
      console.log("Progress reset successfully");
    } else {
      await LessonProgress.create({
        student: studentId,
        lesson: lessonId,
        course: courseId,
        lessonViewed: false,
        quizCompleted: false,
        labCompleted: false,
        isCompleted: false,
      });
      console.log("New progress record created");
    }

    console.log("========== RESET COMPLETE ==========");

    res.status(200).json({
      success: true,
      message: "Lesson reset successfully",
      data: {
        lessonId,
        courseId,
        resetAt: new Date(),
        quizReset: quiz ? true : false,
        labReset: lab ? true : false,
      },
    });
  } catch (error) {
    console.error("Reset lesson error:", error);
    res.status(500).json({
      message: "Failed to reset lesson",
      error: error.message,
    });
  }
});
// ════════════════════════════════════════════════════════════
// DYNAMIC lesson routes
// ════════════════════════════════════════════════════════════
router.put(   "/:id",         protect, authorize("teacher"), updateLesson);
router.delete("/:id",         protect, authorize("teacher"), deleteLesson);
router.get(   "/:id/teacher", protect, authorize("teacher"), getTeacherLessonById);
router.get(   "/:id/content", protect, authorize("student"), getLessonContent);

// ════════════════════════════════════════════════════════════
// LAB routes — TEACHER
// ════════════════════════════════════════════════════════════
router.get("/:lessonId/lab", protect, getLabByLesson);
router.post("/:lessonId/lab", protect, authorize("teacher"), createLab);
router.post("/:lessonId/lab/ai-generate", protect, authorize("teacher"), aiGenerateLab);
router.post("/:lessonId/lab/:labId/explain", protect, aiExplainLab);
router.put("/:lessonId/lab/:labId", protect, authorize("teacher"), updateLab);
router.delete("/:lessonId/lab/:labId", protect, authorize("teacher"), deleteLab);
router.get("/:lessonId/lab/:labId/submissions", protect, authorize("teacher"), getLabSubmissions);
router.get("/:lessonId/lab/:labId/submissions/:submissionId/pdf", getSubmissionPDF);
router.put("/:lessonId/lab/:labId/submissions/:submissionId/grade", protect, authorize("teacher"), gradeSubmission);
router.post("/:lessonId/lab/:labId/submissions/:submissionId/ai-evaluate", protect, authorize("teacher"), aiEvaluateSubmission);

// ════════════════════════════════════════════════════════════
// LAB routes — STUDENT
// ════════════════════════════════════════════════════════════
router.post("/:lessonId/lab/:labId/submit", protect, authorize("student"),
  pdfUpload.single("pdf"), handlePdfUploadError, submitLab);
router.get("/:lessonId/lab/:labId/my-submission", protect, authorize("student"), getMySubmission);

module.exports = router;