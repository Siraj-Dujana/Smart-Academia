const mongoose = require("mongoose");

const QuizAttemptSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    attemptNumber: { type: Number, required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],

    // FIX: use Mixed instead of Map — avoids JSON serialization issues
    // Stored as plain object: { "questionId": selectedOptionIndex }
    answers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    score: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    earnedPoints: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    timeTaken: { type: Number, default: 0 },
    tabSwitchCount: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizAttempt", QuizAttemptSchema);