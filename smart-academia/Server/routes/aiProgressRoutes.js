const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  analyzeStudentProgress,
  analyzeClassProgress,
  getTeacherCoursesForAnalysis,
} = require("../controllers/aiProgressController");

// Student route (any authenticated user)
router.get("/student", protect, analyzeStudentProgress);

// Teacher routes
router.get("/teacher/courses", protect, authorize("teacher"), getTeacherCoursesForAnalysis);
router.get("/teacher/course/:courseId", protect, authorize("teacher"), analyzeClassProgress);

module.exports = router;