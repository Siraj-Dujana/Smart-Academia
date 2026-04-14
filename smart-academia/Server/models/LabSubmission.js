// models/LabSubmission.js — UPDATED: adds PDF fields + grading fields
const mongoose = require("mongoose");

const LabSubmissionSchema = new mongoose.Schema(
  {
    lab:     { type: mongoose.Schema.Types.ObjectId, ref: "Lab",    required: true },
    lesson:  { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
    course:  { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true },
    // Text answer (kept optional — either answer or pdfUrl must exist)
    answer:  { type: String, default: "" },
    // NEW: PDF upload fields
    pdfUrl:       { type: String, default: null },    // Cloudinary secure_url
    pdfFileName:  { type: String, default: null },    // original filename
    pdfPublicId:  { type: String, default: null },    // for Cloudinary deletion
    // Code run results
    testResults:  { type: mongoose.Schema.Types.Mixed, default: [] },
    submittedAt:  { type: Date, default: Date.now },
    // GRADING
    marks:    { type: Number, default: null },
    feedback: { type: String, default: null },
    status:   { type: String, enum: ["submitted","graded"], default: "submitted" },
    gradedAt: { type: Date,   default: null },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Compound index — one submission per student per lab
LabSubmissionSchema.index({ lab: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("LabSubmission", LabSubmissionSchema);