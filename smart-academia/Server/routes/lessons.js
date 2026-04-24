// routes/lessons.js
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
  getSubmissionPDF,       // ✅ ADDED
} = require("../controllers/labController");

const { protect, authorize } = require("../middleware/authMiddleware");

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
// DYNAMIC lesson routes
// ════════════════════════════════════════════════════════════
router.put(   "/:id",         protect, authorize("teacher"), updateLesson);
router.delete("/:id",         protect, authorize("teacher"), deleteLesson);
router.get(   "/:id/teacher", protect, authorize("teacher"), getTeacherLessonById);
router.get(   "/:id/content", protect, authorize("student"), getLessonContent);

// ════════════════════════════════════════════════════════════
// LAB routes — TEACHER
// ════════════════════════════════════════════════════════════

// ✅ GET lab for a lesson
router.get("/:lessonId/lab", protect, getLabByLesson);

// Create lab manually
router.post("/:lessonId/lab", protect, authorize("teacher"), createLab);

// AI generate lab
router.post("/:lessonId/lab/ai-generate", protect, authorize("teacher"), aiGenerateLab);

// AI explain lab
router.post("/:lessonId/lab/:labId/explain", protect, aiExplainLab);

// Update lab
router.put("/:lessonId/lab/:labId", protect, authorize("teacher"), updateLab);

// Delete lab
router.delete("/:lessonId/lab/:labId", protect, authorize("teacher"), deleteLab);

// Get all student submissions for a lab
router.get("/:lessonId/lab/:labId/submissions", protect, authorize("teacher"), getLabSubmissions);

// ✅ PDF proxy route - Get submission PDF with auth check
router.get("/:lessonId/lab/:labId/submissions/:submissionId/pdf",  getSubmissionPDF);

// Grade a submission manually
router.put("/:lessonId/lab/:labId/submissions/:submissionId/grade", protect, authorize("teacher"), gradeSubmission);

// AI evaluate a submission
router.post("/:lessonId/lab/:labId/submissions/:submissionId/ai-evaluate", protect, authorize("teacher"), aiEvaluateSubmission);

// ════════════════════════════════════════════════════════════
// LAB routes — STUDENT
// ════════════════════════════════════════════════════════════

// Submit lab (text answer + optional PDF)
router.post("/:lessonId/lab/:labId/submit", protect, authorize("student"),
  pdfUpload.single("pdf"), handlePdfUploadError, submitLab);

// Get own submission
router.get("/:lessonId/lab/:labId/my-submission", protect, authorize("student"), getMySubmission);

module.exports = router;