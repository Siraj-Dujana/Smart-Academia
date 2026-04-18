const express = require('express');
const router = express.Router();
const {
  getFlashcards,
  getFlashcard,
  deleteFlashcard,
  toggleFavorite,
  getFavoriteCards
} = require('../controllers/flashcardController');
const { protect } = require('../middleware/authMiddleware');

// All routes protected
router.get('/', protect, getFlashcards);
router.get('/:id', protect, getFlashcard);
router.delete('/:id', protect, deleteFlashcard);
router.put('/:id/cards/:cardId/favorite', protect, toggleFavorite);
router.get('/:id/favorites', protect, getFavoriteCards);

module.exports = router;