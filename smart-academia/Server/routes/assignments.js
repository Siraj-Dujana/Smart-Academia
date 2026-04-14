const express  = require("express");
const router   = express.Router();
const multer   = require("multer");
const path     = require("path");
const {
  createAssignment, updateAssignment, deleteAssignment,
  getTeacherAssignments, getSubmissions, gradeSubmission,
  getStudentAssignments, submitAssignment, getMySubmission,
} = require("../controllers/assignmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Multer for file uploads (temp disk storage before Cloudinary)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "/tmp"),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// Teacher
router.post("/",                                    protect, authorize("teacher"), createAssignment);
router.get("/course/:courseId",                     protect, authorize("teacher"), getTeacherAssignments);
router.put("/:id",                                  protect, authorize("teacher"), updateAssignment);
router.delete("/:id",                               protect, authorize("teacher"), deleteAssignment);
router.get("/:id/submissions",                      protect, authorize("teacher"), getSubmissions);
router.put("/submissions/:submissionId/grade",      protect, authorize("teacher"), gradeSubmission);

// Student
router.get("/student/course/:courseId",             protect, authorize("student"), getStudentAssignments);
router.post("/:id/submit",                          protect, authorize("student"), upload.single("file"), submitAssignment);
router.get("/:id/my-submission",                    protect, authorize("student"), getMySubmission);

module.exports = router;