import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Dashboard = () => {
  const navigate = useNavigate();
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const colors = {
    accent: "#6366f1",
    accent2: "#a855f7",
    amber: "#f59e0b",
    green: "#22c55e",
    red: "#ef4444",
    card: "#0f1629",
    border: "#1e293b",
    muted: "#64748b",
    text: "#e2e8f0",
    textDim: "#94a3b8",
  };

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivities();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${API}/api/courses/enrolled`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setEnrolledCourses(data.courses || []);
      else setError(data.message || "Failed to fetch courses");
    } catch {
      setError("Cannot connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const res = await fetch(`${API}/api/student/recent-activities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRecentActivities(data.activities || []);
    } catch { /* ignore */ }
  };

  const completedCourses = enrolledCourses.filter(c => c.isCompleted).length;
  const avgProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((s, c) => s + (c.progress || 0), 0) / enrolledCourses.length)
    : 0;

  const stats = [
    { icon: "import_contacts", title: "Courses Enrolled", value: enrolledCourses.length, color: colors.accent, sub: enrolledCourses.length > 0 ? `${completedCourses} completed` : "Enroll now" },
    { icon: "trending_up", title: "Overall Progress", value: `${avgProgress}%`, color: colors.amber, sub: avgProgress >= 50 ? "Great progress!" : "Keep going!" },
    { icon: "task_alt", title: "Completed", value: completedCourses, color: colors.green, sub: completedCourses > 0 ? "Well done!" : "Start learning" },
    { icon: "school", title: "Total Credits", value: enrolledCourses.reduce((s, c) => s + (c.credits || 0), 0), color: colors.accent2, sub: "Enrolled credits" },
  ];

  useEffect(() => {
    if (isLoading || enrolledCourses.length === 0) return;

    if (barChartRef.current) {
      if (barChartInstance.current) barChartInstance.current.destroy();
      const ctx = barChartRef.current.getContext("2d");
      barChartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: enrolledCourses.slice(0, 8).map(c => c.code || c.title.slice(0, 8)),
          datasets: [{
            label: "Progress %",
            data: enrolledCourses.slice(0, 8).map(c => c.progress || 0),
            backgroundColor: ["#6366f1", "#a855f7", "#f59e0b", "#22c55e", "#3b82f6", "#ec4899", "#14b8a6", "#f97316"],
            borderRadius: 8,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, max: 100, ticks: { callback: v => v + "%", color: "#64748b" }, grid: { color: "#1e293b" } },
            x: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 10 } } },
          },
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.raw}%` } } },
          animation: { duration: 1000 },
        },
      });
    }

    if (pieChartRef.current) {
      if (pieChartInstance.current) pieChartInstance.current.destroy();
      const completed = enrolledCourses.filter(c => c.isCompleted).length;
      const inProgress = enrolledCourses.filter(c => !c.isCompleted && (c.progress || 0) > 0).length;
      const notStarted = enrolledCourses.filter(c => (c.progress || 0) === 0).length;
      
      const ctx = pieChartRef.current.getContext("2d");
      pieChartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Completed", "In Progress", "Not Started"],
          datasets: [{
            data: [completed, inProgress, notStarted],
            backgroundColor: ["#22c55e", "#f59e0b", "#334155"],
            borderWidth: 2,
            borderColor: "#0f1629",
            hoverBorderColor: "#1e293b",
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { usePointStyle: true, padding: 15, color: "#94a3b8", font: { size: 11 } } },
          },
          animation: { duration: 1000, animateScale: true },
        },
      });
    }

    return () => {
      if (barChartInstance.current) barChartInstance.current.destroy();
      if (pieChartInstance.current) pieChartInstance.current.destroy();
    };
  }, [isLoading, enrolledCourses]);

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif" }}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: colors.accent }} />
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#818cf8" }}>Dashboard</p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Welcome back, <span style={{ background: "linear-gradient(90deg, #818cf8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{user.fullName || "Student"}</span>
        </h1>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: "#1a0a0a", border: "1px solid #ef444433" }}>
          <span className="material-symbols-outlined text-red-500">error</span>
          <p className="text-sm text-red-400 flex-1">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="relative rounded-2xl p-5 flex flex-col gap-3 group overflow-hidden" style={{ background: colors.card, border: `1px solid ${stat.color}33` }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(ellipse at 50% 0%, ${stat.color}15 0%, transparent 70%)` }} />
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}22`, border: `1px solid ${stat.color}44` }}>
                <span className="material-symbols-outlined text-xl" style={{ color: stat.color }}>{stat.icon}</span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-white tracking-tight" style={{ textShadow: `0 0 20px ${stat.color}66` }}>
                {isLoading ? "..." : stat.value}
              </p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{stat.title}</p>
              <p className="text-[10px] text-gray-500 mt-1">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* My Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">My Courses</h2>
          <button onClick={() => navigate("/courses")}
            className="text-sm font-medium flex items-center gap-1 transition-colors hover:text-white" style={{ color: "#818cf8" }}>
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-900" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
            </div>
          </div>
        ) : enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.slice(0, 3).map((course, idx) => {
              const gradients = ["#6366f1", "#a855f7", "#f59e0b"];
              const color = gradients[idx % 3];
              return (
                <div key={course._id}
                  onClick={() => navigate(`/lessons/${course._id}`)}
                  className="rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group border"
                  style={{ background: colors.card, borderColor: `${color}33` }}>
                  
                  <div className="h-28 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${color}44, ${color}11)` }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(ellipse at 50% 50%, ${color}20, transparent)` }} />
                    <div className="absolute bottom-3 left-4">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full text-white" style={{ background: `${color}44`, border: `1px solid ${color}66` }}>
                        {course.code}
                      </span>
                    </div>
                    {course.progress === 100 && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1" style={{ background: "#22c55e22", color: "#4ade80", border: "1px solid #22c55e44" }}>
                          <span className="material-symbols-outlined text-xs">check_circle</span> Done
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-white mb-1 truncate">{course.title}</h3>
                    <p className="text-xs text-gray-500 mb-3">{course.teacher?.fullName || "Instructor"}</p>
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>Progress</span>
                      <span className="font-bold" style={{ color }}>{course.progress || 0}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${course.progress || 0}%`, background: color }} />
                    </div>
                  </div>
                  
                  <div className="border-t px-4 py-3" style={{ borderColor: "#1e293b" }}>
                    <button className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2 rounded-lg transition-all hover:scale-105"
                      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
                      {course.progress === 100 ? "Review Course" : "Continue"}
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl p-12 text-center" style={{ background: colors.card, border: "1px solid #1e293b" }}>
            <span className="material-symbols-outlined text-5xl text-gray-700 mb-4 block">import_contacts</span>
            <p className="text-gray-400 font-semibold">No courses yet</p>
            <p className="text-sm text-gray-600 mt-1 mb-4">Enroll in a course to start learning</p>
            <button onClick={() => navigate("/courses")}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
              style={{ background: `${colors.accent}22`, color: "#818cf8", border: `1px solid ${colors.accent}44` }}>
              Browse Courses
            </button>
          </div>
        )}
      </div>

      {/* Charts & Activity */}
      {enrolledCourses.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1 space-y-5">
            <h2 className="text-lg font-bold text-white">Reports Overview</h2>
            <div className="grid grid-cols-1 gap-5">
              <div className="rounded-2xl p-5" style={{ background: colors.card, border: "1px solid #1e293b" }}>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Progress by Course</h3>
                <div className="h-64"><canvas ref={barChartRef} /></div>
              </div>
              <div className="rounded-2xl p-5" style={{ background: colors.card, border: "1px solid #1e293b" }}>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Course Status</h3>
                <div className="h-64 flex items-center justify-center"><canvas ref={pieChartRef} /></div>
              </div>
            </div>
          </div>

          <div className="lg:w-80 xl:w-96 rounded-2xl p-5" style={{ background: colors.card, border: "1px solid #1e293b" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Recent Activity</h3>
              <span className="material-symbols-outlined text-gray-600 text-sm">schedule</span>
            </div>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.slice(0, 5).map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 pb-3" style={{ borderBottom: idx < 4 ? "1px solid #1e293b" : "none" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${colors.accent}22`, border: `1px solid ${colors.accent}44` }}>
                      <span className="material-symbols-outlined text-sm" style={{ color: colors.accent }}>{activity.icon || "play_circle"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{activity.description}</p>
                      <p className="text-[10px] text-gray-600 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-gray-700 mb-2">history</span>
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;