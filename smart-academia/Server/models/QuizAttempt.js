const mongoose = require("mongoose");

const QuizAttemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    // Each answer stored as plain object — no subdocument schema
    answers: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    score: {
      type: Number,
      default: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    timeTaken: {
      type: Number,
      default: 0,
    },
    // Tab switching detection flag
    flaggedForCheating: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizAttempt", QuizAttemptSchema);