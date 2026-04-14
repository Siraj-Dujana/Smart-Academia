// routes/lessons.js — UPDATED: adds multer for PDF, new lab routes
const express = require("express");
const router  = express.Router({ mergeParams: true });
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");

// Ensure /tmp exists
if (!fs.existsSync("/tmp")) fs.mkdirSync("/tmp");

const {
  createLesson, updateLesson, deleteLesson,
  getTeacherLessons, getStudentLessons,
  getLessonContent, getTeacherLessonById,
  getCourseProgress, uploadFile, uploadMiddleware,
} = require("../controllers/lessonController");

const {
  createLab, aiGenerateLab, updateLab, deleteLab,
  getLabSubmissions, gradeSubmission,
  runCode, submitLab, getMySubmission,
} = require("../controllers/labController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Multer for PDF student submissions
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "/tmp"),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});
const pdfUpload = multer({
  storage: pdfStorage,
  limits:  { fileSize: 20 * 1024 * 1024 },  // 20MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// PDF upload error handler middleware
const handlePdfError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE")
      return res.status(400).json({ message: "PDF too large — maximum 20MB" });
    return res.status(400).json({ message: "Upload error: " + err.message });
  }
  if (err?.message === "Only PDF files are allowed")
    return res.status(400).json({ message: "Only PDF files are accepted" });
  next(err);
};

// ── Static routes FIRST ──────────────────────────────────────
router.post("/",          protect, authorize("teacher"), createLesson);
router.get( "/teacher",   protect, authorize("teacher"), getTeacherLessons);
router.get( "/",          protect, authorize("student"), getStudentLessons);
router.get( "/progress",  protect, authorize("student"), getCourseProgress);
router.post("/upload",    protect, authorize("teacher"), uploadMiddleware, uploadFile);

// ── Dynamic lesson routes ────────────────────────────────────
router.put(    "/:id",          protect, authorize("teacher"), updateLesson);
router.delete( "/:id",          protect, authorize("teacher"), deleteLesson);
router.get(    "/:id/teacher",  protect, authorize("teacher"), getTeacherLessonById);
router.get(    "/:id/content",  protect, authorize("student"), getLessonContent);

// ── Lab — teacher ────────────────────────────────────────────
router.post(  "/:lessonId/lab",              protect, authorize("teacher"), createLab);
router.post(  "/:lessonId/lab/ai-generate",  protect, authorize("teacher"), aiGenerateLab);
router.put(   "/:lessonId/lab/:labId",       protect, authorize("teacher"), updateLab);
router.delete("/:lessonId/lab/:labId",       protect, authorize("teacher"), deleteLab);
router.get(   "/:lessonId/lab/:labId/submissions",
                                             protect, authorize("teacher"), getLabSubmissions);
router.put(   "/:lessonId/lab/:labId/submissions/:submissionId/grade",
                                             protect, authorize("teacher"), gradeSubmission);

// ── Lab — student ────────────────────────────────────────────
router.post("/:lessonId/lab/run-code",             protect, authorize("student"), runCode);
router.post("/:lessonId/lab/:labId/submit",        protect, authorize("student"),
            pdfUpload.single("pdf"), handlePdfError, submitLab);
router.get( "/:lessonId/lab/:labId/my-submission", protect, authorize("student"), getMySubmission);

module.exports = router;