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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg">quiz</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(quiz)}`}>
                {getStatusLabel(quiz)}
              </span>
            </div>
            <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-1 line-clamp-1">{quiz.title}</h3>
            {quiz.description && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{quiz.description}</p>
            )}
          </div>
          {quiz.bestScore !== null && quiz.bestScore !== undefined && (
            <div className="text-right flex-shrink-0">
              <div className={`text-xl sm:text-2xl font-bold ${quiz.passed ? "text-green-600" : "text-amber-600"}`}>
                {quiz.bestScore}%
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500">Best score</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
            <span className="material-symbols-outlined text-sm">quiz</span>
            {quiz.totalQuestions} questions
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
            <span className="material-symbols-outlined text-sm">schedule</span>
            {quiz.timeLimit} minutes
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
            <span className="material-symbols-outlined text-sm">replay</span>
            {quiz.attemptCount}/{quiz.maxAttempts} attempts
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
            <span className="material-symbols-outlined text-sm">flag</span>
            Pass: {quiz.passingScore}%
          </div>
        </div>

        <div className="flex flex-col xs:flex-row gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          {quiz.attemptCount > 0 && (
            <button
              onClick={() => onViewResults(quiz)}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">bar_chart</span>
              View Results
            </button>
          )}
          <button
            onClick={() => onStart(quiz)}
            disabled={!quiz.canAttempt}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
              quiz.canAttempt
                ? "text-white bg-blue-600 hover:bg-blue-700"
                : "text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
            }`}
          >
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
// QUIZ PLAYER — answers stored as { questionId: optionIndex }
// =============================================
const QuizPlayer = ({ quiz, attempt, questions, onSubmit, onCancel }) => {
  const [currentQ, setCurrentQ] = useState(0);
  // ✅ FIXED: store answers as { [questionId]: optionIndex (number) }
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMsg, setWarningMsg] = useState("");
  const startTime = useRef(Date.now());

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (isSubmitting) return;
    if (!autoSubmit && !window.confirm("Are you sure you want to submit the quiz?")) return;
    setIsSubmitting(true);
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    // ✅ Pass answers as { questionId: optionIndex }
    await onSubmit({ attemptId: attempt._id, answers, timeTaken, tabSwitchCount });
  }, [isSubmitting, onSubmit, attempt._id, answers, tabSwitchCount]);

  useEffect(() => {
    if (timeLeft <= 0) { handleSubmit(true); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit]);

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
    <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{quiz.title}</h2>
              <p className="text-xs sm:text-sm text-gray-500">Attempt {attempt.attemptNumber} of {quiz.maxAttempts}</p>
            </div>
            <div className="flex items-center gap-3">
              {tabSwitchCount > 0 && (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  <span className="text-xs sm:text-sm font-medium">{tabSwitchCount}/3</span>
                </div>
              )}
              <div className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl font-mono font-bold text-base sm:text-lg ${
                timeLeft < 300
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              }`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mb-1">
              <span>Question {currentQ + 1} of {questions.length}</span>
              <span>{answeredCount} answered</span>
            </div>
            <div className="h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-300 rounded-full" style={{ width: `${progress}%` }}/>
            </div>
          </div>
        </div>

        {showWarning && (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-700 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-sm">warning</span>
            <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 font-medium">{warningMsg}</p>
          </div>
        )}

        {/* Question */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-5 sm:mb-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-gray-500">Question {currentQ + 1}</span>
              <span className="px-2 py-0.5 sm:py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] sm:text-xs font-medium rounded">
                {question.points} points
              </span>
            </div>
            <p className="text-base sm:text-lg text-gray-900 dark:text-white font-medium leading-relaxed">
              {question.text}
            </p>
          </div>

          {/* ✅ FIXED: store option INDEX not text */}
          <div className="space-y-2 sm:space-y-3">
            {question.options.map((option, idx) => {
              const isSelected = answers[question._id] === idx;
              return (
                <label
                  key={idx}
                  className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${question._id}`}
                    checked={isSelected}
                    onChange={() => setAnswers(prev => ({ ...prev, [question._id]: idx }))}
                    className="text-blue-600 w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                  />
                  <span className="text-sm sm:text-base text-gray-800 dark:text-gray-200">{option.text}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-1.5 mb-3 sm:mb-4 flex-wrap">
            {questions.map((q, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-[10px] sm:text-xs font-medium transition-all ${
                  i === currentQ
                    ? "bg-blue-600 text-white scale-110"
                    : answers[q._id] !== undefined
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2">
            <button
              onClick={() => setCurrentQ(p => Math.max(0, p - 1))}
              disabled={currentQ === 0}
              className="flex items-center justify-center gap-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-40 transition-colors order-2 xs:order-1"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span> Previous
            </button>

            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center gap-2 order-1 xs:order-2"
            >
              {isSubmitting
                ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Submitting...</>
                : <><span className="material-symbols-outlined text-sm">check</span> Submit Quiz</>
              }
            </button>

            <button
              onClick={() => setCurrentQ(p => Math.min(questions.length - 1, p + 1))}
              disabled={currentQ === questions.length - 1}
              className="flex items-center justify-center gap-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-40 transition-colors order-3"
            >
              Next <span className="material-symbols-outlined text-base">chevron_right</span>
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
    <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className={`p-4 sm:p-6 ${passed ? "bg-green-600" : "bg-amber-500"} sticky top-0`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-white">Quiz Results</h2>
              <p className="text-white/80 text-sm sm:text-base">{quiz.title}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
              <span className="material-symbols-outlined text-white">close</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Score circle */}
          <div className="flex justify-center mb-5 sm:mb-6">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                <circle cx="50" cy="50" r="45" fill="none"
                  stroke={passed ? "#16a34a" : "#f59e0b"} strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - result.score / 100)}`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{result.score}%</span>
                <span className={`text-xs sm:text-sm font-bold ${passed ? "text-green-600" : "text-amber-600"}`}>
                  {passed ? "PASSED" : "FAILED"}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5 sm:mb-6">
            {[
              { label: "Correct", value: `${result.correctCount}/${result.totalQuestions}` },
              { label: "Time taken", value: result.timeTaken ? `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s` : "—" },
              { label: "Pass mark", value: `${quiz.passingScore}%` },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2 sm:p-3 text-center">
                <div className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Answer review — shown when results array is populated */}
          {result.results && result.results.length > 0 && (
            <div className="mb-5 sm:mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm sm:text-base">Answer Review</h3>
              <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto pr-1">
                {result.results.map((r, i) => (
                  <div key={i} className={`p-3 sm:p-4 rounded-xl border ${
                    r.isCorrect
                      ? "border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
                      : "border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                  }`}>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <span className={`material-symbols-outlined text-base sm:text-lg flex-shrink-0 mt-0.5 ${r.isCorrect ? "text-green-600" : "text-red-500"}`}>
                        {r.isCorrect ? "check_circle" : "cancel"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-1">
                          Q{i + 1}. {r.questionText}
                        </p>
                        {!r.isCorrect && r.options && (
                          <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                            Correct: <span className="font-medium text-green-700 dark:text-green-400">
                              {r.options[r.correctIndex]?.text}
                            </span>
                          </p>
                        )}
                        {r.explanation && (
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                            {r.explanation}
                          </p>
                        )}
                      </div>
                      <span className={`text-[10px] sm:text-xs font-bold flex-shrink-0 ${r.isCorrect ? "text-green-600" : "text-gray-400"}`}>
                        {r.isCorrect ? `+${r.points}` : "0"} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm font-medium"
            >
              Back to Quizzes
            </button>
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex-1 px-4 py-2 sm:py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
              >
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

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [activeAttempt, setActiveAttempt] = useState(null);
  const [activeQuestions, setActiveQuestions] = useState([]);

  const [result, setResult] = useState(null);
  const [resultQuiz, setResultQuiz] = useState(null);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // ✅ FIXED: correct endpoint for enrolled courses
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

  // ✅ FIXED: correct endpoint for student quizzes
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

  useEffect(() => { fetchEnrolledCourses(); }, [fetchEnrolledCourses]);
  useEffect(() => { if (selectedCourse) fetchQuizzes(); }, [selectedCourse, fetchQuizzes]);

  // ✅ FIXED: start attempt via POST /:quizId/attempt, then open player
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

  // ✅ FIXED: submit via POST /submit with correct payload
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
      setResultQuiz(activeQuiz);
      fetchQuizzes();
    } catch { alert("Cannot connect to server"); }
  };

  // ✅ FIXED: view results via correct endpoint, and show populated results
  const handleViewResults = async (quiz) => {
    try {
      const res = await fetch(`${API}/api/quizzes/${quiz._id}/my-results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.attempts?.length > 0) {
        const best = data.attempts.reduce((a, b) => (a.score > b.score ? a : b));
        setResult({
          score:          best.score,
          passed:         best.passed,
          correctCount:   best.answers?.filter(a => a.isCorrect).length || 0,
          totalQuestions: best.answers?.length || 0,
          timeTaken:      best.timeTaken,
          results:        [], // no review detail in history view
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
    total:     quizzes.length,
    completed: quizzes.filter(q => q.attemptCount > 0).length,
    passed:    quizzes.filter(q => q.passed).length,
    pending:   quizzes.filter(q => q.attemptCount === 0 && q.canAttempt).length,
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Quizzes</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Take quizzes and track your performance</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: "quiz",         label: "Total Quizzes", value: stats.total,     color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
          { icon: "pending",      label: "Pending",       value: stats.pending,   color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600" },
          { icon: "check_circle", label: "Attempted",     value: stats.completed, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
          { icon: "emoji_events", label: "Passed",        value: stats.passed,    color: "bg-green-100 dark:bg-green-900/30 text-green-600" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${s.color} group-hover:scale-110 transition-transform duration-200`}>
                <span className="material-symbols-outlined text-lg sm:text-xl">{s.icon}</span>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs">{s.label}</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course selector + filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-3 sm:p-4 space-y-3 sm:space-y-4">
        {courses.length > 0 && (
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="w-full sm:w-72 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">search</span>
            <input
              type="text"
              placeholder="Search quizzes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            {[
              { key: "all",       label: "All" },
              { key: "pending",   label: "Pending" },
              { key: "completed", label: "Attempted" },
              { key: "passed",    label: "Passed" },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  filter === f.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
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
        <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="material-symbols-outlined text-5xl sm:text-6xl text-gray-300 dark:text-gray-600">quiz</span>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mt-3 sm:mt-4 mb-2">No enrolled courses</h3>
          <p className="text-sm text-gray-500 mb-4">Enroll in a course to access its quizzes</p>
          <button onClick={() => navigate("/student/dashboard")} className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Browse Courses →
          </button>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-gray-500 mt-2 text-sm">Loading quizzes...</p>
        </div>
      ) : filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {filteredQuizzes.map(quiz => (
            <QuizCard
              key={quiz._id}
              quiz={quiz}
              onStart={handleStartQuiz}
              onViewResults={handleViewResults}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="material-symbols-outlined text-5xl sm:text-6xl text-gray-300 dark:text-gray-600">quiz</span>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mt-3 sm:mt-4 mb-2">No quizzes found</h3>
          <p className="text-sm text-gray-500">
            {quizzes.length === 0 ? "No quizzes published for this course yet" : "Try a different filter"}
          </p>
        </div>
      )}

      {/* Quiz Player Modal */}
      {activeQuiz && activeAttempt && activeQuestions.length > 0 && (
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