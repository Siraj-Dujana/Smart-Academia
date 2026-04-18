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
  getAnalytics
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// All routes protected
router.get('/analytics', protect, getAnalytics);
router.post('/summary/:documentId', protect, generateSummary);
router.post('/chat/:documentId', protect, chatWithDocument);
router.get('/chat/:documentId/history', protect, getChatHistory);
router.delete('/chat/:documentId/history', protect, clearChatHistory);
router.post('/explain/:documentId', protect, explainConcept);
router.post('/flashcards/:documentId', protect, generateFlashcards);
router.post('/quiz/:documentId', protect, generateQuiz);

module.exports = router;