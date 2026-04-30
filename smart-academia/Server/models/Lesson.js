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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    // text | video | mixed
    format: {
      type: String,
      enum: ["text", "video", "mixed"],
      default: "text",
    },
    // HTML content written by teacher (legacy)
    content: {
      type: String,
      default: "",
    },
    // Video URL (YouTube embed, Cloudinary, etc.)
    videoUrl: {
      type: String,
      default: null,
    },
    // ✅ NEW: Content blocks for modular lesson content
    contentBlocks: {
      type: Array,
      default: [],
      // Structure of each block:
      // {
      //   id: Number,
      //   type: "text" | "image" | "video",
      //   content: String (for text blocks),
      //   url: String (for image/video blocks),
      //   caption: String (for image/video blocks),
      //   order: Number
      // }
    },
    duration: {
      type: String,
      default: "30 min",
    },
    points: {
      type: Number,
      default: 100,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    // Controls what student must finish before next lesson unlocks
    requiresQuiz: {
      type: Boolean,
      default: true,
    },
    requiresLab: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", LessonSchema);