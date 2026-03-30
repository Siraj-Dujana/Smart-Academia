const express = require("express");
const router = express.Router();
const {
  registerStudent,
  registerTeacher,
  login,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register/student", registerStudent);
router.post("/register/teacher", registerTeacher);
router.post("/login", login);
router.get("/me", protect, getMe);

module.exports = router;