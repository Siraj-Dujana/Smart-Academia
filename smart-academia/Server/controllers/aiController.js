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

    const ai = getAI();
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
      document: req.params.documentId,
      type: 'document'
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        user: req.user._id,
        document: req.params.documentId,
        type: 'document',
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
      document: req.params.documentId,
      type: 'document'
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
      document: req.params.documentId,
      type: 'document'
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

    const AIDocument = require('../models/Document');
    const AIFlashcard = require('../models/Flashcard');
    const AIQuiz = require('../models/AIQuiz');

    const totalDocuments = await AIDocument.countDocuments({ user: userId });
    const totalFlashcardSets = await AIFlashcard.countDocuments({ user: userId });
    const totalQuizzes = await AIQuiz.countDocuments({ user: userId });

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

// ✅ ===== STUDENT AI TUTOR =====
// @route   POST /api/ai/student-chat
const studentChat = async (req, res) => {
  try {
    const { message, context = "general" } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    let chatHistory = await ChatHistory.findOne({
      user: req.user._id,
      type: 'student-tutor'
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        user: req.user._id,
        type: 'student-tutor',
        messages: []
      });
    }

    const historyText = chatHistory.messages
      .slice(-10)
      .map(m => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: `
        You are a helpful AI tutor for university students. 
        Explain concepts clearly, provide examples, and help with understanding course material.
        Keep responses educational and encouraging.
        
        Context: ${context === 'general' ? 'General learning' : context}
        
        Previous conversation:
        ${historyText}
        
        Student's question: ${message}
        
        Provide a clear, helpful response:
      `
    });

    const reply = response.text;

    chatHistory.messages.push({ role: 'user', content: message });
    chatHistory.messages.push({ role: 'assistant', content: reply });
    await chatHistory.save();

    res.status(200).json({ 
      reply, 
      chatHistory: chatHistory.messages 
    });

  } catch (error) {
    console.error('Student chat error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ ===== TEACHER AI TUTOR =====
// @route   POST /api/ai/teacher-chat
const teacherChat = async (req, res) => {
  try {
    const { message, context = "general", courseContext = null } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    let chatHistory = await ChatHistory.findOne({
      user: req.user._id,
      type: 'teacher-tutor'
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        user: req.user._id,
        type: 'teacher-tutor',
        messages: []
      });
    }

    const getContextPrompt = (ctx) => {
      const base = "You are an AI teaching assistant for university instructors. ";
      switch(ctx) {
        case "lesson_planning":
          return base + "Focus ONLY on lesson planning: learning objectives, activities, materials, and assessments.";
        case "assessment":
          return base + "Focus ONLY on assessment design: quizzes, rubrics, grading strategies, and evaluation methods.";
        case "student_support":
          return base + "Focus ONLY on student support: helping struggling students, engagement techniques, and differentiated instruction.";
        case "content_generation":
          return base + "Focus ONLY on generating educational content: quiz questions, assignments, examples, and explanations.";
        default:
          return base + "Provide helpful, practical teaching advice for university instructors.";
      }
    };

    const historyText = chatHistory.messages
      .slice(-10)
      .map(m => `${m.role === 'user' ? 'Teacher' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const courseInfo = courseContext ? `Course context: ${courseContext}` : '';

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: `
        ${getContextPrompt(context)}
        ${courseInfo}
        
        Previous conversation:
        ${historyText}
        
        Teacher's question: ${message}
      `
    });

    const reply = response.text;

    chatHistory.messages.push({ role: 'user', content: message });
    chatHistory.messages.push({ role: 'assistant', content: reply });
    await chatHistory.save();

    res.status(200).json({ 
      reply, 
      chatHistory: chatHistory.messages 
    });

  } catch (error) {
    console.error('Teacher chat error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ History functions
const getStudentChatHistory = async (req, res) => {
  try {
    const chatHistory = await ChatHistory.findOne({
      user: req.user._id,
      type: 'student-tutor'
    });
    res.status(200).json({ messages: chatHistory?.messages || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeacherChatHistory = async (req, res) => {
  try {
    const chatHistory = await ChatHistory.findOne({
      user: req.user._id,
      type: 'teacher-tutor'
    });
    res.status(200).json({ messages: chatHistory?.messages || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearStudentChatHistory = async (req, res) => {
  try {
    await ChatHistory.findOneAndDelete({
      user: req.user._id,
      type: 'student-tutor'
    });
    res.status(200).json({ message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearTeacherChatHistory = async (req, res) => {
  try {
    await ChatHistory.findOneAndDelete({
      user: req.user._id,
      type: 'teacher-tutor'
    });
    res.status(200).json({ message: 'Chat history cleared' });
  } catch (error) {
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
  getAnalytics,
  studentChat,
  teacherChat,
  getStudentChatHistory,
  getTeacherChatHistory,
  clearStudentChatHistory,
  clearTeacherChatHistory
};