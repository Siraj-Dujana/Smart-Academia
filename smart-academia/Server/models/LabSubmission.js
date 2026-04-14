// models/LabSubmission.js
const mongoose = require("mongoose");

const LabSubmissionSchema = new mongoose.Schema(
  {
    lab:     { type: mongoose.Schema.Types.ObjectId, ref: "Lab",    required: true },
    lesson:  { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
    course:  { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true },

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
  },
  { timestamps: true }
);

// One submission per student per lab
LabSubmissionSchema.index({ lab: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("LabSubmission", LabSubmissionSchema);