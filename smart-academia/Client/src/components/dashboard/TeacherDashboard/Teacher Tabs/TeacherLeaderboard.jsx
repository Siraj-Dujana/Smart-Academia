// frontend/src/components/Teacher/TeacherLeaderboard.jsx
import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const C = {
  bg: "#070d1a", surface: "#0f1629", surface2: "#0a0f1e",
  border: "#1e293b", border2: "#334155",
  accent: "#6366f1", accent2: "#a855f7", amber: "#f59e0b",
  green: "#22c55e", red: "#ef4444", cyan: "#14b8a6",
  text: "#f1f5f9", textDim: "#94a3b8", textFaint: "#64748b",
  indigoLight: "#818cf8", greenLight: "#4ade80",
  amberLight: "#fbbf24", redLight: "#f87171", purpleLight: "#c084fc",
};

const Spinner = ({ size = "md" }) => {
  const dim = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-16 h-16" : "w-12 h-12";
  return (
    <div className={`relative ${dim} mx-auto`}>
      <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: C.border }} />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
      <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" 
        style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
    </div>
  );
};

const MiniBar = ({ value = 0, color = C.accent, height = 5 }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height, background: C.border }}>
    <div className="h-full rounded-full transition-all duration-700"
      style={{ width: `${Math.min(value, 100)}%`, background: `linear-gradient(90deg, ${color}bb, ${color})` }} />
  </div>
);

const TeacherLeaderboard = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchLeaderboard();
    }
  }, [selectedCourseId]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/teacher/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.courses?.length) {
        setCourses(data.courses);
        setSelectedCourseId(data.courses[0]._id);
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/leaderboard/course/${selectedCourseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setLeaderboard(data.leaderboard || []);
      } else {
        setError(data.message || "Failed to load leaderboard");
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return { icon: "emoji_events", color: C.amber, bg: `${C.amber}22`, label: "1st" };
    if (rank === 2) return { icon: "military_tech", color: "#94a3b8", bg: `${C.textFaint}22`, label: "2nd" };
    if (rank === 3) return { icon: "workspace_premium", color: "#cd7f32", bg: `${C.textDim}22`, label: "3rd" };
    return { icon: "tag", color: C.textFaint, bg: C.surface2, label: `#${rank}` };
  };

  const selectedCourse = courses.find(c => c._id === selectedCourseId);

  if (loadingCourses) {
    return (
      <div className="py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-16" style={{ background: C.bg }}>
        <span className="material-symbols-outlined text-6xl text-gray-700 mb-4 block">school</span>
        <p className="font-bold text-white text-lg">No courses yet</p>
        <p className="text-sm text-gray-500">Create a course to see student rankings</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif", background: C.bg, minHeight: "100vh" }}>
      
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", border: `1px solid ${C.border}` }}>
        <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: C.accent }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: C.accent2 }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.accent }} />
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Teacher · Course Rankings</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Course Rankings</h1>
          <p className="text-sm text-gray-400 mt-1">Track student performance and progress in your courses</p>
        </div>
      </div>

      {/* Course Selector */}
      <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>
          Select Course
        </label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full sm:w-96 px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
          style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
        >
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.title} ({c.enrolledCount || 0} students)</option>
          ))}
        </select>
      </div>

      {/* Leaderboard Display */}
      {loading ? (
        <div className="py-20"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="p-5 rounded-2xl flex items-center gap-3" style={{ background: "#1a0a0a", border: "1px solid #ef444433" }}>
          <span className="material-symbols-outlined text-red-500 text-2xl">error</span>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <span className="material-symbols-outlined text-6xl text-gray-700 mb-4 block">groups</span>
          <p className="font-bold text-white text-lg">No students enrolled yet</p>
          <p className="text-sm text-gray-500">Share the course code to get students enrolled</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: C.surface2, borderBottom: `1px solid ${C.border}` }}>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textFaint }}>Rank</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textFaint }}>Student</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textFaint }}>Progress</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textFaint }}>Points</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textFaint }}>Level</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textFaint }}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: C.border }}>
                {leaderboard.map((entry) => {
                  const rankBadge = getRankBadge(entry.rank);
                  const progressColor = entry.progress >= 70 ? C.green : entry.progress >= 40 ? C.amber : C.red;
                  return (
                    <tr key={entry.student?._id || entry._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg"
                          style={{ background: rankBadge.bg, color: rankBadge.color }}>
                          <span className="material-symbols-outlined text-sm">{rankBadge.icon}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {entry.student?.avatar ? (
                            <div className="w-8 h-8 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${entry.student.avatar})` }} />
                          ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }}>
                              {entry.student?.fullName?.charAt(0) || "S"}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-white">{entry.student?.fullName}</p>
                            <p className="text-[10px] text-gray-500">{entry.student?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-32">
                          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{entry.progress || 0}%</span>
                          </div>
                          <MiniBar value={entry.progress || 0} color={progressColor} height={4} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-lg font-bold text-white">{entry.student?.points || 0}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-amber-400">Lvl {entry.student?.level || 1}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {entry.isCompleted ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" 
                            style={{ background: `${C.green}22`, color: C.greenLight, border: `1px solid ${C.green}44` }}>
                            Completed
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" 
                            style={{ background: `${C.amber}22`, color: C.amberLight, border: `1px solid ${C.amber}44` }}>
                            In Progress
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 text-xs border-t" style={{ color: C.textFaint, borderColor: C.border }}>
            Showing top {leaderboard.length} students
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherLeaderboard;