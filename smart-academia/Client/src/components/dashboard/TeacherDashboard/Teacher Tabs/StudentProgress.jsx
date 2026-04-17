import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const StudentProgress = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseStats, setCourseStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) fetchCourseStats(selectedCourse);
  }, [selectedCourse]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/courses/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.courses?.length > 0) {
        setCourses(data.courses);
        setSelectedCourse(data.courses[0]._id);
      } else {
        setIsLoading(false);
      }
    } catch {
      setError("Cannot connect to server");
      setIsLoading(false);
    }
  };

  const fetchCourseStats = async (courseId) => {
    setIsLoading(true);
    try {
      // Use course data directly — we have enrolledCount and lesson info
      const course = courses.find((c) => c._id === courseId);
      if (course) {
        setCourseStats({
          title: course.title,
          code: course.code,
          enrolledCount: course.enrolledCount || 0,
          totalLessons: course.totalLessons || 0,
          totalQuizzes: course.totalQuizzes || 0,
          totalLabs: course.totalLabs || 0,
          isPublished: course.isPublished,
          department: course.department,
          credits: course.credits,
          semester: course.semester,
        });
      }
    } catch {
      setError("Failed to load course stats");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCourseObj = courses.find((c) => c._id === selectedCourse);

  // Aggregate stats across all courses
  const totalEnrolled = courses.reduce(
    (sum, c) => sum + (c.enrolledCount || 0),
    0
  );
  const totalLessons = courses.reduce(
    (sum, c) => sum + (c.totalLessons || 0),
    0
  );
  const publishedCourses = courses.filter((c) => c.isPublished).length;
  const avgEnrollment =
    courses.length > 0 ? Math.round(totalEnrolled / courses.length) : 0;

  const filteredCourses = courses.filter(
    (c) =>
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Student Progress
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Track enrollment and content across your courses
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <span className="material-symbols-outlined text-base">error</span>
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError("")}
            className="text-red-400 hover:text-red-600"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            icon: "groups",
            label: "Total Enrolled",
            value: totalEnrolled,
            color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
          },
          {
            icon: "school",
            label: "Total Courses",
            value: courses.length,
            color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
          },
          {
            icon: "visibility",
            label: "Published",
            value: publishedCourses,
            color: "bg-green-100 dark:bg-green-900/30 text-green-600",
          },
          {
            icon: "trending_up",
            label: "Avg Enrollment",
            value: avgEnrollment,
            color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${stat.color} group-hover:scale-110 transition-transform duration-200`}
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl">
                  {stat.icon}
                </span>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  {stat.label}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? "..." : stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Search courses by title or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Courses Table */}
      {isLoading && courses.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="material-symbols-outlined text-5xl sm:text-6xl text-gray-300 dark:text-gray-600">
            groups
          </span>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mt-3 sm:mt-4 mb-2">
            No courses yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create a course to start tracking student enrollment
          </p>
          <button
            onClick={() => navigate("/teacher/dashboard?tab=courses")}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Create Course
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                    Department
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Content
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Status
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCourses.map((course) => {
                  const maxEnrolled = Math.max(
                    1,
                    ...courses.map((c) => c.enrolledCount || 0)
                  );
                  const barWidth = Math.round(
                    ((course.enrolledCount || 0) / maxEnrolled) * 100
                  );
                  return (
                    <tr
                      key={course._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150 group"
                    >
                      {/* Course name */}
                      <td className="px-3 sm:px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {course.title}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            {course.code}
                          </p>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-3 sm:px-4 py-3 text-gray-600 dark:text-gray-400 text-sm hidden sm:table-cell">
                        {course.department || "N/A"}
                      </td>

                      {/* Enrolled count + bar */}
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">
                            {course.enrolledCount || 0}
                          </span>
                          <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Content stats */}
                      <td className="px-3 sm:px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-2 flex-wrap">
                          {(course.totalLessons || 0) > 0 && (
                            <span className="flex items-center gap-0.5 text-xs text-gray-500">
                              <span className="material-symbols-outlined text-xs text-blue-500">
                                menu_book
                              </span>
                              {course.totalLessons}
                            </span>
                          )}
                          {(course.totalQuizzes || 0) > 0 && (
                            <span className="flex items-center gap-0.5 text-xs text-gray-500">
                              <span className="material-symbols-outlined text-xs text-amber-500">
                                quiz
                              </span>
                              {course.totalQuizzes}
                            </span>
                          )}
                          {(course.totalLabs || 0) > 0 && (
                            <span className="flex items-center gap-0.5 text-xs text-gray-500">
                              <span className="material-symbols-outlined text-xs text-purple-500">
                                science
                              </span>
                              {course.totalLabs}
                            </span>
                          )}
                          {!course.totalLessons &&
                            !course.totalQuizzes &&
                            !course.totalLabs && (
                              <span className="text-xs text-gray-400">
                                No content yet
                              </span>
                            )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 sm:px-4 py-3 hidden lg:table-cell">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            course.isPublished
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {course.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() =>
                              navigate("/teacher/dashboard?tab=lessons")
                            }
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all hover:scale-110"
                            title="Manage lessons"
                          >
                            <span className="material-symbols-outlined text-sm">
                              menu_book
                            </span>
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                "/teacher/dashboard?tab=lab-submissions"
                              )
                            }
                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-all hover:scale-110"
                            title="View lab submissions"
                          >
                            <span className="material-symbols-outlined text-sm">
                              grading
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredCourses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">
                        search_off
                      </span>
                      <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                        No courses match your search
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-blue-600 text-lg">
            info
          </span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
              About student tracking
            </h4>
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400">
              This tab shows enrollment counts per course. To view and grade
              individual lab submissions, go to{" "}
              <button
                onClick={() =>
                  navigate("/teacher/dashboard?tab=lab-submissions")
                }
                className="underline font-medium"
              >
                Grade Labs
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;