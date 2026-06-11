// utils/scoring.js
// Single source of truth for the "weighted score" calculation used across
// analyticsController, aiProgressController, teacherProgressController, and
// the PDF report generator. Keeping this in one place guarantees a student's
// score is identical everywhere it's displayed.

/**
 * Weighted score formula:
 * - progress + quiz + lab present  -> 50% progress, 30% quiz, 20% lab
 * - progress + quiz only           -> 60% progress, 40% quiz
 * - progress + lab only            -> 70% progress, 30% lab
 * - progress only                  -> 100% progress
 */
function computeWeightedScore(progressPct, avgQuizScore, avgLabScore) {
  const hasQuiz = avgQuizScore !== null && avgQuizScore !== undefined;
  const hasLab  = avgLabScore  !== null && avgLabScore  !== undefined;

  if (hasQuiz && hasLab) {
    return Math.round(progressPct * 0.5 + avgQuizScore * 0.3 + avgLabScore * 0.2);
  }
  if (hasQuiz) {
    return Math.round(progressPct * 0.6 + avgQuizScore * 0.4);
  }
  if (hasLab) {
    return Math.round(progressPct * 0.7 + avgLabScore * 0.3);
  }
  return Math.round(progressPct);
}

/**
 * Streak calculation shared by analyticsController.
 */
function computeStreak(activityDateSet) {
  if (!activityDateSet.size) return 0;
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (activityDateSet.has(key)) {
      streak++;
    } else if (i > 0) {
      break; // gap found
    }
  }
  return streak;
}

module.exports = { computeWeightedScore, computeStreak };