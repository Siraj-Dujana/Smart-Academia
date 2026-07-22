const express = require("express");
const router = express.Router();
const { getAllStudents, getAllTeachers, deleteUser, getDashboardStats,reassignCourse } = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin"));

router.get("/stats", getDashboardStats);
router.get("/students", getAllStudents);
router.get("/teachers", getAllTeachers);
router.delete("/users/:id", deleteUser);
router.put("/courses/:id/reassign", reassignCourse);

module.exports = router;