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

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    publishedCourses: 0,
    avgEnrollment: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Target values for progress bars (Teacher's personal targets)
  const MAX_COURSES_TARGET = 10;      // Teacher can have max 10 courses
  const MAX_PUBLISHED_TARGET = 10;    // Max published courses
  const MAX_STUDENTS_TARGET = 500;    // Max students across all courses
  const MAX_AVG_ENROLLMENT_TARGET = 100; // Max avg students per course

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/courses/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        const courseList = data.courses || [];
        setCourses(courseList);

        const totalStudents = courseList.reduce(
          (sum, c) => sum + (c.enrolledCount || 0),
          0
        );
        const publishedCourses = courseList.filter((c) => c.isPublished).length;
        const avgEnrollment =
          courseList.length > 0
            ? Math.round(totalStudents / courseList.length)
            : 0;

        setStats({
          totalCourses: courseList.length,
          totalStudents,
          publishedCourses,
          avgEnrollment,
        });
      } else {
        setError(data.message);
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const statsCards = [
    { icon: "school", label: "My Courses", value: stats.totalCourses, total: MAX_COURSES_TARGET, color: "#6366f1" },
    { icon: "visibility", label: "Published", value: stats.publishedCourses, total: MAX_PUBLISHED_TARGET, color: "#22c55e" },
    { icon: "groups", label: "Total Students", value: stats.totalStudents, total: MAX_STUDENTS_TARGET, color: "#f59e0b" },
    { icon: "trending_up", label: "Avg Enrollment", value: stats.avgEnrollment, total: MAX_AVG_ENROLLMENT_TARGET, color: "#ef4444" },
  ];

  const displayName = user.fullName || user.name || "Teacher";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "'Lexend', sans-serif" }}>
      
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", border: "1px solid #1e293b" }}>
        <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "#6366f1" }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: "#a855f7" }} />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#6366f1" }} />
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Teacher Portal · Overview</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              Teacher Dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Welcome back, <span className="text-indigo-400 font-semibold">{displayName}</span>! Here's your overview.
            </p>
          </div>
          
          <button
            onClick={fetchDashboardData}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{ background: "#6366f122", color: "#818cf8", border: "1px solid #6366f144" }}
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#ef444422", border: "1px solid #ef444444" }}>
          <span className="material-symbols-outlined text-sm text-red-400">error</span>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Stats Grid using ProgressStatCards (with progress bars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <ProgressStatCard
            key={index}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            total={stat.total}
            color={stat.color}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* My Courses Section */}
      <div>
        <SectionHeader icon="menu_book" title="My Courses" color="#6366f1" />
        
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <div key={course._id} className="rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 group" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-white mb-1 truncate">{course.title}</h3>
                      <p className="text-xs text-gray-500">
                        {course.code} •{" "}
                        <span className={`font-medium ${course.isPublished ? "text-emerald-400" : "text-gray-500"}`}>
                          {course.isPublished ? "Published" : "Draft"}
                        </span>
                      </p>
                    </div>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ml-3" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
                      <span className="material-symbols-outlined text-xl" style={{ color: "#6366f1" }}>menu_book</span>
                    </div>
                  </div>

                  {/* Enrollment stat */}
                  <div className="flex items-center gap-2 p-2 rounded-xl mb-4" style={{ background: "#1e293b" }}>
                    <span className="material-symbols-outlined text-indigo-400 text-base">groups</span>
                    <span className="text-xs text-gray-400">
                      <span className="font-bold text-white">{course.enrolledCount || 0}</span> student{course.enrolledCount !== 1 ? "s" : ""} enrolled
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">
                    {course.description || "No description available"}
                  </p>
                </div>

                <div className="p-4 border-t" style={{ borderColor: "#1e293b", background: "#0a0f1e" }}>
                  <button
                    onClick={() => navigate(`/teacher/dashboard?tab=lessons&courseId=${course._id}`)}
                    className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
                  >
                    <span className="material-symbols-outlined text-base">play_lesson</span>
                    Manage Lessons
                  </button>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => navigate(`/teacher/dashboard?tab=lab-submissions`)}
                      className="flex-1 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105 flex items-center justify-center gap-1"
                      style={{ background: "#6366f122", color: "#818cf8", border: "1px solid #6366f144" }}
                    >
                      <span className="material-symbols-outlined text-sm">science</span>
                      Labs
                    </button>
                    <button
                      onClick={() => navigate(`/teacher/dashboard?tab=announcements`)}
                      className="flex-1 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105 flex items-center justify-center gap-1"
                      style={{ background: "#f59e0b22", color: "#fbbf24", border: "1px solid #f59e0b44" }}
                    >
                      <span className="material-symbols-outlined text-sm">campaign</span>
                      Announce
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
            <span className="material-symbols-outlined text-5xl text-gray-700 mb-3 block">menu_book</span>
            <h3 className="text-base font-bold text-gray-400 mb-1">No courses yet</h3>
            <p className="text-sm text-gray-600 mb-4">Create your first course to get started</p>
            <button
              onClick={() => navigate("/teacher/dashboard?tab=courses")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
            >
              <span className="material-symbols-outlined text-base">add</span>
              Create Course
            </button>
          </div>
        )}
      </div>

      {/* Enrollment Overview Table - only shown when courses exist */}
      {courses.length > 0 && (
        <div>
          <SectionHeader icon="bar_chart" title="Enrollment Overview" color="#f59e0b" />
          
          <div className="rounded-2xl overflow-hidden" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b" }}>
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Department</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Students</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "#1e293b" }}>
                  {courses.map((course) => {
                    const maxEnrollment = Math.max(...courses.map(c => c.enrolledCount || 0), 1);
                    const percentage = ((course.enrolledCount || 0) / maxEnrollment) * 100;
                    return (
                      <tr key={course._id} className="hover:bg-white/5 transition-colors duration-150">
                        <td className="px-5 py-3">
                          <div>
                            <p className="font-semibold text-white text-sm">{course.title}</p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">{course.code}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-sm hidden sm:table-cell">
                          {course.department || "—"}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white text-sm">{course.enrolledCount || 0}</span>
                            <div className="flex-1 max-w-[100px]">
                              <MiniBar value={percentage} color="#f59e0b" height={4} />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell">
                          <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-medium ${
                            course.isPublished ? "text-emerald-400" : "text-gray-500"
                          }`} style={{
                            background: course.isPublished ? "#22c55e22" : "#1e293b",
                            border: `1px solid ${course.isPublished ? "#22c55e44" : "#334155"}`
                          }}>
                            {course.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "#0a0f1e", border: "1px solid #1e293b" }}>
        <span className="material-symbols-outlined text-xs text-indigo-400 mt-0.5">info</span>
        <p className="text-[10px] text-gray-500 leading-relaxed">
          <strong className="text-indigo-400">Teacher insight:</strong> Track your courses, manage lessons, and communicate with students through announcements. Progress bars show your capacity (Max {MAX_COURSES_TARGET} courses, {MAX_STUDENTS_TARGET} students).
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

export default Dashboard;