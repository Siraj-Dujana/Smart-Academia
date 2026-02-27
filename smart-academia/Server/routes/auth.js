const express = require("express");
const router = express.Router();
const {
  registerStudent,
  registerTeacher,
  login,
  getMe,
} = require("../controllers/authController.js");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register/student", registerStudent);
router.post("/register/teacher", registerTeacher);
router.post("/login", login);

// Protected route (requires JWT token)
router.get("/me", protect, getMe);

module.exports = router;