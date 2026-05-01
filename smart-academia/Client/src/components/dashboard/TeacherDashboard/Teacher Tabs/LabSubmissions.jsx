import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ icon, title, color = "#6366f1" }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
      <span className="material-symbols-outlined text-sm" style={{ color }}>{icon}</span>
    </div>
    <h3 className="text-xs font-bold text-white tracking-wide uppercase">{title}</h3>
    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}44, transparent)` }} />
  </div>
);

// ── Mini Bar ──────────────────────────────────────────────────
const MiniBar = ({ value = 0, color = "#6366f1", height = 6 }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height, background: "#1e293b" }}>
    <div
      className="h-full rounded-full"
      style={{
        width: `${Math.min(Math.max(value, 0), 100)}%`,
        background: `linear-gradient(90deg, ${color}cc, ${color})`,
        boxShadow: `0 0 8px ${color}66`,
        transition: "width 1s cubic-bezier(.4,0,.2,1)"
      }}
    />
  </div>
);

// ── Progress Stat Card ─────────────────────────────────────────
const ProgressStatCard = ({ icon, label, value, total, color, isLoading }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <div className="relative rounded-2xl overflow-hidden p-5 flex flex-col gap-3 group" style={{ background: "#0f1629", border: `1px solid ${color}33` }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}15 0%, transparent 70%)` }} />
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
          <span className="material-symbols-outlined text-xl" style={{ color }}>{icon}</span>
        </div>
        <span className="text-xs font-bold" style={{ color }}>{percentage}%</span>
      </div>
      <div>
        {isLoading ? (
          <div className="h-9 w-16 bg-gray-800 rounded-lg animate-pulse" />
        ) : (
          <>
            <p className="text-3xl font-black text-white tracking-tight" style={{ textShadow: `0 0 20px ${color}66` }}>
              {value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              <span className="text-gray-400">out of</span> {total}
            </p>
          </>
        )}
        <p className="text-xs text-gray-400 font-medium mt-1">{label}</p>
      </div>
      <MiniBar value={percentage} color={color} />
    </div>
  );
};

// ── Loading Spinner ───────────────────────────────────────────
const LoadingSpinner = ({ size = "md" }) => {
  const dimensions = size === "sm" ? "w-10 h-10" : size === "lg" ? "w-16 h-16" : "w-12 h-12";
  return (
    <div className={`relative ${dimensions} mx-auto`}>
      <div className="absolute inset-0 rounded-full border-4 border-indigo-900" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
      <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
    </div>
  );
};

