const express = require("express");
const router  = express.Router();

// Only import course controller — lessons have their own route file now
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

const { protect, authorize } = require("../middleware/authMiddleware");

// ===== PUBLIC =====
router.get("/published", getAllPublishedCourses);

//new route added
router.get("/teacher", protect, authorize("teacher"), getTeacherCourses);

// ===== STUDENT =====
router.get("/enrolled",      protect, authorize("student"), getEnrolledCourses);
router.post("/:id/enroll",   protect, authorize("student"), enrollCourse);
router.delete("/:id/unenroll", protect, authorize("student"), unenrollCourse);

// ===== TEACHER =====
router.post("/",             protect, authorize("teacher"), createCourse);
router.get("/my-courses",    protect, authorize("teacher"), getTeacherCourses);
router.put("/:id",           protect, authorize("teacher"), updateCourse);
router.delete("/:id",        protect, authorize("teacher"), deleteCourse);

// ===== ADMIN =====
router.get("/all",           protect, authorize("admin"), getAllCourses);

// ===== SHARED — must be last to avoid catching /published, /enrolled etc. =====
router.get("/:id",           protect, getCourseById);

module.exports = router;