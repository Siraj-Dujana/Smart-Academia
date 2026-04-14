import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const StudentProgress = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentProgress();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API}/api/courses/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.courses?.length > 0) {
        setCourses(data.courses);
        setSelectedCourse(data.courses[0]._id);
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentProgress = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/courses/${selectedCourse}/students/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStudents(data.students || []);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    try {
      const res = await fetch(`${API}/api/students/${studentId}/progress/${selectedCourse}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStudentDetails(data);
        setShowStudentModal(true);
      }
    } catch {
      setError("Cannot connect to server");
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "inactive":
        return "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-400";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    if (sortBy === "progress") {
      aVal = a.progress || 0;
      bVal = b.progress || 0;
    }
    if (sortBy === "name") {
      aVal = a.name || "";
      bVal = b.name || "";
    }
    if (sortBy === "completion") {
      aVal = a.completedLessons || 0;
      bVal = b.completedLessons || 0;
    }
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const stats = {
    totalStudents: students.length,
    avgProgress: students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + (s.progress || 0), 0) / students.length)
      : 0,
    completedCourses: students.filter(s => s.progress === 100).length,
    activeStudents: students.filter(s => s.status === "active").length,
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span className="material-symbols-outlined text-sm">unfold_more</span>;
    return sortOrder === "asc" 
      ? <span className="material-symbols-outlined text-sm">expand_less</span>
      : <span className="material-symbols-outlined text-sm">expand_more</span>;
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Student Progress
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Track and analyze student performance across your courses
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <span className="material-symbols-outlined text-base">error</span>
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Course Selector */}
      {courses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Course
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full sm:w-96 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.title} ({course.code})</option>
            ))}
          </select>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: "groups", label: "Total Students", value: stats.totalStudents, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
          { icon: "trending_up", label: "Avg Progress", value: `${stats.avgProgress}%`, color: "bg-green-100 dark:bg-green-900/30 text-green-600" },
          { icon: "check_circle", label: "Completed", value: stats.completedCourses, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
          { icon: "person", label: "Active Students", value: stats.activeStudents, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600" },
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

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">search</span>
            <input
              type="text"
              placeholder="Search by name, email, or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Students Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="material-symbols-outlined text-5xl sm:text-6xl text-gray-300 dark:text-gray-600">groups</span>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mt-3 sm:mt-4 mb-2">No students enrolled</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">This course has no enrolled students yet</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-900" onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-1">
                      Student
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                    Student ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-900" onClick={() => handleSort("progress")}>
                    <div className="flex items-center gap-1">
                      Progress
                      <SortIcon field="progress" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150 group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm flex-shrink-0">
                          {student.name?.charAt(0).toUpperCase() || "S"}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {student.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm hidden sm:table-cell">
                      {student.studentId || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm hidden md:table-cell truncate max-w-[200px]">
                      {student.email}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2">
                        <div className="w-full xs:w-24 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(student.status)}`}>
                        {student.status || "active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button
                          onClick={() => fetchStudentDetails(student._id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {showStudentModal && studentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50" onClick={() => setShowStudentModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg">
                    {studentDetails.name?.charAt(0).toUpperCase() || "S"}
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{studentDetails.name}</h2>
                    <p className="text-sm text-gray-500">Student ID: {studentDetails.studentId || "N/A"}</p>
                  </div>
                </div>
                <button onClick={() => setShowStudentModal(false)} className="text-gray-400 hover:text-gray-600">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-5 space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Overall Progress", value: `${studentDetails.progress || 0}%`, color: "text-green-600" },
                  { label: "Completed Lessons", value: `${studentDetails.completedLessons || 0}/${studentDetails.totalLessons || 0}`, color: "text-blue-600" },
                  { label: "Quiz Avg Score", value: `${studentDetails.avgQuizScore || 0}%`, color: "text-purple-600" },
                  { label: "Labs Submitted", value: `${studentDetails.submittedLabs || 0}/${studentDetails.totalLabs || 0}`, color: "text-amber-600" },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Lessons Progress */}
              {studentDetails.lessons?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Lessons Progress</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {studentDetails.lessons.map((lesson, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <div className="flex flex-wrap justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{lesson.title}</span>
                          <span className="text-xs text-gray-500">{lesson.progress || 0}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${lesson.progress || 0}%` }} />
                        </div>
                        {lesson.completed && (
                          <span className="text-xs text-green-600 mt-1 inline-block">✓ Completed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz Results */}
              {studentDetails.quizzes?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Quiz Results</h3>
                  <div className="space-y-2">
                    {studentDetails.quizzes.map((quiz, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{quiz.title}</span>
                        <span className={`text-sm font-medium ${quiz.score >= 70 ? "text-green-600" : "text-red-600"}`}>
                          {quiz.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Labs */}
              {studentDetails.labs?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Lab Submissions</h3>
                  <div className="space-y-2">
                    {studentDetails.labs.map((lab, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{lab.title}</span>
                        <span className={`text-sm font-medium ${lab.submitted ? "text-green-600" : "text-yellow-600"}`}>
                          {lab.submitted ? "Submitted" : "Pending"}
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

export default StudentProgress;