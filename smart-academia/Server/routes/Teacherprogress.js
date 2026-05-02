// routes/teacherProgress.js
const express = require("express");
const router  = express.Router();
const {
  getCourseStudentProgress,
  getTeacherCoursesWithStats,
} = require("../controllers/teacherProgressController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes require teacher auth
router.use(protect, authorize("teacher"));

// GET /api/teacher/courses — all teacher courses with enroll stats
router.get("/courses", getTeacherCoursesWithStats);

// GET /api/teacher/courses/:courseId/progress — full student progress for one course
router.get("/courses/:courseId/progress", getCourseStudentProgress);

module.exports = router;