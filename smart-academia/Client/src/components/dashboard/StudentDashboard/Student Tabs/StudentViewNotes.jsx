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

const StudentViewNotes = () => {
  const token = localStorage.getItem("token");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [previewNote, setPreviewNote] = useState(null);

  const apiFetch = (url, opts = {}) =>
    fetch(`${API}${url}`, {
      ...opts,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) }
    });

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) fetchNotes();
  }, [selectedCourse]);

  const fetchEnrolledCourses = async () => {
    try {
      const res = await apiFetch("/api/courses/enrolled");
      const data = await res.json();
      if (res.ok && data.courses?.length > 0) {
        setCourses(data.courses);
        setSelectedCourse(data.courses[0]._id);
      } else {
        console.log('No enrolled courses found');
        setError("You are not enrolled in any courses yet");
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError("Cannot connect to server");
    }
  };

  const fetchNotes = async () => {
    if (!selectedCourse) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await apiFetch(`/api/course-notes/course/${selectedCourse}`);
      const data = await res.json();
      if (res.ok) {
        setNotes(data.notes || []);
      } else {
        setError(data.message || "Failed to fetch notes");
      }
    } catch (err) {
      console.error('Fetch notes error:', err);
      setError("Failed to fetch notes");
    } finally {
      setIsLoading(false);
    }
  };

  // FIXED: Updated download function using the download endpoint
  const handleDownload = async (note) => {
    try {
      const response = await fetch(`${API}/api/course-notes/download/${note._id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Set filename with correct extension
      const filename = `${note.title}.${note.fileType}`;
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log('Download successful:', filename);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download file');
    }
  };

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
      xlsx: '#22c55e',
      txt: '#6b7280'
    };
    return colors[type] || '#6366f1';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredNotes = notes.filter(note => {
    const matchSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.description && note.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchType = selectedType === "all" || note.fileType === selectedType;
    return matchSearch && matchType;
  });

  const fileTypes = [
    { key: "all", label: "All", icon: "folder" },
    { key: "pdf", label: "PDF", icon: "picture_as_pdf" },
    { key: "doc", label: "Word", icon: "description" },
    { key: "docx", label: "Word", icon: "description" },
    { key: "ppt", label: "Presentation", icon: "slideshow" },
    { key: "pptx", label: "Presentation", icon: "slideshow" }
  ];

  return (
    <div className="space-y-6" style={{ fontFamily: "'Lexend', sans-serif" }}>
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden p-6" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", border: "1px solid #1e293b" }}>
        <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "#6366f1" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#6366f1" }} />
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Student · Course Notes</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
            Lecture Notes & Materials
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Access notes, study materials, and resources shared by your teachers
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#ef444422", border: "1px solid #ef444444" }}>
          <span className="material-symbols-outlined text-sm text-red-400">error</span>
          <p className="text-sm text-red-400 flex-1">{error}</p>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-300">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Course Selector */}
      <div className="rounded-2xl p-5" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
        <div className="flex flex-wrap items-center gap-4">
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
        </div>
      </div>

      {/* Notes Section */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
        <div className="px-5 py-4 border-b" style={{ background: "#0a0f1e", borderColor: "#1e293b" }}>
          <SectionHeader icon="menu_book" title="Available Study Materials" color="#6366f1" />
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">search</span>
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex gap-1.5">
              {fileTypes.map(type => (
                <button
                  key={type.key}
                  onClick={() => setSelectedType(type.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 flex items-center gap-1 ${
                    selectedType === type.key
                      ? "text-white"
                      : "text-gray-500"
                  }`}
                  style={selectedType === type.key
                    ? { background: "linear-gradient(135deg, #6366f1, #818cf8)" }
                    : { background: "#1e293b", border: "1px solid #334155" }
                  }
                >
                  <span className="material-symbols-outlined text-xs">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="relative w-12 h-12 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-900" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
            </div>
            <p className="text-gray-500 mt-3 text-sm">Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-gray-700 mb-3 block">menu_book</span>
            <p className="text-sm text-gray-500">
              {notes.length === 0 ? "No notes available for this course yet" : "No notes match your search"}
            </p>
            <p className="text-xs text-gray-600 mt-1">Check back later for study materials</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
            {filteredNotes.map(note => (
              <div key={note._id} className="p-5 hover:bg-white/5 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${getFileColor(note.fileType)}22`, border: `1px solid ${getFileColor(note.fileType)}44` }}>
                    <span className="material-symbols-outlined text-2xl" style={{ color: getFileColor(note.fileType) }}>
                      {getFileIcon(note.fileType)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-white text-base">{note.title}</h4>
                        {note.description && (
                          <p className="text-xs text-gray-500 mt-1">{note.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="text-[10px] text-gray-600">{formatFileSize(note.fileSize)}</span>
                          <span className="text-[10px] text-gray-600">•</span>
                          <span className="text-[10px] text-gray-600">Uploaded {new Date(note.createdAt).toLocaleDateString()}</span>
                          {note.downloads > 0 && (
                            <>
                              <span className="text-[10px] text-gray-600">•</span>
                              <span className="text-[10px] text-gray-600">{note.downloads} downloads</span>
                            </>
                          )}
                          {note.lessonId && (
                            <>
                              <span className="text-[10px] text-gray-600">•</span>
                              <span className="text-[10px] text-indigo-400">Lesson: {note.lessonId.title}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {note.fileType === 'pdf' && (
                          <button
                            onClick={() => setPreviewNote(note)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                            style={{ background: "#6366f122", color: "#818cf8", border: "1px solid #6366f144" }}
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            Preview
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(note)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:scale-105"
                          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
                        >
                          <span className="material-symbols-outlined text-sm">download</span>
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewNote && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setPreviewNote(null)}>
          <div className="rounded-2xl w-full flex flex-col overflow-hidden" style={{ maxWidth: "90vw", height: "85vh", background: "#0f1629", border: "1px solid #1e293b" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
              <div>
                <p className="text-sm font-bold text-white">{previewNote.title}</p>
                <p className="text-xs text-indigo-200">{previewNote.fileName}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewNote)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 bg-white hover:bg-indigo-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Download
                </button>
                <button onClick={() => setPreviewNote(null)} className="text-white hover:bg-white/20 rounded-lg p-1.5">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="flex-1" style={{ minHeight: 0, background: "#1a1a2e" }}>
              <iframe src={previewNote.fileUrl} className="w-full h-full" style={{ border: "none" }} title="PDF Preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentViewNotes;