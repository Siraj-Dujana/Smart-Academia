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
      if (res.ok) {
        setEnrolledCourses(data.courses || []);
      } else {
        setError(data.message || "Failed to fetch courses");
      }
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
      if (res.ok) {
        setRecentActivities(data.activities || []);
      }
    } catch {
      console.error("Failed to fetch activities");
    }
  };

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
            backgroundColor: "#4f46e5",
            borderRadius: 8,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, max: 100, ticks: { callback: v => v + "%" } },
            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
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
        type: "pie",
        data: {
          labels: ["Completed", "In Progress", "Not Started"],
          datasets: [{
            data: [completed, inProgress, notStarted],
            backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
            borderWidth: 2,
            borderColor: "#ffffff",
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { usePointStyle: true, padding: 15, font: { size: 11 } } },
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

  const getCourseColor = (index) => {
    const colors = [
      "from-blue-500 to-indigo-600",
      "from-purple-500 to-pink-600",
      "from-green-500 to-teal-600",
      "from-orange-500 to-red-600",
      "from-cyan-500 to-blue-600",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Student Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
          Welcome back, {user.fullName || "Student"}! Here's your learning overview.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
          <span className="material-symbols-outlined text-red-500 text-base sm:text-lg">error</span>
          <p className="text-sm text-red-600 dark:text-red-400 flex-1">{error}</p>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Stats - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all hover:scale-105 group">
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
              <div className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg ${stat.color} group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-xl sm:text-2xl">{stat.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium mb-0.5">{stat.title}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-0.5">
                  {isLoading ? "..." : stat.value}
                </p>
                <p className={`text-[10px] sm:text-xs font-medium ${stat.trendColor}`}>{stat.trend}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* My Courses Section */}
      <div>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">My Courses</h2>
          <button onClick={() => navigate("/courses")}
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {enrolledCourses.slice(0, 3).map((course, idx) => (
              <div key={course._id}
                onClick={() => navigate(`/lessons/${course._id}`)}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all hover:scale-105 overflow-hidden group cursor-pointer">
                
                {/* Course Image/Gradient Header */}
                <div className={`h-28 sm:h-32 bg-gradient-to-r ${getCourseColor(idx)} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all"></div>
                  <div className="absolute bottom-2 sm:bottom-3 left-3 sm:left-4">
                    <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/20 backdrop-blur-sm rounded-full text-white">
                      {course.code}
                    </span>
                  </div>
                  {course.progress === 100 && (
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                      <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-500 rounded-full text-white flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        <span className="hidden xs:inline">Completed</span>
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors mb-0.5 line-clamp-1 text-sm sm:text-base">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 sm:mb-3">{course.teacher?.fullName || "Instructor"}</p>

                  {/* Progress bar */}
                  <div className="mb-2 sm:mb-3">
                    <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span className="font-medium">{course.progress || 0}%</span>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${course.progress || 0}%` }}/>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-2.5 sm:py-3">
                  <button className="w-full flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all">
                    {course.progress === 100 ? "Review Course" : "Continue Learning"}
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <span className="material-symbols-outlined text-5xl sm:text-6xl text-gray-300 dark:text-gray-600">import_contacts</span>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mt-3 sm:mt-4 mb-2">No courses yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Enroll in a course to start learning</p>
            <button onClick={() => navigate("/courses")}
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              Browse Courses
            </button>
          </div>
        )}
      </div>

      {/* Charts & Recent Activity Row */}
      {enrolledCourses.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-5 sm:gap-6">
          {/* Charts Section */}
          <div className="flex-1 space-y-5 sm:space-y-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">Reports Overview</h2>
            <div className="grid grid-cols-1 gap-5 sm:gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Progress by Course</h3>
                <div className="h-56 sm:h-64"><canvas ref={barChartRef}/></div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Course Status Distribution</h3>
                <div className="h-56 sm:h-64 flex items-center justify-center"><canvas ref={pieChartRef}/></div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="lg:w-80 xl:w-96 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              <span className="material-symbols-outlined text-gray-400 text-sm">schedule</span>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.slice(0, 5).map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-2 sm:gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-blue-600 text-sm">{activity.icon || "play_circle"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <span className="material-symbols-outlined text-3xl sm:text-4xl text-gray-300 dark:text-gray-600">history</span>
                  <p className="text-sm text-gray-500 mt-2">No recent activity</p>
                  <p className="text-xs text-gray-400">Start a lesson to see activity here</p>
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