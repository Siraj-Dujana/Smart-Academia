const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    default: null  // ✅ Null for tutor chats
  },
  type: {
    type: String,
    enum: ['document', 'student-tutor', 'teacher-tutor'],
    default: 'document'
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Compound index for quick lookup
chatHistorySchema.index({ user: 1, document: 1, type: 1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);