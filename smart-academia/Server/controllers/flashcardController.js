const Flashcard = require('../models/Flashcard');

// @route   GET /api/flashcards
const getFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ user: req.user._id })
      .select('-cards') // don't send all cards in list
      .sort({ createdAt: -1 });

    res.status(200).json(flashcards);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/flashcards/:id
const getFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard set not found' });
    }

    res.status(200).json(flashcard);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/flashcards/:id
const deleteFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard set not found' });
    }

    await flashcard.deleteOne();

    res.status(200).json({ message: 'Flashcard set deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/flashcards/:id/cards/:cardId/favorite
const toggleFavorite = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard set not found' });
    }

    // Find the specific card
    const card = flashcard.cards.id(req.params.cardId);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Toggle favorite
    card.isFavorite = !card.isFavorite;
    await flashcard.save();

    res.status(200).json({
      message: `Card ${card.isFavorite ? 'added to' : 'removed from'} favorites`,
      isFavorite: card.isFavorite
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/flashcards/:id/favorites
const getFavoriteCards = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard set not found' });
    }

    const favoriteCards = flashcard.cards.filter(card => card.isFavorite);

    res.status(200).json({ favoriteCards });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFlashcards,
  getFlashcard,
  deleteFlashcard,
  toggleFavorite,
  getFavoriteCards
};