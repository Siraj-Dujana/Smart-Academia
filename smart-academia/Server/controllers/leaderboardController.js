const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

// ─────────────────────────────────────────────────────────────
// Get Global Leaderboard (all students)
// GET /api/leaderboard/global?limit=50
// ─────────────────────────────────────────────────────────────
const getGlobalLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    
    const leaderboard = await User.find({ role: "student" })
      .select("fullName email avatar points level badges streak")
      .sort({ points: -1 })
      .limit(limit)
      .lean();
    
    // Add rank
    const ranked = leaderboard.map((user, index) => ({
      rank: index + 1,
      ...user,
    }));
    
    // Get current user's rank
    let userRank = null;
    const totalStudents = await User.countDocuments({ role: "student" });
    
    if (req.user) {
      const userPoints = await User.findById(req.user._id).select("points");
      const rank = await User.countDocuments({ 
        role: "student", 
        points: { $gt: userPoints?.points || 0 } 
      });
      userRank = rank + 1;
    }
    
    res.status(200).json({
      leaderboard: ranked,
      userRank,
      totalStudents,
    });
  } catch (err) {
    console.error("getGlobalLeaderboard error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// Get Course-Specific Leaderboard
// GET /api/leaderboard/course/:courseId?limit=50
// ─────────────────────────────────────────────────────────────
const getCourseLeaderboard = async (req, res) => {
  try {
    const { courseId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    
    const enrollments = await Enrollment.find({ course: courseId })
      .populate("student", "fullName email avatar points level")
      .sort({ progress: -1, "student.points": -1 })
      .limit(limit)
      .lean();
    
    const leaderboard = enrollments.map((enrollment, index) => ({
      rank: index + 1,
      student: enrollment.student,
      progress: enrollment.progress,
      isCompleted: enrollment.isCompleted,
    }));
    
    res.status(200).json({
      course: { _id: course._id, title: course.title },
      leaderboard,
      totalEnrolled: enrollments.length,
    });
  } catch (err) {
    console.error("getCourseLeaderboard error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// Get Weekly Leaderboard
// GET /api/leaderboard/weekly?limit=50
// ─────────────────────────────────────────────────────────────
const getWeeklyLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Get users with points earned in last 7 days
    const leaderboard = await User.find({ 
      role: "student",
      updatedAt: { $gte: oneWeekAgo }
    })
      .select("fullName email avatar points level badges streak")
      .sort({ points: -1 })
      .limit(limit)
      .lean();
    
    const ranked = leaderboard.map((user, index) => ({
      rank: index + 1,
      ...user,
    }));
    
    res.status(200).json({ leaderboard: ranked });
  } catch (err) {
    console.error("getWeeklyLeaderboard error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// Get User Badges
// GET /api/leaderboard/badges/:userId?
// ─────────────────────────────────────────────────────────────
// Get User Badges
// GET /api/leaderboard/badges/me or /api/leaderboard/badges/:userId
const getUserBadges = async (req, res) => {
  try {
    // Check if it's the "me" route or specific user
    let userId = req.params.userId;
    
    if (req.params.userId === "me" || !userId) {
      userId = req.user._id;
    }
    
    const user = await User.findById(userId).select("fullName email avatar badges points level");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.status(200).json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        points: user.points,
        level: user.level,
      },
      badges: user.badges || [],
      totalBadges: (user.badges || []).length,
    });
  } catch (err) {
    console.error("getUserBadges error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// Get User Stats (Points, Level, Progress)
// GET /api/leaderboard/my-stats
// ─────────────────────────────────────────────────────────────
const getMyStats = async (req, res) => {
  try {
     const { POINTS_CONFIG } = require("../config/pointsConfig"); // Move it here
    const user = await User.findById(req.user._id)
      .select("fullName email avatar points level badges streak totalPointsEarned");
    
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Get rank
    const rank = await User.countDocuments({ 
      role: "student", 
      points: { $gt: user.points || 0 } 
    });
    
    // Get next level requirements
    // const { POINTS_CONFIG } = require("../config/pointsConfig");
    const currentLevel = user.level || 1;
    const nextLevelIndex = POINTS_CONFIG.LEVEL_THRESHOLDS.findIndex(l => l.level === currentLevel + 1);
    const nextLevelXP = nextLevelIndex !== -1 ? POINTS_CONFIG.LEVEL_THRESHOLDS[nextLevelIndex].xpRequired : null;
    const xpToNextLevel = nextLevelXP ? nextLevelXP - (user.xp || 0) : 0;
    
    res.status(200).json({
      stats: {
        points: user.points || 0,
        level: user.level || 1,
        xp: user.xp || 0,
        streak: user.streak || 0,
        totalEarned: user.totalPointsEarned || 0,
        rank: rank + 1,
        badgesCount: (user.badges || []).length,
      },
      nextLevel: nextLevelXP ? {
        level: currentLevel + 1,
        xpRequired: nextLevelXP,
        xpRemaining: xpToNextLevel,
      } : null,
    });
  } catch (err) {
    console.error("getMyStats error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getGlobalLeaderboard,
  getCourseLeaderboard,
  getWeeklyLeaderboard,
  getUserBadges,
  getMyStats,
};