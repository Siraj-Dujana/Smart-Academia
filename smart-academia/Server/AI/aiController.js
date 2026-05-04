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

   // Build system prompt - STRICT VERSION
const systemPrompt = `You are an AI Tutor. Follow these rules STRICTLY:

RULES:
1. Keep responses UNDER 100 words unless asked for "detailed explanation"
2. For syntax questions: ONLY show the code pattern, NO explanation
3. NO greetings like "Hey there!", "Absolutely!", "Of course!"
4. NO conclusions like "Let me know if you have questions!"
5. NO bullet point lists with more than 3 items
6. NO examples unless specifically asked

RESPONSE FORMATS:
- Syntax question → Only code block, no text before or after
- Definition → 1 sentence max
- Comparison → 2-3 bullet points max
- Yes/No → "Yes." or "No." only

EXAMPLES:

Q: "if else syntax in python"
A: 
\`\`\`python
if condition:
    # code
else:
    # code
\`\`\`

Q: "what is a variable"
A: A variable stores data in memory. Example: name = "John"

Q: "difference between list and tuple"
A: • Lists are mutable
• Tuples are immutable

Now respond to the student. Be VERY brief. No fluff. Get straight to the point.`;

// Also add this as a user message to reinforce
const userMessage = `${message}\n\nREMEMBER: Give a VERY SHORT answer. No greetings, no conclusions, just the answer.`;
   
   
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
    "questionText": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option B",
    "explanation": "Brief explanation of why the correct answer is right",
    "difficulty": "${difficulty || "easy"}",
    "points": 10
  }
]

Rules:
- Each question must have exactly 4 options
- correctAnswer must be the exact TEXT of the correct option, not a letter (A, B, C, D)
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
    } catch (err) {
      console.error("JSON parse error:", err.message);
      return res.status(500).json({ message: "AI returned invalid format. Please try again." });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({ message: "AI returned no questions. Please try again." });
    }

    // ✅ FIXED: Convert to database format
    const validatedQuestions = questions
      .map(q => {
        // Handle both formats: {text, options: [{text, isCorrect}]} OR {questionText, options: string[], correctAnswer}
        let questionText = q.questionText || q.text || "";
        let optionStrings = [];
        let correctAnswerText = q.correctAnswer || "";
        
        if (Array.isArray(q.options)) {
          // Check if options are objects with {text, isCorrect}
          if (q.options.length > 0 && typeof q.options[0] === 'object') {
            const correctOpt = q.options.find(o => o.isCorrect === true);
            if (correctOpt) {
              correctAnswerText = correctOpt.text || correctAnswerText;
            }
            optionStrings = q.options.map(o => o.text || "").filter(Boolean);
          } else {
            // Options are already strings
            optionStrings = q.options.map(o => o?.toString().trim()).filter(Boolean);
            
            // If correctAnswer is a letter (A, B, C, D), convert to text
            if (correctAnswerText && correctAnswerText.length === 1 && /[A-D]/.test(correctAnswerText)) {
              const letterMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
              const idx = letterMap[correctAnswerText];
              if (idx !== undefined && idx < optionStrings.length) {
                correctAnswerText = optionStrings[idx];
              }
            }
          }
        }
        
        return {
          questionText: questionText,
          questionType: "mcq",
          options: optionStrings,
          correctAnswer: correctAnswerText,
          explanation: q.explanation || "",
          points: q.points || 10,
        };
      })
      .filter(q =>
        q.questionText &&
        q.options.length >= 2 &&
        q.correctAnswer
      );

    if (validatedQuestions.length === 0) {
      return res.status(500).json({ message: "AI returned invalid questions. Please try again." });
    }

    console.log('✅ Generated questions:', validatedQuestions.map(q => ({
      question: q.questionText.substring(0, 30),
      correctAnswer: q.correctAnswer
    })));

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

// =============================================
// POST /api/ai/teacher-chat — Teacher AI Assistant
// =============================================
const teacherChat = async (req, res) => {
  try {
    const { message, history = [], context = "general", courseContext } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Get course details if courseContext provided
    let courseInfo = "";
    if (courseContext) {
      const course = await Course.findById(courseContext);
      if (course && course.teacher.toString() === req.user._id.toString()) {
        courseInfo = `
The teacher is currently working on the course: "${course.title}" (${course.code})
Department: ${course.department}
Credits: ${course.credits}
Semester: ${course.semester}
Enrolled Students: ${course.enrolledCount || 0}
Tailor your responses to be relevant to this course context.`;
      }
    }

    // Build context-specific system prompts
    const contextPrompts = {
      general: "You are a helpful AI teaching assistant for university educators. Provide practical, professional advice for teaching at the university level.",
      
      lesson_planning: "You are an expert in curriculum design and lesson planning. Help teachers create engaging lesson plans with clear learning objectives, activities, and assessments. Suggest innovative teaching methods and provide structured lesson outlines.",
      
      assessment: "You are an assessment design specialist. Help teachers create fair, comprehensive assessments including quizzes, exams, rubrics, and grading strategies. Provide advice on formative vs summative assessment and how to measure student learning effectively.",
      
      student_support: "You are a student support specialist. Provide strategies for helping struggling students, fostering inclusive classrooms, addressing diverse learning needs, and maintaining student engagement. Offer advice on office hours, mentoring, and academic counseling.",
      
      content_generation: "You are a content creation expert. Help generate educational content including lecture slides, examples, case studies, practice problems, discussion prompts, and teaching materials. Be creative and pedagogically sound.",
    };

    const systemPrompt = `${contextPrompts[context] || contextPrompts.general}

You are assisting ${req.user.fullName}, a university teacher in the ${req.user.department || "their department"}.

${courseInfo}

Guidelines:
- Be helpful, practical, and professional
- Provide specific, actionable advice
- Use examples relevant to higher education
- Keep responses concise but thorough
- Be encouraging and supportive
- If generating content, ensure it's appropriate for university level
- Use bullet points and structured formats when helpful

Respond in a friendly, collaborative tone as a peer teaching assistant.`;

    // Build conversation history for Gemini
    const geminiHistory = (history || [])
      .slice(-10)
      .map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    // Create chat session
    const geminiChat = ai.chats.create({
      model: "gemini-2.5-flash-lite",
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 1536,
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
    console.error("Teacher chat error:", error);

    if (error.message?.includes("API_KEY")) {
      return res.status(500).json({ message: "AI service configuration error. Contact admin." });
    }
    if (error.message?.includes("quota") || error.message?.includes("rate")) {
      return res.status(429).json({ message: "AI service is busy. Please try again in a moment." });
    }

    res.status(500).json({ message: "AI service error. Please try again." });
  }
};

// Update the export at the bottom:
module.exports = { chat, generateQuizQuestions, teacherChat };