const express = require('express');
const multer = require('multer');
const {
  uploadCourseNote,
  getCourseNotes,
  getTeacherNotes,
  deleteCourseNote,
  updateCourseNote,
  trackNoteDownload,
  downloadNote
} = require('../controllers/courseNoteController');
const { protect, teacherOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Teacher routes
router.post('/upload', protect, teacherOnly, upload.single('file'), uploadCourseNote);
router.get('/teacher/courses/:courseId', protect, teacherOnly, getTeacherNotes);
router.delete('/:noteId', protect, teacherOnly, deleteCourseNote);
router.put('/:noteId', protect, teacherOnly, updateCourseNote);

// Student routes
router.get('/course/:courseId', protect, getCourseNotes);
router.post('/:noteId/download', protect, trackNoteDownload);
// Add this line with other routes
router.get('/download/:noteId', protect, downloadNote);

module.exports = router;