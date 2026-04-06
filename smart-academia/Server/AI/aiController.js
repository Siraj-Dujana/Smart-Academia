const Anthropic = require("@anthropic-ai/sdk");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// =============================================
// POST /api/ai/chat
// Student sends a message to AI Tutor
// =============================================
const chat = async (req, res) => {
  try {
    const { message, history, courseId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Get course context if provided
    let courseContext = "";
    if (courseId) {
      const course = await Course.findById(courseId).populate("teacher", "fullName");
      if (course) {
        // Verify student is enrolled
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

You are helping a student named "${req.user.fullName}" who is studying ${req.user.department || "their courses"}.
${courseContext}

Your role:
- Explain concepts clearly and simply
- Help debug code with step-by-step guidance  
- Answer academic questions thoroughly
- Suggest study strategies and resources
- Give encouragement when students are struggling
- Use examples relevant to the student's course

Guidelines:
- Be friendly, patient, and encouraging
- Keep responses clear and well-structured
- Use bullet points and code blocks when helpful
- If asked about code, always explain WHY not just HOW
- If a question is outside academic scope, politely redirect
- Respond in English unless student writes in another language

You are a knowledgeable, supportive tutor — not just a search engine.`;

    // Build message history for Claude
    // history comes from frontend as [{role, content}]
    const messages = [
      ...(history || []).slice(-10), // last 10 messages for context
      { role: "user", content: message.trim() },
    ];

    // Call Claude API
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const reply = response.content[0].text;

    res.status(200).json({
      reply,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error("AI chat error:", error);

    // Handle specific Anthropic errors
    if (error.status === 401) {
      return res.status(500).json({ message: "AI service configuration error. Contact admin." });
    }
    if (error.status === 429) {
      return res.status(429).json({ message: "AI service is busy. Please try again in a moment." });
    }

    res.status(500).json({ message: "AI service error. Please try again." });
  }
};

// =============================================
// POST /api/ai/generate-quiz
// Teacher generates quiz questions using AI
// =============================================
const generateQuizQuestions = async (req, res) => {
  try {
    const { topic, difficulty, count, courseTitle, courseCode } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const numQuestions = Math.min(count || 5, 10); // max 10 at a time

    const prompt = `Generate ${numQuestions} multiple choice quiz questions about "${topic}" for a university course "${courseTitle || "Unknown"}" (${courseCode || ""}).

Difficulty level: ${difficulty || "Beginner"}

Return ONLY a valid JSON array with this exact structure, no other text:
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
- Questions should test understanding, not just memorization
- Make options plausible — no obviously wrong answers
- Explanation should be educational and clear`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = response.content[0].text.trim();

    // Parse JSON safely
    let questions;
    try {
      // Remove any markdown code blocks if present
      const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      questions = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({ message: "AI returned invalid format. Please try again." });
    }

    // Validate structure
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({ message: "AI returned no questions. Please try again." });
    }

    // Clean up and validate each question
    const validatedQuestions = questions.map(q => ({
      text: q.text || "",
      options: (q.options || []).map(o => ({
        text: o.text || "",
        isCorrect: Boolean(o.isCorrect),
      })),
      explanation: q.explanation || "",
      difficulty: q.difficulty || "easy",
      points: q.points || 10,
    })).filter(q => q.text && q.options.length === 4);

    res.status(200).json({
      questions: validatedQuestions,
      count: validatedQuestions.length,
      message: `Generated ${validatedQuestions.length} questions successfully`,
    });
  } catch (error) {
    console.error("Generate quiz error:", error);
    if (error.status === 429) {
      return res.status(429).json({ message: "AI service is busy. Please try again." });
    }
    res.status(500).json({ message: "Failed to generate questions. Please try again." });
  }
};

module.exports = { chat, generateQuizQuestions };