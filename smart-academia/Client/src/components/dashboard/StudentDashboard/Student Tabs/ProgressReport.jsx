import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ProgressReport = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
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

  const fetchCourseDetails = async (courseId) => {
    try {
      const res = await fetch(`${API}/api/courses/${courseId}/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCourseDetails(data);
        setShowDetails(true);
      } else {
        alert(data.message || "Failed to load course details");
      }
    } catch {
      alert("Cannot connect to server");
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getGradeColor = (score) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 75) return "text-blue-600 dark:text-blue-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getGradeLetter = (score) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };

  const overallProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / enrolledCourses.length)
    : 0;

  const completedCourses = enrolledCourses.filter(c => c.isCompleted).length;
  const totalCredits = enrolledCourses.reduce((sum, c) => sum + (c.credits || 3), 0);
  const earnedCredits = enrolledCourses.filter(c => c.isCompleted).reduce((sum, c) => sum + (c.credits || 3), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 sm:py-24">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Loading progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Progress Report
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Track your academic progress and performance
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

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: "trending_up", label: "Overall Progress", value: `${overallProgress}%`, color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600" },
          { icon: "check_circle", label: "Courses Completed", value: `${completedCourses}/${enrolledCourses.length}`, color: "bg-green-100 dark:bg-green-900/30 text-green-600" },
          { icon: "school", label: "Credits Earned", value: `${earnedCredits}/${totalCredits}`, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
          { icon: "grade", label: "GPA", value: "3.65", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${stat.color} group-hover:scale-110 transition-transform duration-200`}>
                <span className="material-symbols-outlined text-xl sm:text-2xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Overall Academic Progress</h3>
          <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">{overallProgress}%</span>
        </div>
        <div className="h-2.5 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getProgressColor(overallProgress)} rounded-full transition-all duration-500`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          {overallProgress >= 80 ? "Excellent progress! Keep up the great work! 🎉" :
           overallProgress >= 60 ? "Good progress! You're on the right track! 👍" :
           overallProgress >= 40 ? "Keep pushing! You're making steady progress. 💪" :
           "Let's get started! Complete your first lesson to begin. 🚀"}
        </p>
      </div>

      {/* Courses Progress List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Course Progress Details</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Click on a course to view detailed progress</p>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {enrolledCourses.length > 0 ? (
            enrolledCourses.map((course) => (
              <div 
                key={course._id}
                onClick={() => fetchCourseDetails(course._id)}
                className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                      {course.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{course.code}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-lg sm:text-xl font-bold ${getGradeColor(course.progress || 0)}`}>
                        {course.progress || 0}%
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Grade: {getGradeLetter(course.progress || 0)}</p>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 text-base sm:text-lg">chevron_right</span>
                  </div>
                </div>
                <div className="h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getProgressColor(course.progress || 0)} rounded-full transition-all duration-500`}
                    style={{ width: `${course.progress || 0}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-3 text-[10px] sm:text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      {course.duration || "16 weeks"}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">school</span>
                      {course.credits || 3} credits
                    </span>
                  </div>
                  {course.isCompleted && (
                    <span className="text-[10px] sm:text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                      Completed
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 sm:py-12">
              <span className="material-symbols-outlined text-5xl sm:text-6xl text-gray-300 dark:text-gray-600 mb-4">import_contacts</span>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No enrolled courses</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Enroll in a course to see your progress</p>
              <button 
                onClick={() => navigate("/courses")}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Browse Courses
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Course Details Modal */}
      {showDetails && courseDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50" onClick={() => setShowDetails(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-5 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{courseDetails.title}</h2>
              <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-4 sm:p-5 space-y-4">
              {/* Course Info */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Overall Progress</p>
                  <p className="text-xl font-bold text-blue-600">{courseDetails.progress || 0}%</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Grade</p>
                  <p className={`text-xl font-bold ${getGradeColor(courseDetails.progress || 0)}`}>
                    {getGradeLetter(courseDetails.progress || 0)}
                  </p>
                </div>
              </div>

              {/* Lessons Progress */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base">Lessons Progress</h3>
                <div className="space-y-3">
                  {courseDetails.lessons?.map((lesson, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>{lesson.title}</span>
                        <span>{lesson.progress || 0}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${lesson.progress || 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quiz Scores */}
              {courseDetails.quizzes?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base">Quiz Scores</h3>
                  <div className="space-y-2">
                    {courseDetails.quizzes.map((quiz, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{quiz.title}</span>
                        <span className={`text-xs sm:text-sm font-medium ${getGradeColor(quiz.score)}`}>
                          {quiz.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Labs Completion */}
              {courseDetails.labs?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base">Labs Completion</h3>
                  <div className="space-y-2">
                    {courseDetails.labs.map((lab, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{lab.title}</span>
                        <span className={`text-xs sm:text-sm font-medium ${lab.completed ? "text-green-600" : "text-yellow-600"}`}>
                          {lab.completed ? "Completed" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressReport;