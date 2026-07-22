const { GoogleGenAI } = require('@google/genai');
const Document = require('../models/Document');
const ChatHistory = require('../models/ChatHistory');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/AIQuiz');

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

// =============================================
// POST /api/ai/public-chat — Public Landing Page Chatbot
// =============================================
// In your aiController.js - publicChat function
const publicChat = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // System prompt for public landing page - NO EMOJIS
    const systemPrompt = `You are Smart Academia's AI Assistant for the landing page. 
Your role is to help visitors understand what Smart Academia offers.

About Smart Academia:
- AI-powered learning platform for students and teachers
- Features: Personalized learning, automated grading, progress tracking, interactive study materials, collaborative learning tools
- Benefits: Save time, improve learning outcomes, get instant feedback, better engagement
- Free to start, with premium plans available
- Website: Smart Academia

Guidelines:
- Be friendly, professional, and helpful
- Keep responses concise and engaging
- Focus on explaining features, benefits, and how it works
- Encourage visitors to sign up or try the platform
- If you don't know something, suggest they explore the website or contact support
- Be conversational
- Keep responses under 100 words
- DO NOT use emojis anywhere in your responses

Examples:
Q: "What is Smart Academia?"
A: Smart Academia is an AI-powered learning platform that helps students master subjects and teachers automate grading. It offers personalized learning, progress tracking, and instant feedback.

Q: "How much does it cost?"
A: We offer a free plan to get started. Premium plans start at $9.99/month for advanced features. All plans come with a 14-day free trial.

Q: "What features do you have?"
A: Smart Academia offers AI-powered learning, automated grading, personalized study plans, real-time progress tracking, and collaborative learning tools.

Q: "How does it work?"
A: Simply create an account, set up your learning goals or classes, and start learning with AI assistance. It's that easy.

Now respond to the visitor's question. Be helpful and encourage them to explore Smart Academia. Do not use any emojis in your response.`;

    // Build conversation history
    const geminiHistory = (history || [])
      .slice(-10)
      .map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    const ai = getAI();
    
    // Create chat session
    const geminiChat = ai.chats.create({
      model: "gemini-2.5-flash-lite",
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
      history: geminiHistory,
    });

    // Send message and get response
    const response = await geminiChat.sendMessage({
      message: message.trim(),
    });

    let reply = response.text;

    // Remove any emojis from the response as a safety net
    reply = reply.replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
      .replace(/[\u{1F700}-\u{1F77F}]/gu, '') // Alchemical Symbols
      .replace(/[\u{1F780}-\u{1F7FF}]/gu, '') // Geometric Shapes Extended
      .replace(/[\u{1F800}-\u{1F8FF}]/gu, '') // Supplemental Arrows-C
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
      .replace(/[\u{2600}-\u{26FF}]/gu, '') // Miscellaneous Symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
      .replace(/[\u{FE00}-\u{FEFF}]/gu, '') // Variation Selectors
      .trim();

    // Clean up any double spaces that might have been created
    reply = reply.replace(/\s+/g, ' ').trim();

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Public AI chat error:", error);

    if (error.message?.includes("API_KEY")) {
      return res.status(500).json({ message: "AI service configuration error. Contact admin." });
    }
    if (error.message?.includes("quota") || error.message?.includes("rate")) {
      return res.status(429).json({ message: "AI service is busy. Please try again in a moment." });
    }

    res.status(500).json({ message: "AI service error. Please try again." });
  }
};
// =============================================
// POST /api/ai/summary/:documentId
// =============================================
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

// =============================================
// POST /api/ai/chat/:documentId
// =============================================
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

// =============================================
// GET /api/ai/chat/:documentId/history
// =============================================
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

// =============================================
// DELETE /api/ai/chat/:documentId/history
// =============================================
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

// =============================================
// POST /api/ai/explain/:documentId
// =============================================
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

// =============================================
// POST /api/ai/flashcards/:documentId
// =============================================
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

// =============================================
// POST /api/ai/quiz/:documentId
// =============================================
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

// =============================================
// GET /api/assistant/analytics
// =============================================
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

// =============================================
// POST /api/ai/student-chat — Student AI Tutor
// =============================================
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

// =============================================
// POST /api/ai/teacher-chat — Teacher AI Tutor
// =============================================
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

// =============================================
// GET /api/ai/student-chat/history
// =============================================
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

// =============================================
// GET /api/ai/teacher-chat/history
// =============================================
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

// =============================================
// DELETE /api/ai/student-chat/history
// =============================================
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

// =============================================
// DELETE /api/ai/teacher-chat/history
// =============================================
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

// =============================================
// EXPORTS
// =============================================
module.exports = {
  publicChat, // ✅ NEW - Landing page chatbot
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