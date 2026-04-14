const mongoose = require("mongoose");

const AssignmentSubmissionSchema = new mongoose.Schema({
  assignment:   { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
  course:       { type: mongoose.Schema.Types.ObjectId, ref: "Course",     required: true },
  student:      { type: mongoose.Schema.Types.ObjectId, ref: "User",       required: true },
  answerText:   { type: String,  default: "" },
  fileUrl:      { type: String,  default: null },
  fileName:     { type: String,  default: null },
  submittedAt:  { type: Date,    default: Date.now },
  // Teacher review fields
  status:       { type: String, enum: ["submitted","reviewed","approved","rejected"], default: "submitted" },
  marksAwarded: { type: Number, default: null },
  feedback:     { type: String, default: null },
  reviewedAt:   { type: Date,   default: null },
  reviewedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

AssignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
module.exports = mongoose.model("AssignmentSubmission", AssignmentSubmissionSchema);