const LabSubmissions = () => {
  const token = localStorage.getItem("token");

  const [courses,           setCourses]           = useState([]);
  const [selectedCourse,    setSelectedCourse]    = useState("");
  const [lessons,           setLessons]           = useState([]);
  const [selectedLesson,    setSelectedLesson]    = useState("");
  const [selectedLab,       setSelectedLab]       = useState(null);
  const [submissions,       setSubmissions]       = useState([]);
  const [isLoading,         setIsLoading]         = useState(false);
  const [error,             setError]             = useState("");
  const [success,           setSuccess]           = useState("");
  const [gradingId,         setGradingId]         = useState(null);
  const [gradeForm,         setGradeForm]         = useState({ marks: "", feedback: "" });
  const [selectedSub,       setSelectedSub]       = useState(null);
  const [showPDFModal,      setShowPDFModal]      = useState(false);
  const [aiEvaluating,      setAiEvaluating]      = useState(null);
  const [aiEvaluation,      setAiEvaluation]      = useState(null);
  const [filter,            setFilter]            = useState("all");
  const [searchTerm,        setSearchTerm]        = useState("");
  const [grading, setGrading] = useState(false);

  // Target values for progress bars
  const MAX_TOTAL_TARGET = 100;
  const MAX_GRADED_TARGET = 100;
  const MAX_PENDING_TARGET = 100;

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) { setSelectedLesson(""); setSelectedLab(null); setSubmissions([]); fetchLessons(); } }, [selectedCourse]);
  useEffect(() => { if (selectedLesson) { setSelectedLab(null); setSubmissions([]); fetchLab(); } }, [selectedLesson]);
  useEffect(() => { if (selectedLab) fetchSubmissions(); }, [selectedLab]);

  const apiFetch = (url, opts = {}) =>
    fetch(`${API}${url}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) } });

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

  const fetchLessons = async () => {
    if (!selectedCourse) return;
    setIsLoading(true);
    try {
      const res  = await apiFetch(`/api/courses/${selectedCourse}/lessons/teacher`);
      const data = await res.json();
      if (res.ok) {
        setLessons(data.lessons || []);
        if (data.lessons?.length > 0) setSelectedLesson(data.lessons[0]._id);
        else { setSelectedLesson(""); setSelectedLab(null); setSubmissions([]); }
      }
    } catch { setError("Cannot connect to server"); }
    finally { setIsLoading(false); }
  };

  const fetchLab = async () => {
    if (!selectedLesson) return;
    setSelectedLab(null); setSubmissions([]);
    try {
      const res  = await apiFetch(`/api/courses/${selectedCourse}/lessons/${selectedLesson}/lab`);
      const data = await res.json();
      if (res.ok && data.lab) setSelectedLab(data.lab);
    } catch { setError("Cannot connect to server"); }
  };

  const fetchSubmissions = async () => {
    if (!selectedLab) return;
    setIsLoading(true);
    try {
      const res  = await apiFetch(`/api/courses/${selectedCourse}/lessons/${selectedLesson}/lab/${selectedLab._id}/submissions`);
      const data = await res.json();
      if (res.ok) setSubmissions(data.submissions || []);
    } catch { setError("Cannot connect to server"); }
    finally { setIsLoading(false); }
  };

  const handleGrade = async (submissionId) => {
    if (gradeForm.marks === "" && gradeForm.marks !== 0) { setError("Please enter marks"); return; }
    const numMarks = Number(gradeForm.marks);
    if (isNaN(numMarks) || numMarks < 0) { setError("Marks must be a valid non-negative number"); return; }
    if (numMarks > (selectedLab.totalMarks || 100)) { setError(`Marks cannot exceed ${selectedLab.totalMarks || 100}`); return; }

    setError("");
    setGrading(true); 
    try {
      const res  = await apiFetch(
        `/api/courses/${selectedCourse}/lessons/${selectedLesson}/lab/${selectedLab._id}/submissions/${submissionId}/grade`,
        { method: "PUT", body: JSON.stringify(gradeForm) }
      );
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setSuccess("Grade saved successfully!");
      setGradingId(null);
      setAiEvaluation(null);
      fetchSubmissions();
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("Cannot connect to server"); }
    finally { setGrading(false); }
  };

  const handleAiEvaluate = async (submissionId) => {
    setAiEvaluating(submissionId); setAiEvaluation(null); setError("");
    try {
      const res  = await apiFetch(
        `/api/courses/${selectedCourse}/lessons/${selectedLesson}/lab/${selectedLab._id}/submissions/${submissionId}/ai-evaluate`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setAiEvaluation({ submissionId, ...data.evaluation });
      setGradeForm(p => ({
        marks:    data.evaluation.score ?? p.marks,
        feedback: data.evaluation.feedback ?? p.feedback,
      }));
      setGradingId(submissionId);
    } catch { setError("Cannot connect to server"); }
    finally { setAiEvaluating(null); }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "graded":    return { bg: "#22c55e22", color: "#4ade80", border: "#22c55e44", label: "Graded" };
      case "submitted": return { bg: "#f59e0b22", color: "#fbbf24", border: "#f59e0b44", label: "Pending" };
      default:          return { bg: "#1e293b", color: "#94a3b8", border: "#334155", label: status };
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    const matchFilter =
      filter === "all" ||
      (filter === "submitted" && s.status !== "graded") ||
      (filter === "graded" && s.status === "graded");
    const matchSearch = !searchTerm || s.student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student?.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    total:    submissions.length,
    graded:   submissions.filter(s => s.status === "graded").length,
    pending:  submissions.filter(s => s.status !== "graded").length,
    avgScore: submissions.filter(s => s.marks !== null && s.marks !== undefined).length > 0
      ? Math.round(submissions.filter(s => s.marks !== null && s.marks !== undefined).reduce((a, s) => a + s.marks, 0) /
          submissions.filter(s => s.marks !== null && s.marks !== undefined).length)
      : null,
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Lexend', sans-serif" }}>
      
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden p-6" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", border: "1px solid #1e293b" }}>
        <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "#6366f1" }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: "#a855f7" }} />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#6366f1" }} />
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Teacher · Lab Grading</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
            Grade Lab Submissions
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Review and grade student lab submissions
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#ef444422", border: "1px solid #ef444444" }}>
          <span className="material-symbols-outlined text-sm text-red-400">error</span>
          <p className="text-sm text-red-400 flex-1">{error}</p>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-300">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}
      {success && (
        <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#22c55e22", border: "1px solid #22c55e44" }}>
          <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
          <p className="text-sm text-emerald-400 flex-1">{success}</p>
        </div>
      )}

      {/* Selectors Card */}
      <div className="rounded-2xl p-5" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
        <SectionHeader icon="filter_alt" title="Select Course & Lesson" color="#6366f1" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Course</label>
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all cursor-pointer"
            >
              {courses.length === 0
                ? <option value="">No courses found</option>
                : courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)
              }
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Lesson</label>
            <select
              value={selectedLesson}
              onChange={e => setSelectedLesson(e.target.value)}
              disabled={lessons.length === 0}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {lessons.length === 0
                ? <option value="">No lessons available</option>
                : lessons.map(l => <option key={l._id} value={l._id}>{l.order}. {l.title}</option>)
              }
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {selectedLab && submissions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ProgressStatCard 
            icon="assignment" 
            label="Total Submissions" 
            value={stats.total} 
            total={MAX_TOTAL_TARGET}
            color="#6366f1"
            isLoading={isLoading}
          />
          <ProgressStatCard 
            icon="verified" 
            label="Graded" 
            value={stats.graded} 
            total={MAX_GRADED_TARGET}
            color="#22c55e"
            isLoading={isLoading}
          />
          <ProgressStatCard 
            icon="pending" 
            label="Pending" 
            value={stats.pending} 
            total={MAX_PENDING_TARGET}
            color="#f59e0b"
            isLoading={isLoading}
          />
          <div className="relative rounded-2xl overflow-hidden p-5 flex flex-col gap-3 group" style={{ background: "#0f1629", border: "1px solid #a855f733" }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(ellipse at 50% 0%, #a855f715 0%, transparent 70%)" }} />
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#a855f722", border: "1px solid #a855f744" }}>
                <span className="material-symbols-outlined text-xl" style={{ color: "#a855f7" }}>analytics</span>
              </div>
            </div>
            <div>
              {isLoading ? (
                <div className="h-9 w-16 bg-gray-800 rounded-lg animate-pulse" />
              ) : (
                <>
                  <p className="text-3xl font-black text-white tracking-tight" style={{ textShadow: "0 0 20px #a855f766" }}>
                    {stats.avgScore !== null ? `${stats.avgScore}/${selectedLab.totalMarks}` : "—"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <span className="text-gray-400">avg score</span>
                  </p>
                </>
              )}
              <p className="text-xs text-gray-400 font-medium mt-1">Average Score</p>
            </div>
            <MiniBar value={stats.avgScore !== null ? (stats.avgScore / (selectedLab.totalMarks || 100)) * 100 : 0} color="#a855f7" />
          </div>
        </div>
      )}

      {/* No lab message */}
      {selectedLesson && !selectedLab && !isLoading && (
        <div className="text-center py-16 rounded-2xl" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
          <span className="material-symbols-outlined text-5xl text-gray-700 mb-3 block">science</span>
          <p className="text-sm text-gray-500">No lab created for this lesson yet.</p>
        </div>
      )}

      {/* Submissions panel */}
      {selectedLab && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
          {/* Lab header */}
          <div className="px-5 py-4 border-b" style={{ background: "#0a0f1e", borderColor: "#1e293b" }}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">{selectedLab.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedLab.labType} · {selectedLab.difficulty} · {selectedLab.totalMarks} pts
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          {submissions.length > 0 && (
            <div className="px-5 py-3 border-b flex flex-col sm:flex-row gap-3" style={{ borderColor: "#1e293b" }}>
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">search</span>
                <input
                  type="text"
                  placeholder="Search by student name or ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="flex gap-1.5">
                {[
                  { key: "all", label: "All", count: stats.total, color: "#6366f1" },
                  { key: "submitted", label: "Pending", count: stats.pending, color: "#f59e0b" },
                  { key: "graded", label: "Graded", count: stats.graded, color: "#22c55e" },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 ${
                      filter === f.key
                        ? "text-white"
                        : "text-gray-500"
                    }`}
                    style={filter === f.key
                      ? { background: `linear-gradient(135deg, ${f.color}, ${f.color}cc)` }
                      : { background: "#1e293b", border: "1px solid #334155" }
                    }
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="text-center py-16">
              <LoadingSpinner />
              <p className="text-gray-500 mt-3 text-sm">Loading submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-gray-700 mb-3 block">inbox</span>
              <p className="text-sm text-gray-500">
                {submissions.length === 0 ? "No submissions yet" : "No submissions match your filter"}
              </p>
            </div>
          ) : (
            <div className="divide-y max-h-[700px] overflow-y-auto" style={{ borderColor: "#1e293b" }}>
              {filteredSubmissions.map(sub => {
                const statusStyle = getStatusColor(sub.status);
                return (
                  <div key={sub._id} className="p-5 hover:bg-white/5 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Student info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)", color: "white" }}>
                            {sub.student?.fullName?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white text-sm truncate">
                              {sub.student?.fullName || "Unknown Student"}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              <p className="text-xs text-gray-500">ID: {sub.student?.studentId || "N/A"}</p>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold`}
                                style={{ background: statusStyle.bg, border: `1px solid ${statusStyle.border}`, color: statusStyle.color }}>
                                {statusStyle.label}
                              </span>
                              {sub.marks !== null && sub.marks !== undefined && (
                                <span className="text-xs font-bold text-indigo-400">
                                  {sub.marks} / {selectedLab.totalMarks} pts
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              Submitted {new Date(sub.submittedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Submitted answer preview */}
                        {sub.answer && (
                          <div className="mt-2 p-3 rounded-xl max-h-32 overflow-y-auto" style={{ background: selectedLab.labType === "programming" ? "#1e293b" : "#0a0f1e", border: "1px solid #334155" }}>
                            <p className={`text-xs ${selectedLab.labType === "programming" ? "font-mono text-green-400" : "text-gray-400"} whitespace-pre-wrap`}>
                              {sub.answer.length > 500 ? sub.answer.slice(0, 500) + "..." : sub.answer}
                            </p>
                          </div>
                        )}

                        {/* PDF link */}
                        {sub.pdfUrl && (
                          <button
                            onClick={() => { setSelectedSub(sub); setShowPDFModal(true); }}
                            className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                            style={{ background: "#6366f122", color: "#818cf8", border: "1px solid #6366f144" }}
                          >
                            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                            View submitted PDF
                          </button>
                        )}

                        {/* Existing feedback */}
                        {sub.feedback && (
                          <div className="mt-2 p-3 rounded-xl" style={{ background: "#3b82f622", border: "1px solid #3b82f644" }}>
                            <p className="text-[10px] font-semibold text-blue-400 mb-0.5">Feedback</p>
                            <p className="text-xs text-gray-300">{sub.feedback}</p>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0 self-start">
                        <button
                          onClick={() => handleAiEvaluate(sub._id)}
                          disabled={!!aiEvaluating}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 disabled:opacity-50"
                          style={{ background: "#a855f722", color: "#c084fc", border: "1px solid #a855f744" }}
                        >
                          {aiEvaluating === sub._id ? (
                            <><div className="relative w-3 h-3"><div className="absolute inset-0 rounded-full border-2 border-indigo-900" /><div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" /></div>Evaluating...</>
                          ) : (
                            <><span className="material-symbols-outlined text-sm">auto_awesome</span>AI Evaluate</>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setGradingId(sub._id);
                            setAiEvaluation(null);
                            setGradeForm({
                              marks:    sub.marks ?? "",
                              feedback: sub.feedback || "",
                            });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:scale-105"
                          style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
                        >
                          <span className="material-symbols-outlined text-sm">grade</span>
                          {sub.marks !== null && sub.marks !== undefined ? "Re-grade" : "Grade"}
                        </button>
                      </div>
                    </div>

                    {/* AI Evaluation panel */}
                    {aiEvaluation?.submissionId === sub._id && (
                      <div className="mt-3 p-4 rounded-xl" style={{ background: "#a855f722", border: "1px solid #a855f744" }}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="material-symbols-outlined text-purple-400 text-sm">auto_awesome</span>
                          <p className="text-sm font-bold text-purple-400">AI Evaluation</p>
                          <span className="ml-auto text-sm font-bold text-purple-400">
                            Suggested: {aiEvaluation.score} / {selectedLab.totalMarks} pts
                          </span>
                        </div>
                        {aiEvaluation.feedback && (
                          <p className="text-xs text-gray-300 mb-2 leading-relaxed">{aiEvaluation.feedback}</p>
                        )}
                        {aiEvaluation.mistakes?.length > 0 && (
                          <div className="mb-2">
                            <p className="text-[10px] font-semibold text-red-400 mb-1">Issues found</p>
                            {aiEvaluation.mistakes.map((m, i) => (
                              <p key={i} className="text-[10px] text-gray-400">• {m}</p>
                            ))}
                          </div>
                        )}
                        {aiEvaluation.suggestions?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold text-emerald-400 mb-1">Suggestions</p>
                            {aiEvaluation.suggestions.map((s, i) => (
                              <p key={i} className="text-[10px] text-gray-400">• {s}</p>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] text-gray-500 mt-2 italic">
                          AI evaluation is pre-filled below — review and adjust before saving.
                        </p>
                      </div>
                    )}

                    {/* Grade form */}
                    {gradingId === sub._id && (
                      <div className="mt-3 p-4 rounded-xl space-y-3" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
                        <p className="text-sm font-bold text-indigo-400">Grade Submission</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                              Marks (max {selectedLab.totalMarks})
                            </label>
                            <input
                              type="number"
                              value={gradeForm.marks}
                              onChange={e => setGradeForm(p => ({ ...p, marks: e.target.value }))}
                              min={0}
                              max={selectedLab.totalMarks}
                              className="w-full px-4 py-2 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            />
                          </div>
                          <div className="flex items-end">
                            {gradeForm.marks !== "" && (
                              <p className={`text-2xl font-bold ${(Number(gradeForm.marks) / selectedLab.totalMarks) >= 0.5 ? "text-emerald-400" : "text-amber-400"}`}>
                                {Math.round((Number(gradeForm.marks) / selectedLab.totalMarks) * 100)}%
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Feedback</label>
                          <textarea
                            value={gradeForm.feedback}
                            onChange={e => setGradeForm(p => ({ ...p, feedback: e.target.value }))}
                            rows={3}
                            placeholder="Provide constructive feedback for the student..."
                            className="w-full px-4 py-2 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleGrade(sub._id)}
                            disabled={grading}
                            className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
                          >
                            {grading ? (
                              <><div className="relative w-4 h-4"><div className="absolute inset-0 rounded-full border-2 border-green-900" /><div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" /></div>Saving...</>
                            ) : (
                              <><span className="material-symbols-outlined text-sm">save</span>Save Grade</>
                            )}
                          </button>
                          <button
                            onClick={() => { setGradingId(null); setAiEvaluation(null); }}
                            className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                            style={{ background: "#1e293b", color: "#94a3b8" }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Info Banner */}
      <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "#0a0f1e", border: "1px solid #1e293b" }}>
        <span className="material-symbols-outlined text-xs text-indigo-400 mt-0.5">info</span>
        <p className="text-[10px] text-gray-500 leading-relaxed">
          <strong className="text-indigo-400">Lab grading:</strong> Review student submissions, provide feedback, and assign marks. Use AI evaluation for suggested scores and feedback, then review and adjust before saving.
        </p>
      </div>

      {/* PDF Viewer Modal */}
      {showPDFModal && selectedSub && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPDFModal(false)}>
          <div className="rounded-2xl w-full flex flex-col overflow-hidden" style={{ maxWidth: "95vw", height: "90vh", background: "#0f1629", border: "1px solid #1e293b" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
              <div>
                <p className="text-sm font-bold text-white">Student Submission</p>
                <p className="text-xs text-indigo-200">{selectedSub.student?.fullName} · {selectedSub.student?.studentId}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedSub.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 bg-white hover:bg-indigo-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Download
                </a>
                <button onClick={() => setShowPDFModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1.5">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="flex-1" style={{ minHeight: 0, background: "#1a1a2e" }}>
              {selectedSub.pdfUrl ? (
                <iframe src={selectedSub.pdfUrl} className="w-full h-full" style={{ border: "none" }} title="PDF Viewer" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="material-symbols-outlined text-5xl text-gray-600 mb-3">broken_image</span>
                  <p className="text-gray-500 text-sm">PDF file not available</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-t flex-shrink-0" style={{ borderColor: "#1e293b" }}>
              <p className="text-xs text-gray-500">
                Submitted: {new Date(selectedSub.submittedAt).toLocaleString()}
              </p>
              <button
                onClick={() => setShowPDFModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default LabSubmissions;