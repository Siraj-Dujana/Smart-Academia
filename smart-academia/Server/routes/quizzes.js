const express = require("express");
const Quiz = require("../models/Quiz");
const LessonProgress = require("../models/LessonProgress");
const router  = express.Router();
const {
  createQuiz, updateQuiz, deleteQuiz, getQuizzes,
  addQuestion, getQuestions, deleteQuestion,
  aiGenerateQuestions,
  getMyAttempts, submitQuiz,
  getStudentQuizzesByCourse,
  startQuizAttempt,
  getMyResults,
} = require("../controllers/quizController");
const { protect, authorize } = require("../middleware/authMiddleware");

// ── TEACHER ─────────────────────────────────────────────────
router.post("/",                                protect, authorize("teacher"), createQuiz);
router.get("/",                                 protect, authorize("teacher"), getQuizzes);
router.put("/:quizId",                          protect, authorize("teacher"), updateQuiz);
router.delete("/:quizId",                       protect, authorize("teacher"), deleteQuiz);
router.post("/:quizId/questions",               protect, authorize("teacher"), addQuestion);
router.delete("/:quizId/questions/:questionId", protect, authorize("teacher"), deleteQuestion);
router.post("/:quizId/ai-generate",             protect, authorize("teacher"), aiGenerateQuestions);

// ── SHARED (both roles can get questions) ───────────────────
router.get("/:quizId/questions",                protect, getQuestions);

// ── STUDENT ──────────────────────────────────────────────────
// Get all quizzes for a course (student view with attempt data)
router.get("/student/course/:courseId",         protect, authorize("student"), getStudentQuizzesByCourse);
// Start a new attempt
router.post("/:quizId/attempt",                 protect, authorize("student"), startQuizAttempt);
// Submit answers (uses attemptId in body)
router.post("/submit",                          protect, authorize("student"), submitQuiz);
// Get my past attempts for a quiz
router.get("/:quizId/my-attempts",              protect, authorize("student"), getMyAttempts);
// Get best result details for a quiz
router.get("/:quizId/my-results",               protect, authorize("student"), getMyResults);

router.post("/:quizId/mark-exhausted", protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const result = await LessonProgress.findOneAndUpdate(
      { student: req.user._id, lesson: quiz.lesson },
      { $set: { quizCompleted: true } },
      { upsert: true, new: true }
    );

    console.log("Marked quiz as exhausted:", result);

    const { checkAndUnlockNext } = require("../controllers/lessonController");
    await checkAndUnlockNext(req.user._id, quiz.lesson, quiz.course);

    res.json({ message: "Quiz marked as exhausted" });
  } catch (err) {
    console.error("mark-exhausted error:", err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;