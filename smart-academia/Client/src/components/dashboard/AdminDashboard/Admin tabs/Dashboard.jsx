import React, { useEffect, useRef, useState } from "react";
import { Chart } from 'chart.js/auto';

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Dashboard = () => {
  const token = localStorage.getItem("token");
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);

  const [stats, setStats] = useState({
    totalStudents:    0,
    totalTeachers:    0,
    totalCourses:     0,
    totalEnrollments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]   = useState("");

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

  const statCards = [
    {
      icon: "school",
      title: "Total Teachers",
      value: stats.totalTeachers,
      color: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-500",
    },
    {
      icon: "groups",
      title: "Total Students",
      value: stats.totalStudents,
      color: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-500",
    },
    {
      icon: "menu_book",
      title: "Total Courses",
      value: stats.totalCourses,
      color: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500",
    },
    {
      icon: "trending_up",
      title: "Total Enrollments",
      value: stats.totalEnrollments,
      color: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-500",
    },
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
            backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
            borderRadius: 8,
            hoverBackgroundColor: ['#6366f1', '#34d399', '#fbbf24', '#f87171'],
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.1)' },
              ticks: { font: { size: 11 } }
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 11 } }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0,0,0,0.8)',
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
      // Derive a simple enrollment ratio: enrolled vs not enrolled students
      const enrolled  = Math.min(stats.totalEnrollments, stats.totalStudents);
      const notEnrolled = Math.max(0, stats.totalStudents - enrolled);
      pieChartInstance.current = new Chart(pieCtx, {
        type: 'pie',
        data: {
          labels: ['Enrolled Students', 'Not Yet Enrolled', 'Teachers'],
          datasets: [{
            data: [enrolled, notEnrolled, stats.totalTeachers],
            backgroundColor: ['#10b981', '#ef4444', '#4f46e5'],
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 8,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { usePointStyle: true, padding: 15, font: { size: 11 } }
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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Welcome back, {displayName}! Here's the system overview.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-lg transition-colors w-full sm:w-auto justify-center"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-600 text-base">error</span>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group"
          >
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
              <div className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg ${stat.color} group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
                <span className="material-symbols-outlined text-xl sm:text-2xl">{stat.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">
                  {stat.title}
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? (
                    <span className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-8 w-12 inline-block" />
                  ) : (
                    stat.value.toLocaleString()
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Platform Overview
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Bar Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5 md:p-6 hover:shadow-md transition-all duration-300">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Platform Statistics
            </h3>
            <div className="h-56 sm:h-64 md:h-72 lg:h-80">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                </div>
              ) : (
                <canvas ref={barChartRef} />
              )}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5 md:p-6 hover:shadow-md transition-all duration-300">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              User Distribution
            </h3>
            <div className="h-56 sm:h-64 md:h-72 lg:h-80 flex items-center justify-center">
              {isLoading ? (
                <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (
                <canvas ref={pieChartRef} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;