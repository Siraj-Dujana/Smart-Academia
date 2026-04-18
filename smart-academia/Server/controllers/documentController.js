const Document = require('../models/Document');
const pdfParse = require('pdf-parse');


// @route   POST /api/documents/upload
const uploadDocument = async (req, res) => {
  try { 
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract text from this PDF' });
    }

    // Get title from body or use filename
    const title = req.body.title || req.file.originalname.replace('.pdf', '');

    // Save to database
    const document = await Document.create({
      user: req.user._id,
      title,
      filename: req.file.originalname,
      fileSize: req.file.size,
      extractedText
    });

    res.status(201).json({
      message: 'Document uploaded successfully!',
      document: {
        _id: document._id,
        title: document.title,
        filename: document.filename,
        fileSize: document.fileSize,
        createdAt: document.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/documents
const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user._id })
      .select('-extractedText') // don't send full text in list
      .sort({ createdAt: -1 });

    res.status(200).json(documents);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/documents/:id
const getDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.status(200).json(document);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/documents/:id
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await document.deleteOne();

    res.status(200).json({ message: 'Document deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/documents/:id/summary
const updateSummary = async (req, res) => {
  try {
    const { summary } = req.body;

    if (!summary) {
      return res.status(400).json({ message: 'Summary is required' });
    }

    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    document.summary = summary;
    await document.save();

    res.status(200).json({ message: 'Summary updated successfully', document });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  updateSummary
};