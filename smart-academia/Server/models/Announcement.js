const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  content:    { type: String, required: true, trim: true },
  course:     { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true },
  priority:   { type: String, enum: ["normal", "high", "urgent"], default: "normal" },
  sentEmail:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Announcement", AnnouncementSchema);