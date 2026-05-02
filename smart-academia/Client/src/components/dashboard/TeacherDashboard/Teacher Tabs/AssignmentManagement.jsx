import React, { useState, useEffect } from "react";

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

// ── Loading Spinner ───────────────────────────────────────────
const Spinner = ({ size = "sm" }) => {
  const dim = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-5 h-5";
  return (
    <div className={`relative ${dim}`}>
      <div className="absolute inset-0 rounded-full border-2 border-indigo-300" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-600 animate-spin" />
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
      ...(opts.headers || {}) 
    } 
  });
};

const AssignmentManagement = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", instructions: "", dueDate: "", totalMarks: 100 });
  const [viewSubs, setViewSubs] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradingId, setGradingId] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marksAwarded: "", feedback: "", status: "approved" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) fetchAssignments(); }, [selectedCourse]);

  const fetchCourses = async () => {
    const res = await apiFetch("/api/courses/my-courses");
    const data = await res.json();
    if (res.ok && data.courses?.length > 0) { 
      setCourses(data.courses); 
      setSelectedCourse(data.courses[0]._id); 
    }
  };

  const fetchAssignments = async () => {
    const res = await apiFetch(`/api/assignments/course/${selectedCourse}`);
    const data = await res.json();
    if (res.ok) setAssignments(data.assignments || []);
  };

  const fetchSubmissions = async (assignmentId) => {
    const res = await apiFetch(`/api/assignments/${assignmentId}/submissions`);
    const data = await res.json();
    if (res.ok) { 
      setSubmissions(data.submissions || []); 
      setViewSubs(assignmentId); 
    }
  };

  const openCreate = () => { 
    setEditingId(null); 
    setForm({ title: "", description: "", instructions: "", dueDate: "", totalMarks: 100 }); 
    setShowForm(true); 
  };
  
  const openEdit = (a) => { 
    setEditingId(a._id); 
    setForm({ 
      title: a.title, 
      description: a.description || "", 
      instructions: a.instructions || "", 
      dueDate: a.dueDate ? a.dueDate.slice(0, 10) : "", 
      totalMarks: a.totalMarks || 100 
    }); 
    setShowForm(true); 
  };

  const handleSave = async () => {
    if (!form.title.trim()) { 
      setError("Title required"); 
      return; 
    }
    setSaving(true); 
    setError("");
    try {
      const url = editingId ? `/api/assignments/${editingId}` : `/api/assignments`;
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? form : { ...form, courseId: selectedCourse };
      const res = await apiFetch(url, { method, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { 
        setError(data.message); 
        return; 
      }
      setSuccess(editingId ? "Assignment updated!" : "Assignment created!");
      setShowForm(false);
      fetchAssignments();
      setTimeout(() => setSuccess(""), 3000);
    } catch { 
      setError("Cannot connect"); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    await apiFetch(`/api/assignments/${id}`, { method: "DELETE" });
    fetchAssignments();
  };

  const handleGrade = async () => {
    if (gradeForm.marksAwarded === "") { 
      setError("Marks required"); 
      return; 
    }
    setSaving(true); 
    setError("");
    try {
      const res = await apiFetch(`/api/assignments/submissions/${gradingId}/grade`, { 
        method: "PUT", 
        body: JSON.stringify(gradeForm) 
      });
      const data = await res.json();
      if (!res.ok) { 
        setError(data.message); 
        return; 
      }
      setSuccess("Grade saved!");
      setGradingId(null);
      fetchSubmissions(viewSubs);
      setTimeout(() => setSuccess(""), 3000);
    } catch { 
      setError("Cannot connect"); 
    } finally { 
      setSaving(false); 
    }
  };

  const statusColor = { 
    submitted: { bg: `${C.amber}22`, text: C.amberLight, border: `${C.amber}44` },
    reviewed: { bg: `${C.accent}22`, text: C.indigoLight, border: `${C.accent}44` },
    approved: { bg: `${C.green}22`, text: C.greenLight, border: `${C.green}44` },
    rejected: { bg: `${C.red}22`, text: C.redLight, border: `${C.red}44` }
  };

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif", background: C.bg, minHeight: "100vh" }}>
      
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", border: `1px solid ${C.border}` }}>
        <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: C.accent }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: C.accent2 }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.accent }} />
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">SmartAcademia · Teacher Tools</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Assignment Management</h1>
            <p className="text-sm text-gray-400 mt-1">Create assignments and grade student submissions</p>
          </div>
          <button 
            onClick={openCreate} 
            disabled={!selectedCourse}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }}
          >
            <span className="material-symbols-outlined text-base">add</span>
            New Assignment
          </button>
        </div>
      </div>

      {/* Error & Success Messages */}
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
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>
          Select Course
        </label>
        <select 
          value={selectedCourse} 
          onChange={e => setSelectedCourse(e.target.value)}
          className="w-full sm:w-80 px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
          style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
        >
          {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
      </div>

      {/* Assignments list */}
      {assignments.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <span className="material-symbols-outlined text-6xl mb-4 block" style={{ color: C.border2 }}>assignment</span>
          <p className="font-semibold text-white">No assignments yet</p>
          <p className="text-sm mt-1" style={{ color: C.textDim }}>Create your first assignment to get started</p>
          <button 
            onClick={openCreate} 
            className="mt-4 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }}
          >
            Create First Assignment
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map(a => (
            <div key={a._id} className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-base">{a.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="text-xs" style={{ color: C.textFaint }}>{a.totalMarks} marks</span>
                    {a.dueDate && (
                      <span className="text-xs flex items-center gap-1" style={{ color: C.textFaint }}>
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        Due: {new Date(a.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {!a.isPublished && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${C.amber}22`, color: C.amberLight, border: `1px solid ${C.amber}44` }}>
                        Draft
                      </span>
                    )}
                  </div>
                  {a.description && (
                    <p className="text-sm mt-2 line-clamp-2" style={{ color: C.textDim }}>{a.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button 
                    onClick={() => fetchSubmissions(a._id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                    style={{ background: `${C.green}22`, color: C.greenLight, border: `1px solid ${C.green}44` }}
                  >
                    <span className="material-symbols-outlined text-sm">grading</span>
                    Submissions
                  </button>
                  <button 
                    onClick={() => openEdit(a)} 
                    className="p-1.5 rounded-lg transition-all hover:scale-105"
                    style={{ color: C.textFaint }}
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(a._id)} 
                    className="p-1.5 rounded-lg transition-all hover:scale-105"
                    style={{ color: C.textFaint }}
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submissions Panel */}
      {viewSubs && (
        <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 border-b" style={{ borderColor: C.border }}>
            <h3 className="font-bold text-white">Submissions ({submissions.length})</h3>
            <button onClick={() => setViewSubs(null)} className="p-1 rounded-lg transition-all hover:bg-white/10" style={{ color: C.textFaint }}>
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          
          {submissions.length === 0 ? (
            <div className="text-center py-12" style={{ color: C.textDim }}>
              <span className="material-symbols-outlined text-5xl mb-2 block">inbox</span>
              No submissions yet
            </div>
          ) : (
            <div className="divide-y max-h-[500px] overflow-y-auto" style={{ borderColor: C.border }}>
              {submissions.map(s => {
                const status = statusColor[s.status] || statusColor.submitted;
                return (
                  <div key={s._id} className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-semibold text-white text-sm">{s.student?.fullName}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium`} style={{ background: status.bg, color: status.text, border: `1px solid ${status.border}` }}>
                            {s.status}
                          </span>
                          {s.marksAwarded !== null && (
                            <span className="text-xs font-bold" style={{ color: C.greenLight }}>{s.marksAwarded} / {s.totalMarks || 100} marks</span>
                          )}
                        </div>
                        <p className="text-xs" style={{ color: C.textFaint }}>
                          {s.student?.studentId} · Submitted {new Date(s.submittedAt).toLocaleString()}
                        </p>
                        {s.answerText && (
                          <p className="text-sm mt-2 p-3 rounded-lg line-clamp-3" style={{ background: C.surface2, color: C.textDim }}>
                            {s.answerText}
                          </p>
                        )}
                        {s.fileUrl && (
                          <a href={s.fileUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-2 text-xs transition-all hover:scale-105"
                            style={{ color: C.accent }}
                          >
                            <span className="material-symbols-outlined text-sm">download</span>
                            {s.fileName || "Download file"}
                          </a>
                        )}
                        {s.feedback && (
                          <p className="text-xs mt-2 italic" style={{ color: C.textFaint }}>
                            Feedback: {s.feedback}
                          </p>
                        )}
                      </div>
                      <button 
                        onClick={() => { setGradingId(s._id); setGradeForm({ marksAwarded: s.marksAwarded || "", feedback: s.feedback || "", status: "approved" }); }}
                        className="flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }}
                      >
                        <span className="material-symbols-outlined text-sm">grade</span>
                        {s.marksAwarded !== null ? "Re-grade" : "Grade"}
                      </button>
                    </div>

                    {/* Grade form */}
                    {gradingId === s._id && (
                      <div className="mt-4 p-4 rounded-xl" style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44` }}>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: C.textFaint }}>Marks Awarded</label>
                            <input 
                              type="number" 
                              value={gradeForm.marksAwarded} 
                              min={0} 
                              max={s.totalMarks || 100}
                              onChange={e => setGradeForm(p => ({ ...p, marksAwarded: Number(e.target.value) }))}
                              className="w-full px-3 py-2 text-sm rounded-lg outline-none transition-all"
                              style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: C.textFaint }}>Status</label>
                            <select 
                              value={gradeForm.status} 
                              onChange={e => setGradeForm(p => ({ ...p, status: e.target.value }))}
                              className="w-full px-3 py-2 text-sm rounded-lg outline-none transition-all"
                              style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                            >
                              <option value="approved">Approved</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                        </div>
                        <textarea 
                          value={gradeForm.feedback} 
                          onChange={e => setGradeForm(p => ({ ...p, feedback: e.target.value }))}
                          rows={2} 
                          placeholder="Feedback for student (optional)"
                          className="w-full mt-3 px-3 py-2 text-sm rounded-lg outline-none transition-all resize-none"
                          style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                        />
                        <div className="flex flex-col xs:flex-row gap-2 mt-3">
                          <button 
                            onClick={handleGrade} 
                            disabled={saving}
                            className="flex-1 py-2 rounded-lg text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ background: `linear-gradient(135deg, ${C.green}, #16a34a)` }}
                          >
                            {saving ? (
                              <div className="flex items-center justify-center gap-2">
                                <Spinner size="sm" />
                                <span>Saving...</span>
                              </div>
                            ) : (
                              "Save Grade"
                            )}
                          </button>
                          <button 
                            onClick={() => setGradingId(null)} 
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                            style={{ background: C.surface2, color: C.textDim, border: `1px solid ${C.border}` }}
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

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}>
          <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b" style={{ background: C.surface2, borderColor: C.border }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44` }}>
                    <span className="material-symbols-outlined text-base" style={{ color: C.accent }}>assignment</span>
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                    {editingId ? "Edit Assignment" : "New Assignment"}
                  </h3>
                  <div className="flex-1 h-px w-20" style={{ background: `linear-gradient(90deg, ${C.accent}44, transparent)` }} />
                </div>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg transition-all hover:bg-white/10" style={{ color: C.textFaint }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Title *</label>
                <input 
                  value={form.title} 
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Assignment title"
                  className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                  style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                  onFocus={e => e.target.style.borderColor = C.accent}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Description</label>
                <textarea 
                  value={form.description} 
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={2} 
                  placeholder="Brief description"
                  className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all resize-none"
                  style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                  onFocus={e => e.target.style.borderColor = C.accent}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Instructions</label>
                <textarea 
                  value={form.instructions} 
                  onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))}
                  rows={4} 
                  placeholder="Detailed instructions for students..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all resize-none"
                  style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                  onFocus={e => e.target.style.borderColor = C.accent}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Total Marks</label>
                  <input 
                    type="number" 
                    value={form.totalMarks} 
                    min={1}
                    onChange={e => setForm(p => ({ ...p, totalMarks: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                    style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Due Date</label>
                  <input 
                    type="date" 
                    value={form.dueDate} 
                    onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                    style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                  />
                </div>
              </div>

              <div className="flex flex-col xs:flex-row gap-3 pt-2">
                <button 
                  onClick={() => setShowForm(false)} 
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 flex items-center justify-center"
                  style={{ background: C.surface2, color: C.textDim, border: `1px solid ${C.border}` }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }}
                >
                  {saving ? (
                    <div className="flex items-center justify-center gap-2">
                      <Spinner size="sm" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    editingId ? "Update Assignment" : "Create Assignment"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;