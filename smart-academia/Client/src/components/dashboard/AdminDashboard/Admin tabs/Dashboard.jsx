import React, { useEffect, useRef, useState } from "react";
import { Chart } from 'chart.js/auto';

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
      <span className="material-symbols-outlined text-sm text-white">{icon}</span>
    </div>
    <h3 className="text-xs font-bold text-white tracking-wide uppercase">{title}</h3>
    <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.15), transparent)" }} />
  </div>
);

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

// ── Progress Stat Card (icon-free, no hardcoded ceiling) ───────
// `total` is now derived from the live data itself (the highest value
// among the current stats), not a made-up fixed target. This keeps the
// percentage + bar visualization without artificially capping any count.
const ProgressStatCard = ({ label, value, total, isLoading, delay = 0 }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div
      className="relative rounded-2xl overflow-hidden p-5 flex flex-col gap-3 group opacity-0 animate-fadeInUp transition-all duration-300 ease-out hover:-translate-y-1"
      style={{
        background: "#0f1629",
        border: "1px solid rgba(255,255,255,0.1)",
        animationDelay: `${delay}ms`,
        animationFillMode: "forwards",
      }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />
      <div className="flex items-start justify-between">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <span className="text-xs font-bold text-white transition-all duration-300">{percentage}%</span>
      </div>
      <div>
        {isLoading ? (
          <div className="h-9 w-20 rounded-lg overflow-hidden relative" style={{ background: "#1a2338" }}>
            <div className="absolute inset-0 animate-shimmer" style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
            }} />
          </div>
        ) : (
          <>
            <p className="text-3xl font-black text-white tracking-tight" style={{ textShadow: "0 0 20px rgba(255,255,255,0.25)" }}>
              {value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              <span className="text-gray-400">out of</span> {total.toLocaleString()}
            </p>
          </>
        )}
      </div>
      <MiniBar value={percentage} />
    </div>
  );
};

// ── Loading Spinner ───────────────────────────────────────────
const LoadingSpinner = () => (
  <div className="relative w-12 h-12 mx-auto">
    <div className="absolute inset-0 rounded-full border-4 border-white/10" />
    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin" />
    <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-white/40 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
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

  // No fixed targets — the reference point each bar/percentage is drawn
  // against is simply the largest live count among the four stats, so
  // nothing is ever capped by a made-up number.
  const liveMax = Math.max(
    stats.totalTeachers,
    stats.totalStudents,
    stats.totalCourses,
    stats.totalEnrollments,
    1
  );

  const statCards = [
    { title: "Total Teachers", value: stats.totalTeachers, total: liveMax },
    { title: "Total Students", value: stats.totalStudents, total: liveMax },
    { title: "Total Courses", value: stats.totalCourses, total: liveMax },
    { title: "Total Enrollments", value: stats.totalEnrollments, total: liveMax },
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
            backgroundColor: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'],
            borderRadius: 8,
            hoverBackgroundColor: ['#cbd5e1', '#cbd5e1', '#cbd5e1', '#cbd5e1'],
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
              borderColor: 'rgba(255,255,255,0.15)',
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
            backgroundColor: ['#ffffff', '#64748b', '#334155'],
            hoverBackgroundColor: ['#e2e8f0', '#94a3b8', '#475569'],
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
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full animate-pulse bg-white" />
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Admin Portal · Overview</p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Welcome back, <span className="text-white/90">{displayName}</span>
          {" "}Here's the system overview.
        </h1>
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
            label={stat.title}
            value={stat.value}
            total={stat.total}
            isLoading={isLoading}
            delay={index * 90}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div>
        <SectionHeader icon="bar_chart" title="Platform Overview" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Bar Chart */}
          <div className="lg:col-span-2 rounded-2xl p-5 transition-all duration-300" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-white text-base">show_chart</span>
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
          <div className="rounded-2xl p-5 transition-all duration-300" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-white text-base">pie_chart</span>
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
        <span className="material-symbols-outlined text-xs text-white/70 mt-0.5">info</span>
        <p className="text-[10px] text-gray-500 leading-relaxed">
          <span className="text-white/80 font-semibold">Admin insight:</span> Bars scale relative to your platform's own live numbers — no fixed capacity limits.
        </p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.4s ease-out both; }

        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        .animate-shimmer { animation: shimmer 1.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Dashboard;