const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const bcrypt = require("bcryptjs");

// ── GET /api/profile/me ─────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -resetOTP -resetOTPExpiry");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    console.error("getProfile error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── PUT /api/profile/update ─────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const allowedFields = {
      student: ["fullName", "department", "semester"],
      teacher: ["fullName", "department", "specialization", "qualification"],
      admin: ["fullName"],
    };

    const fields = allowedFields[user.role] || ["fullName"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    await user.save();

    const updated = await User.findById(req.user._id).select("-password -resetOTP -resetOTPExpiry");
    res.status(200).json({ message: "Profile updated successfully", user: updated });
  } catch (err) {
    console.error("updateProfile error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/profile/avatar ────────────────────────────────────
// Expects multipart form with field "avatar"
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image file provided" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete old avatar from Cloudinary if exists
    if (user.avatarPublicId) {
      try {
        await cloudinary.uploader.destroy(user.avatarPublicId);
      } catch (e) {
        console.warn("Failed to delete old avatar:", e.message);
      }
    }

    // Upload new avatar
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "smartacademia/avatars",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    user.avatar = result.secure_url;
    user.avatarPublicId = result.public_id;
    await user.save();

    res.status(200).json({
      message: "Avatar uploaded successfully",
      avatar: result.secure_url,
      avatarPublicId: result.public_id,
    });
  } catch (err) {
    console.error("uploadAvatar error:", err.message);
    res.status(500).json({ message: "Failed to upload avatar" });
  }
};

// ── DELETE /api/profile/avatar ──────────────────────────────────
const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }

    user.avatar = null;
    user.avatarPublicId = null;
    await user.save();

    res.status(200).json({ message: "Avatar removed" });
  } catch (err) {
    console.error("deleteAvatar error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── PUT /api/profile/change-password ───────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Both fields are required" });

    if (newPassword.length < 8)
      return res.status(400).json({ message: "New password must be at least 8 characters" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("changePassword error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getProfile, updateProfile, uploadAvatar, deleteAvatar, changePassword };