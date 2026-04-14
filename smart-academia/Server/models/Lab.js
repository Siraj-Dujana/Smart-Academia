// models/Lab.js — UPDATED: adds description, outputExample, difficulty, aiGenerated
const mongoose = require("mongoose");

const LabSchema = new mongoose.Schema(
  {
    title:         { type: String, required: [true, "Title required"], trim: true },
    // NEW FIELDS
    description:   { type: String, default: "" },
    outputExample: { type: String, default: "" },
    difficulty:    { type: String, enum: ["easy","medium","hard"], default: "medium" },
    aiGenerated:   { type: Boolean, default: false },
    // EXISTING
    lesson:     { type: mongoose.Schema.Types.ObjectId, ref: "Lesson",  required: true },
    course:     { type: mongoose.Schema.Types.ObjectId, ref: "Course",  required: true },
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
    labType:    { type: String, enum: ["programming","dld","networking","theory"], default: "theory" },
    instructions: { type: String, default: "" },
    starterCode:  { type: String, default: "" },
    language:     { type: String, default: "python" },
    testCases:    { type: mongoose.Schema.Types.Mixed, default: [] },
    isPublished:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lab", LabSchema);