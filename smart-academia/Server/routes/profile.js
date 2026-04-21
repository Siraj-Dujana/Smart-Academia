const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
} = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

// Multer setup for avatar uploads (temp storage before Cloudinary)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "/tmp"),
  filename: (req, file, cb) =>
    cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`),
});

const avatarUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpg, png, gif, webp)"));
    }
  },
});

router.get("/me", protect, getProfile);
router.put("/update", protect, updateProfile);
router.post("/avatar", protect, avatarUpload.single("avatar"), uploadAvatar);
router.delete("/avatar", protect, deleteAvatar);
router.put("/change-password", protect, changePassword);

module.exports = router;