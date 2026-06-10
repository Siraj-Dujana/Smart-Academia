// models/LabSubmission.js
const mongoose = require("mongoose");

const LabSubmissionSchema = new mongoose.Schema(
  {
    lab:     { type: mongoose.Schema.Types.ObjectId, ref: "Lab",    required: true },
    lesson:  { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
    course:  { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true },

    // ✅ NEW: Track attempt number for analytics
    attemptNumber: {
      type: Number,
      default: 1,
    },

    // Text answer — optional when PDF is uploaded
    answer: { type: String, default: "" },

    // PDF upload fields (Cloudinary)
    pdfUrl:      { type: String, default: null },
    pdfFileName: { type: String, default: null },
    pdfPublicId: { type: String, default: null },

    submittedAt: { type: Date, default: Date.now },

    // Teacher grading
    marks:    { type: Number, default: null },
    feedback: { type: String, default: null },
    status:   { type: String, enum: ["submitted", "graded"], default: "submitted" },
    gradedAt: { type: Date,   default: null },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // AI Auto-evaluation fields
    aiSuggestedMarks: {
      type: Number,
      default: null,
    },
    aiSuggestedFeedback: {
      type: String,
      default: null,
    },
    aiEvaluatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ✅ UPDATED: Allow multiple attempts per student-lab (remove unique constraint)
// Now index includes attemptNumber to allow multiple submissions
LabSubmissionSchema.index({ lab: 1, student: 1, attemptNumber: 1 }, { unique: true });

// ✅ NEW: Index for fetching latest attempt quickly
LabSubmissionSchema.index({ student: 1, lab: 1, attemptNumber: -1 });

// ✅ NEW: Index for analytics - get all attempts for a lab
LabSubmissionSchema.index({ lab: 1, student: 1, submittedAt: -1 });

module.exports = mongoose.model("LabSubmission", LabSubmissionSchema);