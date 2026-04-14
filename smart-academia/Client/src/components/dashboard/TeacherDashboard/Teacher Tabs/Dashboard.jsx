import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [courses, setCourses] = useState([]);
  const [studentProgress, setStudentProgress] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalQuizzes: 0,
    totalStudents: 0,
    avgProgress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch teacher's courses
      const coursesRes = await fetch(`${API}/api/courses/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const coursesData = await coursesRes.json();
      
      if (coursesRes.ok) {
        setCourses(coursesData.courses || []);
        
        // Calculate stats from courses
        const totalCourses = coursesData.courses?.length || 0;
        const totalStudents = coursesData.courses?.reduce((sum, c) => sum + (c.enrolledCount || 0), 0) || 0;
        
        // Fetch student progress data
        let allProgress = [];
        for (const course of coursesData.courses || []) {
          const progressRes = await fetch(`${API}/api/courses/${course._id}/student-progress`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const progressData = await progressRes.json();
          if (progressRes.ok) {
            allProgress = [...allProgress, ...(progressData.students || [])];
          }
        }
        
        setStudentProgress(allProgress.slice(0, 5));
        
        // Calculate average progress
        const avgProgress = allProgress.length > 0
          ? Math.round(allProgress.reduce((sum, s) => sum + (s.progress || 0), 0) / allProgress.length)
          : 0;
        
        setStats({
          totalCourses,
          totalQuizzes: coursesData.courses?.reduce((sum, c) => sum + (c.totalQuizzes || 0), 0) || 0,
          totalStudents,
          avgProgress,
        });
      } else {
        setError(coursesData.message);
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const statsCards = [
    {
      icon: "school",
      title: "Courses",
      value: stats.totalCourses,
      color: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-500",
      trend: "Active courses",
    },
    {
      icon: "quiz",
      title: "Quizzes Created",
      value: stats.totalQuizzes,
      color: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500",
      trend: "Total quizzes",
    },
    {
      icon: "groups",
      title: "Students",
      value: stats.totalStudents,
      color: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-500",
      trend: "Enrolled students",
    },
    {
      icon: "trending_up",
      title: "Average Progress",
      value: `${stats.avgProgress}%`,
      color: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-500",
      trend: "Across all courses",
    },
  ];

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const displayName = user.fullName || user.name || "Teacher";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 sm:py-24">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            Teacher Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Welcome back, {displayName}! Here's your overview.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-600 text-sm">error</span>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {statsCards.map((stat, index) => (
          <div 
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group"
          >
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
              <div className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg ${stat.color} group-hover:scale-110 transition-transform duration-200`}>
                <span className="material-symbols-outlined text-xl sm:text-2xl">{stat.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium mb-0.5">
                  {stat.title}
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-0.5">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs font-medium text-gray-500">
                  {stat.trend}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* My Courses Section */}
      <div>
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          My Courses
        </h2>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 overflow-hidden group">
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-0.5 truncate">
                        {course.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {course.code} • {course.enrolledCount || 0} Students
                      </p>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex-shrink-0 ml-2">
                      <span className="material-symbols-outlined text-lg sm:text-xl">menu_book</span>
                    </div>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3 sm:mb-4 line-clamp-2">
                    {course.description || "No description available"}
                  </p>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 dark:bg-gray-700/30">
                  <button 
                    onClick={() => navigate(`/teacher/lessons/${course._id}`)}
                    className="w-full flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 group-hover:scale-105"
                  >
                    <span className="material-symbols-outlined text-sm sm:text-base group-hover:scale-110 transition-transform duration-200">
                      play_lesson
                    </span> 
                    View Lessons
                  </button>
                  <div className="flex items-center gap-2 mt-2">
                    <button 
                      onClick={() => navigate(`/teacher/quizzes?course=${course._id}`)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <span className="material-symbols-outlined text-sm">quiz</span> 
                      Quizzes
                    </button>
                    <button 
                      onClick={() => navigate(`/teacher/announcements?course=${course._id}`)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
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
          <div className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <span className="material-symbols-outlined text-5xl sm:text-6xl text-gray-300 dark:text-gray-600">menu_book</span>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mt-3 sm:mt-4 mb-2">No courses yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create your first course to get started</p>
            <button 
              onClick={() => navigate("/teacher/courses")}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Create Course
            </button>
          </div>
        )}
      </div>

      {/* Recent Student Progress Section */}
      {studentProgress.length > 0 && (
        <div>
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Recent Student Progress
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider text-left">
                      Student Name
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider text-left">
                      Course
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider text-left">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {studentProgress.slice(0, 5).map((student, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150 group">
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm">
                            {student.name?.charAt(0).toUpperCase() || "S"}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {student.name}
                          </span>
                        </div>
                       </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-600 dark:text-gray-400 text-sm">
                        {student.courseTitle}
                       </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2">
                          <div className="w-full xs:w-32 sm:w-40 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(student.progress || 0)}`} 
                              style={{ width: `${student.progress || 0}%` }}
                            />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                            {student.progress || 0}%
                          </span>
                        </div>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;