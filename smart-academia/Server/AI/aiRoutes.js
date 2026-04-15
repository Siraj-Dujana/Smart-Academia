const express = require("express");
const router = express.Router();
const { chat, generateQuizQuestions, teacherChat } = require("./aiController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Student — AI Tutor chat
router.post("/chat", protect, authorize("student"), chat);

// Teacher — AI Quiz Generator
router.post("/generate-quiz", protect, authorize("teacher"), generateQuizQuestions);

// Teacher — AI Teaching Assistant Chat
router.post("/teacher-chat", protect, authorize("teacher"), teacherChat);

module.exports = router;