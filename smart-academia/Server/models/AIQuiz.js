const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: Number, required: true },
    explanation: { type: String }
  }],
  results: [{
    score: { type: Number },
    totalQuestions: { type: Number },
    takenAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('AIQuiz', quizSchema);