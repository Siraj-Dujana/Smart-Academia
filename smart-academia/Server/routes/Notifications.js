// routes/notifications.js
const express = require("express");
const router  = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllRead,
  sendAnnouncementNotification,
  sendDeadlineNotification,
} = require("../controllers/notificationController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// Student + Teacher: Get own notifications
router.get("/",             getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/read-all",     markAllAsRead);
router.delete("/clear-read", clearAllRead);
router.put("/:id/read",     markAsRead);
router.delete("/:id",       deleteNotification);

// Teacher only: Send notification to course students
router.post("/announcement", authorize("teacher"), sendAnnouncementNotification);
router.post("/deadline",     authorize("teacher"), sendDeadlineNotification);

module.exports = router;