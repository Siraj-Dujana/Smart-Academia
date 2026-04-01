const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lesson title is required"],
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
    order: {
      type: Number,
      required: true,
    },
    format: {
      type: String,
      enum: ["text", "video", "flowchart"],
      default: "text",
    },
    content: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: null,
    },
    duration: {
      type: String,
      default: "30 min",
    },
    points: {
      type: Number,
      default: 100,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", LessonSchema);