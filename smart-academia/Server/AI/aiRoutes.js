const express = require("express");
const router = express.Router();
const { chat, generateQuizQuestions, teacherChat, publicChat } = require("../controllers/aiController");
const { protect, authorize } = require("../middleware/authMiddleware");

// PUBLIC - Landing page AI Tutor chat (no authentication required)
router.post("/public-chat", publicChat);

// Student — AI Tutor chat (requires student auth)
router.post("/chat", protect, authorize("student"), chat);

// Teacher — AI Quiz Generator
router.post("/generate-quiz", protect, authorize("teacher"), generateQuizQuestions);

// Teacher — AI Teaching Assistant Chat
router.post("/teacher-chat", protect, authorize("teacher"), teacherChat);

module.exports = router;