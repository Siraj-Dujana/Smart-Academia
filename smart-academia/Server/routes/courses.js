const express = require("express");
const router = express.Router();
const {
  createCourse,
  getTeacherCourses,
  updateCourse,
  deleteCourse,
  getAllPublishedCourses,
  getEnrolledCourses,
  enrollCourse,
  unenrollCourse,
  getAllCourses,
  getCourseById,
} = require("../controllers/courseController");
const {
  createLesson,
  updateLesson,
  deleteLesson,
  getCourseLessons,
  completeLesson,
} = require("../controllers/lessonController");
const { protect, authorize } = require("../middleware/authMiddleware");

// ===== PUBLIC =====
router.get("/published", getAllPublishedCourses);

// ===== STUDENT =====
router.get("/enrolled", protect, authorize("student"), getEnrolledCourses);
router.post("/:id/enroll", protect, authorize("student"), enrollCourse);
router.delete("/:id/unenroll", protect, authorize("student"), unenrollCourse);
router.get("/:courseId/lessons", protect, getCourseLessons);
router.put("/lessons/:id/complete", protect, authorize("student"), completeLesson);

// ===== TEACHER =====
router.post("/", protect, authorize("teacher"), createCourse);
router.get("/my-courses", protect, authorize("teacher"), getTeacherCourses);
router.put("/:id", protect, authorize("teacher"), updateCourse);
router.delete("/:id", protect, authorize("teacher"), deleteCourse);
router.post("/:courseId/lessons", protect, authorize("teacher"), createLesson);
router.put("/lessons/:id", protect, authorize("teacher"), updateLesson);
router.delete("/lessons/:id", protect, authorize("teacher"), deleteLesson);

// ===== ADMIN =====
router.get("/all", protect, authorize("admin"), getAllCourses);

// ===== SHARED (must be last — catches :id) =====
router.get("/:id", protect, getCourseById);

module.exports = router;