const express = require('express');
const router = express.Router();
const {
  generateSummary,
  chatWithDocument,
  getChatHistory,
  clearChatHistory,
  explainConcept,
  generateFlashcards,
  generateQuiz,
  getAnalytics,
  studentChat,
  teacherChat,
  publicChat, // ✅ Added publicChat import
  chat // ✅ Added chat import if needed
} = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

// =============================================
// PUBLIC ROUTES (No authentication required)
// =============================================
// Landing page AI Tutor chat
router.post('/public-chat', publicChat);

// =============================================
// PROTECTED ROUTES (Authentication required)
// =============================================
router.get('/analytics', protect, getAnalytics);
router.post('/summary/:documentId', protect, generateSummary);
router.post('/chat/:documentId', protect, chatWithDocument);
router.get('/chat/:documentId/history', protect, getChatHistory);
router.delete('/chat/:documentId/history', protect, clearChatHistory);
router.post('/explain/:documentId', protect, explainConcept);
router.post('/flashcards/:documentId', protect, generateFlashcards);
router.post('/quiz/:documentId', protect, generateQuiz);

// =============================================
// ROLE-BASED ROUTES (Authentication + Role required)
// =============================================
// Student AI Tutor
router.post('/student-chat', protect, authorize('student'), studentChat);

// Teacher AI Assistant
router.post('/teacher-chat', protect, authorize('teacher', 'admin'), teacherChat);

module.exports = router;