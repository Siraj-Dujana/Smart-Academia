const express = require("express");
const router  = express.Router();
const {
  createAnnouncement,
  getAnnouncementsByCourse,
  getTeacherAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  getStudentAnnouncements,
} = require("../controllers/announcementController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Teacher routes
router.post("/",                     protect, authorize("teacher"), createAnnouncement);
router.get("/teacher",               protect, authorize("teacher"), getTeacherAnnouncements);
router.get("/course/:courseId",      protect, authorize("teacher"), getAnnouncementsByCourse);
router.put("/:id",                   protect, authorize("teacher"), updateAnnouncement);
router.delete("/:id",                protect, authorize("teacher"), deleteAnnouncement);

// Student routes
router.get("/student",               protect, authorize("student"), getStudentAnnouncements);

module.exports = router;