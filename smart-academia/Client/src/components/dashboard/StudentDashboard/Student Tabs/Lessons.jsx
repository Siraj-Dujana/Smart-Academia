import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Lessons = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchCourseAndLessons();
  }, [courseId]);

  const fetchCourseAndLessons = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Get course details + lessons with progress
      const [courseRes, lessonsRes] = await Promise.all([
        fetch(`${API}/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/api/courses/${courseId}/lessons`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const courseData = await courseRes.json();
      const lessonsData = await lessonsRes.json();

      if (!courseRes.ok) {
        setError(courseData.message || "Course not found");
        return;
      }

      setCourse(courseData.course);

      const fetchedLessons = lessonsRes.ok ? lessonsData.lessons : [];
      setLessons(fetchedLessons);

      // Auto-select first unlocked lesson
      const firstUnlocked = fetchedLessons.find(l => !l.isLocked);
      if (firstUnlocked) setActiveLesson(firstUnlocked);

    } catch {
      setError("Cannot connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!activeLesson || activeLesson.isCompleted) return;
    setIsCompleting(true);
    try {
      const res = await fetch(`${API}/api/courses/lessons/${activeLesson._id}/complete`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }

      setSuccessMsg(`Lesson completed! Course progress: ${data.progress}%`);
      setTimeout(() => setSuccessMsg(""), 3000);

      // Refresh lessons to update lock/unlock status
      await fetchCourseAndLessons();
    } catch {
      setError("Cannot connect to server");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSelectLesson = (lesson) => {
    if (lesson.isLocked) return;
    setActiveLesson(lesson);
    setError("");
    setSuccessMsg("");
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case "video": return "play_circle";
      case "flowchart": return "account_tree";
      default: return "article";
    }
  };

  const getFormatColor = (format) => {
    switch (format) {
      case "video": return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
      case "flowchart": return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      default: return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
    }
  };

  const getFormatLabel = (format) => {
    switch (format) {
      case "video": return "Video Lesson";
      case "flowchart": return "Visual Diagram";
      default: return "Reading";
    }
  };

  const calculateProgress = () => {
    if (lessons.length === 0) return 0;
    const completed = lessons.filter(l => l.isCompleted).length;
    return Math.round((completed / lessons.length) * 100);
  };

  // Render lesson content based on format
  const renderContent = (lesson) => {
    if (!lesson.content && !lesson.videoUrl) {
      return (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">article</span>
          <p className="text-gray-500 dark:text-gray-400 mt-3">
            No content added yet for this lesson.
          </p>
          <p className="text-sm text-gray-400 mt-1">Teacher will add content soon.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Video content */}
        {lesson.format === "video" && lesson.videoUrl && (
          <div className="rounded-xl overflow-hidden bg-black">
            <video controls className="w-full max-h-96" src={lesson.videoUrl}>
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Text / HTML content */}
        {lesson.content && (
          <div
            className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
          />
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-gray-500 dark:text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-red-300 mb-4">error</span>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{error}</h3>
          <button onClick={() => navigate("/student/dashboard")}
            className="mt-4 px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors text-sm">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const completedCount = lessons.filter(l => l.isCompleted).length;
  const unlockedCount = lessons.filter(l => !l.isLocked).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">

      {/* Top bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/student/dashboard")}
              className="flex items-center justify-center size-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">arrow_back</span>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full flex-shrink-0">
                  {course?.code}
                </span>
                <h1 className="text-base font-bold text-gray-900 dark:text-white truncate">
                  {course?.title}
                </h1>
              </div>
              <p className="text-xs text-gray-500">{course?.teacher?.fullName}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-gray-500">{completedCount}/{lessons.length} lessons</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{progress}%</p>
            </div>
            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}/>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex h-[calc(100vh-57px)]">

        {/* Sidebar — lesson list */}
        <aside className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Course Lessons</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {unlockedCount} unlocked · {completedCount} completed
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {lessons.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">menu_book</span>
                <p className="text-sm text-gray-500 mt-2">No lessons yet</p>
              </div>
            ) : (
              lessons.map((lesson, index) => (
                <div
                  key={lesson._id}
                  onClick={() => handleSelectLesson(lesson)}
                  className={`p-3 rounded-xl border transition-all duration-200 ${
                    lesson.isLocked
                      ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed"
                      : activeLesson?._id === lesson._id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 cursor-pointer"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  }`}>
                  <div className="flex items-center gap-3">
                    {/* Format icon */}
                    <div className={`flex items-center justify-center size-9 rounded-lg flex-shrink-0 ${getFormatColor(lesson.format)}`}>
                      <span className="material-symbols-outlined text-sm">
                        {lesson.isLocked ? "lock" : getFormatIcon(lesson.format)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs text-gray-400">Lesson {lesson.order}</span>
                        {lesson.isCompleted && (
                          <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {lesson.title}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">{lesson.duration}</span>
                        {!lesson.isLocked && !lesson.isCompleted && (
                          <div className="h-1 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${lesson.progress || 0}%` }}/>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          {activeLesson ? (
            <div className="p-6 max-w-4xl mx-auto">

              {/* Success/Error banners */}
              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                  <p className="text-sm text-green-700 dark:text-green-300">{successMsg}</p>
                </div>
              )}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-600 text-lg">error</span>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* Lesson header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getFormatColor(activeLesson.format)}`}>
                    {getFormatLabel(activeLesson.format)}
                  </span>
                  <span className="text-xs text-gray-500">Lesson {activeLesson.order} · {activeLesson.duration}</span>
                  {activeLesson.isCompleted && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                      ✓ Completed
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {activeLesson.title}
                </h2>
                {activeLesson.description && (
                  <p className="text-gray-600 dark:text-gray-400 mt-2">{activeLesson.description}</p>
                )}
              </div>

              {/* Lesson content */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
                {renderContent(activeLesson)}
              </div>

              {/* Navigation + complete button */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => {
                    const prev = lessons.find(l => l.order === activeLesson.order - 1);
                    if (prev && !prev.isLocked) handleSelectLesson(prev);
                  }}
                  disabled={activeLesson.order === 1}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <span className="material-symbols-outlined">chevron_left</span>
                  Previous
                </button>

                {/* Complete button */}
                {!activeLesson.isCompleted ? (
                  <button onClick={handleCompleteLesson} disabled={isCompleting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {isCompleting ? (
                      <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg> Saving...</>
                    ) : (
                      <><span className="material-symbols-outlined text-sm">check</span>
                      Mark as Complete</>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Completed
                  </div>
                )}

                <button
                  onClick={() => {
                    const next = lessons.find(l => l.order === activeLesson.order + 1);
                    if (next && !next.isLocked) handleSelectLesson(next);
                  }}
                  disabled={
                    activeLesson.order === lessons.length ||
                    lessons.find(l => l.order === activeLesson.order + 1)?.isLocked
                  }
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Next
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>

              {/* Locked next lesson hint */}
              {activeLesson.order < lessons.length &&
               lessons.find(l => l.order === activeLesson.order + 1)?.isLocked && (
                <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">lock</span>
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        Next lesson is locked
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                        Complete this lesson to unlock the next one.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">menu_book</span>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2">
                  {lessons.length === 0 ? "No lessons yet" : "Select a lesson"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {lessons.length === 0
                    ? "Your teacher hasn't added any lessons yet"
                    : "Choose a lesson from the sidebar to start learning"}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Lessons;