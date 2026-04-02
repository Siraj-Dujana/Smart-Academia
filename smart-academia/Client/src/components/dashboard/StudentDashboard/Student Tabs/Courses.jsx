import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CourseCard = ({ course, isEnrolled = true, onEnroll, onUnenroll }) => {
  const navigate = useNavigate();
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - ((course.progress || 0) / 100) * circumference;

  const getProgressColor = (p) => {
    if (p >= 80) return "stroke-blue-600 dark:stroke-blue-500";
    if (p >= 60) return "stroke-blue-500 dark:stroke-blue-400";
    if (p >= 40) return "stroke-blue-400 dark:stroke-blue-300";
    return "stroke-blue-300 dark:stroke-blue-200";
  };

  return (
    <div
      onClick={() => isEnrolled && navigate(`/lessons/${course._id}`)}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group h-full flex flex-col cursor-pointer active:scale-95 hover:-translate-y-1 select-none"
    >
      <div className="p-4 flex-1">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex items-center justify-center size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0 mt-1">
            <span className="material-symbols-outlined text-base text-blue-600 dark:text-blue-400">menu_book</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1 truncate group-hover:text-blue-600 transition-colors">
              {course.title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
              {course.code} · {course.teacher?.fullName || "Instructor"}
            </p>
          </div>
          {isEnrolled && (
            <div className="relative size-10 flex-shrink-0">
              <svg className="size-full" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="2"/>
                <circle cx="18" cy="18" r="16" fill="none"
                  className={getProgressColor(course.progress || 0)}
                  strokeWidth="2" strokeLinecap="round"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={progressOffset}
                  transform="rotate(-90 18 18)"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-900 dark:text-white">{course.progress || 0}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-6 rounded bg-blue-50 dark:bg-blue-900/20">
              <span className="material-symbols-outlined text-blue-600 text-xs">school</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Credits</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{course.credits || 3}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-6 rounded bg-blue-50 dark:bg-blue-900/20">
              <span className="material-symbols-outlined text-blue-600 text-xs">calendar_today</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Semester</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{course.semester || "Fall 2024"}</p>
            </div>
          </div>
        </div>

        {/* Description / next lesson */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <span className="material-symbols-outlined text-blue-600 text-xs">info</span>
          <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
            {course.description || "Learn fundamental concepts and skills"}
          </p>
        </div>
      </div>

      {/* Action button */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        {isEnrolled ? (
          <div className="flex gap-2">
            <button
              onClick={e => { e.stopPropagation(); navigate(`/lessons/${course._id}`); }}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all">
              Continue <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <button
              onClick={e => { e.stopPropagation(); onUnenroll && onUnenroll(course._id); }}
              className="px-3 py-2 rounded-lg text-sm border border-red-200 dark:border-red-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Unenroll">
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); onEnroll && onEnroll(course._id); }}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all">
            <span className="material-symbols-outlined text-sm">add</span>
            Enroll Now
          </button>
        )}
      </div>
    </div>
  );
};

const Courses = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("enrolled");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const fetchAllCourses = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Fetch enrolled courses and all published courses in parallel
      const [enrolledRes, publishedRes] = await Promise.all([
        fetch(`${API_URL}/api/courses/enrolled`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/courses/published`),
      ]);

      const enrolledData = await enrolledRes.json();
      const publishedData = await publishedRes.json();

      const enrolled = enrolledRes.ok ? enrolledData.courses : [];
      const published = publishedRes.ok ? publishedData.courses : [];

      setEnrolledCourses(enrolled);

      // Available = published courses that the student is NOT enrolled in
      const enrolledIds = enrolled.map(c => c._id);
      const available = published.filter(c => !enrolledIds.includes(c._id));
      setAvailableCourses(available);
    } catch {
      setError("Cannot connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const res = await fetch(`${API_URL}/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        fetchAllCourses(); // refresh both lists
      } else {
        alert(data.message);
      }
    } catch {
      alert("Cannot connect to server");
    }
  };

  const handleUnenroll = async (courseId) => {
    if (!window.confirm("Are you sure you want to unenroll from this course?")) return;
    try {
      const res = await fetch(`${API_URL}/api/courses/${courseId}/unenroll`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        fetchAllCourses();
      } else {
        alert(data.message);
      }
    } catch {
      alert("Cannot connect to server");
    }
  };

  const filteredEnrolled = enrolledCourses.filter(c =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailable = availableCourses.filter(c =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / enrolledCourses.length)
    : 0;

  const totalCredits = enrolledCourses.reduce((sum, c) => sum + (c.credits || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-gray-500 dark:text-gray-400">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Courses</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your course enrollments and track progress</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: "import_contacts", label: "Enrolled", value: enrolledCourses.length, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
          { icon: "trending_up", label: "Avg Progress", value: `${avgProgress}%`, color: "bg-green-100 dark:bg-green-900/30 text-green-600" },
          { icon: "school", label: "Total Credits", value: totalCredits, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
          { icon: "library_books", label: "Available", value: availableCourses.length, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center size-12 rounded-lg ${stat.color}`}>
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { key: "enrolled", label: `Enrolled (${enrolledCourses.length})`, icon: "check_circle" },
            { key: "available", label: `Available (${availableCourses.length})`, icon: "library_books" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === tab.key
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
              }`}>
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* Search */}
          <div className="relative mb-6">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input type="text" placeholder="Search courses..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
          </div>

          {/* Courses Grid */}
          {activeTab === "enrolled" ? (
            filteredEnrolled.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEnrolled.map(course => (
                  <CourseCard key={course._id} course={course} isEnrolled={true} onUnenroll={handleUnenroll}/>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">import_contacts</span>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2">No enrolled courses</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Browse available courses to get started</p>
                <button onClick={() => setActiveTab("available")}
                  className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  <span className="material-symbols-outlined text-base">library_books</span>
                  Browse Courses
                </button>
              </div>
            )
          ) : (
            filteredAvailable.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAvailable.map(course => (
                  <CourseCard key={course._id} course={course} isEnrolled={false} onEnroll={handleEnroll}/>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">library_books</span>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2">No courses available</h3>
                <p className="text-gray-500 dark:text-gray-400">Check back later when teachers publish new courses</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;