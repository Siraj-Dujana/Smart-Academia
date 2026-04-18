const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  updateSummary
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// All routes are protected
router.post('/upload', protect, upload.single('pdf'), uploadDocument);
router.get('/', protect, getDocuments);
router.get('/:id', protect, getDocument);
router.delete('/:id', protect, deleteDocument);
router.put('/:id/summary', protect, updateSummary);

module.exports = router;