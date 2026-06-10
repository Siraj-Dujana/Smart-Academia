const mongoose = require("mongoose");

const LessonProgressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    
    // Viewing progress
    lessonViewed: {
      type: Boolean,
      default: false,
    },
    
    // ✅ UPDATED: Quiz progress with attempt tracking
    quizCompleted: {
      type: Boolean,
      default: false,
    },
    quizPassed: {
      type: Boolean,
      default: false,
    },
    quizScore: {
      type: Number,
      default: null,
    },
    // ✅ NEW: Track best quiz performance across attempts
    quizBestScore: {
      type: Number,
      default: null,
    },
    quizBestAttempt: {
      type: Number,
      default: null,
    },
    quizTotalAttempts: {
      type: Number,
      default: 0,
    },
    
    // ✅ UPDATED: Lab progress with attempt tracking
    labCompleted: {
      type: Boolean,
      default: false,
    },
    labPassed: {
      type: Boolean,
      default: false,
    },
    // ✅ NEW: Track best lab performance across attempts
    labBestScore: {
      type: Number,
      default: null,
    },
    labBestAttempt: {
      type: Number,
      default: null,
    },
    labTotalAttempts: {
      type: Number,
      default: 0,
    },
    labSubmitted: {
      type: Boolean,
      default: false,
    },
    
    // Overall lesson completion
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Unique index for one progress record per student per lesson
LessonProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });

// Index for course-level queries
LessonProgressSchema.index({ student: 1, course: 1 });

module.exports = mongoose.model("LessonProgress", LessonProgressSchema);