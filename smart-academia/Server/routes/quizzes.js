const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/quizController");
const { protect, authorize } = require("../middleware/authMiddleware");

// ===== TEACHER =====
router.post("/", protect, authorize("teacher"), createQuiz);
router.get("/course/:courseId", protect, authorize("teacher"), getTeacherQuizzes);
router.get("/:id/manage", protect, authorize("teacher"), getQuizWithQuestions);
router.post("/:quizId/questions", protect, authorize("teacher"), addQuestion);
router.put("/:id", protect, authorize("teacher"), updateQuiz);
router.delete("/:id", protect, authorize("teacher"), deleteQuiz);
router.get("/:id/analytics", protect, authorize("teacher"), getQuizAnalytics);

// ===== STUDENT =====
router.get("/student/course/:courseId", protect, authorize("student"), getStudentQuizzes);
router.post("/:id/attempt", protect, authorize("student"), startQuizAttempt);
router.post("/submit", protect, authorize("student"), submitQuizAttempt);
router.get("/:id/my-results", protect, authorize("student"), getMyQuizResults);

module.exports = router;