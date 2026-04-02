const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const QuizAttempt = require("../models/QuizAttempt");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

// Helper: shuffle array (Fisher-Yates)
const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// =============================================
// TEACHER — Create quiz
// =============================================
const createQuiz = async (req, res) => {
  try {
    const {
      title, description, courseId, timeLimit,
      maxAttempts, passingScore, difficulty,
      questionsPerAttempt, dueDate,
    } = req.body;

    if (!title || !courseId) {
      return res.status(400).json({ message: "Title and course are required" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const quiz = await Quiz.create({
      title: title.trim(),
      description: description || "",
      course: courseId,
      teacher: req.user._id,
      timeLimit: timeLimit || 30,
      maxAttempts: maxAttempts || 3,
      passingScore: passingScore || 70,
      difficulty: difficulty || "Beginner",
      questionsPerAttempt: questionsPerAttempt || 10,
      dueDate: dueDate || null,
    });

    // Update course quiz count
    course.totalQuizzes += 1;
    await course.save();

    res.status(201).json({ message: "Quiz created successfully", quiz });
  } catch (error) {
    console.error("Create quiz error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// TEACHER — Add question to quiz
// =============================================
const addQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (quiz.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { text, type, options, explanation, points, difficulty } = req.body;

    if (!text || !options || options.length < 2) {
      return res.status(400).json({ message: "Question text and at least 2 options required" });
    }

    // Make sure exactly one option is correct
    const correctCount = options.filter(o => o.isCorrect).length;
    if (correctCount !== 1) {
      return res.status(400).json({ message: "Exactly one option must be marked as correct" });
    }

    const question = await Question.create({
      quiz: quiz._id,
      course: quiz.course,
      text: text.trim(),
      type: type || "multiple-choice",
      options,
      explanation: explanation || "",
      points: points || 10,
      difficulty: difficulty || "easy",
    });

    // Update quiz question count
    quiz.totalQuestions += 1;
    // Auto-set questionsPerAttempt to min of current total and 10
    quiz.questionsPerAttempt = Math.min(quiz.totalQuestions, 10);
    await quiz.save();

    res.status(201).json({ message: "Question added", question });
  } catch (error) {
    console.error("Add question error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// TEACHER — Get quiz with all questions
// =============================================
const getQuizWithQuestions = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("course", "title code");

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (quiz.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const questions = await Question.find({ quiz: quiz._id });

    res.status(200).json({ quiz, questions });
  } catch (error) {
    console.error("Get quiz error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// TEACHER — Get all quizzes for a course
// =============================================
const getTeacherQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      teacher: req.user._id,
      course: req.params.courseId,
    }).populate("course", "title code").sort({ createdAt: -1 });

    res.status(200).json({ quizzes });
  } catch (error) {
    console.error("Get teacher quizzes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// TEACHER — Update quiz
// =============================================
const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (quiz.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const fields = ["title", "description", "timeLimit", "maxAttempts",
      "passingScore", "difficulty", "isPublished", "questionsPerAttempt", "dueDate"];

    fields.forEach(f => {
      if (req.body[f] !== undefined) quiz[f] = req.body[f];
    });

    await quiz.save();
    res.status(200).json({ message: "Quiz updated", quiz });
  } catch (error) {
    console.error("Update quiz error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// TEACHER — Delete quiz
// =============================================
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (quiz.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Question.deleteMany({ quiz: quiz._id });
    await QuizAttempt.deleteMany({ quiz: quiz._id });
    await Course.findByIdAndUpdate(quiz.course, { $inc: { totalQuizzes: -1 } });
    await quiz.deleteOne();

    res.status(200).json({ message: "Quiz deleted" });
  } catch (error) {
    console.error("Delete quiz error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// STUDENT — Get published quizzes for a course
// =============================================
const getStudentQuizzes = async (req, res) => {
  try {
    // Check enrolled
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId,
    });
    if (!enrollment) {
      return res.status(403).json({ message: "You are not enrolled in this course" });
    }

    const quizzes = await Quiz.find({
      course: req.params.courseId,
      isPublished: true,
    }).sort({ createdAt: -1 });

    // For each quiz, get this student's attempt info
    const quizzesWithAttempts = await Promise.all(
      quizzes.map(async (quiz) => {
        const attempts = await QuizAttempt.find({
          student: req.user._id,
          quiz: quiz._id,
          isCompleted: true,
        }).sort({ score: -1 });

        const bestScore = attempts.length > 0 ? attempts[0].score : null;
        const attemptCount = attempts.length;
        const canAttempt = attemptCount < quiz.maxAttempts;

        return {
          ...quiz.toObject(),
          attemptCount,
          bestScore,
          canAttempt,
          passed: bestScore !== null && bestScore >= quiz.passingScore,
        };
      })
    );

    res.status(200).json({ quizzes: quizzesWithAttempts });
  } catch (error) {
    console.error("Get student quizzes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// STUDENT — Start a quiz attempt
// =============================================
const startQuizAttempt = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (!quiz.isPublished) return res.status(400).json({ message: "Quiz not available" });

    // Check enrolled
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: quiz.course,
    });
    if (!enrollment) return res.status(403).json({ message: "Not enrolled in this course" });

    // Check attempt limit
    const completedAttempts = await QuizAttempt.countDocuments({
      student: req.user._id,
      quiz: quiz._id,
      isCompleted: true,
    });

    if (completedAttempts >= quiz.maxAttempts) {
      return res.status(400).json({
        message: `Maximum ${quiz.maxAttempts} attempts reached`,
      });
    }

    // Check for an existing incomplete attempt
    const existingAttempt = await QuizAttempt.findOne({
      student: req.user._id,
      quiz: quiz._id,
      isCompleted: false,
    });

    if (existingAttempt) {
      // Return the existing incomplete attempt with questions
      const questions = await Question.find({
        _id: { $in: existingAttempt.questions },
      }).select("-options.isCorrect"); // hide correct answers

      return res.status(200).json({
        attempt: existingAttempt,
        questions,
        timeLimit: quiz.timeLimit,
        message: "Resuming existing attempt",
      });
    }

    // Get all questions for this quiz and pick random subset
    const allQuestions = await Question.find({ quiz: quiz._id });

    if (allQuestions.length === 0) {
      return res.status(400).json({ message: "This quiz has no questions yet" });
    }

    const questionsToShow = shuffleArray(allQuestions)
      .slice(0, Math.min(quiz.questionsPerAttempt, allQuestions.length));

    // Create new attempt
    const attemptNumber = completedAttempts + 1;
    const attempt = await QuizAttempt.create({
      student: req.user._id,
      quiz: quiz._id,
      course: quiz.course,
      attemptNumber,
      questions: questionsToShow.map(q => q._id),
    });

    // Return questions without correct answers
    const questionsForStudent = questionsToShow.map(q => ({
      _id: q._id,
      text: q.text,
      type: q.type,
      points: q.points,
      options: q.options.map((o, index) => ({
        index,
        text: o.text,
        // isCorrect hidden from student
      })),
    }));

    res.status(201).json({
      attempt,
      questions: questionsForStudent,
      timeLimit: quiz.timeLimit,
      attemptNumber,
      message: `Attempt ${attemptNumber} of ${quiz.maxAttempts} started`,
    });
  } catch (error) {
    console.error("Start quiz attempt error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// STUDENT — Submit quiz attempt
// =============================================
const submitQuizAttempt = async (req, res) => {
  try {
    const { attemptId, answers, timeTaken, tabSwitchCount } = req.body;
    // answers format: { "questionId": selectedOptionIndex }

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    if (attempt.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (attempt.isCompleted) {
      return res.status(400).json({ message: "Attempt already submitted" });
    }

    const quiz = await Quiz.findById(attempt.quiz);

    // Get the questions for this attempt with correct answers
    const questions = await Question.find({
      _id: { $in: attempt.questions },
    });

    // Grade the attempt
    let earnedPoints = 0;
    let totalPoints = 0;
    const results = [];

    questions.forEach(question => {
      totalPoints += question.points;
      const selectedIndex = answers[question._id.toString()];
      const isCorrect =
        selectedIndex !== undefined &&
        selectedIndex !== null &&
        question.options[selectedIndex]?.isCorrect === true;

      if (isCorrect) earnedPoints += question.points;

      results.push({
        questionId: question._id,
        questionText: question.text,
        selectedIndex,
        correctIndex: question.options.findIndex(o => o.isCorrect),
        isCorrect,
        points: isCorrect ? question.points : 0,
        explanation: question.explanation,
        options: question.options.map((o, i) => ({ text: o.text, isCorrect: o.isCorrect, index: i })),
      });
    });

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= quiz.passingScore;

    // Save attempt
    attempt.answers = answers;
    attempt.score = score;
    attempt.earnedPoints = earnedPoints;
    attempt.totalPoints = totalPoints;
    attempt.passed = passed;
    attempt.timeTaken = timeTaken || 0;
    attempt.tabSwitchCount = tabSwitchCount || 0;
    attempt.isCompleted = true;
    attempt.submittedAt = new Date();
    await attempt.save();

    res.status(200).json({
      message: "Quiz submitted successfully",
      score,
      earnedPoints,
      totalPoints,
      passed,
      passingScore: quiz.passingScore,
      results,
      timeTaken,
    });
  } catch (error) {
    console.error("Submit quiz error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// STUDENT — Get my results for a quiz
// =============================================
const getMyQuizResults = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      student: req.user._id,
      quiz: req.params.id,
      isCompleted: true,
    }).sort({ attemptNumber: 1 });

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const bestScore = attempts.length > 0
      ? Math.max(...attempts.map(a => a.score))
      : null;

    res.status(200).json({ attempts, bestScore, quiz });
  } catch (error) {
    console.error("Get quiz results error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// TEACHER — Get all student attempts for a quiz
// =============================================
const getQuizAnalytics = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (quiz.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const attempts = await QuizAttempt.find({
      quiz: quiz._id,
      isCompleted: true,
    }).populate("student", "fullName email studentId");

    const avgScore = attempts.length > 0
      ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
      : 0;

    const passRate = attempts.length > 0
      ? Math.round((attempts.filter(a => a.passed).length / attempts.length) * 100)
      : 0;

    res.status(200).json({
      quiz,
      attempts,
      analytics: {
        totalAttempts: attempts.length,
        avgScore,
        passRate,
        highestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0,
        lowestScore: attempts.length > 0 ? Math.min(...attempts.map(a => a.score)) : 0,
      },
    });
  } catch (error) {
    console.error("Get quiz analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createQuiz,
  addQuestion,
  getQuizWithQuestions,
  getTeacherQuizzes,
  updateQuiz,
  deleteQuiz,
  getStudentQuizzes,
  startQuizAttempt,
  submitQuizAttempt,
  getMyQuizResults,
  getQuizAnalytics,
};