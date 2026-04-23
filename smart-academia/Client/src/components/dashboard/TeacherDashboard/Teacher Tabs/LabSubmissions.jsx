import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
  const [aiEvaluating,      setAiEvaluating]      = useState(null); // submissionId being AI-evaluated
  const [aiEvaluation,      setAiEvaluation]      = useState(null); // { score, mistakes, feedback, suggestions }
  const [filter,            setFilter]            = useState("all"); // all | submitted | graded
  const [searchTerm,        setSearchTerm]        = useState("");

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
      // Pre-fill the grade form with AI suggestion
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
      case "graded":    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "submitted": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:          return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
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
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Grade Lab Submissions
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Review and grade student lab submissions
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-500 text-sm">error</span>
          <p className="text-sm text-red-600 dark:text-red-400 flex-1">{error}</p>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}
      {success && (
        <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
          <p className="text-sm text-green-600 dark:text-green-400 flex-1">{success}</p>
        </div>
      )}

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course</label>
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            {courses.length === 0
              ? <option value="">No courses found</option>
              : courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)
            }
          </select>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lesson</label>
          <select
            value={selectedLesson}
            onChange={e => setSelectedLesson(e.target.value)}
            disabled={lessons.length === 0}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {lessons.length === 0
              ? <option value="">No lessons available</option>
              : lessons.map(l => <option key={l._id} value={l._id}>{l.order}. {l.title}</option>)
            }
          </select>
        </div>
      </div>

      {/* No lab message */}
      {selectedLesson && !selectedLab && !isLoading && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">science</span>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">No lab created for this lesson yet.</p>
        </div>
      )}

      {/* Submissions panel */}
      {selectedLab && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Lab header */}
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">{selectedLab.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedLab.labType} · {selectedLab.difficulty} · {selectedLab.totalMarks} pts
                </p>
              </div>
              {/* Stats row */}
              {submissions.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: "Total", value: stats.total, color: "text-gray-700 dark:text-gray-300" },
                    { label: "Graded", value: stats.graded, color: "text-green-700 dark:text-green-300" },
                    { label: "Pending", value: stats.pending, color: "text-amber-700 dark:text-amber-300" },
                    ...(stats.avgScore !== null ? [{ label: "Avg score", value: `${stats.avgScore}/${selectedLab.totalMarks}`, color: "text-indigo-700 dark:text-indigo-300" }] : []),
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] text-gray-500">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          {submissions.length > 0 && (
            <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                <input
                  type="text"
                  placeholder="Search by student name or ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-1.5">
                {[
                  { key: "all",       label: "All",     count: stats.total   },
                  { key: "submitted", label: "Pending", count: stats.pending },
                  { key: "graded",    label: "Graded",  count: stats.graded  },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filter === f.key
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <p className="text-gray-500 mt-2 text-sm">Loading submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">inbox</span>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                {submissions.length === 0 ? "No submissions yet" : "No submissions match your filter"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[700px] overflow-y-auto">
              {filteredSubmissions.map(sub => (
                <div key={sub._id} className="p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Student info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {sub.student?.fullName?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                            {sub.student?.fullName || "Unknown Student"}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <p className="text-xs text-gray-500">ID: {sub.student?.studentId || "N/A"}</p>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(sub.status)}`}>
                              {sub.status}
                            </span>
                            {sub.marks !== null && sub.marks !== undefined && (
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                {sub.marks} / {selectedLab.totalMarks} pts
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Submitted {new Date(sub.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Submitted answer preview */}
                      {sub.answer && (
                        <div className={`mt-2 p-3 rounded-lg border border-gray-200 dark:border-gray-600 max-h-32 overflow-y-auto ${
                          selectedLab.labType === "programming"
                            ? "bg-gray-900"
                            : "bg-gray-50 dark:bg-gray-700/30"
                        }`}>
                          <p className={`text-xs ${
                            selectedLab.labType === "programming"
                              ? "font-mono text-green-400"
                              : "text-gray-700 dark:text-gray-300"
                          } whitespace-pre-wrap`}>
                            {sub.answer.length > 500 ? sub.answer.slice(0, 500) + "..." : sub.answer}
                          </p>
                        </div>
                      )}

                      {/* PDF link */}
                      {sub.pdfUrl && (
                        <button
                          onClick={() => { setSelectedSub(sub); setShowPDFModal(true); }}
                          className="flex items-center gap-2 mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-700 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                          View submitted PDF
                        </button>
                      )}

                      {/* Existing feedback */}
                      {sub.feedback && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                          <p className="text-[10px] font-semibold text-blue-600 mb-0.5">Feedback</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300">{sub.feedback}</p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0 self-start">
                      <button
                        onClick={() => handleAiEvaluate(sub._id)}
                        disabled={!!aiEvaluating}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-700 transition-colors disabled:opacity-50"
                        title="Let AI evaluate this submission"
                      >
                        {aiEvaluating === sub._id ? (
                          <><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Evaluating...</>
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
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">grade</span>
                        {sub.marks !== null && sub.marks !== undefined ? "Re-grade" : "Grade"}
                      </button>
                    </div>
                  </div>

                  {/* AI Evaluation panel */}
                  {aiEvaluation?.submissionId === sub._id && (
                    <div className="mt-3 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-purple-600 text-sm">auto_awesome</span>
                        <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">AI Evaluation</p>
                        <span className="ml-auto text-sm font-bold text-purple-700 dark:text-purple-300">
                          Suggested: {aiEvaluation.score} / {selectedLab.totalMarks} pts
                        </span>
                      </div>
                      {aiEvaluation.feedback && (
                        <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">{aiEvaluation.feedback}</p>
                      )}
                      {aiEvaluation.mistakes?.length > 0 && (
                        <div className="mb-2">
                          <p className="text-[10px] font-semibold text-red-600 mb-1">Issues found</p>
                          {aiEvaluation.mistakes.map((m, i) => (
                            <p key={i} className="text-[10px] text-gray-600 dark:text-gray-400">• {m}</p>
                          ))}
                        </div>
                      )}
                      {aiEvaluation.suggestions?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-green-600 mb-1">Suggestions</p>
                          {aiEvaluation.suggestions.map((s, i) => (
                            <p key={i} className="text-[10px] text-gray-600 dark:text-gray-400">• {s}</p>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-gray-400 mt-2 italic">
                        AI evaluation is pre-filled in the grade form below — review and adjust before saving.
                      </p>
                    </div>
                  )}

                  {/* Grade form */}
                  {gradingId === sub._id && (
                    <div className="mt-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700 space-y-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Grade Submission</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Marks (max {selectedLab.totalMarks})
                          </label>
                          <input
                            type="number"
                            value={gradeForm.marks}
                            onChange={e => setGradeForm(p => ({ ...p, marks: e.target.value }))}
                            min={0}
                            max={selectedLab.totalMarks}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="flex items-end">
                          {gradeForm.marks !== "" && (
                            <p className={`text-2xl font-bold ${
                              (Number(gradeForm.marks) / selectedLab.totalMarks) >= 0.5
                                ? "text-green-600"
                                : "text-amber-600"
                            }`}>
                              {Math.round((Number(gradeForm.marks) / selectedLab.totalMarks) * 100)}%
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Feedback</label>
                        <textarea
                          value={gradeForm.feedback}
                          onChange={e => setGradeForm(p => ({ ...p, feedback: e.target.value }))}
                          rows={3}
                          placeholder="Provide constructive feedback for the student..."
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGrade(sub._id)}
                          className="flex-1 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">save</span>
                          Save Grade
                        </button>
                        <button
                          onClick={() => { setGradingId(null); setAiEvaluation(null); }}
                          className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PDF Viewer Modal */}
{/* PDF Viewer Modal */}
{showPDFModal && selectedSub && (
  <div
    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={() => setShowPDFModal(false)}
  >
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden"
      style={{ maxHeight: "95vh" }}
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white">Student Submission</h3>
          <p className="text-indigo-100 text-xs sm:text-sm">
            {selectedSub.student?.fullName} · {selectedSub.student?.studentId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={selectedSub.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-white hover:bg-indigo-50 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Download
          </a>
          <button onClick={() => setShowPDFModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      {/* ✅ PDF Viewer - token passed as query parameter */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-900" style={{ minHeight: "70vh" }}>
        {selectedSub.pdfUrl ? (
          <iframe
            src={`${API}/api/courses/${selectedCourse}/lessons/${selectedLesson}/lab/${selectedLab._id}/submissions/${selectedSub._id}/pdf?token=${encodeURIComponent(token)}`}
            className="w-full h-full"
            style={{ minHeight: "70vh", border: "none" }}
            title="PDF Viewer"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <span className="material-symbols-outlined text-5xl text-gray-400 mb-4">broken_image</span>
            <p className="text-gray-500 text-sm">PDF file not available</p>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <p className="text-xs text-gray-500">
          Submitted: {new Date(selectedSub.submittedAt).toLocaleString()}
        </p>
        <button
          onClick={() => setShowPDFModal(false)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default LabSubmissions;