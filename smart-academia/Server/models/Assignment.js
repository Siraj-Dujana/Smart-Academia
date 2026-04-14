const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  description:  { type: String, default: "" },
  instructions: { type: String, default: "" },
  course:       { type: mongoose.Schema.Types.ObjectId, ref: "Course",  required: true },
  lesson:       { type: mongoose.Schema.Types.ObjectId, ref: "Lesson",  default: null },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
  dueDate:      { type: Date,    default: null },
  totalMarks:   { type: Number,  default: 100 },
  isPublished:  { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Assignment", AssignmentSchema);