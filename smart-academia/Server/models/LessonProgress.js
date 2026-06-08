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
    lessonViewed: {
      type: Boolean,
      default: false,
    },
    quizCompleted: {
      type: Boolean,
      default: false,
    },
    quizScore: {
      type: Number,
      default: null,
    },
    labCompleted: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    // ✅ ADD THESE TWO NEW FIELDS
    quizPassed: {
      type: Boolean,
      default: false,
    },
    labPassed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

LessonProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model("LessonProgress", LessonProgressSchema);