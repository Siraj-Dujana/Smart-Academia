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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${API}/api/courses/enrolled`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setEnrolledCourses(data.courses);
    } catch {
      console.error("Failed to fetch dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate real stats from enrolled courses
  const completedCourses = enrolledCourses.filter(c => c.isCompleted).length;
  const avgProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((s, c) => s + (c.progress || 0), 0) / enrolledCourses.length)
    : 0;

  const stats = [
    {
      icon: "import_contacts", title: "Courses Enrolled", value: enrolledCourses.length,
      color: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-500",
      trend: enrolledCourses.length > 0 ? `${completedCourses} completed` : "Enroll in a course",
      trendColor: "text-green-500",
    },
    {
      icon: "trending_up", title: "Overall Progress", value: `${avgProgress}%`,
      color: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-500",
      trend: avgProgress >= 50 ? "Great progress!" : "Keep going!",
      trendColor: avgProgress >= 50 ? "text-green-500" : "text-amber-500",
    },
    {
      icon: "task_alt", title: "Courses Completed", value: completedCourses,
      color: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-500",
      trend: completedCourses > 0 ? "Well done!" : "Complete a course",
      trendColor: "text-green-500",
    },
    {
      icon: "school", title: "Total Credits",
      value: enrolledCourses.reduce((s, c) => s + (c.credits || 0), 0),
      color: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-500",
      trend: "Enrolled credits",
      trendColor: "text-green-500",
    },
  ];

  // Build chart data from real courses
  useEffect(() => {
    if (isLoading) return;

    if (barChartRef.current) {
      if (barChartInstance.current) barChartInstance.current.destroy();
      const ctx = barChartRef.current.getContext("2d");
      barChartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: enrolledCourses.length > 0
            ? enrolledCourses.map(c => c.code || c.title.slice(0, 8))
            : ["No courses yet"],
          datasets: [{
            label: "Progress %",
            data: enrolledCourses.length > 0
              ? enrolledCourses.map(c => c.progress || 0)
              : [0],
            backgroundColor: "#4f46e5",
            borderRadius: 8,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, max: 100, ticks: { callback: v => v + "%" } },
            x: { grid: { display: false } },
          },
          plugins: { legend: { display: false } },
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
        type: "pie",
        data: {
          labels: ["Completed", "In Progress", "Not Started"],
          datasets: [{
            data: [completed || 0, inProgress || 0, notStarted || (enrolledCourses.length === 0 ? 1 : 0)],
            backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
            borderWidth: 2,
            borderColor: "#ffffff",
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { usePointStyle: true, padding: 20 } },
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Student Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 text-base mt-1">
          Welcome back, {user.fullName || "Student"}! Here's your learning overview.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all hover:scale-105 group">
            <div className="flex items-start gap-4">
              <div className={`flex items-center justify-center size-12 rounded-lg ${stat.color} group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{stat.title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {isLoading ? "..." : stat.value}
                </p>
                <p className={`text-xs font-medium ${stat.trendColor}`}>{stat.trend}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Courses */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Courses</h2>
          <button onClick={() => navigate("/student/dashboard")}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All →
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
        ) : enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.slice(0, 3).map(course => (
              <div key={course._id}
                onClick={() => navigate(`/lessons/${course._id}`)}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all hover:scale-105 overflow-hidden group cursor-pointer">
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600">
                      <span className="material-symbols-outlined text-base">menu_book</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-500">{course.code} · {course.teacher?.fullName}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{course.progress || 0}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${course.progress || 0}%` }}/>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
                  <button className="w-full flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all">
                    Continue <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">import_contacts</span>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2">No courses yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Enroll in a course to start learning</p>
            <button onClick={() => navigate("/student/dashboard")}
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              Browse Courses
            </button>
          </div>
        )}
      </div>

      {/* Charts */}
      {enrolledCourses.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Reports Overview</h2>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress by Course</h3>
              <div className="h-64"><canvas ref={barChartRef}/></div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Course Status</h3>
              <div className="h-64 flex items-center justify-center"><canvas ref={pieChartRef}/></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;