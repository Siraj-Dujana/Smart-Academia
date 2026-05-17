import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SectionHeader = ({ icon, title, color = "#6366f1" }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
      <span className="material-symbols-outlined text-sm" style={{ color }}>{icon}</span>
    </div>
    <h3 className="text-xs font-bold text-white tracking-wide uppercase">{title}</h3>
    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}44, transparent)` }} />
  </div>
);

const NoteCard = ({ note, onDelete, onUpdate, formatFileSize }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: note.title,
    description: note.description,
    isPublic: note.isPublic,
    lessonId: note.lessonId?._id || note.lessonId || ''
  });

  const getFileIcon = (type) => {
    const icons = {
      pdf: 'picture_as_pdf',
      doc: 'description',
      docx: 'description',
      ppt: 'slideshow',
      pptx: 'slideshow',
      xls: 'table_chart',
      xlsx: 'table_chart',
      txt: 'description',
      other: 'insert_drive_file'
    };
    return icons[type] || 'insert_drive_file';
  };

  const getFileColor = (type) => {
    const colors = {
      pdf: '#ef4444',
      doc: '#3b82f6',
      docx: '#3b82f6',
      ppt: '#f59e0b',
      pptx: '#f59e0b',
      xls: '#22c55e',
      xlsx: '#22c55e'
    };
    return colors[type] || '#6366f1';
  };

  return (
    <div className="rounded-xl p-4 hover:bg-white/5 transition-all group" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editForm.title}
            onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Note title"
          />
          <textarea
            value={editForm.description}
            onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Description"
            rows={2}
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={editForm.isPublic}
                onChange={e => setEditForm(p => ({ ...p, isPublic: e.target.checked }))}
                className="rounded border-gray-600"
              />
              Public (visible to all students)
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate(note._id, editForm)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-green-600 hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400 bg-gray-800 hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${getFileColor(note.fileType)}22`, border: `1px solid ${getFileColor(note.fileType)}44` }}>
              <span className="material-symbols-outlined text-lg" style={{ color: getFileColor(note.fileType) }}>
                {getFileIcon(note.fileType)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-white text-sm truncate">{note.title}</h4>
                  {note.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{note.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="text-[10px] text-gray-600">{formatFileSize(note.fileSize)}</span>
                    <span className="text-[10px] text-gray-600">•</span>
                    <span className="text-[10px] text-gray-600">{note.downloads} downloads</span>
                    <span className="text-[10px] text-gray-600">•</span>
                    <span className="text-[10px] text-gray-600">Uploaded {new Date(note.createdAt).toLocaleDateString()}</span>
                    {note.lessonId && (
                      <>
                        <span className="text-[10px] text-gray-600">•</span>
                        <span className="text-[10px] text-indigo-400">Lesson: {note.lessonId.title}</span>
                      </>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${note.isPublic ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {note.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <a
                    href={note.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm text-gray-400">download</span>
                  </a>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm text-gray-400">edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(note._id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm text-red-400">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const TeacherShareNotes = () => {
  const token = localStorage.getItem("token");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [notes, setNotes] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    lessonId: "",
    isPublic: true,
    file: null
  });
  const [showUploadModal, setShowUploadModal] = useState(false);

  const apiFetch = (url, opts = {}) =>
    fetch(`${API}${url}`, {
      ...opts,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(opts.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(opts.headers || {})
      }
    });

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) { fetchNotes(); fetchLessons(); } }, [selectedCourse]);

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

  const fetchLessons = async () => {
    if (!selectedCourse) return;
    try {
      const res = await apiFetch(`/api/courses/${selectedCourse}/lessons/teacher`);
      const data = await res.json();
      if (res.ok) setLessons(data.lessons || []);
    } catch { console.error("Failed to fetch lessons"); }
  };

  const fetchNotes = async () => {
    if (!selectedCourse) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/course-notes/teacher/courses/${selectedCourse}`);
      const data = await res.json();
      if (res.ok) setNotes(data.notes || []);
    } catch { setError("Failed to fetch notes"); }
    finally { setIsLoading(false); }
  };

  const handleUpload = async () => {
    if (!uploadForm.file) {
      setError("Please select a file");
      return;
    }
    if (!uploadForm.title.trim()) {
      setError("Please enter a title");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadForm.file);
    formData.append("courseId", selectedCourse);
    formData.append("title", uploadForm.title);
    formData.append("description", uploadForm.description);
    formData.append("isPublic", uploadForm.isPublic);
    if (uploadForm.lessonId) formData.append("lessonId", uploadForm.lessonId);

    setIsLoading(true);
    try {
      const res = await apiFetch("/api/course-notes/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess("Note uploaded successfully!");
      setShowUploadModal(false);
      setUploadForm({ title: "", description: "", lessonId: "", isPublic: true, file: null });
      fetchNotes();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      const res = await apiFetch(`/api/course-notes/${noteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setSuccess("Note deleted successfully!");
      fetchNotes();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (noteId, updateData) => {
    try {
      const res = await apiFetch(`/api/course-notes/${noteId}`, {
        method: "PUT",
        body: JSON.stringify(updateData)
      });
      if (!res.ok) throw new Error("Failed to update");
      setSuccess("Note updated successfully!");
      fetchNotes();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Lexend', sans-serif" }}>
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden p-6" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", border: "1px solid #1e293b" }}>
        <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "#6366f1" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#6366f1" }} />
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Teacher · Share Notes</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
            Share Notes & Materials
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Upload and share lecture notes, study materials, and resources with your students
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

      {/* Course Selector & Upload Button */}
      <div className="rounded-2xl p-5" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Select Course</label>
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
          >
            <span className="material-symbols-outlined text-sm">upload_file</span>
            Share Notes
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
        <div className="px-5 py-4 border-b" style={{ background: "#0a0f1e", borderColor: "#1e293b" }}>
          <SectionHeader icon="menu_book" title="Shared Notes & Materials" color="#6366f1" />
          <p className="text-xs text-gray-500 mt-1">Here are all the notes and materials you've shared with your students</p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="relative w-12 h-12 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-900" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
            </div>
            <p className="text-gray-500 mt-3 text-sm">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-gray-700 mb-3 block">menu_book</span>
            <p className="text-sm text-gray-500">No notes shared yet</p>
            <p className="text-xs text-gray-600 mt-1">Click "Share Notes" to upload study materials for your students</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
            {notes.map(note => (
              <NoteCard
                key={note._id}
                note={note}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                formatFileSize={formatFileSize}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowUploadModal(false)}>
          <div className="rounded-2xl w-full max-w-md overflow-hidden" style={{ background: "#0f1629", border: "1px solid #1e293b" }} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
              <h3 className="text-lg font-bold text-white">Share Notes</h3>
              <p className="text-xs text-indigo-200 mt-0.5">Upload study materials for your students</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Title *</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-2 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g., Chapter 1 Lecture Notes"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={uploadForm.description}
                  onChange={e => setUploadForm(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Brief description of the material..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Related Lesson (Optional)</label>
                <select
                  value={uploadForm.lessonId}
                  onChange={e => setUploadForm(p => ({ ...p, lessonId: e.target.value }))}
                  className="w-full px-4 py-2 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">General (not tied to specific lesson)</option>
                  {lessons.map(l => <option key={l._id} value={l._id}>{l.order}. {l.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">File *</label>
                <input
                  type="file"
                  onChange={e => setUploadForm(p => ({ ...p, file: e.target.files[0] }))}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                  className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:text-xs file:font-semibold file:bg-indigo-500/20 file:text-indigo-400 file:border-0 hover:file:bg-indigo-500/30 cursor-pointer"
                />
                <p className="text-[10px] text-gray-600 mt-1">Supported: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT (Max 50MB)</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={uploadForm.isPublic}
                  onChange={e => setUploadForm(p => ({ ...p, isPublic: e.target.checked }))}
                  className="rounded border-gray-600"
                />
                Make this publicly available to all students in the course
              </label>
            </div>
            <div className="px-5 py-4 border-t flex gap-3" style={{ borderColor: "#1e293b" }}>
              <button
                onClick={handleUpload}
                disabled={isLoading}
                className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
              >
                {isLoading ? "Uploading..." : "Share Notes"}
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                style={{ background: "#1e293b", color: "#94a3b8" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherShareNotes;