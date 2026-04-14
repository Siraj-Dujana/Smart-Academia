const express = require("express");
const router  = express.Router();
const {
  createQuiz, updateQuiz, deleteQuiz, getQuizzes,
  addQuestion, getQuestions, deleteQuestion,
  aiGenerateQuestions,
  getMyAttempts, submitQuiz,
} = require("../controllers/quizController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Teacher
router.post("/",                                  protect, authorize("teacher"), createQuiz);
router.get("/",                                   protect, authorize("teacher"), getQuizzes);
router.put("/:quizId",                            protect, authorize("teacher"), updateQuiz);
router.delete("/:quizId",                         protect, authorize("teacher"), deleteQuiz);
router.post("/:quizId/questions",                 protect, authorize("teacher"), addQuestion);
router.delete("/:quizId/questions/:questionId",   protect, authorize("teacher"), deleteQuestion);
router.post("/:quizId/ai-generate",               protect, authorize("teacher"), aiGenerateQuestions);

// Shared (both can get questions)
router.get("/:quizId/questions",                  protect, getQuestions);

// Student
router.get("/:quizId/my-attempts",                protect, authorize("student"), getMyAttempts);
router.post("/:quizId/submit",                    protect, authorize("student"), submitQuiz);

module.exports = router;