import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Mini Bar ──────────────────────────────────────────────────
const MiniBar = ({ value = 0, height = 6 }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height, background: "#1e293b" }}>
    <div
      className="h-full rounded-full bg-white"
      style={{
        width: `${Math.min(Math.max(value, 0), 100)}%`,
        boxShadow: "0 0 8px rgba(255,255,255,0.4)",
        transition: "width 1s cubic-bezier(.4,0,.2,1)"
      }}
    />
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const creditsChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);
  const creditsChartInstance = useRef(null);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Monochrome palette — matches AdminDashboard / StudentDashboard shell theme
  const colors = {
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
  const totalCredits = enrolledCourses.reduce((s, c) => s + (c.credits || 0), 0);
  const completedCredits = enrolledCourses.filter(c => c.isCompleted).reduce((s, c) => s + (c.credits || 0), 0);

  // Every percentage here comes from the student's own real numbers —
  // completion rate, average progress, credits earned — never a fixed cap.
  const completionRate = enrolledCourses.length > 0 ? Math.round((completedCourses / enrolledCourses.length) * 100) : 0;
  const creditsRate = totalCredits > 0 ? Math.round((completedCredits / totalCredits) * 100) : 0;

  const stats = [
    { title: "Courses Enrolled", value: enrolledCourses.length, sub: enrolledCourses.length > 0 ? `${completedCourses} completed` : "Enroll now", percentage: completionRate },
    { title: "Overall Progress", value: `${avgProgress}%`, sub: avgProgress >= 50 ? "Great progress!" : "Keep going!", percentage: avgProgress },
    { title: "Completed", value: completedCourses, sub: completedCourses > 0 ? "Well done!" : "Start learning", percentage: completionRate },
    { title: "Total Credits", value: totalCredits, sub: "Enrolled credits", percentage: creditsRate },
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
            backgroundColor: "#ffffff",
            borderRadius: 8,
            hoverBackgroundColor: "#cbd5e1",
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, max: 100, ticks: { callback: v => v + "%", color: "#64748b" }, grid: { color: "#1e293b" } },
            x: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 10 } } },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#0f1629",
              titleColor: "#e2e8f0",
              bodyColor: "#94a3b8",
              borderColor: "rgba(255,255,255,0.15)",
              borderWidth: 1,
              cornerRadius: 8,
              callbacks: { label: ctx => `${ctx.raw}%` },
            },
          },
          animation: { duration: 1000, easing: "easeOutQuart" },
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
            backgroundColor: ["#ffffff", "#94a3b8", "#334155"],
            hoverBackgroundColor: ["#e2e8f0", "#cbd5e1", "#475569"],
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
            tooltip: {
              backgroundColor: "#0f1629",
              titleColor: "#e2e8f0",
              bodyColor: "#94a3b8",
              borderColor: "rgba(255,255,255,0.15)",
              borderWidth: 1,
              cornerRadius: 8,
            },
          },
          animation: { duration: 1000, animateScale: true, easing: "easeOutQuart" },
        },
      });
    }

    if (creditsChartRef.current) {
      if (creditsChartInstance.current) creditsChartInstance.current.destroy();
      const ctx = creditsChartRef.current.getContext("2d");
      const sorted = [...enrolledCourses].sort((a, b) => (b.credits || 0) - (a.credits || 0)).slice(0, 8);
      creditsChartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: sorted.map(c => c.code || c.title.slice(0, 10)),
          datasets: [{
            label: "Credits",
            data: sorted.map(c => c.credits || 0),
            backgroundColor: sorted.map(c => c.isCompleted ? "#ffffff" : "rgba(255,255,255,0.35)"),
            borderRadius: 8,
          }],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { beginAtZero: true, ticks: { precision: 0, color: "#64748b" }, grid: { color: "#1e293b" } },
            y: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 10 } } },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#0f1629",
              titleColor: "#e2e8f0",
              bodyColor: "#94a3b8",
              borderColor: "rgba(255,255,255,0.15)",
              borderWidth: 1,
              cornerRadius: 8,
              callbacks: {
                label: ctx => `${ctx.raw} credits${sorted[ctx.dataIndex]?.isCompleted ? " · completed" : ""}`,
              },
            },
          },
          animation: { duration: 1000, easing: "easeOutQuart" },
        },
      });
    }

    return () => {
      if (barChartInstance.current) barChartInstance.current.destroy();
      if (pieChartInstance.current) pieChartInstance.current.destroy();
      if (creditsChartInstance.current) creditsChartInstance.current.destroy();
    };
  }, [isLoading, enrolledCourses]);

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif" }}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full animate-pulse bg-white" />
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Dashboard</p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Welcome back, <span className="text-white/90">{user.fullName || "Student"}</span>
        </h1>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl flex items-center gap-3 transition-all duration-300" style={{ background: "#1a0a0a", border: "1px solid #ef444433" }}>
          <span className="material-symbols-outlined text-red-500">error</span>
          <p className="text-sm text-red-400 flex-1">{error}</p>
        </div>
      )}

      {/* Stats — each with a live percentage bar, no fixed caps */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="relative rounded-2xl p-5 flex flex-col gap-3 group overflow-hidden opacity-0 animate-fadeInUp transition-all duration-300 ease-out hover:-translate-y-1"
            style={{ background: colors.card, border: "1px solid rgba(255,255,255,0.1)", animationDelay: `${i * 90}ms`, animationFillMode: "forwards" }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />
            <div className="flex items-start justify-between">
              <p className="text-xs text-gray-400 font-medium">{stat.title}</p>
              <span className="text-xs font-bold text-white transition-all duration-300">
                {isLoading ? "" : `${stat.percentage}%`}
              </span>
            </div>
            <div>
              <p className="text-3xl font-black text-white tracking-tight" style={{ textShadow: "0 0 20px rgba(255,255,255,0.25)" }}>
                {isLoading ? "..." : stat.value}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">{stat.sub}</p>
            </div>
            <MiniBar value={isLoading ? 0 : stat.percentage} />
          </div>
        ))}
      </div>

      {/* My Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">My Courses</h2>
          <button onClick={() => navigate("/student/dashboard?tab=courses")}
            className="text-sm font-medium flex items-center gap-1 text-white/70 transition-colors duration-300 hover:text-white">
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-white/10" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
            </div>
          </div>
        ) : enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.slice(0, 3).map((course) => (
              <div key={course._id}
                onClick={() => navigate(`/lessons/${course._id}`)}
                className="rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group border hover:-translate-y-1"
                style={{ background: colors.card, borderColor: "rgba(255,255,255,0.1)" }}>

                <div className="h-28 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02))" }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.1), transparent)" }} />
                  <div className="absolute bottom-3 left-4">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full text-white" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
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
                    <span className="font-bold text-white transition-all duration-300">{course.progress || 0}%</span>
                  </div>
                  <MiniBar value={course.progress || 0} height={6} />
                </div>

                <div className="border-t px-4 py-3" style={{ borderColor: "#1e293b" }}>
                  <button className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2 rounded-lg transition-all duration-300 hover:scale-105"
                    style={{ background: "rgba(255,255,255,0.08)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.18)" }}>
                    {course.progress === 100 ? "Review Course" : "Continue"}
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl p-12 text-center transition-all duration-300" style={{ background: colors.card, border: "1px solid #1e293b" }}>
            <span className="material-symbols-outlined text-5xl text-gray-700 mb-4 block">import_contacts</span>
            <p className="text-gray-400 font-semibold">No courses yet</p>
            <p className="text-sm text-gray-600 mt-1 mb-4">Enroll in a course to start learning</p>
            <button onClick={() => navigate("/student/dashboard?tab=courses")}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105"
              style={{ background: "rgba(255,255,255,0.08)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.18)" }}>
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
              <div className="rounded-2xl p-5 transition-all duration-300" style={{ background: colors.card, border: "1px solid #1e293b" }}>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Progress by Course</h3>
                <div className="h-64"><canvas ref={barChartRef} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="rounded-2xl p-5 transition-all duration-300" style={{ background: colors.card, border: "1px solid #1e293b" }}>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Course Status</h3>
                  <div className="h-64 flex items-center justify-center"><canvas ref={pieChartRef} /></div>
                </div>
                <div className="rounded-2xl p-5 transition-all duration-300" style={{ background: colors.card, border: "1px solid #1e293b" }}>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Credits by Course</h3>
                  <div className="h-64"><canvas ref={creditsChartRef} /></div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-80 xl:w-96 rounded-2xl p-5 transition-all duration-300" style={{ background: colors.card, border: "1px solid #1e293b" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Recent Activity</h3>
              <span className="material-symbols-outlined text-gray-600 text-sm">schedule</span>
            </div>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.slice(0, 5).map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 pb-3 transition-opacity duration-300" style={{ borderBottom: idx < 4 ? "1px solid #1e293b" : "none" }}>
                    
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

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.4s ease-out both; }
      `}</style>
    </div>
  );
};

export default Dashboard;