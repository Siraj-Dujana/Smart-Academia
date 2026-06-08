const CourseNote = require('../models/CourseNote');
const Course = require('../models/Course');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// Helper function to upload to cloudinary with original format preservation
const uploadToCloudinary = (fileBuffer, originalName, mimetype) => {
  return new Promise((resolve, reject) => {
    // Get original file extension
    const originalExt = originalName.split('.').pop().toLowerCase();
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const publicId = `${Date.now()}_${baseName}`;
    
    // Determine resource type and format
    let resourceType = 'auto';
    let format = originalExt;
    
    // For office documents and PDFs, use 'raw' resource type to preserve original format
    const rawTypes = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
    if (rawTypes.includes(originalExt)) {
      resourceType = 'raw';
    }
    
    const uploadOptions = {
      folder: 'course_notes',
      resource_type: resourceType,
      public_id: publicId,
      use_filename: true,
      unique_filename: true,
      format: format
    };
    
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    const readableStream = new Readable();
    readableStream.push(fileBuffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

// Helper function to get file type from mimetype
const getFileType = (mimetype, originalName) => {
  // First check by extension for more accuracy
  const ext = originalName.split('.').pop().toLowerCase();
  
  const extensionMap = {
    'pdf': 'pdf',
    'ppt': 'ppt',
    'pptx': 'pptx',
    'doc': 'doc',
    'docx': 'docx',
    'xls': 'xls',
    'xlsx': 'xlsx',
    'txt': 'txt'
  };
  
  if (extensionMap[ext]) {
    return extensionMap[ext];
  }
  
  // Fallback to mimetype
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype === 'application/msword') return 'doc';
  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  if (mimetype === 'application/vnd.ms-powerpoint') return 'ppt';
  if (mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return 'pptx';
  if (mimetype === 'application/vnd.ms-excel') return 'xls';
  if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'xlsx';
  if (mimetype === 'text/plain') return 'txt';
  return 'other';
};

// @desc    Upload course note
const uploadCourseNote = async (req, res) => {
  try {
    const { courseId, lessonId, title, description, isPublic } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Upload to cloudinary with original format
    const result = await uploadToCloudinary(file.buffer, file.originalname, file.mimetype);
    const fileType = getFileType(file.mimetype, file.originalname);
    
    // IMPORTANT: Ensure isPublic is true by default
    const isPublicValue = isPublic === 'true' || isPublic === true || isPublic === undefined;
    
    const courseNote = new CourseNote({
      courseId,
      lessonId: lessonId || null,
      title: title.trim(),
      description: description || '',
      fileName: file.originalname,
      fileUrl: result.secure_url,
      fileType,
      fileSize: file.size,
      uploadedBy: req.user._id,
      isPublic: isPublicValue  // This ensures notes are public by default
    });

    await courseNote.save();
    
    console.log('✅ Note saved:', {
      id: courseNote._id,
      title: courseNote.title,
      isPublic: courseNote.isPublic
    });
    
    res.status(201).json({
      success: true,
      message: 'Note uploaded successfully',
      note: courseNote
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading note', error: error.message });
  }
};

// @desc    Get notes for a course (student view)
const getCourseNotes = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonId } = req.query;
    
    console.log('=== STUDENT FETCH ===');
    console.log('Course ID:', courseId);
    
    // Query for public notes only
    const query = { courseId, isPublic: true };
    if (lessonId) {
      query.lessonId = lessonId;
    }
    
    const notes = await CourseNote.find(query)
      .populate('uploadedBy', 'fullName')
      .populate('lessonId', 'title order')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${notes.length} public notes for student`);
    
    res.json({ success: true, notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
};

// @desc    Get all notes (teacher view)
const getTeacherNotes = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const notes = await CourseNote.find({ courseId })
      .populate('uploadedBy', 'fullName')
      .populate('lessonId', 'title order')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${notes.length} notes for teacher`);
    
    res.json({ success: true, notes });
  } catch (error) {
    console.error('Error fetching teacher notes:', error);
    res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
};

// @desc    Download note with correct file format
const downloadNote = async (req, res) => {
  try {
    const note = await CourseNote.findById(req.params.noteId);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Track download
    await CourseNote.findByIdAndUpdate(req.params.noteId, { $inc: { downloads: 1 } });
    
    // Set correct content type based on file type
    const contentTypes = {
      'pdf': 'application/pdf',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain'
    };
    
    const contentType = contentTypes[note.fileType] || 'application/octet-stream';
    const filename = `${note.title}.${note.fileType}`;
    
    if (note.fileUrl) {
      // ✅ FIX: Use require('https') or 'http' based on URL
      const https = require('https');
      const http = require('http');
      const protocol = note.fileUrl.startsWith('https') ? https : http;
      
      protocol.get(note.fileUrl, (response) => {
        if (response.statusCode !== 200) {
          return res.status(502).json({ message: 'Failed to fetch file from storage' });
        }
        
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const fileBuffer = Buffer.concat(chunks);
          
          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          res.setHeader('Content-Length', fileBuffer.length);
          res.send(fileBuffer);
        });
        response.on('error', (err) => {
          console.error('Stream error:', err);
          res.status(502).json({ message: 'Error streaming file' });
        });
      }).on('error', (err) => {
        console.error('Request error:', err);
        res.status(502).json({ message: 'Failed to fetch file' });
      });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Error downloading file', error: error.message });
  }
};

// @desc    Delete course note
const deleteCourseNote = async (req, res) => {
  try {
    const note = await CourseNote.findById(req.params.noteId);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Delete from cloudinary
    try {
      const urlParts = note.fileUrl.split('/');
      const filename = urlParts.pop();
      const publicId = urlParts.slice(-2).join('/') + '/' + filename.split('.')[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    } catch (cloudinaryError) {
      console.error('Cloudinary delete error:', cloudinaryError);
    }
    
    await CourseNote.findByIdAndDelete(req.params.noteId);
    
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
};

// @desc    Update course note
const updateCourseNote = async (req, res) => {
  try {
    const { title, description, isPublic, lessonId } = req.body;
    
    const note = await CourseNote.findById(req.params.noteId);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    note.title = title || note.title;
    note.description = description !== undefined ? description : note.description;
    note.isPublic = isPublic !== undefined ? isPublic : note.isPublic;
    note.lessonId = lessonId || null;
    
    await note.save();
    
    res.json({ success: true, note });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Error updating note', error: error.message });
  }
};

// @desc    Track note download (legacy - now handled in downloadNote)
const trackNoteDownload = async (req, res) => {
  try {
    await CourseNote.findByIdAndUpdate(
      req.params.noteId,
      { $inc: { downloads: 1 } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking download:', error);
    res.status(500).json({ message: 'Error tracking download', error: error.message });
  }
};

module.exports = {
  uploadCourseNote,
  getCourseNotes,
  getTeacherNotes,
  deleteCourseNote,
  updateCourseNote,
  trackNoteDownload,
  downloadNote
};