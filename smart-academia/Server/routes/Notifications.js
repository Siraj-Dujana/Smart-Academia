// routes/notifications.js
const express = require("express");
const router  = express.Router();
const {
  // Student/Teacher endpoints
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllRead,
  sendAnnouncementNotification,
  sendDeadlineNotification,
  
  // Admin endpoints
  getAdminNotifications,
  markAdminAsRead,
  markAdminAllAsRead,
  clearAdminRead,
  deleteAdminNotification,
  adminBroadcast,
} = require("../controllers/notificationController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// ─────────────────────────────────────────────────────────────
// STUDENT + TEACHER ROUTES (existing)
// ─────────────────────────────────────────────────────────────
router.get("/",             getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/read-all",     markAllAsRead);
router.delete("/clear-read", clearAllRead);
router.put("/:id/read",     markAsRead);
router.delete("/:id",       deleteNotification);

// Teacher only: Send notification to course students
router.post("/announcement", authorize("teacher"), sendAnnouncementNotification);
router.post("/deadline",     authorize("teacher"), sendDeadlineNotification);

// ─────────────────────────────────────────────────────────────
// ADMIN ROUTES (new)
// ─────────────────────────────────────────────────────────────
router.get("/admin/notifications",          authorize("admin"), getAdminNotifications);
router.put("/admin/notifications/read-all", authorize("admin"), markAdminAllAsRead);
router.delete("/admin/notifications/clear-read", authorize("admin"), clearAdminRead);
router.put("/admin/notifications/:id/read", authorize("admin"), markAdminAsRead);
router.delete("/admin/notifications/:id",   authorize("admin"), deleteAdminNotification);
router.post("/admin/broadcast",             authorize("admin"), adminBroadcast);

module.exports = router;