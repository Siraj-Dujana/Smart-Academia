import React, { useEffect, useRef, useState } from "react";
import { Chart } from 'chart.js/auto';

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
          <div className="h-9 w-20 bg-gray-800 rounded-lg animate-pulse" />
        ) : (
          <>
            <p className="text-3xl font-black text-white tracking-tight" style={{ textShadow: `0 0 20px ${color}66` }}>
              {value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              <span className="text-gray-400">out of</span> {total.toLocaleString()}
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

const Dashboard = () => {
  const token = localStorage.getItem("token");
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName = user.fullName || user.name || "Admin User";

  // Target values for progress bars (max capacity or goals)
  const MAX_TEACHERS_TARGET = 100;
  const MAX_STUDENTS_TARGET = 500;
  const MAX_COURSES_TARGET = 200;
  const MAX_ENROLLMENTS_TARGET = 5000;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { icon: "school", title: "Total Teachers", value: stats.totalTeachers, total: MAX_TEACHERS_TARGET, color: "#6366f1" },
    { icon: "groups", title: "Total Students", value: stats.totalStudents, total: MAX_STUDENTS_TARGET, color: "#22c55e" },
    { icon: "menu_book", title: "Total Courses", value: stats.totalCourses, total: MAX_COURSES_TARGET, color: "#f59e0b" },
    { icon: "trending_up", title: "Total Enrollments", value: stats.totalEnrollments, total: MAX_ENROLLMENTS_TARGET, color: "#ef4444" },
  ];

  // Initialize charts once stats are loaded
  useEffect(() => {
    if (isLoading) return;

    if (barChartRef.current) {
      if (barChartInstance.current) barChartInstance.current.destroy();
      const barCtx = barChartRef.current.getContext('2d');
      barChartInstance.current = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: ['Teachers', 'Students', 'Courses', 'Enrollments'],
          datasets: [{
            label: 'Count',
            data: [
              stats.totalTeachers,
              stats.totalStudents,
              stats.totalCourses,
              stats.totalEnrollments,
            ],
            backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'],
            borderRadius: 8,
            hoverBackgroundColor: ['#818cf8', '#4ade80', '#fbbf24', '#f87171'],
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: '#1e293b' },
              ticks: { font: { size: 11, color: '#94a3b8' } }
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 11, color: '#94a3b8' } }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0f1629',
              titleColor: '#e2e8f0',
              bodyColor: '#94a3b8',
              borderColor: '#6366f144',
              borderWidth: 1,
              cornerRadius: 8,
            }
          },
          animation: { duration: 1000, easing: 'easeOutQuart' }
        }
      });
    }

    if (pieChartRef.current) {
      if (pieChartInstance.current) pieChartInstance.current.destroy();
      const pieCtx = pieChartRef.current.getContext('2d');
      const enrolled = Math.min(stats.totalEnrollments, stats.totalStudents);
      const notEnrolled = Math.max(0, stats.totalStudents - enrolled);
      pieChartInstance.current = new Chart(pieCtx, {
        type: 'pie',
        data: {
          labels: ['Enrolled Students', 'Not Yet Enrolled', 'Teachers'],
          datasets: [{
            data: [enrolled, notEnrolled, stats.totalTeachers],
            backgroundColor: ['#22c55e', '#ef4444', '#6366f1'],
            borderWidth: 2,
            borderColor: '#0f1629',
            hoverOffset: 8,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 15,
                font: { size: 11, family: "'Lexend', sans-serif" },
                color: '#94a3b8'
              }
            }
          },
          animation: { duration: 1000, easing: 'easeOutQuart', animateScale: true }
        }
      });
    }

    return () => {
      if (barChartInstance.current) barChartInstance.current.destroy();
      if (pieChartInstance.current) pieChartInstance.current.destroy();
    };
  }, [isLoading, stats]);

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
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Admin Portal · Overview</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Welcome back, <span className="text-indigo-400 font-semibold">{displayName}</span>! Here's the system overview.
            </p>
          </div>
          
          <button
            onClick={fetchStats}
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

      {/* Stats Grid using ProgressStatCards with ratio display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <ProgressStatCard
            key={index}
            icon={stat.icon}
            label={stat.title}
            value={stat.value}
            total={stat.total}
            color={stat.color}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div>
        <SectionHeader icon="bar_chart" title="Platform Overview" color="#6366f1" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Bar Chart */}
          <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400 text-base">show_chart</span>
              Platform Statistics
            </h3>
            <div className="h-72 lg:h-80">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <canvas ref={barChartRef} />
              )}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="rounded-2xl p-5" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400 text-base">pie_chart</span>
              User Distribution
            </h3>
            <div className="h-72 lg:h-80 flex items-center justify-center">
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <canvas ref={pieChartRef} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "#0a0f1e", border: "1px solid #1e293b" }}>
        <span className="material-symbols-outlined text-xs text-indigo-400 mt-0.5">info</span>
        <p className="text-[10px] text-gray-500 leading-relaxed">
          <span className="text-indigo-400 font-semibold">Admin insight:</span> Track key metrics with progress bars showing capacity. Targets: {MAX_TEACHERS_TARGET} teachers, {MAX_STUDENTS_TARGET} students, {MAX_COURSES_TARGET} courses, {MAX_ENROLLMENTS_TARGET} enrollments.
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