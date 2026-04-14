import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const apiFetch = (url, opts = {}) => {
  const token = localStorage.getItem("token");
  return fetch(`${API}${url}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers||{}) } });
};

const AssignmentManagement = () => {
  const [courses,      setCourses]      = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [assignments,  setAssignments]  = useState([]);
  const [showForm,     setShowForm]     = useState(false);
  const [editingId,    setEditingId]    = useState(null);
  const [form,         setForm]         = useState({ title:"", description:"", instructions:"", dueDate:"", totalMarks:100 });
  const [viewSubs,     setViewSubs]     = useState(null);
  const [submissions,  setSubmissions]  = useState([]);
  const [gradingId,    setGradingId]    = useState(null);
  const [gradeForm,    setGradeForm]    = useState({ marksAwarded:"", feedback:"", status:"approved" });
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState("");

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) fetchAssignments(); }, [selectedCourse]);

  const fetchCourses = async () => {
    const res  = await apiFetch("/api/courses/my-courses");
    const data = await res.json();
    if (res.ok && data.courses?.length > 0) { setCourses(data.courses); setSelectedCourse(data.courses[0]._id); }
  };

  const fetchAssignments = async () => {
    const res  = await apiFetch(`/api/assignments/course/${selectedCourse}`);
    const data = await res.json();
    if (res.ok) setAssignments(data.assignments || []);
  };

  const fetchSubmissions = async (assignmentId) => {
    const res  = await apiFetch(`/api/assignments/${assignmentId}/submissions`);
    const data = await res.json();
    if (res.ok) { setSubmissions(data.submissions || []); setViewSubs(assignmentId); }
  };

  const openCreate = () => { setEditingId(null); setForm({ title:"", description:"", instructions:"", dueDate:"", totalMarks:100 }); setShowForm(true); };
  const openEdit   = (a) => { setEditingId(a._id); setForm({ title:a.title, description:a.description||"", instructions:a.instructions||"", dueDate:a.dueDate?a.dueDate.slice(0,10):"", totalMarks:a.totalMarks||100 }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title required"); return; }
    setSaving(true); setError("");
    try {
      const url = editingId ? `/api/assignments/${editingId}` : `/api/assignments`;
      const method = editingId ? "PUT" : "POST";
      const body   = editingId ? form : { ...form, courseId: selectedCourse };
      const res  = await apiFetch(url, { method, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setSuccess(editingId ? "Updated!" : "Created!");
      setShowForm(false);
      fetchAssignments();
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("Cannot connect"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    await apiFetch(`/api/assignments/${id}`, { method: "DELETE" });
    fetchAssignments();
  };

  const handleGrade = async () => {
    if (gradeForm.marksAwarded === "") { setError("Marks required"); return; }
    setSaving(true); setError("");
    try {
      const res  = await apiFetch(`/api/assignments/submissions/${gradingId}/grade`, { method: "PUT", body: JSON.stringify(gradeForm) });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setSuccess("Graded!"); setGradingId(null);
      fetchSubmissions(viewSubs);
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("Cannot connect"); }
    finally { setSaving(false); }
  };

  const statusColor = { 
    submitted:"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", 
    reviewed:"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300", 
    approved:"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", 
    rejected:"bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" 
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Assignment Management</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Create assignments and grade student submissions</p>
        </div>
        <button onClick={openCreate} disabled={!selectedCourse}
          className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 hover:scale-105 w-full sm:w-auto">
          <span className="material-symbols-outlined text-base">add</span>New Assignment
        </button>
      </div>

      {/* Error & Success Messages */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          {success}
        </div>
      )}

      {/* Course selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course</label>
        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
          className="w-full sm:w-80 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
          {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
      </div>

      {/* Assignments list */}
      {assignments.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="material-symbols-outlined text-5xl sm:text-6xl text-gray-300 dark:text-gray-600">assignment</span>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">No assignments yet</p>
          <button onClick={openCreate} className="mt-3 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
            Create First Assignment
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {assignments.map(a => (
            <div key={a._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{a.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>{a.totalMarks} marks</span>
                    {a.dueDate && <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>}
                    {!a.isPublished && <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-[10px]">Draft</span>}
                  </div>
                  {a.description && <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{a.description}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => fetchSubmissions(a._id)}
                    className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 transition-colors">
                    <span className="material-symbols-outlined text-sm">grading</span>
                    <span className="hidden xs:inline">Submissions</span>
                  </button>
                  <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button onClick={() => handleDelete(a._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
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
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Submissions ({submissions.length})</h3>
            <button onClick={() => setViewSubs(null)} className="text-gray-400 hover:text-gray-600">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No submissions yet</div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
              {submissions.map(s => (
                <div key={s._id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{s.student?.fullName}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${statusColor[s.status]||"bg-gray-100 text-gray-600"}`}>
                          {s.status}
                        </span>
                        {s.marksAwarded !== null && (
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{s.marksAwarded} marks</span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        {s.student?.studentId} · Submitted {new Date(s.submittedAt).toLocaleString()}
                      </p>
                      {s.answerText && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                          {s.answerText}
                        </p>
                      )}
                      {s.fileUrl && (
                        <a href={s.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700">
                          <span className="material-symbols-outlined text-sm">download</span>
                          {s.fileName || "Download file"}
                        </a>
                      )}
                      {s.feedback && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                          Feedback: {s.feedback}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => { setGradingId(s._id); setGradeForm({ marksAwarded: s.marksAwarded||"", feedback: s.feedback||"", status:"approved" }); }}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 flex-shrink-0">
                      <span className="material-symbols-outlined text-sm">grade</span>
                      {s.marksAwarded !== null ? "Re-grade" : "Grade"}
                    </button>
                  </div>

                  {/* Grade form */}
                  {gradingId === s._id && (
                    <div className="mt-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Marks Awarded</label>
                          <input type="number" value={gradeForm.marksAwarded} min={0} max={100}
                            onChange={e => setGradeForm(p => ({ ...p, marksAwarded: Number(e.target.value) }))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"/>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                          <select value={gradeForm.status} onChange={e => setGradeForm(p => ({ ...p, status: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                            <option value="approved">Approved</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                      <textarea value={gradeForm.feedback} onChange={e => setGradeForm(p => ({ ...p, feedback: e.target.value }))}
                        rows={2} placeholder="Feedback for student (optional)"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none"/>
                      <div className="flex flex-col xs:flex-row gap-2">
                        <button onClick={handleGrade} disabled={saving}
                          className="flex-1 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                          {saving ? "Saving..." : "Save Grade"}
                        </button>
                        <button onClick={() => setGradingId(null)} 
                          className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
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

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">{editingId ? "Edit Assignment" : "New Assignment"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Assignment title"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={2} placeholder="Brief description"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructions</label>
                <textarea value={form.instructions} onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))}
                  rows={4} placeholder="Detailed instructions for students..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"/>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Marks</label>
                  <input type="number" value={form.totalMarks} min={1}
                    onChange={e => setForm(p => ({ ...p, totalMarks: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"/>
                </div>
              </div>
              <div className="flex flex-col xs:flex-row gap-2 pt-2">
                <button onClick={() => setShowForm(false)} 
                  className="flex-1 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {saving ? "Saving..." : editingId ? "Update" : "Create"}
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