const express = require('express');
const router = express.Router();
const {
  getQuizzes,
  getQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizResults
} = require('../controllers/quizControllerassistant');
const { protect } = require('../middleware/authMiddleware');

// All routes protected
router.get('/', protect, getQuizzes);
router.get('/:id', protect, getQuiz);
router.delete('/:id', protect, deleteQuiz);
router.post('/:id/submit', protect, submitQuiz);
router.get('/:id/results', protect, getQuizResults);

module.exports = router;