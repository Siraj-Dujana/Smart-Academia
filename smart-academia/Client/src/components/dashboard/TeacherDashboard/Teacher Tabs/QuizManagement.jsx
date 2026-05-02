import React, { useState, useEffect } from "react";
import AIQuizGenerator from "./AIQuizGenerator";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Color palette (matches TeacherAnalytics) ─────────────────
const C = {
  bg: "#070d1a", surface: "#0f1629", surface2: "#0a0f1e",
  border: "#1e293b", border2: "#334155",
  accent: "#6366f1", accent2: "#a855f7", amber: "#f59e0b",
  green: "#22c55e", red: "#ef4444", cyan: "#14b8a6",
  text: "#f1f5f9", textDim: "#94a3b8", textFaint: "#64748b",
  indigoLight: "#818cf8", greenLight: "#4ade80",
  amberLight: "#fbbf24", redLight: "#f87171", purpleLight: "#c084fc",
};

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ icon, title, color = C.accent }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
      <span className="material-symbols-outlined text-sm" style={{ color }}>{icon}</span>
    </div>
    <h3 className="text-xs font-bold text-white tracking-wide uppercase">{title}</h3>
    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}44, transparent)` }} />
  </div>
);

// ── Loading Spinner ───────────────────────────────────────────
const Spinner = ({ size = "md" }) => {
  const dim = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-16 h-16" : "w-12 h-12";
  return (
    <div className={`relative ${dim} mx-auto`}>
      <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: C.border }} />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
      <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
    </div>
  );
};

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
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showQForm, setShowQForm] = useState(false);
  const [showAIGen, setShowAIGen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [quizForm, setQuizForm] = useState({
    title: "", timeLimit: 30, passingScore: 70,
    maxAttempts: 3, shuffleQuestions: true, isPublished: false,
  });

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
      const res = await apiFetch("/api/courses/my-courses");
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
      const res = await apiFetch(`/api/quizzes?courseId=${selectedCourse}`);
      const data = await res.json();
      if (res.ok) setQuizzes(data.quizzes || []);
      else setError(data.message);
    } catch { setError("Cannot connect to server"); }
    finally { setIsLoading(false); }
  };

  const fetchQuestions = async (quizId) => {
    try {
      const res = await apiFetch(`/api/quizzes/${quizId}/questions`);
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
      title: quiz.title,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      shuffleQuestions: quiz.shuffleQuestions,
      isPublished: quiz.isPublished,
    });
    setError("");
    setShowForm(true);
  };

  const handleSaveQuiz = async () => {
    if (!quizForm.title.trim()) { setError("Quiz title is required"); return; }
    setIsLoading(true); setError("");
    try {
      const url = editingQuiz ? `/api/quizzes/${editingQuiz._id}` : `/api/quizzes`;
      const method = editingQuiz ? "PUT" : "POST";
      const body = editingQuiz ? quizForm : { ...quizForm, course: selectedCourse };

      const res = await apiFetch(url, { method, body: JSON.stringify(body) });
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

  const handleAddQuestion = async () => {
    if (!questionForm.questionText.trim()) { setError("Question text is required"); return; }
    if (!questionForm.correctAnswer.trim()) { setError("Correct answer is required"); return; }

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
        : questionForm.questionType === "true_false" ? ["true", "false"] : [];

      const payload = {
        questionText: questionForm.questionText.trim(),
        questionType: questionForm.questionType,
        options: cleanOptions,
        correctAnswer: questionForm.correctAnswer.trim(),
        explanation: questionForm.explanation.trim(),
        points: questionForm.points,
      };

      const res = await apiFetch(`/api/quizzes/${selectedQuiz._id}/questions`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }

      setQuestions(prev => [...prev, data.question]);
      setSuccess("Question added!");
      setShowQForm(false);
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
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif", background: C.bg, minHeight: "100vh" }}>
      
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", border: `1px solid ${C.border}` }}>
        <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: C.accent }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: C.accent2 }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.accent }} />
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">SmartAcademia · Teacher Tools</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Quiz Management</h1>
            <p className="text-sm text-gray-400 mt-1">Create and manage quizzes for your courses</p>
          </div>
          <button
            onClick={handleCreateQuiz}
            disabled={!selectedCourse}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }}
          >
            <span className="material-symbols-outlined text-base">add</span>
            New Quiz
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: `${C.red}22`, border: `1px solid ${C.red}44` }}>
          <span className="material-symbols-outlined text-sm" style={{ color: C.redLight }}>error</span>
          <span className="text-sm flex-1" style={{ color: C.redLight }}>{error}</span>
          <button onClick={() => setError("")}><span className="material-symbols-outlined text-sm">close</span></button>
        </div>
      )}
      {success && (
        <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: `${C.green}22`, border: `1px solid ${C.green}44` }}>
          <span className="material-symbols-outlined text-sm" style={{ color: C.greenLight }}>check_circle</span>
          <span className="text-sm flex-1" style={{ color: C.greenLight }}>{success}</span>
        </div>
      )}

      {/* Course selector */}
      <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <SectionHeader icon="school" title="Select Course" color={C.accent} />
        {courses.length === 0 ? (
          <p className="text-sm" style={{ color: C.textFaint }}>No courses found. Create a course first.</p>
        ) : (
          <select
            value={selectedCourse}
            onChange={e => { setSelectedCourse(e.target.value); setSelectedQuiz(null); setQuestions([]); }}
            className="w-full sm:w-96 px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
            style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border}
          >
            {courses.map(c => <option key={c._id} value={c._id}>{c.title} ({c.code})</option>)}
          </select>
        )}
      </div>

      {/* Quizzes list */}
      {isLoading ? (
        <div className="text-center py-16"><Spinner /></div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <span className="material-symbols-outlined text-6xl mb-4 block" style={{ color: C.border2 }}>quiz</span>
          <p className="font-semibold text-white">No quizzes yet</p>
          <p className="text-sm mt-1" style={{ color: C.textDim }}>Create your first quiz to get started</p>
          <button
            onClick={handleCreateQuiz}
            className="mt-4 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }}
          >
            Create Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map(quiz => (
            <div
              key={quiz._id}
              onClick={() => setSelectedQuiz(quiz)}
              className={`rounded-2xl p-5 cursor-pointer transition-all hover:scale-105 ${
                selectedQuiz?._id === quiz._id
                  ? "shadow-lg"
                  : "opacity-80 hover:opacity-100"
              }`}
              style={{
                background: selectedQuiz?._id === quiz._id ? `linear-gradient(135deg, ${C.accent}22, ${C.accent2}22)` : C.surface,
                border: `2px solid ${selectedQuiz?._id === quiz._id ? C.accent : C.border}`,
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-bold text-white text-base">{quiz.title}</h3>
                <button
                  onClick={e => { e.stopPropagation(); handleTogglePublish(quiz); }}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    quiz.isPublished
                      ? "text-green-400 bg-green-400/20 border border-green-500/30"
                      : "text-gray-500 bg-gray-700 border border-gray-600"
                  }`}
                >
                  {quiz.isPublished ? "Published" : "Draft"}
                </button>
              </div>
              <div className="flex flex-wrap gap-3 text-xs mb-3" style={{ color: C.textFaint }}>
                <span>{quiz.timeLimit} min</span>
                <span>Pass: {quiz.passingScore}%</span>
                <span>Max: {quiz.maxAttempts} attempts</span>
              </div>
              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => handleEditQuiz(quiz)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                  style={{ background: `${C.accent}22`, color: C.indigoLight, border: `1px solid ${C.accent}44` }}
                >
                  <span className="material-symbols-outlined text-sm">edit</span> Edit
                </button>
                <button
                  onClick={() => handleDeleteQuiz(quiz)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                  style={{ background: `${C.red}22`, color: C.redLight, border: `1px solid ${C.red}44` }}
                >
                  <span className="material-symbols-outlined text-sm">delete</span> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Questions Panel */}
      {selectedQuiz && (
        <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 border-b" style={{ background: C.surface2, borderColor: C.border }}>
            <h3 className="font-bold text-white">
              Questions — {selectedQuiz.title} ({questions.length})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAIGen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                style={{ background: `${C.accent2}22`, color: C.purpleLight, border: `1px solid ${C.accent2}44` }}
              >
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                AI Generate
              </button>
              <button
                onClick={() => { setShowQForm(true); setError(""); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }}
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Question
              </button>
            </div>
          </div>

          {/* Add Question Form */}
          {showQForm && (
            <div className="p-5 border-b" style={{ background: `${C.accent}22`, borderColor: C.border }}>
              <h4 className="font-bold text-white text-sm mb-4">New Question</h4>
              <div className="space-y-4">
                <textarea
                  value={questionForm.questionText}
                  onChange={e => setQuestionForm(p => ({ ...p, questionText: e.target.value }))}
                  placeholder="Question text..."
                  rows={2}
                  className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all resize-none"
                  style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                  onFocus={e => e.target.style.borderColor = C.accent}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Type</label>
                    <select
                      value={questionForm.questionType}
                      onChange={e => setQuestionForm(p => ({ ...p, questionType: e.target.value, correctAnswer: "", options: ["", "", "", ""] }))}
                      className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                      style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                    >
                      <option value="mcq">Multiple Choice</option>
                      <option value="true_false">True / False</option>
                      <option value="short_answer">Short Answer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Points</label>
                    <input
                      type="number"
                      value={questionForm.points}
                      min={1}
                      onChange={e => setQuestionForm(p => ({ ...p, points: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                      style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                    />
                  </div>
                </div>

                {/* MCQ Options */}
                {questionForm.questionType === "mcq" && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Options</label>
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
                        className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                        style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                      />
                    ))}
                  </div>
                )}

                {/* Correct Answer */}
                {questionForm.questionType === "true_false" ? (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Correct Answer</label>
                    <select
                      value={questionForm.correctAnswer}
                      onChange={e => setQuestionForm(p => ({ ...p, correctAnswer: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                      style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                    >
                      <option value="">Select correct answer</option>
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Correct Answer</label>
                    <input
                      value={questionForm.correctAnswer}
                      placeholder="Expected answer"
                      onChange={e => setQuestionForm(p => ({ ...p, correctAnswer: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                      style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                    />
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Explanation (optional)</label>
                  <input
                    value={questionForm.explanation}
                    placeholder="Explain why this answer is correct..."
                    onChange={e => setQuestionForm(p => ({ ...p, explanation: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                    style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setShowQForm(false); setError(""); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
                    style={{ background: C.surface2, color: C.textDim, border: `1px solid ${C.border}` }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddQuestion}
                    disabled={isLoading}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="relative w-4 h-4">
                          <div className="absolute inset-0 rounded-full border-2 border-white/30" />
                          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                        </div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      "Add Question"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Questions List */}
          <div className="divide-y max-h-96 overflow-y-auto" style={{ borderColor: C.border }}>
            {questions.length === 0 ? (
              <div className="text-center py-12" style={{ color: C.textDim }}>
                <span className="material-symbols-outlined text-5xl mb-2 block">question_mark</span>
                No questions yet. Add questions manually or use AI Generate.
              </div>
            ) : (
              questions.map((q, i) => (
                <div key={q._id} className="p-4 flex items-start gap-3 hover:bg-white/5 transition-colors">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${C.accent}22`, color: C.accent, border: `1px solid ${C.accent}44` }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{q.questionText}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.greenLight }}>✓ {q.correctAnswer}</p>
                    {q.options?.length > 0 && (
                      <p className="text-xs mt-0.5" style={{ color: C.textFaint }}>{q.options.join(" · ")}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(q._id)}
                    className="flex-shrink-0 p-1 rounded transition-all hover:scale-110"
                    style={{ color: C.textFaint }}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}>
          <div className="rounded-2xl w-full max-w-md overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <div className="px-6 py-4 border-b" style={{ background: C.surface2, borderColor: C.border }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44` }}>
                    <span className="material-symbols-outlined text-base" style={{ color: C.accent }}>quiz</span>
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                    {editingQuiz ? "Edit Quiz" : "New Quiz"}
                  </h3>
                </div>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg transition-all hover:bg-white/10" style={{ color: C.textFaint }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Quiz Title *</label>
                <input
                  value={quizForm.title}
                  onChange={e => setQuizForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Chapter 1 Quiz"
                  className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                  style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                  onFocus={e => e.target.style.borderColor = C.accent}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Time Limit (min)</label>
                  <input
                    type="number" min={5}
                    value={quizForm.timeLimit}
                    onChange={e => setQuizForm(p => ({ ...p, timeLimit: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                    style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Passing Score (%)</label>
                  <input
                    type="number" min={0} max={100}
                    value={quizForm.passingScore}
                    onChange={e => setQuizForm(p => ({ ...p, passingScore: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                    style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Max Attempts</label>
                  <input
                    type="number" min={1} max={10}
                    value={quizForm.maxAttempts}
                    onChange={e => setQuizForm(p => ({ ...p, maxAttempts: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                    style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quizForm.shuffleQuestions}
                    onChange={e => setQuizForm(p => ({ ...p, shuffleQuestions: e.target.checked }))}
                    className="rounded w-4 h-4"
                    style={{ accentColor: C.accent }}
                  />
                  <span className="text-sm" style={{ color: C.text }}>Shuffle questions</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quizForm.isPublished}
                    onChange={e => setQuizForm(p => ({ ...p, isPublished: e.target.checked }))}
                    className="rounded w-4 h-4"
                    style={{ accentColor: C.accent }}
                  />
                  <span className="text-sm" style={{ color: C.text }}>Publish immediately</span>
                </label>
              </div>
              {error && (
                <div className="p-3 rounded-xl text-sm" style={{ background: `${C.red}22`, color: C.redLight, border: `1px solid ${C.red}44` }}>
                  {error}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105" style={{ background: C.surface2, color: C.textDim, border: `1px solid ${C.border}` }}>
                  Cancel
                </button>
                <button onClick={handleSaveQuiz} disabled={isLoading} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }}>
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="relative w-4 h-4">
                        <div className="absolute inset-0 rounded-full border-2 border-white/30" />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                      </div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    editingQuiz ? "Update" : "Create"
                  )}
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