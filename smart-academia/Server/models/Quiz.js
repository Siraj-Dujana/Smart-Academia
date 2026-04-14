const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // ✅ NEW — link quiz to a specific lesson
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    timeLimit: {
      type: Number,
      default: 30,
    },
    passingScore: {
      type: Number,
      default: 70,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    shuffleQuestions: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", QuizSchema);