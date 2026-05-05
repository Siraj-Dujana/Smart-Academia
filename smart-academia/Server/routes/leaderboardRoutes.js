const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getGlobalLeaderboard,
  getCourseLeaderboard,
  getWeeklyLeaderboard,
  getUserBadges,
  getMyStats,
} = require("../controllers/leaderboardController");

// Leaderboard routes
router.get("/global", protect, getGlobalLeaderboard);
router.get("/weekly", protect, getWeeklyLeaderboard);
router.get("/my-stats", protect, getMyStats);
router.get("/course/:courseId", protect, getCourseLeaderboard);

// ✅ FIXED: Separate routes instead of optional parameter
router.get("/badges/me", protect, getUserBadges);      // Get current user's badges
router.get("/badges/:userId", protect, getUserBadges); // Get specific user's badges

module.exports = router;