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

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "", code: "", description: "",
    department: "Computer Science", credits: 3, semester: "Fall 2024",
  });

  const departments = ["Computer Science", "Mathematics", "Physics", "Business Administration", "Mechanical Engineering", "Electrical Engineering"];
  const semesters = ["Fall 2024", "Spring 2025", "Fall 2025", "Spring 2026"];
  const token = localStorage.getItem("token");

  // Target values for progress bars (Teacher's limits)
  const MAX_COURSES_TARGET = 10;      // Max 1 course per teacher
  const MAX_PUBLISHED_TARGET = 10;    // Max 1 published course
  const MAX_STUDENTS_TARGET = 500;   // Max students across all courses

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/courses/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCourses(data.courses);
      else setApiError(data.message);
    } catch {
      setApiError("Cannot connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStudents = courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);
  const publishedCount = courses.filter(c => c.isPublished).length;
  const hasReachedLimit = courses.length >= MAX_COURSES_TARGET;

  const handleOpenModal = (course = null) => {
    if (!course && hasReachedLimit) {
      setApiError(`You have reached the maximum limit of ${MAX_COURSES_TARGET} course(s). You cannot create more.`);
      return;
    }
    setApiError("");
    setApiSuccess("");
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        code: course.code,
        description: course.description,
        department: course.department,
        credits: course.credits,
        semester: course.semester,
      });
    } else {
      setEditingCourse(null);
      setFormData({ title: "", code: "", description: "", department: "Computer Science", credits: 3, semester: "Fall 2024" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setIsSubmitting(true);

    try {
      const url = editingCourse
        ? `${API}/api/courses/${editingCourse._id}`
        : `${API}/api/courses`;
      const method = editingCourse ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) return setApiError(data.message);

      setApiSuccess(editingCourse ? "Course updated!" : "Course created!");
      fetchCourses();
      setTimeout(() => { setIsModalOpen(false); setApiSuccess(""); }, 1000);
    } catch {
      setApiError("Cannot connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete "${course.title}"? This will also delete all lessons.`)) return;
    try {
      const res = await fetch(`${API}/api/courses/${course._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCourses(prev => prev.filter(c => c._id !== course._id));
      } else {
        alert(data.message);
      }
    } catch {
      alert("Cannot connect to server");
    }
  };

  const handleTogglePublish = async (course) => {
    try {
      const res = await fetch(`${API}/api/courses/${course._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublished: !course.isPublished }),
      });
      if (res.ok) fetchCourses();
    } catch {
      alert("Cannot connect to server");
    }
  };

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
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Teacher · Course Management</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              Course Management
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Create and manage your courses (Max {MAX_COURSES_TARGET} course per teacher)
            </p>
          </div>
          
          <button 
            onClick={() => handleOpenModal()}
            disabled={hasReachedLimit}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 ${
              hasReachedLimit ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
          >
            <span className="material-symbols-outlined text-base">add</span>
            New Course
          </button>
        </div>
      </div>

      {/* Limit Warning Message */}
      {hasReachedLimit && (
        <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#f59e0b22", border: "1px solid #f59e0b44" }}>
          <span className="material-symbols-outlined text-sm text-amber-400">warning</span>
          <p className="text-sm text-amber-400">
            You have reached the maximum limit of {MAX_COURSES_TARGET} course. You cannot create more courses.
          </p>
        </div>
      )}

      {/* Error Message */}
      {apiError && !isModalOpen && (
        <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#ef444422", border: "1px solid #ef444444" }}>
          <span className="material-symbols-outlined text-sm text-red-400">error</span>
          <p className="text-sm text-red-400 flex-1">{apiError}</p>
          <button onClick={() => setApiError("")} className="text-red-400 hover:text-red-300">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Stats Grid using ProgressStatCards (with progress bars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProgressStatCard 
          icon="menu_book" 
          label="My Courses" 
          value={courses.length} 
          total={MAX_COURSES_TARGET}
          color="#6366f1"
          isLoading={isLoading}
        />
        <ProgressStatCard 
          icon="publish" 
          label="Published" 
          value={publishedCount} 
          total={MAX_PUBLISHED_TARGET}
          color="#22c55e"
          isLoading={isLoading}
        />
        <ProgressStatCard 
          icon="groups" 
          label="Total Students" 
          value={totalStudents} 
          total={MAX_STUDENTS_TARGET}
          color="#f59e0b"
          isLoading={isLoading}
        />
      </div>

      {/* Search Card */}
      <div className="rounded-2xl p-5" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
        <SectionHeader icon="search" title="Search Courses" color="#6366f1" />
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">search</span>
          <input 
            type="text" 
            placeholder="Search courses by title or code..."
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Courses Table */}
      {isLoading ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
          <LoadingSpinner />
          <p className="text-gray-500 mt-3 text-sm">Loading courses...</p>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b" }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Lessons</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Students</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "#1e293b" }}>
                {filteredCourses.map(course => (
                  <tr key={course._id} className="hover:bg-white/5 transition-colors duration-150">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-white text-sm">{course.title}</p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{course.code} · {course.credits} credits</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm hidden sm:table-cell">{course.department}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm hidden md:table-cell">{course.totalLessons || 0}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm hidden lg:table-cell">{course.enrolledCount || 0}</td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => handleTogglePublish(course)}
                        className={`px-2 py-1 rounded-full text-[10px] font-medium transition-all hover:scale-105 ${
                          course.isPublished
                            ? "text-emerald-400"
                            : "text-gray-500"
                        }`} style={{
                          background: course.isPublished ? "#22c55e22" : "#1e293b",
                          border: `1px solid ${course.isPublished ? "#22c55e44" : "#334155"}`
                        }}>
                        {course.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(course)}
                          className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Edit course"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(course)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Delete course"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
          <span className="material-symbols-outlined text-5xl text-gray-700 mb-3 block">menu_book</span>
          <h3 className="text-base font-bold text-gray-400 mb-1">No courses yet</h3>
          <p className="text-sm text-gray-600 mb-4">Create your first course to get started</p>
          <button 
            onClick={() => handleOpenModal()}
            disabled={hasReachedLimit}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 ${
              hasReachedLimit ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
          >
            <span className="material-symbols-outlined text-base">add</span>
            Create Course
          </button>
        </div>
      )}

      {/* Add/Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setIsModalOpen(false)}>
          <div className="rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ background: "#0f1629", border: "1px solid #1e293b" }} onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 px-5 py-4" style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b" }}>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">
                  {editingCourse ? "Edit Course" : "Create New Course"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-400">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </div>

            <div className="p-5">
              {apiError && (
                <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: "#ef444422", border: "1px solid #ef444444" }}>
                  <span className="material-symbols-outlined text-sm text-red-400">error</span>
                  <p className="text-sm text-red-400">{apiError}</p>
                </div>
              )}
              {apiSuccess && (
                <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: "#22c55e22", border: "1px solid #22c55e44" }}>
                  <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
                  <p className="text-sm text-emerald-400">{apiSuccess}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Course Title *</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    required 
                    placeholder="e.g. Introduction to Python"
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Course Code *</label>
                    <input 
                      type="text" 
                      value={formData.code}
                      onChange={e => setFormData(p => ({ ...p, code: e.target.value }))}
                      required 
                      placeholder="e.g. CS101"
                      disabled={!!editingCourse}
                      className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Credits</label>
                    <select 
                      value={formData.credits}
                      onChange={e => setFormData(p => ({ ...p, credits: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all cursor-pointer"
                    >
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} credits</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description *</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    required rows={3} 
                    placeholder="Brief description of the course..."
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Department *</label>
                    <select 
                      value={formData.department}
                      onChange={e => setFormData(p => ({ ...p, department: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all cursor-pointer"
                    >
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Semester</label>
                    <select 
                      value={formData.semester}
                      onChange={e => setFormData(p => ({ ...p, semester: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all cursor-pointer"
                    >
                      {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
                    style={{ background: "#1e293b", color: "#94a3b8" }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
                  >
                    {isSubmitting ? (
                      <><div className="relative w-4 h-4"><div className="absolute inset-0 rounded-full border-2 border-indigo-900" /><div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" /></div> Saving...</>
                    ) : editingCourse ? "Update Course" : "Create Course"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "#0a0f1e", border: "1px solid #1e293b" }}>
        <span className="material-symbols-outlined text-xs text-indigo-400 mt-0.5">info</span>
        <p className="text-[10px] text-gray-500 leading-relaxed">
          <strong className="text-indigo-400">Course management:</strong> You can create up to {MAX_COURSES_TARGET} course. Published courses are visible to students for enrollment. Course code cannot be changed after creation.
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

export default CourseManagement;