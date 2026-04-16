const Quiz           = require("../models/Quiz");
const Question       = require("../models/Question");
const QuizAttempt    = require("../models/QuizAttempt");
const LessonProgress = require("../models/LessonProgress");
const { checkAndUnlockNext } = require("./lessonController");
const { GoogleGenAI } = require("@google/genai");

// ── TEACHER: Create quiz ────────────────────────────────────
const createQuiz = async (req, res) => {
  try {
    const {
      title, course, lesson, timeLimit,
      passingScore, maxAttempts, shuffleQuestions, isPublished,
    } = req.body;

    if (!title?.trim()) return res.status(400).json({ message: "Quiz title is required" });
    if (!course)        return res.status(400).json({ message: "Course is required" });

    const quiz = await Quiz.create({
      title:            title.trim(),
      course,
      lesson:           lesson || null,
      createdBy:        req.user._id,
      timeLimit:        timeLimit || 30,
      passingScore:     passingScore || 70,
      maxAttempts:      maxAttempts || 3,
      shuffleQuestions: shuffleQuestions !== undefined ? shuffleQuestions : true,
      isPublished:      isPublished !== undefined ? isPublished : false,
    });
    res.status(201).json({ message: "Quiz created", quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── TEACHER: Update quiz ────────────────────────────────────
const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (quiz.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your quiz" });

    const allowed = [
      "title","timeLimit","passingScore",
      "maxAttempts","shuffleQuestions","isPublished","lesson",
    ];
    allowed.forEach(f => { if (req.body[f] !== undefined) quiz[f] = req.body[f]; });
    await quiz.save();
    res.status(200).json({ message: "Quiz updated", quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── TEACHER: Delete quiz ────────────────────────────────────
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (quiz.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your quiz" });

    await Question.deleteMany({ quiz: quiz._id });
    await QuizAttempt.deleteMany({ quiz: quiz._id });
    await quiz.deleteOne();
    res.status(200).json({ message: "Quiz deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── TEACHER: Get quizzes (filter by lessonId or courseId) ───
const getQuizzes = async (req, res) => {
  try {
    const filter = { createdBy: req.user._id };
    if (req.query.lessonId) filter.lesson = req.query.lessonId;
    if (req.query.courseId) filter.course = req.query.courseId;

    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ quizzes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── TEACHER: Add question manually ─────────────────────────
const addQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (quiz.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your quiz" });

    const { questionText, questionType, options, correctAnswer, points, explanation } = req.body;

    if (!questionText?.trim())
      return res.status(400).json({ message: "Question text is required" });
    if (!correctAnswer?.toString().trim())
      return res.status(400).json({ message: "Correct answer is required" });

    const cleanOptions = Array.isArray(options)
      ? options.map(o => o.toString().trim()).filter(Boolean)
      : [];

    const question = await Question.create({
      quiz:          quiz._id,
      questionText:  questionText.trim(),
      questionType:  questionType || "mcq",
      options:       cleanOptions,
      correctAnswer: correctAnswer.toString().trim(),
      explanation:   explanation || "",
      points:        points || 1,
    });

    res.status(201).json({ message: "Question added", question });
  } catch (err) {
    console.error("addQuestion error:", err.message);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ── TEACHER: Get questions for a quiz ──────────────────────
const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ quiz: req.params.quizId }).sort({ createdAt: 1 });
    res.status(200).json({ questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── TEACHER: Delete a question ──────────────────────────────
const deleteQuestion = async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.questionId);
    res.status(200).json({ message: "Question deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── TEACHER: AI generate questions via Gemini ───────────────
const aiGenerateQuestions = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (quiz.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your quiz" });

    const { topic, difficulty, count } = req.body;
    if (!topic?.trim()) return res.status(400).json({ message: "Topic is required" });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ message: "GEMINI_API_KEY not configured in .env" });
    }

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const numQ = Math.min(parseInt(count) || 5, 15);
    const diff = difficulty || "medium";

    const prompt = `Generate exactly ${numQ} multiple choice questions about "${topic}" at ${diff} difficulty.

Return ONLY a valid JSON array. No explanation. No markdown. No code blocks. Just raw JSON.

Format:
[{"questionText":"...","options":["A","B","C","D"],"correctAnswer":"A","explanation":"..."}]`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 2048, temperature: 0.7 },
    });

    let text = response.text || "";
    if (!text && response.candidates?.[0]) {
      text = response.candidates[0].content?.parts?.[0]?.text || "";
    }
    text = text.trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let generated;
    try {
      generated = JSON.parse(text);
    } catch (err) {
      return res.status(500).json({ message: "AI returned invalid format. Try again." });
    }

    if (!Array.isArray(generated) || generated.length === 0) {
      return res.status(500).json({ message: "AI returned no questions. Try again." });
    }

    const savedQuestions = [];
    for (const q of generated) {
      if (!q.questionText || !q.correctAnswer || !Array.isArray(q.options)) continue;
      const cleanOptions = q.options.map(o => o.toString().trim()).filter(Boolean);
      try {
        const question = await Question.create({
          quiz:          quiz._id,
          questionText:  q.questionText.trim(),
          questionType:  "mcq",
          options:       cleanOptions,
          correctAnswer: q.correctAnswer.trim(),
          explanation:   q.explanation || "",
          points:        1,
        });
        savedQuestions.push(question);
      } catch (qErr) {
        console.error("Failed to save AI question:", qErr.message);
      }
    }

    if (savedQuestions.length === 0) {
      return res.status(500).json({ message: "AI generated questions but none could be saved. Try again." });
    }

    res.status(201).json({
      message:   `${savedQuestions.length} questions generated by AI`,
      questions: savedQuestions,
    });
  } catch (err) {
    console.error("AI generate error:", err.message);
    if (err.message?.includes("quota") || err.message?.includes("rate") || err.message?.includes("429")) {
      return res.status(429).json({ message: "AI service is busy. Please try again in a moment." });
    }
    res.status(500).json({ message: "AI generation failed: " + err.message });
  }
};

// ── STUDENT: Get quizzes for a course with attempt info ─────
const getStudentQuizzesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const quizzes = await Quiz.find({ course: courseId, isPublished: true }).sort({ createdAt: -1 });

    const result = await Promise.all(quizzes.map(async (quiz) => {
      const attempts = await QuizAttempt.find({
        quiz: quiz._id,
        student: req.user._id,
      }).sort({ createdAt: -1 });

      const attemptCount = attempts.length;
      const passed = attempts.some(a => a.passed);
      const bestScore = attempts.length > 0
        ? Math.max(...attempts.map(a => a.score))
        : null;

      const questions = await Question.find({ quiz: quiz._id });

      return {
        _id:           quiz._id,
        title:         quiz.title,
        description:   quiz.description || "",
        timeLimit:     quiz.timeLimit,
        passingScore:  quiz.passingScore,
        maxAttempts:   quiz.maxAttempts,
        totalQuestions: questions.length,
        difficulty:    quiz.difficulty || "Intermediate",
        attemptCount,
        passed,
        bestScore,
        canAttempt:    !passed && attemptCount < quiz.maxAttempts,
      };
    }));

    res.status(200).json({ quizzes: result });
  } catch (err) {
    console.error("getStudentQuizzesByCourse error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── STUDENT: Start a quiz attempt ───────────────────────────
const startQuizAttempt = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz)             return res.status(404).json({ message: "Quiz not found" });
    if (!quiz.isPublished) return res.status(400).json({ message: "Quiz not available" });

    const attemptCount = await QuizAttempt.countDocuments({
      quiz:    quiz._id,
      student: req.user._id,
    });

    // Check if already passed
    const passed = await QuizAttempt.findOne({
      quiz:    quiz._id,
      student: req.user._id,
      passed:  true,
    });
    if (passed) return res.status(400).json({ message: "You have already passed this quiz" });

    if (attemptCount >= quiz.maxAttempts)
      return res.status(400).json({ message: `Maximum ${quiz.maxAttempts} attempts reached` });

    // Create a pending attempt
    const attempt = await QuizAttempt.create({
      quiz:          quiz._id,
      student:       req.user._id,
      course:        quiz.course,
      attemptNumber: attemptCount + 1,
      answers:       [],
      score:         0,
      passed:        false,
    });

    // Get questions (shuffle if required)
    let questions = await Question.find({ quiz: quiz._id });
    if (quiz.shuffleQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    // Return questions with options but NOT correctAnswer
    const safeQuestions = questions.map(q => ({
      _id:          q._id,
      text:         q.questionText,
      questionType: q.questionType,
      options:      q.options.map((opt, idx) => ({ text: opt, index: idx })),
      points:       q.points,
    }));

    res.status(201).json({
      attempt: {
        _id:           attempt._id,
        attemptNumber: attempt.attemptNumber,
        quiz:          quiz._id,
      },
      questions: safeQuestions,
    });
  } catch (err) {
    console.error("startQuizAttempt error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── STUDENT: Submit quiz (fixed format: attemptId + answers as {qId: optionIndex}) ──
const submitQuiz = async (req, res) => {
  try {
    const { attemptId, answers, timeTaken, tabSwitchCount } = req.body;

    if (!attemptId) return res.status(400).json({ message: "attemptId is required" });

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });
    if (attempt.student.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your attempt" });

    const quiz = await Quiz.findById(attempt.quiz);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const questions = await Question.find({ quiz: quiz._id });
    if (questions.length === 0)
      return res.status(400).json({ message: "No questions in this quiz" });

    // answers is { [questionId]: optionIndex (number) }
    let correctCount = 0;
    let totalPoints  = 0;
    let earnedPoints = 0;

    const gradedAnswers = questions.map(q => {
      const givenIndex = answers?.[q._id.toString()];
      // Convert option index to option text
      const givenText = givenIndex !== undefined && givenIndex !== null
        ? q.options[givenIndex] || null
        : null;
      const correct   = q.correctAnswer;
      const isCorrect = givenText !== null &&
        givenText.toString().toLowerCase().trim() === correct.toString().toLowerCase().trim();

      if (isCorrect) {
        correctCount++;
        earnedPoints += q.points || 1;
      }
      totalPoints += q.points || 1;

      return {
        questionId:    q._id,
        questionText:  q.questionText,
        givenAnswer:   givenText,
        correctAnswer: correct,
        isCorrect,
        points:        q.points || 1,
      };
    });

    const score  = questions.length > 0
      ? Math.round((correctCount / questions.length) * 100)
      : 0;
    const passed = score >= quiz.passingScore;

    // Update attempt with results
    attempt.answers            = gradedAnswers;
    attempt.score              = score;
    attempt.passed             = passed;
    attempt.timeTaken          = timeTaken || 0;
    attempt.flaggedForCheating = (tabSwitchCount || 0) >= 3;
    attempt.submittedAt        = new Date();
    await attempt.save();

    // Build results for the response (so Quizzes.jsx can show the review)
    const results = gradedAnswers.map(ga => {
      const question = questions.find(q => q._id.toString() === ga.questionId.toString());
      return {
        questionText:  ga.questionText,
        isCorrect:     ga.isCorrect,
        correctIndex:  question ? question.options.indexOf(question.correctAnswer) : 0,
        options:       question ? question.options.map(o => ({ text: o })) : [],
        explanation:   question?.explanation || "",
        points:        ga.points,
      };
    });

    // Unlock next lesson if quiz is linked
    if (quiz.lesson) {
      await LessonProgress.findOneAndUpdate(
        { student: req.user._id, lesson: quiz.lesson },
        {
          $set: { quizCompleted: true, quizScore: score },
          $setOnInsert: {
            student: req.user._id,
            lesson:  quiz.lesson,
            course:  quiz.course,
          },
        },
        { upsert: true }
      );
      await checkAndUnlockNext(req.user._id, quiz.lesson, quiz.course);
    }

    res.status(200).json({
      message:        passed ? "Quiz passed!" : "Quiz submitted",
      score,
      passed,
      correctCount,
      totalQuestions: questions.length,
      earnedPoints,
      totalPoints,
      timeTaken:      attempt.timeTaken,
      results,
      attempt,
    });
  } catch (err) {
    console.error("submitQuiz error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── STUDENT: Get my attempts ────────────────────────────────
const getMyAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      quiz:    req.params.quizId,
      student: req.user._id,
    }).sort({ createdAt: -1 });
    res.status(200).json({ attempts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── STUDENT: Get best result with review details ─────────────
const getMyResults = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      quiz:    req.params.quizId,
      student: req.user._id,
    }).sort({ score: -1 });

    res.status(200).json({ attempts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizzes,
  addQuestion,
  getQuestions,
  deleteQuestion,
  aiGenerateQuestions,
  getStudentQuizzesByCourse,
  startQuizAttempt,
  submitQuiz,
  getMyAttempts,
  getMyResults,
};