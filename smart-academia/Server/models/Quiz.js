const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    timeLimit: {
      type: Number, // in minutes
      default: 30,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    passingScore: {
      type: Number,
      default: 70, // percentage
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    // How many questions to show per attempt
    questionsPerAttempt: {
      type: Number,
      default: 10,
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", QuizSchema);