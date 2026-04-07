const { GoogleGenAI } = require("@google/genai");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// =============================================
// POST /api/ai/chat — Student AI Tutor
// =============================================
const chat = async (req, res) => {
  try {
    const { message, history, courseId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Get course context if student selected a course
    let courseContext = "";
    if (courseId) {
      const course = await Course.findById(courseId).populate("teacher", "fullName");
      if (course) {
        const enrollment = await Enrollment.findOne({
          student: req.user._id,
          course: courseId,
        });
        if (enrollment) {
          courseContext = `
The student is currently studying: "${course.title}" (${course.code})
Department: ${course.department}
Instructor: ${course.teacher?.fullName || "Unknown"}
Course Description: ${course.description}
Focus your answers on topics relevant to this course when possible.`;
        }
      }
    }

    // Build system prompt
    const systemPrompt = `You are an intelligent AI Tutor for SmartAcademia, an AI-powered Learning Management System at Sukkur IBA University, Pakistan.

You are helping a student named "${req.user.fullName}" studying ${req.user.department || "their courses"}.
${courseContext}

Your role:
- Explain concepts clearly and simply with real examples
- Help debug code with step-by-step guidance
- Answer academic questions thoroughly
- Suggest study strategies and resources
- Be encouraging when students are struggling
- Use examples relevant to the student's course

Guidelines:
- Be friendly, patient, and supportive
- Use bullet points and code blocks when helpful
- If asked about code, explain WHY not just HOW
- Keep responses focused and educational
- Respond in English unless student writes in another language`;

    // Build conversation history for Gemini
    // Gemini uses "user" and "model" roles (not "assistant")
    const geminiHistory = (history || [])
      .slice(-10) // last 10 messages for context
      .map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    // Create chat session with history
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

    const reply = response.text;

    res.status(200).json({ reply });
  } catch (error) {
    console.error("AI chat error:", error);

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
// POST /api/ai/generate-quiz — Teacher AI Quiz Generator
// =============================================
const generateQuizQuestions = async (req, res) => {
  try {
    const { topic, difficulty, count, courseTitle, courseCode } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const numQuestions = Math.min(count || 5, 10);

    const prompt = `Generate ${numQuestions} multiple choice quiz questions about "${topic}" for a university course "${courseTitle || "Unknown"}" (${courseCode || ""}).

Difficulty level: ${difficulty || "easy"}

Return ONLY a valid JSON array with this exact structure, no markdown, no extra text:
[
  {
    "text": "Question text here?",
    "options": [
      { "text": "Option A", "isCorrect": false },
      { "text": "Option B", "isCorrect": true },
      { "text": "Option C", "isCorrect": false },
      { "text": "Option D", "isCorrect": false }
    ],
    "explanation": "Brief explanation of why the correct answer is right",
    "difficulty": "${difficulty || "easy"}",
    "points": 10
  }
]

Rules:
- Each question must have exactly 4 options
- Exactly one option must have isCorrect: true
- Questions should test understanding not just memorization
- Make distractors (wrong options) plausible
- Explanation should be clear and educational
- Return pure JSON only, no markdown code blocks`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        maxOutputTokens: 2048,
        temperature: 0.8,
      },
    });

    const rawText = response.text.trim();

    // Parse JSON — remove any markdown if Gemini adds it
    let questions;
    try {
      const cleaned = rawText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      questions = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({ message: "AI returned invalid format. Please try again." });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({ message: "AI returned no questions. Please try again." });
    }

    // Validate and clean each question
    const validatedQuestions = questions
      .map(q => ({
        text: q.text || "",
        options: (q.options || []).map(o => ({
          text: o.text || "",
          isCorrect: Boolean(o.isCorrect),
        })),
        explanation: q.explanation || "",
        difficulty: q.difficulty || difficulty || "easy",
        points: q.points || 10,
      }))
      .filter(q =>
        q.text &&
        q.options.length === 4 &&
        q.options.filter(o => o.isCorrect).length === 1
      );

    if (validatedQuestions.length === 0) {
      return res.status(500).json({ message: "AI returned invalid questions. Please try again." });
    }

    res.status(200).json({
      questions: validatedQuestions,
      count: validatedQuestions.length,
      message: `Generated ${validatedQuestions.length} questions successfully`,
    });
  } catch (error) {
    console.error("Generate quiz error:", error);
    if (error.message?.includes("quota") || error.message?.includes("rate")) {
      return res.status(429).json({ message: "AI service is busy. Please try again." });
    }
    res.status(500).json({ message: "Failed to generate questions. Please try again." });
  }
};

module.exports = { chat, generateQuizQuestions };