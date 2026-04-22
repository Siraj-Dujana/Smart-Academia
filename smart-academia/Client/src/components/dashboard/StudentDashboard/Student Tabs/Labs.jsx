import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Labs = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [labs,           setLabs]           = useState([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [error,          setError]          = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses,        setCourses]        = useState([]);

  useEffect(() => { fetchEnrolledCourses(); }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const res  = await fetch(`${API}/api/courses/enrolled`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCourses(data.courses || []);
        if (data.courses?.length > 0) {
          setSelectedCourse(data.courses[0]._id);
          await fetchLabsForCourse(data.courses[0]._id);
        } else {
          setIsLoading(false);
        }
      } else {
        setError(data.message || "Failed to fetch courses");
        setIsLoading(false);
      }
    } catch {
      setError("Cannot connect to server");
      setIsLoading(false);
    }
  };

  const fetchLabsForCourse = async (courseId) => {
    setIsLoading(true);
    setError("");
    try {
      const lessonsRes = await fetch(`${API}/api/courses/${courseId}/lessons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const lessonsData = await lessonsRes.json();

      if (!lessonsRes.ok) {
        setError(lessonsData.message);
        setIsLoading(false);
        return;
      }

      const lessons = lessonsData.lessons || [];

      const labsPromises = lessons.map(async (lesson) => {
        try {
          const labRes  = await fetch(
            `${API}/api/courses/${courseId}/lessons/${lesson._id}/lab`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const labData = await labRes.json();

          if (labRes.ok && labData.lab) {
            // Fetch student's own submission status
            let submissionData = null;
            try {
              const subRes  = await fetch(
                `${API}/api/courses/${courseId}/lessons/${lesson._id}/lab/${labData.lab._id}/my-submission`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const subJson = await subRes.json();
              if (subRes.ok && subJson.submission) {
                submissionData = subJson.submission;
              }
            } catch { /* ignore */ }

            return {
              ...labData.lab,
              lessonTitle:  lesson.title,
              lessonOrder:  lesson.order,
              lessonId:     lesson._id,
              courseId,
              // Include full submission data so we can show marks/feedback
              submission:   submissionData,
              status:       submissionData?.status || null,
              marks:        submissionData?.marks ?? null,
            };
          }
          return null;
        } catch { return null; }
      });

      const results = await Promise.all(labsPromises);
      // Sort by lesson order
      setLabs(results.filter(Boolean).sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0)));
    } catch {
      setError("Cannot connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    setLabs([]);
    await fetchLabsForCourse(courseId);
  };

  const getStatusConfig = (status, dueDate) => {
    const isOverdue = dueDate && new Date(dueDate) < new Date();
    if (status === "graded")    return { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",   icon: "grade",        text: "Graded"     };
    if (status === "submitted") return { color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300", icon: "check_circle", text: "Submitted"  };
    if (isOverdue)              return { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",             icon: "warning",      text: "Overdue"    };
    return                             { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",         icon: "play_circle",  text: "Not started" };
  };

  const getDifficultyColor = (diff) => ({
    easy:   "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    hard:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  }[diff] || "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400");

  const labTypeIcon = {
    programming: "terminal",
    dld:         "schema",
    networking:  "hub",
    theory:      "description",
  };

  const stats = {
    total:     labs.length,
    completed: labs.filter(l => l.status === "submitted" || l.status === "graded").length,
    graded:    labs.filter(l => l.status === "graded").length,
    rate:      labs.length > 0
      ? Math.round((labs.filter(l => l.status === "submitted" || l.status === "graded").length / labs.length) * 100)
      : 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 sm:py-24">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Loading labs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Labs</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
          Practical lab assignments — submit your work for instructor review
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-600 text-sm">error</span>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Course selector */}
      {courses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Course</label>
          <select
            value={selectedCourse}
            onChange={e => handleCourseChange(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: "science",      label: "Total Labs",       value: stats.total,     color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600"    },
          { icon: "check_circle", label: "Submitted",        value: stats.completed, color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600" },
          { icon: "grade",        label: "Graded",           value: stats.graded,    color: "bg-green-100 dark:bg-green-900/30 text-green-600"   },
          { icon: "trending_up",  label: "Completion Rate",  value: `${stats.rate}%`, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all hover:scale-105 group">
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${stat.color} group-hover:scale-110 transition-transform`}>
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

      {/* Lab cards */}
      {labs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {labs.map((lab, idx) => {
            const sc = getStatusConfig(lab.status, lab.dueDate);
            const icon = labTypeIcon[lab.labType] || "science";
            const isOverdue = lab.dueDate && new Date(lab.dueDate) < new Date() && !lab.status;

            return (
              <div
                key={lab._id || idx}
                onClick={() => navigate(`/lessons/${lab.courseId}?lessonId=${lab.lessonId}`)}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer hover:-translate-y-1 flex flex-col"
              >
                {/* Card header */}
                <div className={`px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700 ${isOverdue ? "bg-red-50 dark:bg-red-900/10" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex-shrink-0">
                        <span className="material-symbols-outlined text-base">{icon}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate group-hover:text-blue-600 transition-colors">
                          {lab.title}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                          Lesson {lab.lessonOrder}: {lab.lessonTitle}
                        </p>
                      </div>
                    </div>
                    <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.color}`}>
                      <span className="material-symbols-outlined text-xs">{sc.icon}</span>
                      {sc.text}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4 flex-1">
                  {lab.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                      {lab.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs text-gray-500">
                    {lab.difficulty && (
                      <span className={`px-2 py-0.5 rounded-full font-medium ${getDifficultyColor(lab.difficulty)}`}>
                        {lab.difficulty}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">grade</span>
                      {lab.totalMarks || 100} pts
                    </span>
                    {lab.language && lab.labType === "programming" && (
                      <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-xs">code</span>
                        {lab.language}
                      </span>
                    )}
                    {lab.dueDate && (
                      <span className={`flex items-center gap-1 ${isOverdue ? "text-red-600 dark:text-red-400" : ""}`}>
                        <span className="material-symbols-outlined text-xs">{isOverdue ? "warning" : "schedule"}</span>
                        {isOverdue ? "Overdue: " : "Due: "}
                        {new Date(lab.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Graded result */}
                  {lab.status === "graded" && lab.marks !== null && (
                    <div className="mt-3 p-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-green-700 dark:text-green-300">Score</p>
                        <p className="text-sm font-bold text-green-700 dark:text-green-300">
                          {lab.marks} / {lab.totalMarks || 100}
                          <span className="text-xs font-normal ml-1">
                            ({Math.round((lab.marks / (lab.totalMarks || 100)) * 100)}%)
                          </span>
                        </p>
                      </div>
                      {lab.submission?.feedback && (
                        <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 italic">
                          "{lab.submission.feedback}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3">
                  <button className="w-full flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors group-hover:bg-blue-700">
                    <span className="material-symbols-outlined text-sm">
                      {lab.status === "graded" ? "visibility" : lab.status === "submitted" ? "edit" : "play_arrow"}
                    </span>
                    {lab.status === "graded"    ? "View Result"
                     : lab.status === "submitted" ? "Update Submission"
                     : "Start Lab"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="material-symbols-outlined text-5xl sm:text-6xl text-gray-300 dark:text-gray-600 mb-4">science</span>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No Labs Available</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {courses.length === 0 ? "Enroll in a course to access labs" : "No labs have been created for your courses yet"}
          </p>
          {courses.length === 0 && (
            <button
              onClick={() => navigate("/student/dashboard?tab=courses")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Browse Courses
            </button>
          )}
        </div>
      )}

      {/* Info banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-blue-600 text-lg">info</span>
          <div>
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">How labs work</h4>
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400">
              Click a lab to open it within its lesson. You can submit a text answer, code, or upload a PDF.
              Your instructor will review and provide marks with feedback. Completing a lab unlocks the next lesson.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Labs;