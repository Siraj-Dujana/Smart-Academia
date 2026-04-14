const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    // Using questionText (not text) to match controller
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    questionType: {
      type: String,
      enum: ["mcq", "true_false", "short_answer"],
      default: "mcq",
    },
    // Plain array of strings — NOT subdocuments
    options: {
      type: [String],
      default: [],
    },
    correctAnswer: {
      type: String,
      required: [true, "Correct answer is required"],
      trim: true,
    },
    explanation: {
      type: String,
      default: "",
    },
    points: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", QuestionSchema);