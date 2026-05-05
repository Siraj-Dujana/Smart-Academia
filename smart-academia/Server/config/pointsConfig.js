// Points Configuration for Gamification

const POINTS_CONFIG = {
  // Lesson related
  LESSON_COMPLETED: 50,
  LESSON_VIEWED: 10,
  
  // Quiz related
  QUIZ_PASSED: 100,
  QUIZ_PERFECT_SCORE: 50,
  QUIZ_ATTEMPT: 20,
  
  // Lab related
  LAB_SUBMITTED: 50,
  LAB_PASSED: 100,
  LAB_PERFECT: 50,
  
  // Course related
  COURSE_COMPLETED: 500,
  COURSE_PERFECT: 200,
  
  // Streak bonuses
  STREAK_3_DAYS: 50,
  STREAK_7_DAYS: 150,
  STREAK_30_DAYS: 1000,
  
  // Level thresholds (XP required)
  LEVEL_THRESHOLDS: [
    { level: 1, xpRequired: 0 },
    { level: 2, xpRequired: 500 },
    { level: 3, xpRequired: 1200 },
    { level: 4, xpRequired: 2200 },
    { level: 5, xpRequired: 3500 },
    { level: 6, xpRequired: 5000 },
    { level: 7, xpRequired: 7000 },
    { level: 8, xpRequired: 9500 },
    { level: 9, xpRequired: 12500 },
    { level: 10, xpRequired: 16000 },
  ],
  
  // Badges - Material Icons only (no emojis)
  BADGES: {
    FIRST_LESSON: {
      id: "first_lesson",
      name: "First Step",
      description: "Completed your first lesson",
      icon: "menu_book",
      points: 50,
    },
    LESSON_MASTER: {
      id: "lesson_master",
      name: "Lesson Master",
      description: "Completed 10 lessons",
      icon: "library_books",
      points: 200,
    },
    QUIZ_MASTER: {
      id: "quiz_master",
      name: "Quiz Master",
      description: "Passed 5 quizzes",
      icon: "quiz",
      points: 200,
    },
    QUIZ_CHAMPION: {
      id: "quiz_champion",
      name: "Quiz Champion",
      description: "Passed 20 quizzes",
      icon: "military_tech",
      points: 500,
    },
    LAB_EXPERT: {
      id: "lab_expert",
      name: "Lab Expert",
      description: "Completed 5 labs",
      icon: "biotech",
      points: 200,
    },
    LAB_MASTER: {
      id: "lab_master",
      name: "Lab Master",
      description: "Completed 20 labs",
      icon: "science",
      points: 500,
    },
    COURSE_CHAMPION: {
      id: "course_champion",
      name: "Course Champion",
      description: "Completed your first course",
      icon: "school",
      points: 500,
    },
    COURSE_MASTER: {
      id: "course_master",
      name: "Course Master",
      description: "Completed 5 courses",
      icon: "workspace_premium",
      points: 1000,
    },
    ACADEMIC_EXCELLENCE: {
      id: "academic_excellence",
      name: "Academic Excellence",
      description: "Completed 10 courses with 90%+ average",
      icon: "stars",
      points: 2000,
    },
    PERFECT_SCORE: {
      id: "perfect_score",
      name: "Perfect Score",
      description: "Got 100% on a quiz",
      icon: "star",
      points: 100,
    },
    CONSISTENT_EXCELLENCE: {
      id: "consistent_excellence",
      name: "Consistent Excellence",
      description: "Got 90%+ on 5 consecutive quizzes",
      icon: "trending_up",
      points: 300,
    },
    STREAK_7: {
      id: "streak_7",
      name: "Weekly Warrior",
      description: "Active for 7 days in a row",
      icon: "local_fire_department",
      points: 150,
    },
    STREAK_30: {
      id: "streak_30",
      name: "Monthly Master",
      description: "Active for 30 days in a row",
      icon: "whatshot",
      points: 500,
    },
    TOP_LEARNER: {
      id: "top_learner",
      name: "Top Learner",
      description: "Reached top 10 on leaderboard",
      icon: "crown",
      points: 300,
    },
    ELITE_LEARNER: {
      id: "elite_learner",
      name: "Elite Learner",
      description: "Reached number 1 on leaderboard",
      icon: "king_bed",
      points: 1000,
    },
    SPEED_DEMON: {
      id: "speed_demon",
      name: "Speed Demon",
      description: "Completed a quiz in under 5 minutes",
      icon: "bolt",
      points: 100,
    },
    KNOWLEDGE_SEEKER: {
      id: "knowledge_seeker",
      name: "Knowledge Seeker",
      description: "Completed courses in 3 different departments",
      icon: "psychology",
      points: 500,
    },
    EARLY_BIRD: {
      id: "early_bird",
      name: "Early Bird",
      description: "Completed 5 lessons before 9 AM",
      icon: "wb_twilight",
      points: 100,
    },
    NIGHT_OWL: {
      id: "night_owl",
      name: "Night Owl",
      description: "Completed 5 lessons after 11 PM",
      icon: "bedtime",
      points: 100,
    },
  },
};

module.exports = { POINTS_CONFIG };