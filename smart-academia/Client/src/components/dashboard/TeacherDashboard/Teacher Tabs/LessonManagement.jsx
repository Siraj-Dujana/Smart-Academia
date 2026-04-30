import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

// ── Progress Stat Card (with progress bar and ratio) ──────────
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
const LoadingSpinner = () => (
  <div className="relative w-12 h-12 mx-auto">
    <div className="absolute inset-0 rounded-full border-4 border-indigo-900" />
    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
    <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
  </div>
);

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

const LessonManagement = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Target values for progress bars
  const MAX_LESSONS_TARGET = 20;      // Max lessons per course
  const MAX_PUBLISHED_TARGET = 20;    // Max published lessons
  const MAX_DRAFT_TARGET = 20;        // Max draft lessons

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) fetchLessons(); }, [selectedCourse]);

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
    setIsLoading(true);
    setError("");
    try {
      const res = await apiFetch(`/api/courses/${selectedCourse}/lessons/teacher`);
      const data = await res.json();
      if (res.ok) setLessons(data.lessons || []);
      else setError(data.message);
    } catch { setError("Cannot connect to server"); }
    finally { setIsLoading(false); }
  };

  const handleDelete = async (lesson) => {
    if (!window.confirm(`Delete "${lesson.title}"? This cannot be undone.`)) return;
    try {
      const res = await apiFetch(`/api/courses/${selectedCourse}/lessons/${lesson._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess("Lesson deleted");
        fetchLessons();
      } else {
        setError(data.message);
      }
    } catch { setError("Cannot connect to server"); }
  };

  const handleTogglePublish = async (lesson) => {
    try {
      const res = await apiFetch(`/api/courses/${selectedCourse}/lessons/${lesson._id}`, {
        method: "PUT",
        body: JSON.stringify({ isPublished: !lesson.isPublished }),
      });
      if (res.ok) fetchLessons();
    } catch { setError("Cannot connect to server"); }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const openCreate = () => {
    if (!selectedCourse) return;
    navigate(`/teacher/lessons/${selectedCourse}/create`);
  };

  const openEdit = (lesson) => {
    navigate(`/teacher/lessons/${selectedCourse}/edit/${lesson._id}`);
  };

  const getFormatIcon = (format) => {
    if (format === "video") return "play_circle";
    if (format === "mixed") return "auto_awesome";
    return "article";
  };

  const completedLessons = lessons.filter(l => l.isPublished).length;
  const draftLessons = lessons.filter(l => !l.isPublished).length;

  return (
    <div className="space-y-6" style={{ fontFamily: "'Lexend', sans-serif" }}>
      
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden p-6" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", border: "1px solid #1e293b" }}>
        <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "#6366f1" }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: "#a855f7" }} />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#6366f1" }} />
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Teacher · Lesson Management</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              Lesson Management
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Create and manage lessons, quizzes, and labs for your courses
            </p>
          </div>
          
          <button 
            onClick={openCreate} 
            disabled={!selectedCourse}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
          >
            <span className="material-symbols-outlined text-base">add</span>
            New Lesson
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#ef444422", border: "1px solid #ef444444" }}>
          <span className="material-symbols-outlined text-sm text-red-400">error</span>
          <span className="flex-1 text-sm text-red-400">{error}</span>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-300">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}
      {successMsg && (
        <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#22c55e22", border: "1px solid #22c55e44" }}>
          <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
          <span className="flex-1 text-sm text-emerald-400">{successMsg}</span>
        </div>
      )}

      {/* Course selector */}
      <div className="rounded-2xl p-5" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
        <SectionHeader icon="school" title="Select Course" color="#6366f1" />
        {courses.length === 0 ? (
          <p className="text-sm text-gray-500">No courses found. Create a course in Course Management first.</p>
        ) : (
          <select 
            value={selectedCourse} 
            onChange={e => setSelectedCourse(e.target.value)}
            className="w-full sm:w-96 px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all cursor-pointer"
          >
            {courses.map(c => (
              <option key={c._id} value={c._id}>{c.title} ({c.code})</option>
            ))}
          </select>
        )}
      </div>

      {/* Stats Grid using ProgressStatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProgressStatCard 
          icon="menu_book" 
          label="Total Lessons" 
          value={lessons.length} 
          total={MAX_LESSONS_TARGET}
          color="#6366f1"
          isLoading={isLoading}
        />
        <ProgressStatCard 
          icon="visibility" 
          label="Published" 
          value={completedLessons} 
          total={MAX_PUBLISHED_TARGET}
          color="#22c55e"
          isLoading={isLoading}
        />
        <ProgressStatCard 
          icon="edit_note" 
          label="Draft" 
          value={draftLessons} 
          total={MAX_DRAFT_TARGET}
          color="#f59e0b"
          isLoading={isLoading}
        />
      </div>

      {/* Lessons list */}
      {isLoading ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
          <LoadingSpinner />
          <p className="text-gray-500 mt-3 text-sm">Loading lessons...</p>
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
          <span className="material-symbols-outlined text-5xl text-gray-700 mb-3 block">menu_book</span>
          <h3 className="text-base font-bold text-gray-400 mb-1">No lessons yet</h3>
          <p className="text-sm text-gray-600 mb-4">Create your first lesson for this course</p>
          <button 
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
          >
            <span className="material-symbols-outlined text-base">add</span>
            Create First Lesson
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <div key={lesson._id} className="rounded-xl p-4 transition-all duration-200 hover:scale-[1.02]" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                
                {/* Order badge */}
                <div className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
                  <span className="text-sm font-bold text-indigo-400">{lesson.order}</span>
                </div>

                {/* Format icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0" style={{ background: "#1e293b" }}>
                  <span className="material-symbols-outlined text-gray-400 text-base">
                    {getFormatIcon(lesson.format)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white text-sm sm:text-base">
                      {lesson.title}
                    </h3>
                    {!lesson.isPublished && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }}>
                        Draft
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-500">{lesson.duration}</span>
                    <span className="text-[10px] text-gray-500">•</span>
                    <span className="text-[10px] text-gray-500">{lesson.points} pts</span>
                    
                    {lesson.requiresQuiz && (
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                        <span className="material-symbols-outlined text-xs">quiz</span>
                        Quiz
                      </span>
                    )}
                    {lesson.requiresLab && (
                      <span className="flex items-center gap-0.5 text-[10px] text-purple-400">
                        <span className="material-symbols-outlined text-xs">science</span>
                        Lab
                      </span>
                    )}
                    {lesson.content && (
                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-400">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        Content
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-end gap-2 flex-shrink-0">
                  {/* Publish toggle */}
                  <button 
                    onClick={() => handleTogglePublish(lesson)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all hover:scale-105 ${
                      lesson.isPublished
                        ? "text-emerald-400"
                        : "text-gray-500"
                    }`} style={{
                      background: lesson.isPublished ? "#22c55e22" : "#1e293b",
                      border: `1px solid ${lesson.isPublished ? "#22c55e44" : "#334155"}`
                    }}>
                    {lesson.isPublished ? "Published" : "Draft"}
                  </button>

                  {/* Edit button */}
                  <button 
                    onClick={() => openEdit(lesson)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                    style={{ background: "#6366f122", color: "#818cf8", border: "1px solid #6366f144" }}>
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span className="hidden xs:inline">Edit</span>
                  </button>

                  {/* Delete button */}
                  <button 
                    onClick={() => handleDelete(lesson)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all hover:scale-110">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Banner */}
      <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "#0a0f1e", border: "1px solid #1e293b" }}>
        <span className="material-symbols-outlined text-xs text-indigo-400 mt-0.5">info</span>
        <p className="text-[10px] text-gray-500 leading-relaxed">
          <strong className="text-indigo-400">Lesson management:</strong> Create and organize lessons for your course. Each lesson can include video, text content, quizzes, and labs. Publish lessons to make them available to students.
        </p>
      </div>

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

export default LessonManagement;