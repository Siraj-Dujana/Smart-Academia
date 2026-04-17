import React, { useState, useEffect } from "react";
import AIQuizGenerator from "./AIQuizGenerator";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const apiFetch = (url, opts = {}) => {
  const token = localStorage.getItem("token");
  return fetch(`${API}${url}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
};

const QuizManagement = () => {
  const [courses,    setCourses]    = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [quizzes,    setQuizzes]    = useState([]);
  const [questions,  setQuestions]  = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [showQForm,  setShowQForm]  = useState(false);
  const [showAIGen,  setShowAIGen]  = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");

  // Quiz form state
  const [quizForm, setQuizForm] = useState({
    title: "", timeLimit: 30, passingScore: 70,
    maxAttempts: 3, shuffleQuestions: true, isPublished: false,
  });

  // ✅ FIXED: question form now matches what server expects
  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    questionType: "mcq",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    points: 1,
  });

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) fetchQuizzes(); }, [selectedCourse]);
  useEffect(() => { if (selectedQuiz) fetchQuestions(selectedQuiz._id); }, [selectedQuiz?._id]);

  const fetchCourses = async () => {
    try {
      const res  = await apiFetch("/api/courses/my-courses");
      const data = await res.json();
      if (res.ok && data.courses?.length > 0) {
        setCourses(data.courses);
        setSelectedCourse(data.courses[0]._id);
      }
    } catch { setError("Cannot connect to server"); }
  };

  const fetchQuizzes = async () => {
    if (!selectedCourse) return;
    setIsLoading(true);
    try {
      // ✅ FIXED: uses correct endpoint GET /api/quizzes?courseId=...
      const res  = await apiFetch(`/api/quizzes?courseId=${selectedCourse}`);
      const data = await res.json();
      if (res.ok) setQuizzes(data.quizzes || []);
      else setError(data.message);
    } catch { setError("Cannot connect to server"); }
    finally { setIsLoading(false); }
  };

  const fetchQuestions = async (quizId) => {
    try {
      const res  = await apiFetch(`/api/quizzes/${quizId}/questions`);
      const data = await res.json();
      if (res.ok) setQuestions(data.questions || []);
    } catch { setError("Cannot connect to server"); }
  };

  const handleCreateQuiz = () => {
    setEditingQuiz(null);
    setQuizForm({ title: "", timeLimit: 30, passingScore: 70, maxAttempts: 3, shuffleQuestions: true, isPublished: false });
    setError("");
    setShowForm(true);
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title:            quiz.title,
      timeLimit:        quiz.timeLimit,
      passingScore:     quiz.passingScore,
      maxAttempts:      quiz.maxAttempts,
      shuffleQuestions: quiz.shuffleQuestions,
      isPublished:      quiz.isPublished,
    });
    setError("");
    setShowForm(true);
  };

  const handleSaveQuiz = async () => {
    if (!quizForm.title.trim()) { setError("Quiz title is required"); return; }
    setIsLoading(true); setError("");
    try {
      const url    = editingQuiz ? `/api/quizzes/${editingQuiz._id}` : `/api/quizzes`;
      const method = editingQuiz ? "PUT" : "POST";
      const body   = editingQuiz
        ? quizForm
        : { ...quizForm, course: selectedCourse };

      const res  = await apiFetch(url, { method, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }

      setSuccess(editingQuiz ? "Quiz updated!" : "Quiz created!");
      setShowForm(false);
      fetchQuizzes();
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("Cannot connect to server"); }
    finally { setIsLoading(false); }
  };

  const handleDeleteQuiz = async (quiz) => {
    if (!window.confirm(`Delete "${quiz.title}"?`)) return;
    try {
      const res = await apiFetch(`/api/quizzes/${quiz._id}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedQuiz?._id === quiz._id) { setSelectedQuiz(null); setQuestions([]); }
        fetchQuizzes();
      } else {
        const data = await res.json();
        setError(data.message);
      }
    } catch { setError("Cannot connect to server"); }
  };

  const handleTogglePublish = async (quiz) => {
    try {
      const res = await apiFetch(`/api/quizzes/${quiz._id}`, {
        method: "PUT",
        body: JSON.stringify({ isPublished: !quiz.isPublished }),
      });
      if (res.ok) fetchQuizzes();
    } catch { setError("Cannot connect to server"); }
  };

  // ✅ FIXED: sends correct payload { questionText, questionType, options: string[], correctAnswer, explanation, points }
  const handleAddQuestion = async () => {
    if (!questionForm.questionText.trim()) { setError("Question text is required"); return; }
    if (!questionForm.correctAnswer.trim()) { setError("Correct answer is required"); return; }

    // Validate MCQ — correct answer must match one of the options
    if (questionForm.questionType === "mcq") {
      const cleanOptions = questionForm.options.map(o => o.trim()).filter(Boolean);
      if (cleanOptions.length < 2) { setError("Please add at least 2 options"); return; }
      if (!cleanOptions.includes(questionForm.correctAnswer.trim())) {
        setError("Correct answer must exactly match one of the options"); return;
      }
    }

    setIsLoading(true); setError("");
    try {
      const cleanOptions = questionForm.questionType === "mcq"
        ? questionForm.options.map(o => o.trim()).filter(Boolean)
        : questionForm.questionType === "true_false"
        ? ["true", "false"]
        : [];

      const payload = {
        questionText:  questionForm.questionText.trim(),
        questionType:  questionForm.questionType,
        options:       cleanOptions,
        correctAnswer: questionForm.correctAnswer.trim(),
        explanation:   questionForm.explanation.trim(),
        points:        questionForm.points,
      };

      const res  = await apiFetch(`/api/quizzes/${selectedQuiz._id}/questions`, {
        method: "POST",
        body:   JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }

      setQuestions(prev => [...prev, data.question]);
      setSuccess("Question added!");
      setShowQForm(false);
      // Reset form
      setQuestionForm({ questionText: "", questionType: "mcq", options: ["", "", "", ""], correctAnswer: "", explanation: "", points: 1 });
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("Cannot connect to server"); }
    finally { setIsLoading(false); }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await apiFetch(`/api/quizzes/${selectedQuiz._id}/questions/${questionId}`, { method: "DELETE" });
      setQuestions(prev => prev.filter(q => q._id !== questionId));
    } catch { setError("Cannot connect to server"); }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Quiz Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create and manage quizzes for your courses</p>
        </div>
        <button
          onClick={handleCreateQuiz}
          disabled={!selectedCourse}
          className="flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all hover:scale-105 w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-base">add</span>
          New Quiz
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">error</span>
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")}><span className="material-symbols-outlined text-sm">close</span></button>
        </div>
      )}
      {success && (
        <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 text-green-600 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          {success}
        </div>
      )}

      {/* Course selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Course</label>
        {courses.length === 0 ? (
          <p className="text-sm text-gray-500">No courses found. Create a course first.</p>
        ) : (
          <select
            value={selectedCourse}
            onChange={e => { setSelectedCourse(e.target.value); setSelectedQuiz(null); setQuestions([]); }}
            className="w-full sm:w-96 px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            {courses.map(c => <option key={c._id} value={c._id}>{c.title} ({c.code})</option>)}
          </select>
        )}
      </div>

      {/* Quizzes list */}
      {isLoading ? (
        <div className="text-center py-10">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">quiz</span>
          <p className="text-gray-500 mt-3 text-sm">No quizzes yet. Create your first quiz.</p>
          <button onClick={handleCreateQuiz} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            Create Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map(quiz => (
            <div
              key={quiz._id}
              onClick={() => setSelectedQuiz(quiz)}
              className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedQuiz?._id === quiz._id
                  ? "border-blue-500 shadow-md"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{quiz.title}</h3>
                <button
                  onClick={e => { e.stopPropagation(); handleTogglePublish(quiz); }}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                    quiz.isPublished
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {quiz.isPublished ? "Published" : "Draft"}
                </button>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                <span>{quiz.timeLimit} min</span>
                <span>Pass: {quiz.passingScore}%</span>
                <span>Max: {quiz.maxAttempts} attempts</span>
              </div>
              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => handleEditQuiz(quiz)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">edit</span> Edit
                </button>
                <button
                  onClick={() => handleDeleteQuiz(quiz)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">delete</span> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Questions Panel — shows when a quiz is selected */}
      {selectedQuiz && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
              Questions — {selectedQuiz.title} ({questions.length})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAIGen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                AI Generate
              </button>
              <button
                onClick={() => { setShowQForm(true); setError(""); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Question
              </button>
            </div>
          </div>

          {/* Add Question Form */}
          {showQForm && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/10">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-3">New Question</h4>
              <div className="space-y-3">
                <textarea
                  value={questionForm.questionText}
                  onChange={e => setQuestionForm(p => ({ ...p, questionText: e.target.value }))}
                  placeholder="Question text..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Type</label>
                    <select
                      value={questionForm.questionType}
                      onChange={e => setQuestionForm(p => ({ ...p, questionType: e.target.value, correctAnswer: "", options: ["", "", "", ""] }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="mcq">Multiple Choice</option>
                      <option value="true_false">True / False</option>
                      <option value="short_answer">Short Answer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Points</label>
                    <input
                      type="number"
                      value={questionForm.points}
                      min={1}
                      onChange={e => setQuestionForm(p => ({ ...p, points: Number(e.target.value) }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* MCQ Options */}
                {questionForm.questionType === "mcq" && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Options (the correct answer must match one exactly)</label>
                    {questionForm.options.map((opt, i) => (
                      <input
                        key={i}
                        value={opt}
                        placeholder={`Option ${i + 1}`}
                        onChange={e => {
                          const o = [...questionForm.options];
                          o[i] = e.target.value;
                          setQuestionForm(p => ({ ...p, options: o }));
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    ))}
                  </div>
                )}

                {/* Correct Answer */}
                {questionForm.questionType === "true_false" ? (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Correct Answer</label>
                    <select
                      value={questionForm.correctAnswer}
                      onChange={e => setQuestionForm(p => ({ ...p, correctAnswer: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select correct answer</option>
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Correct Answer {questionForm.questionType === "mcq" ? "(must exactly match an option above)" : ""}
                    </label>
                    <input
                      value={questionForm.correctAnswer}
                      placeholder={questionForm.questionType === "mcq" ? "Must exactly match one of the options" : "Expected answer"}
                      onChange={e => setQuestionForm(p => ({ ...p, correctAnswer: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Explanation (optional)</label>
                  <input
                    value={questionForm.explanation}
                    placeholder="Explain why this answer is correct..."
                    onChange={e => setQuestionForm(p => ({ ...p, explanation: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddQuestion}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? "Saving..." : "Add Question"}
                  </button>
                  <button
                    onClick={() => { setShowQForm(false); setError(""); }}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Questions List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No questions yet. Add questions manually or use AI Generate.
              </div>
            ) : (
              questions.map((q, i) => (
                <div key={q._id} className="p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{q.questionText}</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">✓ {q.correctAnswer}</p>
                    {q.options?.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">{q.options.join(" · ")}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(q._id)}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Quiz Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingQuiz ? "Edit Quiz" : "New Quiz"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quiz Title *</label>
                <input
                  value={quizForm.title}
                  onChange={e => setQuizForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Chapter 1 Quiz"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Limit (min)</label>
                  <input
                    type="number" min={5}
                    value={quizForm.timeLimit}
                    onChange={e => setQuizForm(p => ({ ...p, timeLimit: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passing Score (%)</label>
                  <input
                    type="number" min={0} max={100}
                    value={quizForm.passingScore}
                    onChange={e => setQuizForm(p => ({ ...p, passingScore: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Attempts</label>
                  <input
                    type="number" min={1} max={10}
                    value={quizForm.maxAttempts}
                    onChange={e => setQuizForm(p => ({ ...p, maxAttempts: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quizForm.shuffleQuestions}
                    onChange={e => setQuizForm(p => ({ ...p, shuffleQuestions: e.target.checked }))}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Shuffle questions</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quizForm.isPublished}
                    onChange={e => setQuizForm(p => ({ ...p, isPublished: e.target.checked }))}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Publish immediately</span>
                </label>
              </div>
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
              )}
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSaveQuiz} disabled={isLoading} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {isLoading ? "Saving..." : editingQuiz ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Quiz Generator Modal */}
      {showAIGen && selectedQuiz && (
        <AIQuizGenerator
          quiz={selectedQuiz}
          onQuestionsGenerated={(count) => {
            setSuccess(`${count} questions added by AI!`);
            fetchQuestions(selectedQuiz._id);
            setTimeout(() => setSuccess(""), 3000);
          }}
          onClose={() => setShowAIGen(false)}
        />
      )}
    </div>
  );
};

export default QuizManagement;