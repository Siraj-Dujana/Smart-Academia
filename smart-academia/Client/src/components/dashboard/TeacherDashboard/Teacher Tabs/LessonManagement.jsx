import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  // ✅ ADDED

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

const LessonManagement = () => {
  const navigate = useNavigate();  // ✅ ADDED
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

  // ✅ UPDATED: Navigate to full page editor
 const openCreate = () => {
  if (!selectedCourse) return;
  navigate(`/teacher/lessons/${selectedCourse}/create`);
};

  // ✅ UPDATED: Navigate to full page editor with lesson ID
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
    <div className="space-y-5 sm:space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Lesson Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Create and manage lessons, quizzes, and labs for your courses
          </p>
        </div>
        <button onClick={openCreate} disabled={!selectedCourse}
          className="flex items-center justify-center gap-2 text-sm font-medium px-4 sm:px-5 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md w-full sm:w-auto">
          <span className="material-symbols-outlined text-base">add</span>
          New Lesson
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <span className="material-symbols-outlined text-base">error</span>
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}
      {successMsg && (
        <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span className="flex-1">{successMsg}</span>
        </div>
      )}

      {/* Course selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Course
        </label>
        {courses.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No courses found. Create a course in Course Management first.
          </p>
        ) : (
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
            className="w-full sm:w-96 px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            {courses.map(c => (
              <option key={c._id} value={c._id}>{c.title} ({c.code})</option>
            ))}
          </select>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { icon: "menu_book", label: "Total", value: lessons.length, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
          { icon: "visibility", label: "Published", value: completedLessons, color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" },
          { icon: "edit_note", label: "Draft", value: draftLessons, color: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400" },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${stat.color} group-hover:scale-110 transition-transform duration-200`}>
                <span className="material-symbols-outlined text-lg">{stat.icon}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lessons list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="material-symbols-outlined text-5xl sm:text-6xl text-gray-300 dark:text-gray-600">menu_book</span>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mt-3 sm:mt-4 mb-2">No lessons yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Create your first lesson for this course
          </p>
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors">
            <span className="material-symbols-outlined text-base">add</span>
            Create First Lesson
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <div key={lesson._id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-3 sm:p-4 hover:shadow-md transition-all duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                
                {/* Order badge */}
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-xs sm:text-sm flex-shrink-0">
                  {lesson.order}
                </div>

                {/* Format icon */}
                <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                    {getFormatIcon(lesson.format)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      {lesson.title}
                    </h3>
                    {!lesson.isPublished && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                        Draft
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                    <span className="text-[10px] sm:text-xs text-gray-500">{lesson.duration}</span>
                    <span className="text-[10px] sm:text-xs text-gray-500">{lesson.points} pts</span>
                    {lesson.requiresQuiz && (
                      <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-amber-600 dark:text-amber-400">
                        <span className="material-symbols-outlined text-xs">quiz</span>
                        Quiz
                      </span>
                    )}
                    {lesson.requiresLab && (
                      <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-purple-600 dark:text-purple-400">
                        <span className="material-symbols-outlined text-xs">science</span>
                        Lab
                      </span>
                    )}
                    {lesson.content && (
                      <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-green-600 dark:text-green-400">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        Content
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-end gap-2 flex-shrink-0">
                  {/* Publish toggle */}
                  <button onClick={() => handleTogglePublish(lesson)}
                    className={`px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium transition-colors ${
                      lesson.isPublished
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                    }`}>
                    {lesson.isPublished ? "Published" : "Draft"}
                  </button>

                  {/* Edit button - ✅ UPDATED */}
                  <button onClick={() => openEdit(lesson)}
                    className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span className="hidden xs:inline">Edit</span>
                  </button>

                  {/* Delete button */}
                  <button onClick={() => handleDelete(lesson)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonManagement;