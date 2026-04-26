import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const colors = {
  card: "#0f1629",
  border: "#1e293b",
  accent: "#6366f1",
  accent2: "#a855f7",
  amber: "#f59e0b",
  green: "#22c55e",
  red: "#ef4444",
  muted: "#64748b",
  text: "#e2e8f0",
};

const CourseCard = ({ course, isEnrolled = true, onEnroll, onUnenroll, loadingId }) => {
  const navigate = useNavigate();
  const progress = course.progress || 0;
  const isLoading = loadingId === course._id;
  const gradients = ["#6366f1", "#a855f7", "#f59e0b", "#22c55e"];
  const color = gradients[Math.floor(Math.random() * gradients.length)];

  const size = 52;
  const stroke = 4;
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(progress, 100) / 100) * circ;

  return (
    <div
      onClick={() => isEnrolled && !isLoading && navigate(`/lessons/${course._id}`)}
      className="rounded-2xl overflow-hidden transition-all duration-300 group border flex flex-col"
      style={{
        background: colors.card,
        borderColor: isEnrolled ? `${color}33` : colors.border,
        cursor: isEnrolled && !isLoading ? "pointer" : "default",
        opacity: isLoading ? 0.7 : 1,
      }}
    >
      <div className="p-5 flex-1">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
            <span className="material-symbols-outlined text-lg" style={{ color }}>menu_book</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm mb-0.5 truncate group-hover:text-indigo-300 transition-colors">
              {course.title || "Untitled Course"}
            </h3>
            <p className="text-xs text-gray-500 truncate">{course.code || "N/A"} · {course.teacher?.fullName || "Instructor"}</p>
          </div>
          {isEnrolled && (
            <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
              <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
                {progress > 0 && (
                  <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                    strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
                    style={{ transition: "stroke-dasharray 0.8s ease", filter: `drop-shadow(0 0 4px ${color}88)` }} />
                )}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-black text-white">{progress}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex gap-3 mb-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#1e293b" }}>
            <span className="material-symbols-outlined text-xs text-indigo-400">school</span>
            <span className="text-xs text-gray-300 font-medium">{course.credits || 3} credits</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#1e293b" }}>
            <span className="material-symbols-outlined text-xs text-amber-400">calendar_today</span>
            <span className="text-xs text-gray-300 font-medium truncate">{course.semester || "Fall 2024"}</span>
          </div>
        </div>

        {/* Description */}
        <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: `${color}11`, border: `1px solid ${color}22` }}>
          <span className="material-symbols-outlined text-xs mt-0.5" style={{ color }}>info</span>
          <p className="text-xs text-gray-400 line-clamp-2">
            {course.description && course.description !== "asdf" ? course.description : "Learn fundamental concepts and develop practical skills in this comprehensive course."}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t px-5 py-3" style={{ borderColor: "#1e293b" }}>
        {isEnrolled ? (
          <div className="flex gap-2">
            <button
              onClick={e => { e.stopPropagation(); navigate(`/lessons/${course._id}`); }}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2 rounded-lg transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
              Continue <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <button
              onClick={e => { e.stopPropagation(); onUnenroll && onUnenroll(course._id, course); }}
              disabled={isLoading}
              className="px-3 py-2 rounded-lg text-sm transition-all hover:bg-white/5"
              style={{ color: colors.red, border: `1px solid ${colors.red}33` }}
              title="Unenroll">
              {isLoading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              ) : (
                <span className="material-symbols-outlined text-sm">logout</span>
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); onEnroll && onEnroll(course._id, course); }}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2 rounded-lg transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: `${colors.accent}22`, color: "#818cf8", border: `1px solid ${colors.accent}44` }}>
            {isLoading ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Enrolling...</>
            ) : (
              <><span className="material-symbols-outlined text-sm">add</span>Enroll Now</>
            )}
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
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => { fetchAllCourses(); }, []);

  const fetchAllCourses = async () => {
    setIsLoading(true);
    try {
      const [enrolledRes, publishedRes] = await Promise.all([
        fetch(`${API_URL}/api/courses/enrolled`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/courses/published`),
      ]);
      const enrolledData = await enrolledRes.json();
      const publishedData = await publishedRes.json();
      const enrolled = enrolledRes.ok ? enrolledData.courses : [];
      const published = publishedRes.ok ? publishedData.courses : [];
      setEnrolledCourses(enrolled);
      setAvailableCourses(published.filter(c => !enrolled.find(e => e._id === c._id)));
    } catch {
      setError("Cannot connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (courseId, courseData) => {
    setLoadingId(courseId);
    try {
      const res = await fetch(`${API_URL}/api/courses/${courseId}/enroll`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAvailableCourses(prev => prev.filter(c => c._id !== courseId));
        setEnrolledCourses(prev => [...prev, { ...courseData, progress: 0 }]);
      }
    } catch { /* ignore */ }
    finally { setLoadingId(null); }
  };

  const handleUnenroll = async (courseId, courseData) => {
    if (!window.confirm("Are you sure?")) return;
    setLoadingId(courseId);
    try {
      const res = await fetch(`${API_URL}/api/courses/${courseId}/unenroll`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setEnrolledCourses(prev => prev.filter(c => c._id !== courseId));
        setAvailableCourses(prev => [...prev, { ...courseData, progress: 0 }]);
      }
    } catch { /* ignore */ }
    finally { setLoadingId(null); }
  };

  const filteredEnrolled = enrolledCourses.filter(c => c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || c.code?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredAvailable = availableCourses.filter(c => c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || c.code?.toLowerCase().includes(searchTerm.toLowerCase()));
  const avgProgress = enrolledCourses.length > 0 ? Math.round(enrolledCourses.reduce((s, c) => s + (c.progress || 0), 0) / enrolledCourses.length) : 0;
  const totalCredits = enrolledCourses.reduce((s, c) => s + (c.credits || 0), 0);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24" style={{ background: "#0a0b10", minHeight: "100vh" }}>
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-3 border-indigo-900" />
          <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-indigo-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif" }}>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: colors.accent }} />
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#818cf8" }}>Courses</p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">My Courses</h1>
      </div>

      {error && (
        <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: "#1a0a0a", border: "1px solid #ef444433" }}>
          <span className="material-symbols-outlined text-red-500">error</span>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: "import_contacts", label: "Enrolled", value: enrolledCourses.length, color: colors.accent },
          { icon: "trending_up", label: "Avg Progress", value: `${avgProgress}%`, color: colors.green },
          { icon: "school", label: "Total Credits", value: totalCredits, color: colors.accent2 },
          { icon: "library_books", label: "Available", value: availableCourses.length, color: colors.amber },
        ].map((s, i) => (
          <div key={i} className="relative rounded-2xl p-5 flex flex-col gap-3 group overflow-hidden" style={{ background: colors.card, border: `1px solid ${s.color}33` }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(ellipse at 50% 0%, ${s.color}15 0%, transparent 70%)` }} />
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${s.color}22`, border: `1px solid ${s.color}44` }}>
              <span className="material-symbols-outlined text-xl" style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-3xl font-black text-white" style={{ textShadow: `0 0 20px ${s.color}66` }}>{s.value}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="rounded-2xl overflow-hidden" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
        <div className="flex" style={{ borderBottom: `1px solid ${colors.border}` }}>
          {[
            { key: "enrolled", label: `Enrolled (${enrolledCourses.length})`, icon: "check_circle" },
            { key: "available", label: `Available (${availableCourses.length})`, icon: "library_books" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex-1 px-6 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={activeTab === tab.key ? { color: "#818cf8", borderBottom: `2px solid ${colors.accent}`, background: `${colors.accent}08` } : { color: colors.muted }}>
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">search</span>
            <input type="text" placeholder="Search courses..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg transition-all"
              style={{ background: "#0a0f1e", border: `1px solid ${colors.border}`, color: colors.text, outline: "none" }}
            />
          </div>

          {activeTab === "enrolled" ? (
            filteredEnrolled.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEnrolled.map(c => <CourseCard key={c._id} course={c} isEnrolled onUnenroll={handleUnenroll} loadingId={loadingId} />)}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl text-gray-700 mb-3 block">import_contacts</span>
                <p className="text-gray-400 font-semibold">No enrolled courses</p>
                <button onClick={() => setActiveTab("available")}
                  className="mt-4 px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                  style={{ background: `${colors.accent}22`, color: "#818cf8", border: `1px solid ${colors.accent}44` }}>
                  Browse Courses
                </button>
              </div>
            )
          ) : (
            filteredAvailable.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAvailable.map(c => <CourseCard key={c._id} course={c} isEnrolled={false} onEnroll={handleEnroll} loadingId={loadingId} />)}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl text-gray-700 mb-3 block">library_books</span>
                <p className="text-gray-400 font-semibold">No courses available</p>
                <p className="text-sm text-gray-600 mt-1">Check back later</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;