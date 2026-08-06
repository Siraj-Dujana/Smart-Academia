import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Mini Bar ──────────────────────────────────────────────────
const MiniBar = ({ value = 0, color = "#ffffff", height = 3 }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height, background: "#1e293b" }}>
    <div
      className="h-full rounded-full"
      style={{
        width: `${Math.min(value, 100)}%`,
        background: color,
        boxShadow: `0 0 8px ${color}66`,
        transition: "width 1s cubic-bezier(.4,0,.2,1)"
      }}
    />
  </div>
);

// ── Stat Card — icon-free, all cards identical, live percentage bar ───
const StatCard = ({ label, value, percentage, sub, delay = 0 }) => (
  <div
    className="relative rounded-2xl overflow-hidden p-4 flex flex-col gap-2 group opacity-0 animate-fadeInUp transition-all duration-300 ease-out hover:-translate-y-1"
    style={{ background: "#0f1629", border: "1px solid rgba(255,255,255,0.1)", animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
  >
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />
    <div className="flex items-start justify-between relative z-10">
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <span className="text-xs font-bold text-white transition-all duration-300">{percentage}%</span>
    </div>
    <p className="text-2xl font-black text-white tracking-tight relative z-10" style={{ textShadow: "0 0 20px rgba(255,255,255,0.25)" }}>{value}</p>
    {sub && <p className="text-[10px] text-gray-500 relative z-10">{sub}</p>}
    <div className="relative z-10"><MiniBar value={percentage} /></div>
  </div>
);

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
      <span className="material-symbols-outlined text-sm text-white">{icon}</span>
    </div>
    <h3 className="text-xs font-bold text-white tracking-wide uppercase">{title}</h3>
    <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.15), transparent)" }} />
  </div>
);

// ── Loading State ─────────────────────────────────────────────
const LoadingState = () => (
  <div className="flex items-center justify-center py-24">
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-5">
        <div className="absolute inset-0 rounded-full border-4 border-white/10" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-white/40 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
      </div>
      <p className="text-sm font-medium text-gray-500">Loading labs...</p>
    </div>
  </div>
);

const Labs = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [labs, setLabs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState([]);

  useEffect(() => { fetchEnrolledCourses(); }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const res = await fetch(`${API}/api/courses/enrolled`, {
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
          const labRes = await fetch(
            `${API}/api/courses/${courseId}/lessons/${lesson._id}/lab`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const labData = await labRes.json();

          if (labRes.ok && labData.lab) {
            let submissionData = null;
            try {
              const subRes = await fetch(
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
              lessonTitle: lesson.title,
              lessonOrder: lesson.order,
              lessonId: lesson._id,
              courseId,
              submission: submissionData,
              status: submissionData?.status || null,
              marks: submissionData?.marks ?? null,
              feedback: submissionData?.feedback || null,
            };
          }
          return null;
        } catch { return null; }
      });

      const results = await Promise.all(labsPromises);
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

  // Two-color semantic palette, matching the rest of the app: white = neutral/
  // in-progress, green = success (graded), red = danger (overdue). No amber.
  const getStatusConfig = (status, dueDate) => {
    const isOverdue = dueDate && new Date(dueDate) < new Date();
    if (status === "graded") return { color: "#22c55e", bg: "#22c55e22", border: "#22c55e", icon: "verified", text: "Graded" };
    if (status === "submitted") return { color: "#ffffff", bg: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.4)", icon: "pending", text: "Submitted" };
    if (isOverdue) return { color: "#ef4444", bg: "#ef444422", border: "#ef4444", icon: "warning", text: "Overdue" };
    return { color: "#ffffff", bg: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.4)", icon: "play_arrow", text: "Not Started" };
  };

  // easy = success (green), hard = danger (red), medium = neutral white —
  // same two-color-plus-neutral rule used everywhere else.
  const getDifficultyColor = (diff) => ({
    easy: { color: "#4ade80", bg: "#22c55e22" },
    medium: { color: "#e2e8f0", bg: "#1e293b" },
    hard: { color: "#f87171", bg: "#ef444422" },
  }[diff] || { color: "#94a3b8", bg: "#1e293b" });

  const labTypeIcon = {
    programming: "terminal",
    dld: "schema",
    networking: "hub",
    theory: "description",
  };

  const stats = {
    total: labs.length,
    submitted: labs.filter(l => l.status === "submitted" || l.status === "graded").length,
    notGraded: labs.filter(l => l.status === "submitted").length,
  };

  // Every percentage is a real share of your total labs — never a fixed cap.
  const pct = v => stats.total > 0 ? Math.round((v / stats.total) * 100) : 0;

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif" }}>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full animate-pulse bg-white" />
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Labs</p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Hands-on Learning
        </h1>
      </div>

      {/* Course Selector */}
      {courses.length > 0 && (
        <div className="rounded-2xl p-4 transition-all duration-300" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
          <SectionHeader icon="school" title="Select Course" />
          <select
            value={selectedCourse}
            onChange={e => handleCourseChange(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-white/40 focus:border-transparent cursor-pointer hover:bg-gray-800 transition-all duration-300 text-sm"
          >
            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
        </div>
      )}

      {/* Stats Cards — identical styling, live percentage bars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total Labs" value={stats.total} percentage={100} delay={0} />
        <StatCard label="Submitted" value={stats.submitted} percentage={pct(stats.submitted)} sub={`${stats.submitted}/${stats.total}`} delay={90} />
        <StatCard label="Pending Review" value={stats.notGraded} percentage={pct(stats.notGraded)} sub="Waiting for teacher" delay={180} />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-xl flex items-center gap-2 transition-all duration-300" style={{ background: "#1a0a0a", border: "1px solid #ef444433" }}>
          <span className="material-symbols-outlined text-red-500 text-sm">error</span>
          <p className="text-sm text-red-400 flex-1">{error}</p>
          <button onClick={() => setError("")} className="text-red-500 hover:text-red-400 transition-colors duration-300">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Lab Cards */}
      {labs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {labs.map((lab, idx) => {
            const sc = getStatusConfig(lab.status, lab.dueDate);
            const difficulty = getDifficultyColor(lab.difficulty);
            const icon = labTypeIcon[lab.labType] || "science";
            const scorePercent = lab.marks && lab.totalMarks ? (lab.marks / lab.totalMarks) * 100 : 0;

            return (
              <div
                key={lab._id || idx}
                onClick={() => navigate(`/lessons/${lab.courseId}?lessonId=${lab.lessonId}`)}
                className="group rounded-xl overflow-hidden transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1 flex flex-col"
                style={{ background: "#0f1629", border: `1px solid ${sc.color === "#ffffff" ? "rgba(255,255,255,0.1)" : sc.border + "33"}` }}
              >
                <div className="p-4 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)" }}>
                        <span className="material-symbols-outlined text-white text-base">{icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-white text-sm truncate transition-colors duration-300">
                          {lab.title}
                        </h3>
                        <p className="text-[10px] text-gray-500 truncate">
                          {lab.lessonTitle}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border flex-shrink-0" style={{ background: sc.bg, borderColor: sc.border, color: sc.color }}>
                      <span className="material-symbols-outlined text-xs">{sc.icon}</span>
                      {sc.text}
                    </span>
                  </div>

                  {/* Description */}
                  {lab.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed flex-shrink-0">
                      {lab.description}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3 flex-shrink-0">
                    {lab.difficulty && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: difficulty.bg, color: difficulty.color }}>
                        {lab.difficulty}
                      </span>
                    )}
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "#1e293b", color: "#94a3b8" }}>
                  
                      {lab.totalMarks || 100} pts
                    </span>
                    {lab.language && lab.labType === "programming" && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "#1e293b", color: "#94a3b8" }}>
                        <span className="material-symbols-outlined text-xs">code</span>
                        {lab.language}
                      </span>
                    )}
                    {lab.dueDate && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "#1e293b", color: "#94a3b8" }}>
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        Due: {new Date(lab.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Score Section for Graded Labs */}
                  {lab.status === "graded" && lab.marks !== null && (
                    <div className="mb-3 p-2 rounded-lg flex-shrink-0 transition-all duration-300" style={{ background: "#1e293b", border: "1px solid #22c55e33" }}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-semibold text-green-400">Score</span>
                        <span className="text-xs font-bold text-green-400">
                          {lab.marks}/{lab.totalMarks || 100}
                          <span className="text-[9px] ml-1 text-gray-400">
                            ({Math.round(scorePercent)}%)
                          </span>
                        </span>
                      </div>
                      <MiniBar value={scorePercent} color="#22c55e" height={2} />
                      {lab.feedback && (
                        <p className="text-[9px] text-gray-400 mt-1 italic line-clamp-2">
                          "{lab.feedback}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Submitted but not graded yet */}
                  {lab.status === "submitted" && !lab.marks && (
                    <div className="mb-3 p-2 rounded-lg flex-shrink-0 transition-all duration-300" style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.15)" }}>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-white/70 text-sm">pending</span>
                        <p className="text-[10px] text-gray-300">Waiting for instructor review</p>
                      </div>
                    </div>
                  )}

                  {/* Spacer to push button to bottom */}
                  <div className="flex-1"></div>

                  {/* Action Button - Always at bottom */}
                  <button 
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg transition-all duration-300 hover:opacity-90 mt-3 flex-shrink-0" 
                    style={{
                      background: lab.status === "graded" ? "#334155" : "rgba(255,255,255,0.1)",
                      color: "white",
                      border: lab.status === "graded" ? "none" : "1px solid rgba(255,255,255,0.2)",
                      cursor: lab.status === "graded" ? "not-allowed" : "pointer"
                    }}
                    disabled={lab.status === "graded"}
                    onClick={() => {
                      if (lab.status !== "graded") {
                        navigate(`/lessons/${lab.courseId}?lessonId=${lab.lessonId}`);
                      }
                    }}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {lab.status === "graded" ? "lock" : (lab.status === "submitted" ? "edit" : "play_arrow")}
                    </span>
                    {lab.status === "graded" ? "Graded - Read Only" : (lab.status === "submitted" ? "Update Submission" : "Start Lab")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl p-12 text-center transition-all duration-300" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
          <span className="material-symbols-outlined text-6xl text-gray-700 mb-4 block">science</span>
          <p className="text-gray-400 font-semibold">No Labs Available</p>
          <p className="text-sm text-gray-600 mt-1">
            {courses.length === 0 ? "Enroll in a course to access labs" : "No labs have been created for your courses yet"}
          </p>
          {courses.length === 0 && (
            <button
              onClick={() => navigate("/student/dashboard?tab=courses")}
              className="mt-4 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105"
              style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              Browse Courses
            </button>
          )}
        </div>
      )}

      {/* Info Banner */}
      <div className="rounded-xl p-4 transition-all duration-300" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <span className="material-symbols-outlined text-sm text-white">info</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white mb-1">How labs work</h4>
            <p className="text-xs text-gray-400">
              Click a lab to open it within its lesson. You can submit text, code, or upload a PDF.
              Your instructor will review and provide marks with feedback.
            </p>
          </div>
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

export default Labs;