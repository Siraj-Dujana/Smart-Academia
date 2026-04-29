// routes/Notifications.js
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
// STUDENT + TEACHER ROUTES
// ─────────────────────────────────────────────────────────────
router.get("/",              getNotifications);
router.get("/unread-count",  getUnreadCount);
router.put("/read-all",      markAllAsRead);
router.delete("/clear-read", clearAllRead);
router.put("/:id/read",      markAsRead);
router.delete("/:id",        deleteNotification);

// Teacher only
router.post("/announcement", authorize("teacher"), sendAnnouncementNotification);
router.post("/deadline",     authorize("teacher"), sendDeadlineNotification);

// ─────────────────────────────────────────────────────────────
// ADMIN ROUTES  — prefix is /admin (no duplication)
// These are mounted as /api/notifications/admin/...
// ─────────────────────────────────────────────────────────────
router.get("/admin",                    authorize("admin"), getAdminNotifications);
router.put("/admin/read-all",           authorize("admin"), markAdminAllAsRead);
router.delete("/admin/clear-read",      authorize("admin"), clearAdminRead);
router.put("/admin/:id/read",           authorize("admin"), markAdminAsRead);
router.delete("/admin/:id",             authorize("admin"), deleteAdminNotification);
router.post("/admin/broadcast",         authorize("admin"), adminBroadcast);

// Add this admin route for unread count
router.get("/admin/unread-count", authorize("admin"), getUnreadCount);

module.exports = router;