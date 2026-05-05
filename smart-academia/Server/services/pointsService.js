const User = require("../models/User");
const { POINTS_CONFIG } = require("../config/pointsConfig");

class PointsService {
  // Add points to a user
  static async addPoints(userId, points, reason) {
    const user = await User.findById(userId);
    if (!user) return null;
    
    user.points = (user.points || 0) + points;
    user.totalPointsEarned = (user.totalPointsEarned || 0) + points;
    
    // Update XP and level
    user.xp = (user.xp || 0) + points;
    await this.updateLevel(user);
    
    await user.save();
    
    console.log(`📊 Added ${points} points to ${user.fullName} for: ${reason}`);
    return { newPoints: user.points, newLevel: user.level };
  }
  
  // Update user level based on XP
  static async updateLevel(user) {
    const thresholds = POINTS_CONFIG.LEVEL_THRESHOLDS;
    let newLevel = 1;
    
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (user.xp >= thresholds[i].xpRequired) {
        newLevel = thresholds[i].level;
        break;
      }
    }
    
    if (newLevel !== user.level) {
      console.log(`🎉 ${user.fullName} leveled up from ${user.level} to ${newLevel}!`);
      user.level = newLevel;
    }
    
    return newLevel;
  }
  
  // Award a badge to user
  static async awardBadge(userId, badgeKey) {
    const badge = POINTS_CONFIG.BADGES[badgeKey];
    if (!badge) return null;
    
    const user = await User.findById(userId);
    if (!user) return null;
    
    // Check if already has badge
    if (user.badges?.some(b => b.id === badge.id)) {
      return null;
    }
    
    user.badges = user.badges || [];
    user.badges.push({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      earnedAt: new Date(),
    });
    
    // Award bonus points for badge
    await this.addPoints(userId, badge.points, `Earned badge: ${badge.name}`);
    
    await user.save();
    return badge;
  }
  
  // Update streak
  static async updateStreak(userId) {
    const user = await User.findById(userId);
    if (!user) return null;
    
    const today = new Date().toDateString();
    const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt).toDateString() : null;
    
    if (lastActive === today) {
      return user.streak;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    let newStreak = 1;
    if (lastActive === yesterdayStr) {
      newStreak = (user.streak || 0) + 1;
    }
    
    user.streak = newStreak;
    user.lastActiveAt = new Date();
    
    // Award streak bonuses
    if (newStreak === 3) {
      await this.addPoints(userId, POINTS_CONFIG.STREAK_3_DAYS, "3-day streak bonus!");
    } else if (newStreak === 7) {
      await this.addPoints(userId, POINTS_CONFIG.STREAK_7_DAYS, "7-day streak bonus!");
      await this.awardBadge(userId, "STREAK_7");
    } else if (newStreak === 30) {
      await this.addPoints(userId, POINTS_CONFIG.STREAK_30_DAYS, "30-day streak bonus!");
    }
    
    await user.save();
    return newStreak;
  }
}

module.exports = PointsService;