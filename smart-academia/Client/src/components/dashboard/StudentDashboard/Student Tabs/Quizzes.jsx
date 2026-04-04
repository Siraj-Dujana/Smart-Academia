import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// =============================================
// QUIZ CARD
// =============================================
const QuizCard = ({ quiz, onStart, onViewResults }) => {
  const getStatusColor = (quiz) => {
    if (!quiz.canAttempt && quiz.attemptCount > 0) return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
    if (quiz.passed) return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
    if (quiz.attemptCount > 0) return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300";
    return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
  };

  const getStatusLabel = (quiz) => {
    if (quiz.passed) return "Passed ✓";
    if (!quiz.canAttempt) return "Max attempts reached";
    if (quiz.attemptCount > 0) return `Attempted (${quiz.attemptCount}/${quiz.maxAttempts})`;
    return "Not attempted";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">quiz</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quiz)}`}>
                {getStatusLabel(quiz)}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                quiz.difficulty === "Beginner" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" :
                quiz.difficulty === "Intermediate" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" :
                "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
              }`}>
                {quiz.difficulty}
              </span>
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{quiz.title}</h3>
            {quiz.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{quiz.description}</p>
            )}
          </div>
          {quiz.bestScore !== null && (
            <div className="text-right ml-3 flex-shrink-0">
              <div className={`text-2xl font-bold ${quiz.passed ? "text-green-600" : "text-amber-600"}`}>
                {quiz.bestScore}%
              </div>
              <div className="text-xs text-gray-500">Best score</div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span className="material-symbols-outlined text-sm">quiz</span>
            {quiz.totalQuestions} questions
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span className="material-symbols-outlined text-sm">schedule</span>
            {quiz.timeLimit} minutes
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span className="material-symbols-outlined text-sm">replay</span>
            {quiz.attemptCount}/{quiz.maxAttempts} attempts
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span className="material-symbols-outlined text-sm">flag</span>
            Pass: {quiz.passingScore}%
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          {quiz.attemptCount > 0 && (
            <button onClick={() => onViewResults(quiz)}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span className="material-symbols-outlined text-sm">bar_chart</span>
              View Results
            </button>
          )}
          <button
            onClick={() => onStart(quiz)}
            disabled={!quiz.canAttempt}
            className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors ${
              quiz.canAttempt
                ? "text-white bg-blue-600 hover:bg-blue-700"
                : "text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
            }`}>
            <span className="material-symbols-outlined text-sm">
              {quiz.attemptCount > 0 ? "replay" : "play_arrow"}
            </span>
            {quiz.attemptCount > 0 ? `Retry (${quiz.maxAttempts - quiz.attemptCount} left)` : "Start Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================
// QUIZ PLAYER
// =============================================
const QuizPlayer = ({ quiz, attempt, questions, onSubmit, onCancel }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMsg, setWarningMsg] = useState("");
  const startTime = useRef(Date.now());

  // Wrap handleSubmit in useCallback with proper dependencies
  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (isSubmitting) return;
    if (!autoSubmit && !window.confirm("Are you sure you want to submit the quiz?")) return;
    setIsSubmitting(true);
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    await onSubmit({ attemptId: attempt._id, answers, timeTaken, tabSwitchCount });
  }, [isSubmitting, onSubmit, attempt._id, answers, tabSwitchCount]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) { handleSubmit(true); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit]);

  // Tab switch detection (anti-cheating)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          setWarningMsg(`Warning ${newCount}/3: Do not switch tabs during the quiz!`);
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 4000);
          if (newCount >= 3) handleSubmit(true);
          return newCount;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [handleSubmit]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const question = questions[currentQ];
  const answeredCount = Object.keys(answers).length;
  const progress = ((currentQ + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{quiz.title}</h2>
              <p className="text-sm text-gray-500">Attempt {attempt.attemptNumber} of {quiz.maxAttempts}</p>
            </div>
            <div className="flex items-center gap-4">
              {tabSwitchCount > 0 && (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  <span className="text-sm font-medium">{tabSwitchCount}/3 warnings</span>
                </div>
              )}
              <div className={`px-4 py-1.5 rounded-xl font-mono font-bold text-lg ${
                timeLeft < 300
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              }`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Question {currentQ + 1} of {questions.length}</span>
              <span>{answeredCount} answered</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}/>
            </div>
          </div>
        </div>

        {/* Warning banner */}
        {showWarning && (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-700 px-6 py-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600">warning</span>
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">{warningMsg}</p>
          </div>
        )}

        {/* Question */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">Question {currentQ + 1}</span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                {question.points} points
              </span>
            </div>
            <p className="text-lg text-gray-900 dark:text-white font-medium leading-relaxed">
              {question.text}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = answers[question._id] === option.index;
              return (
                <label key={option.index}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}>
                  <input type="radio" name={`q-${question._id}`}
                    checked={isSelected}
                    onChange={() => setAnswers(prev => ({ ...prev, [question._id]: option.index }))}
                    className="text-blue-600 w-4 h-4 flex-shrink-0"/>
                  <span className="text-gray-800 dark:text-gray-200">{option.text}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Footer nav */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          {/* Question dots */}
          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
            {questions.map((q, i) => (
              <button key={i} onClick={() => setCurrentQ(i)}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                  i === currentQ
                    ? "bg-blue-600 text-white scale-110"
                    : answers[q._id] !== undefined
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300"
                }`}>
                {i + 1}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <button onClick={() => setCurrentQ(p => Math.max(0, p - 1))}
              disabled={currentQ === 0}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-40 transition-colors">
              <span className="material-symbols-outlined">chevron_left</span> Previous
            </button>

            <button onClick={() => handleSubmit(false)} disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2">
              {isSubmitting
                ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Submitting...</>
                : <><span className="material-symbols-outlined text-sm">check</span> Submit Quiz</>
              }
            </button>

            <button onClick={() => setCurrentQ(p => Math.min(questions.length - 1, p + 1))}
              disabled={currentQ === questions.length - 1}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-40 transition-colors">
              Next <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================
// QUIZ RESULTS
// =============================================
const QuizResults = ({ result, quiz, onClose, onRetry }) => {
  const passed = result.passed;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 ${passed ? "bg-green-600" : "bg-amber-500"}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Quiz Results</h2>
              <p className="text-white/80">{quiz.title}</p>
            </div>
            <button onClick={onClose}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
              <span className="material-symbols-outlined text-white">close</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Score circle */}
          <div className="flex justify-center mb-6">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                <circle cx="50" cy="50" r="45" fill="none"
                  stroke={passed ? "#16a34a" : "#f59e0b"} strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - result.score / 100)}`}
                  transform="rotate(-90 50 50)"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{result.score}%</span>
                <span className={`text-sm font-bold ${passed ? "text-green-600" : "text-amber-600"}`}>
                  {passed ? "PASSED" : "FAILED"}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Earned", value: `${result.earnedPoints}/${result.totalPoints} pts` },
              { label: "Time taken", value: `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s` },
              { label: "Pass mark", value: `${quiz.passingScore}%` },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                <div className="font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Question-by-question breakdown */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Answer Review</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {result.results.map((r, i) => (
                <div key={i} className={`p-4 rounded-xl border ${
                  r.isCorrect
                    ? "border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
                    : "border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                }`}>
                  <div className="flex items-start gap-3">
                    <span className={`material-symbols-outlined text-lg flex-shrink-0 mt-0.5 ${
                      r.isCorrect ? "text-green-600" : "text-red-500"
                    }`}>
                      {r.isCorrect ? "check_circle" : "cancel"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Q{i + 1}. {r.questionText}
                      </p>
                      {!r.isCorrect && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Correct: <span className="font-medium text-green-700 dark:text-green-400">
                            {r.options[r.correctIndex]?.text}
                          </span>
                        </p>
                      )}
                      {r.explanation && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                          {r.explanation}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs font-bold flex-shrink-0 ${
                      r.isCorrect ? "text-green-600" : "text-gray-400"
                    }`}>
                      {r.isCorrect ? `+${r.points}` : "0"} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
              Back to Quizzes
            </button>
            {onRetry && (
              <button onClick={onRetry}
                className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium">
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================
// MAIN QUIZZES PAGE
// =============================================
const Quizzes = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Quiz player state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [activeAttempt, setActiveAttempt] = useState(null);
  const [activeQuestions, setActiveQuestions] = useState([]);

  // Results state
  const [result, setResult] = useState(null);
  const [resultQuiz, setResultQuiz] = useState(null);

  // Filter state
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Wrap fetch functions in useCallback
  const fetchEnrolledCourses = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/courses/enrolled`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.courses.length > 0) {
        setCourses(data.courses);
        setSelectedCourse(data.courses[0]._id);
      }
    } catch { setError("Cannot connect to server"); }
  }, [token]);

  const fetchQuizzes = useCallback(async () => {
    if (!selectedCourse) return;
    setIsLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/quizzes/student/course/${selectedCourse}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setQuizzes(data.quizzes);
      else setError(data.message);
    } catch { setError("Cannot connect to server"); }
    finally { setIsLoading(false); }
  }, [selectedCourse, token]);

  useEffect(() => { 
    fetchEnrolledCourses(); 
  }, [fetchEnrolledCourses]);

  useEffect(() => { 
    if (selectedCourse) fetchQuizzes(); 
  }, [selectedCourse, fetchQuizzes]);

  const handleStartQuiz = async (quiz) => {
    try {
      const res = await fetch(`${API}/api/quizzes/${quiz._id}/attempt`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      setActiveQuiz(quiz);
      setActiveAttempt(data.attempt);
      setActiveQuestions(data.questions);
    } catch { alert("Cannot connect to server"); }
  };

  const handleSubmitQuiz = async ({ attemptId, answers, timeTaken, tabSwitchCount }) => {
    try {
      const res = await fetch(`${API}/api/quizzes/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ attemptId, answers, timeTaken, tabSwitchCount }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      setActiveQuiz(null);
      setActiveAttempt(null);
      setActiveQuestions([]);
      setResult(data);
      setResultQuiz(quizzes.find(q => q._id === activeAttempt?.quiz) || activeQuiz);
      fetchQuizzes(); // refresh attempt counts
    } catch { alert("Cannot connect to server"); }
  };

  const handleViewResults = async (quiz) => {
    try {
      const res = await fetch(`${API}/api/quizzes/${quiz._id}/my-results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.attempts.length > 0) {
        const best = data.attempts.reduce((a, b) => a.score > b.score ? a : b);
        // Build a fake result object from the best attempt for display
        setResult({
          score: best.score,
          earnedPoints: best.earnedPoints,
          totalPoints: best.totalPoints,
          passed: best.passed,
          timeTaken: best.timeTaken,
          results: [], // no detailed results for historical view
        });
        setResultQuiz(quiz);     
      }
    } catch { alert("Cannot connect to server"); }
  };

  const filteredQuizzes = quizzes.filter(q => {
    if (filter === "pending" && (q.attemptCount >= q.maxAttempts || q.passed)) return false;
    if (filter === "completed" && q.attemptCount === 0) return false;
    if (filter === "passed" && !q.passed) return false;
    if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: quizzes.length,
    completed: quizzes.filter(q => q.attemptCount > 0).length,
    passed: quizzes.filter(q => q.passed).length,
    pending: quizzes.filter(q => q.attemptCount === 0 && q.canAttempt).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Quizzes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Take quizzes and track your performance</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: "quiz", label: "Total Quizzes", value: stats.total, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
          { icon: "pending", label: "Pending", value: stats.pending, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600" },
          { icon: "check_circle", label: "Attempted", value: stats.completed, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
          { icon: "emoji_events", label: "Passed", value: stats.passed, color: "bg-green-100 dark:bg-green-900/30 text-green-600" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center size-10 rounded-lg ${s.color}`}>
                <span className="material-symbols-outlined text-xl">{s.icon}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course selector + filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 space-y-4">
        {/* Course selector */}
        {courses.length > 0 && (
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
            className="w-full sm:w-72 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm">
            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input type="text" placeholder="Search quizzes..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"/>
          </div>
          {/* Filter buttons */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "completed", label: "Attempted" },
              { key: "passed", label: "Passed" },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz list */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm">{error}</div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">quiz</span>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2">No enrolled courses</h3>
          <p className="text-gray-500 mb-4">Enroll in a course to access its quizzes</p>
          <button onClick={() => navigate("/student/dashboard")}
            className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Browse Courses →
          </button>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-gray-500 mt-2">Loading quizzes...</p>
        </div>
      ) : filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredQuizzes.map(quiz => (
            <QuizCard key={quiz._id} quiz={quiz}
              onStart={handleStartQuiz}
              onViewResults={handleViewResults}/>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">quiz</span>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2">No quizzes found</h3>
          <p className="text-gray-500">
            {quizzes.length === 0 ? "No quizzes published for this course yet" : "Try a different filter"}
          </p>
        </div>
      )}

      {/* Quiz Player Modal */}
      {activeQuiz && activeAttempt && (
        <QuizPlayer
          quiz={activeQuiz}
          attempt={activeAttempt}
          questions={activeQuestions}
          onSubmit={handleSubmitQuiz}
          onCancel={() => {
            if (window.confirm("Cancel quiz? Your progress will be lost.")) {
              setActiveQuiz(null);
              setActiveAttempt(null);
              setActiveQuestions([]);
            }
          }}
        />
      )}

      {/* Results Modal */}
      {result && resultQuiz && (
        <QuizResults
          result={result}
          quiz={resultQuiz}
          onClose={() => { setResult(null); setResultQuiz(null); }}
          onRetry={resultQuiz.canAttempt ? () => {
            setResult(null);
            setResultQuiz(null);
            handleStartQuiz(resultQuiz);
          } : null}
        />
      )}
    </div>
  );
};

export default Quizzes;