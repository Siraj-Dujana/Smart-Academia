const { GoogleGenAI } = require('@google/genai');
const Document = require('../models/Document');
const ChatHistory = require('../models/ChatHistory');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/AIQuiz');


// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};


// @route   POST /api/ai/summary/:documentId
const generateSummary = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.documentId,
      user: req.user._id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const ai = getAI(); // 👈 initialize here
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: `
        Please provide a clear and concise summary of the following document.
        Break it down into:
        1. Main Topic
        2. Key Points (5-7 bullet points)
        3. Conclusion
        
        Document:
        ${document.extractedText.substring(0, 2000)}
      `
    });

    const summary = response.text;
    document.summary = summary;
    await document.save();

    res.status(200).json({ summary });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/ai/chat/:documentId
const chatWithDocument = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const document = await Document.findOne({
      _id: req.params.documentId,
      user: req.user._id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    let chatHistory = await ChatHistory.findOne({
      user: req.user._id,
      document: req.params.documentId
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        user: req.user._id,
        document: req.params.documentId,
        messages: []
      });
    }

    // Build prompt with conversation history
    const historyText = chatHistory.messages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: `
        You are a helpful AI assistant. Answer questions based on this document only.
        
        Document: ${document.extractedText.substring(0, 8000)}
        
        Previous conversation:
        ${historyText}
        
        User question: ${message}
        
        Answer:
      `
    });

    const reply = response.text;

    chatHistory.messages.push({ role: 'user', content: message });
    chatHistory.messages.push({ role: 'assistant', content: reply });
    await chatHistory.save();

    res.status(200).json({ reply, chatHistory: chatHistory.messages });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/ai/chat/:documentId/history
const getChatHistory = async (req, res) => {
  try {
    const chatHistory = await ChatHistory.findOne({
      user: req.user._id,
      document: req.params.documentId
    });

    if (!chatHistory) {
      return res.status(200).json({ messages: [] });
    }

    res.status(200).json({ messages: chatHistory.messages });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/ai/chat/:documentId/history
const clearChatHistory = async (req, res) => {
  try {
    await ChatHistory.findOneAndDelete({
      user: req.user._id,
      document: req.params.documentId
    });

    res.status(200).json({ message: 'Chat history cleared' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/ai/explain/:documentId
const explainConcept = async (req, res) => {
  try {
    const { concept } = req.body;

    if (!concept) {
      return res.status(400).json({ message: 'Concept is required' });
    }

    const document = await Document.findOne({
      _id: req.params.documentId,
      user: req.user._id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: `
        Based on the following document, explain the concept "${concept}" in simple terms.
        
        Structure your explanation as:
        1. Simple Definition (1-2 sentences)
        2. Detailed Explanation (3-4 sentences)
        3. Real World Example
        4. How it relates to the document
        
        Document:
        ${document.extractedText.substring(0, 10000)}
      `
    });

    const explanation = response.text;

    res.status(200).json({ concept, explanation });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/ai/flashcards/:documentId
const generateFlashcards = async (req, res) => {
  try {
    const { title, count = 10 } = req.body;

    const document = await Document.findOne({
      _id: req.params.documentId,
      user: req.user._id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: `
        Based on the following document, generate exactly ${count} flashcards.
        
        Return ONLY a valid JSON array in this exact format, nothing else:
        [
          {
            "question": "question here",
            "answer": "answer here"
          }
        ]
        
        Document:
        ${document.extractedText.substring(0, 10000)}
      `
    });

    let responseText = response.text;
    responseText = responseText.replace(/```json|```/g, '').trim();
    const cards = JSON.parse(responseText);

    const flashcard = await Flashcard.create({
      user: req.user._id,
      document: req.params.documentId,
      title: title || `${document.title} - Flashcards`,
      cards
    });

    res.status(201).json({
      message: 'Flashcards generated successfully!',
      flashcard
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/ai/quiz/:documentId
const generateQuiz = async (req, res) => {
  try {
    const { title, count = 10 } = req.body;

    const document = await Document.findOne({
      _id: req.params.documentId,
      user: req.user._id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: `
        Based on the following document, generate exactly ${count} multiple choice questions.
        
        Return ONLY a valid JSON array in this exact format, nothing else:
        [
          {
            "question": "question here",
            "options": ["option A", "option B", "option C", "option D"],
            "correctAnswer": 0,
            "explanation": "why this answer is correct"
          }
        ]
        
        Note: correctAnswer is the index (0-3) of the correct option.
        
        Document:
        ${document.extractedText.substring(0, 10000)}
      `
    });

    let responseText = response.text;
    responseText = responseText.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(responseText);

    const quiz = await Quiz.create({
      user: req.user._id,
      document: req.params.documentId,
      title: title || `${document.title} - Quiz`,
      questions
    });

    res.status(201).json({
      message: 'Quiz generated successfully!',
      quiz
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/assistant/analytics
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { range = "week" } = req.query;

    // Get counts
    const AIDocument = require('../models/Document');
    const AIFlashcard = require('../models/Flashcard');
    const AIQuiz = require('../models/AIQuiz');

    const totalDocuments = await AIDocument.countDocuments({ user: userId });
    const totalFlashcardSets = await AIFlashcard.countDocuments({ user: userId });
    const totalQuizzes = await AIQuiz.countDocuments({ user: userId });

    // Quiz stats
    const quizzes = await AIQuiz.find({ user: userId });
    let totalQuizAttempts = 0;
    let totalScore = 0;
    let bestQuizScore = 0;

    quizzes.forEach(q => {
      if (q.results && q.results.length > 0) {
        q.results.forEach(r => {
          totalQuizAttempts++;
          const percentage = Math.round((r.score / r.totalQuestions) * 100);
          totalScore += percentage;
          if (percentage > bestQuizScore) bestQuizScore = percentage;
        });
      }
    });

    const avgQuizScore = totalQuizAttempts > 0 ? Math.round(totalScore / totalQuizAttempts) : 0;

    // Recent activity (simplified - no date filtering for now)
    const recentQuizzes = await AIQuiz.find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(3);
      
    const recentFlashcards = await AIFlashcard.find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(2);

    const recentActivity = [
      ...recentQuizzes.map(q => ({
        type: "quiz",
        title: q.title,
        description: `${q.questions?.length || 0} questions`,
        time: "recently",
      })),
      ...recentFlashcards.map(f => ({
        type: "flashcard",
        title: f.title,
        description: `${f.cards?.length || 0} cards`,
        time: "recently",
      })),
    ].slice(0, 5);

    res.json({
      totalDocuments,
      totalFlashcardSets,
      totalQuizzes,
      totalQuizAttempts,
      avgQuizScore,
      bestQuizScore,
      totalStudyTime: 120,
      streak: 5,
      recentActivity,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  generateSummary,
  chatWithDocument,
  getChatHistory,
  clearChatHistory,
  explainConcept,
  generateFlashcards,
  generateQuiz,
  getAnalytics
  
};
