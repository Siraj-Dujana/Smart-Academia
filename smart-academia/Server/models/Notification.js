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

// Auto-expire notifications after 90 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model("Notification", NotificationSchema);