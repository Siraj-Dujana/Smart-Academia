import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-3 mb-4">
    <h3 className="text-xs font-bold text-white tracking-wide uppercase">{title}</h3>
    <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.15), transparent)" }} />
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
    { key: "docx", label: "Word", icon: "description" },
    { key: "pptx", label: "Presentation", icon: "slideshow" }
  ];

  return (
    <div className="space-y-6" style={{ fontFamily: "'Lexend', sans-serif" }}>
      {/* Hero Section */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full animate-pulse bg-white" />
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Student · Course Notes</p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Lecture Notes & Materials
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Access notes, study materials, and resources shared by your teachers
        </p>
      </div>

      {error && (
        <div className="rounded-xl p-3 flex items-center gap-2 transition-all duration-300" style={{ background: "#ef444422", border: "1px solid #ef444444" }}>
          <span className="material-symbols-outlined text-sm text-red-400">error</span>
          <p className="text-sm text-red-400 flex-1">{error}</p>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-300 transition-colors duration-300">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Course Selector */}
      <div className="rounded-2xl p-5 transition-all duration-300" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Select Course</label>
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-white/40 outline-none transition-all duration-300"
            >
              {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="rounded-2xl overflow-hidden transition-all duration-300" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
        <div className="px-5 py-4 border-b" style={{ background: "#0a0f1e", borderColor: "#1e293b" }}>
          <SectionHeader  title="Available Study Materials" />
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">search</span>
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-white/40 outline-none transition-all duration-300"
              />
            </div>
            <div className="flex gap-1.5">
              {fileTypes.map(type => (
                <button
                  key={type.key}
                  onClick={() => setSelectedType(type.key)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 hover:scale-105 flex items-center gap-1"
                  style={selectedType === type.key
                    ? { background: "#ffffff", color: "#0a0f1e" }
                    : { background: "#1e293b", border: "1px solid #334155", color: "#64748b" }
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
              <div className="absolute inset-0 rounded-full border-4 border-white/10" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin" />
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
              <div key={note._id} className="p-5 hover:bg-white/5 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)" }}>
                    <span className="material-symbols-outlined text-2xl text-white">
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
                              <span className="text-[10px] text-gray-400">Lesson: {note.lessonId.title}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {note.fileType === 'pdf' && (
                          <button
                            onClick={() => setPreviewNote(note)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-105"
                            style={{ background: "rgba(255,255,255,0.06)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.16)" }}
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            Preview
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(note)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 hover:scale-105"
                          style={{ background: "rgba(255,255,255,0.1)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.2)" }}
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300" onClick={() => setPreviewNote(null)}>
          <div className="rounded-2xl w-full flex flex-col overflow-hidden" style={{ maxWidth: "90vw", height: "85vh", background: "#0f1629", border: "1px solid #1e293b" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b" }}>
              <div>
                <p className="text-sm font-bold text-white">{previewNote.title}</p>
                <p className="text-xs text-gray-500">{previewNote.fileName}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewNote)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 hover:scale-105"
                  style={{ background: "rgba(255,255,255,0.1)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Download
                </button>
                <button onClick={() => setPreviewNote(null)} className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all duration-300">
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