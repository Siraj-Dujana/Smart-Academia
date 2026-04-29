// models/Notification.js
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      enum: [
        // Student/Teacher types
        "quiz_deadline",
        "lab_deadline",
        "assignment_deadline",
        "announcement",
        "course_published",
        "enrollment",
        "grade_posted",
        "lab_graded",
        "assignment_graded",
        "lesson_unlocked",
        "quiz_passed",
        "course_completed",
        // Admin types
        "teacher_registration",
        "student_registration", 
        "course_creation",
        "course_deletion",
        "user_report",
        "system_alert",
        "backup_completed",
        "maintenance",
        "system",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    // Link to navigate when clicking the notification
    link: {
      type: String,
      default: null,
    },
    // Related entity IDs for context
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      default: null,
    },
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      default: null,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      default: null,
    },
    // For admin notifications - additional metadata
    metadata: {
      userName: { type: String, default: null },      // Name of user involved
      userEmail: { type: String, default: null },     // Email of user involved
      userRole: { type: String, default: null },      // Role of user involved
      courseName: { type: String, default: null },    // Course name for course events
      courseCode: { type: String, default: null },    // Course code for course events
      actionBy: { type: String, default: null },      // Who performed the action
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isEmailSent: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    // For deadline notifications — when the deadline is
    dueDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // Auto-expire after 90 days

// Static method to get unread count for a user
NotificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ recipient: userId, isRead: false });
};

// Static method to mark all as read for a user
NotificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
};

// Static method to delete old read notifications
NotificationSchema.statics.deleteOldRead = function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  return this.deleteMany({
    isRead: true,
    createdAt: { $lt: cutoffDate }
  });
};

module.exports = mongoose.model("Notification", NotificationSchema);