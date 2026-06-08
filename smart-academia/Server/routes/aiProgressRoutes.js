const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  analyzeStudentProgress,
  analyzeClassProgress,
  getTeacherCoursesForAnalysis,
  getStudentsWeakAreas,
} = require("../controllers/Aiprogresscontroller");

// Student route (any authenticated user)
router.get("/student", protect, analyzeStudentProgress);

// Teacher routes
router.get("/teacher/courses", protect, authorize("teacher"), getTeacherCoursesForAnalysis);
router.get("/teacher/course/:courseId", protect, authorize("teacher"), analyzeClassProgress);

// Add this route
router.get("/teacher/course/:courseId/students", protect, authorize("teacher"), getStudentsWeakAreas);

module.exports = router;