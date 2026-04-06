import React, { useState, useEffect, useCallback } from "react";
import AIQuizGenerator from "./AIQuizGenerator"; // Fixed import

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const QuizManagement = () => {
  const token = localStorage.getItem("token");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const [quizForm, setQuizForm] = useState({
    title: "", description: "", timeLimit: 30,
    maxAttempts: 3, passingScore: 70,
    difficulty: "Beginner", questionsPerAttempt: 10,
  });

  const [questionForm, setQuestionForm] = useState({
    text: "", type: "multiple-choice", explanation: "", points: 10, difficulty: "easy",
    options: [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/courses/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCourses(data.courses);
        if (data.courses.length > 0) setSelectedCourse(data.courses[0]._id);
      }
    } catch { 
      setApiError("Cannot connect to server"); 
    }
  }, [token]); // ✅ Added token as dependency

  const fetchQuizzes = useCallback(async () => {
    if (!selectedCourse) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/quizzes/course/${selectedCourse}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setQuizzes(data.quizzes);
    } catch { 
      setApiError("Cannot connect to server"); 
    } finally { 
      setIsLoading(false); 
    }
  }, [selectedCourse, token]); // ✅ Added token as dependency

  useEffect(() => { 
    fetchCourses(); 
  }, [fetchCourses]);

  useEffect(() => { 
    if (selectedCourse) fetchQuizzes(); 
  }, [selectedCourse, fetchQuizzes]);

  const fetchQuizQuestions = async (quiz) => {
    try {
      const res = await fetch(`${API}/api/quizzes/${quiz._id}/manage`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) { 
        setActiveQuiz(quiz); 
        setQuestions(data.questions); 
      }
    } catch { 
      setApiError("Cannot connect to server"); 
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    setApiError(""); 
    setIsSubmitting(true);
    try {
      const url = editingQuiz ? `${API}/api/quizzes/${editingQuiz._id}` : `${API}/api/quizzes`;
      const method = editingQuiz ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...quizForm, courseId: selectedCourse }),
      });
      const data = await res.json();
      if (!res.ok) return setApiError(data.message);
      setApiSuccess(editingQuiz ? "Quiz updated!" : "Quiz created!");
      fetchQuizzes();
      setTimeout(() => { 
        setShowQuizModal(false); 
        setApiSuccess(""); 
      }, 1000);
    } catch { 
      setApiError("Cannot connect to server"); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!activeQuiz) return;
    setApiError(""); 
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/api/quizzes/${activeQuiz._id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(questionForm),
      });
      const data = await res.json();
      if (!res.ok) return setApiError(data.message);
      setApiSuccess("Question added!");
      setQuestions(prev => [...prev, data.question]);
      fetchQuizzes();
      setQuestionForm({
        text: "", type: "multiple-choice", explanation: "", points: 10, difficulty: "easy",
        options: [
          { text: "", isCorrect: true }, 
          { text: "", isCorrect: false },
          { text: "", isCorrect: false }, 
          { text: "", isCorrect: false },
        ],
      });
      setTimeout(() => setApiSuccess(""), 1500);
    } catch { 
      setApiError("Cannot connect to server"); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleTogglePublish = async (quiz) => {
    try {
      const res = await fetch(`${API}/api/quizzes/${quiz._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isPublished: !quiz.isPublished }),
      });
      if (res.ok) fetchQuizzes();
    } catch { 
      setApiError("Cannot connect to server"); 
    }
  };

  const handleDeleteQuiz = async (quiz) => {
    if (!window.confirm(`Delete "${quiz.title}"?`)) return;
    try {
      const res = await fetch(`${API}/api/quizzes/${quiz._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { 
        fetchQuizzes(); 
        if (activeQuiz?._id === quiz._id) setActiveQuiz(null); 
      }
    } catch { 
      setApiError("Cannot connect to server"); 
    }
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...questionForm.options];
    if (field === "isCorrect") {
      newOptions.forEach((o, i) => o.isCorrect = i === index);
    } else {
      newOptions[index][field] = value;
    }
    setQuestionForm(p => ({ ...p, options: newOptions }));
  };

  const openNewQuizModal = () => {
    setEditingQuiz(null);
    setQuizForm({ 
      title: "", description: "", timeLimit: 30, maxAttempts: 3, 
      passingScore: 70, difficulty: "Beginner", questionsPerAttempt: 10 
    });
    setApiError(""); 
    setApiSuccess("");
    setShowQuizModal(true);
  };

  const openEditQuizModal = (quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title, description: quiz.description,
      timeLimit: quiz.timeLimit, maxAttempts: quiz.maxAttempts,
      passingScore: quiz.passingScore, difficulty: quiz.difficulty,
      questionsPerAttempt: quiz.questionsPerAttempt,
    });
    setApiError(""); 
    setApiSuccess("");
    setShowQuizModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Quiz Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage quizzes for your courses
          </p>
        </div>
        <button 
          onClick={openNewQuizModal} 
          disabled={!selectedCourse}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          <span className="material-symbols-outlined text-base">add</span>
          New Quiz
        </button>
      </div>

      {/* Course selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Course
        </label>
        <select 
          value={selectedCourse} 
          onChange={e => setSelectedCourse(e.target.value)}
          className="w-full sm:w-72 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.title} ({c.code})</option>
          ))}
        </select>
      </div>

      {/* Main layout: quiz list + question panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quizzes ({quizzes.length})
          </h2>
          {isLoading ? (
            <div className="text-center py-8">
              <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">quiz</span>
              <p className="text-gray-500 mt-2">No quizzes yet. Create one!</p>
            </div>
          ) : (
            quizzes.map(quiz => (
              <div key={quiz._id}
                className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-4 cursor-pointer transition-all ${
                  activeQuiz?._id === quiz._id
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                }`}
                onClick={() => fetchQuizQuestions(quiz)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {quiz.totalQuestions} questions · {quiz.timeLimit} min · Max {quiz.maxAttempts} attempts
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button 
                      onClick={e => { e.stopPropagation(); handleTogglePublish(quiz); }}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        quiz.isPublished
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {quiz.isPublished ? "Published" : "Draft"}
                    </button>
                    <button 
                      onClick={e => { e.stopPropagation(); openEditQuizModal(quiz); }}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button 
                      onClick={e => { e.stopPropagation(); handleDeleteQuiz(quiz); }}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">signal_cellular_alt</span>
                    {quiz.difficulty}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">flag</span>
                    Pass: {quiz.passingScore}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Questions Panel */}
        <div>
          {activeQuiz ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Questions — {activeQuiz.title} ({questions.length})
                </h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setApiError(""); setApiSuccess(""); setShowQuestionModal(true); }}
                    className="flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    Add Question
                  </button>
                  <button 
                    onClick={() => setShowAIGenerator(true)}
                    className="flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">auto_awesome</span>
                    AI Generate
                  </button>
                </div>
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">help_outline</span>
                  <p className="text-gray-500 mt-2">No questions yet</p>
                  <button 
                    onClick={() => setShowQuestionModal(true)}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Add first question →
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {questions.map((q, index) => (
                    <div key={q._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center size-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            {q.text}
                          </p>
                          <div className="space-y-1">
                            {q.options.map((opt, i) => (
                              <div key={i} className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
                                opt.isCorrect
                                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}>
                                <span>{opt.isCorrect ? "✓" : "·"}</span>
                                <span>{opt.text}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-3 mt-2 text-xs text-gray-400">
                            <span>{q.points} pts</span>
                            <span>{q.difficulty}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed">
              <div className="text-center">
                <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">quiz</span>
                <p className="text-gray-500 text-sm mt-2">Select a quiz to manage questions</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingQuiz ? "Edit Quiz" : "Create Quiz"}
                </h2>
                <button onClick={() => setShowQuizModal(false)} className="text-gray-400 hover:text-gray-600">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              {apiError && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{apiError}</div>}
              {apiSuccess && <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">{apiSuccess}</div>}
              <form onSubmit={handleQuizSubmit} className="space-y-4">
                {/* Form fields remain the same */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quiz Title *</label>
                  <input 
                    type="text" 
                    value={quizForm.title} 
                    onChange={e => setQuizForm(p => ({ ...p, title: e.target.value }))}
                    required 
                    placeholder="e.g. Python Basics Quiz"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea 
                    value={quizForm.description} 
                    onChange={e => setQuizForm(p => ({ ...p, description: e.target.value }))}
                    rows={2} 
                    placeholder="Brief description..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Limit (min)</label>
                    <input 
                      type="number" 
                      value={quizForm.timeLimit} 
                      min={5} 
                      max={180}
                      onChange={e => setQuizForm(p => ({ ...p, timeLimit: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Attempts</label>
                    <select 
                      value={quizForm.maxAttempts} 
                      onChange={e => setQuizForm(p => ({ ...p, maxAttempts: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passing Score (%)</label>
                    <input 
                      type="number" 
                      value={quizForm.passingScore} 
                      min={0} 
                      max={100}
                      onChange={e => setQuizForm(p => ({ ...p, passingScore: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                    <select 
                      value={quizForm.difficulty} 
                      onChange={e => setQuizForm(p => ({ ...p, difficulty: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      {["Beginner","Intermediate","Advanced"].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowQuizModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg> 
                        Saving...
                      </>
                    ) : editingQuiz ? "Update Quiz" : "Create Quiz"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Question</h2>
                <button onClick={() => setShowQuestionModal(false)} className="text-gray-400 hover:text-gray-600">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              {apiError && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{apiError}</div>}
              {apiSuccess && <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">{apiSuccess}</div>}
              <form onSubmit={handleAddQuestion} className="space-y-4">
                {/* Question form fields remain the same */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question Text *</label>
                  <textarea 
                    value={questionForm.text} 
                    onChange={e => setQuestionForm(p => ({ ...p, text: e.target.value }))}
                    required 
                    rows={3} 
                    placeholder="Enter your question..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Points</label>
                    <input 
                      type="number" 
                      value={questionForm.points} 
                      min={1}
                      onChange={e => setQuestionForm(p => ({ ...p, points: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                    <select 
                      value={questionForm.difficulty} 
                      onChange={e => setQuestionForm(p => ({ ...p, difficulty: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      {["easy","medium","hard"].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Options — click the radio button to mark correct answer
                  </label>
                  <div className="space-y-2">
                    {questionForm.options.map((opt, index) => (
                      <div key={index} className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                        opt.isCorrect ? "border-green-400 bg-green-50 dark:bg-green-900/20" : "border-gray-200 dark:border-gray-600"
                      }`}>
                        <input 
                          type="radio" 
                          name="correctOption" 
                          checked={opt.isCorrect}
                          onChange={() => handleOptionChange(index, "isCorrect", true)}
                          className="text-green-600 flex-shrink-0"
                        />
                        <input 
                          type="text" 
                          value={opt.text}
                          onChange={e => handleOptionChange(index, "text", e.target.value)}
                          placeholder={`Option ${index + 1}`} 
                          required
                          className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white border-none outline-none placeholder-gray-400"
                        />
                        {opt.isCorrect && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium flex-shrink-0">✓ Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Explanation (shown after attempt)
                  </label>
                  <textarea 
                    value={questionForm.explanation}
                    onChange={e => setQuestionForm(p => ({ ...p, explanation: e.target.value }))}
                    rows={2} 
                    placeholder="Why is this the correct answer?"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowQuestionModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg> 
                        Adding...
                      </>
                    ) : "Add Question"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* AI Quiz Generator Modal */}
      {showAIGenerator && activeQuiz && (
        <AIQuizGenerator
          quiz={activeQuiz}
          onQuestionsGenerated={(count) => {
            fetchQuizQuestions(activeQuiz);
            fetchQuizzes();
          }}
          onClose={() => setShowAIGenerator(false)}
        />
      )}
    </div>
  );
};

export default QuizManagement;