import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Monochrome palette — matches AdminDashboard / StudentDashboard shell theme.
// Red/green are kept only as true status colors (destructive action, completion).
const colors = {
  card: "#0f1629",
  border: "#1e293b",
  muted: "#64748b",
  text: "#e2e8f0",
  red: "#ef4444",
  green: "#22c55e",
};

// ── Mini Bar ──────────────────────────────────────────────────
const MiniBar = ({ value = 0, height = 6 }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height, background: "#1e293b" }}>
    <div
      className="h-full rounded-full bg-white"
      style={{
        width: `${Math.min(Math.max(value, 0), 100)}%`,
        boxShadow: "0 0 8px rgba(255,255,255,0.4)",
        transition: "width 1s cubic-bezier(.4,0,.2,1)"
      }}
    />
  </div>
);

const CourseCard = ({ course, isEnrolled = true, onEnroll, onUnenroll, loadingId }) => {
  const navigate = useNavigate();
  const progress = course.progress || 0;
  const isLoading = loadingId === course._id;

  const size = 52;
  const stroke = 4;
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(progress, 100) / 100) * circ;

  return (
    <div
      onClick={() => isEnrolled && !isLoading && navigate(`/lessons/${course._id}`)}
      className="rounded-2xl overflow-hidden transition-all duration-300 group border flex flex-col hover:-translate-y-1"
      style={{
        background: colors.card,
        borderColor: "rgba(255,255,255,0.1)",
        cursor: isEnrolled && !isLoading ? "pointer" : "default",
        opacity: isLoading ? 0.7 : 1,
      }}
    >
      <div className="p-5 flex-1">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm mb-0.5 truncate transition-colors duration-300">
              {course.title || "Untitled Course"}
            </h3>
            <p className="text-xs text-gray-500 truncate">{course.code || "N/A"} · {course.teacher?.fullName || "Instructor"}</p>
          </div>
          {isEnrolled && (
            <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
              <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
                {progress > 0 && (
                  <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ffffff" strokeWidth={stroke}
                    strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
                    style={{ transition: "stroke-dasharray 0.8s ease", filter: "drop-shadow(0 0 4px rgba(255,255,255,0.5))" }} />
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
            {/* <span className="material-symbols-outlined text-xs text-white/60">school</span> */}
            <span className="text-xs text-gray-300 font-medium">{course.credits || 3} credits</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#1e293b" }}>
            <span className="material-symbols-outlined text-xs text-white/60">calendar_today</span>
            <span className="text-xs text-gray-300 font-medium truncate">{course.semester || "Fall 2024"}</span>
          </div>
        </div>

        {/* Description */}
        <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <span className="material-symbols-outlined text-xs mt-0.5 text-white/60">info</span>
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
              className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: "rgba(255,255,255,0.08)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.18)" }}>
              Continue <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <button
              onClick={e => { e.stopPropagation(); onUnenroll && onUnenroll(course._id, course); }}
              disabled={isLoading}
              className="px-3 py-2 rounded-lg text-sm transition-all duration-300 hover:bg-white/5"
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
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            style={{ background: "rgba(255,255,255,0.08)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.18)" }}>
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
  const completedCredits = enrolledCourses.filter(c => (c.progress || 0) === 100).reduce((s, c) => s + (c.credits || 0), 0);

  // Every percentage below comes from the student's own live numbers —
  // never a hardcoded cap.
  const totalCourses = enrolledCourses.length + availableCourses.length;
  const enrolledPct = totalCourses > 0 ? Math.round((enrolledCourses.length / totalCourses) * 100) : 0;
  const availablePct = totalCourses > 0 ? Math.round((availableCourses.length / totalCourses) * 100) : 0;
  const creditsPct = totalCredits > 0 ? Math.round((completedCredits / totalCredits) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-24" style={{ background: "#0a0b10", minHeight: "100vh" }}>
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif" }}>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full animate-pulse bg-white" />
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Courses</p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">My Courses</h1>
      </div>

      {error && (
        <div className="p-4 rounded-xl flex items-center gap-3 transition-all duration-300" style={{ background: "#1a0a0a", border: "1px solid #ef444433" }}>
          <span className="material-symbols-outlined text-red-500">error</span>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Stats — icon-free, with live percentage bars */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Enrolled", value: enrolledCourses.length, percentage: enrolledPct },
          { label: "Avg Progress", value: `${avgProgress}%`, percentage: avgProgress },
          { label: "Total Credits", value: totalCredits, percentage: creditsPct },
          { label: "Available", value: availableCourses.length, percentage: availablePct },
        ].map((s, i) => (
          <div
            key={i}
            className="relative rounded-2xl p-5 flex flex-col gap-3 group overflow-hidden opacity-0 animate-fadeInUp transition-all duration-300 ease-out hover:-translate-y-1"
            style={{ background: colors.card, border: "1px solid rgba(255,255,255,0.1)", animationDelay: `${i * 90}ms`, animationFillMode: "forwards" }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />
            <div className="flex items-start justify-between">
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              <span className="text-xs font-bold text-white transition-all duration-300">{s.percentage}%</span>
            </div>
            <p className="text-3xl font-black text-white" style={{ textShadow: "0 0 20px rgba(255,255,255,0.25)" }}>{s.value}</p>
            <MiniBar value={s.percentage} />
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="rounded-2xl overflow-hidden transition-all duration-300" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
        <div className="flex" style={{ borderBottom: `1px solid ${colors.border}` }}>
          {[
            { key: "enrolled", label: `Enrolled (${enrolledCourses.length})` },
            { key: "available", label: `Available (${availableCourses.length})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex-1 px-6 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300"
              style={activeTab === tab.key ? { color: "#ffffff", borderBottom: "2px solid #ffffff", background: "rgba(255,255,255,0.04)" } : { color: colors.muted }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">search</span>
            <input type="text" placeholder="Search courses..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg transition-all duration-300 focus:ring-2 focus:ring-white/40 focus:border-transparent"
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
                  className="mt-4 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105"
                  style={{ background: "rgba(255,255,255,0.08)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.18)" }}>
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

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.4s ease-out both; }
      `}</style>
    </div>
  );
};

export default Courses;