import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Mini Bar ──────────────────────────────────────────────────
const MiniBar = ({ value = 0, color = "#6366f1", height = 3 }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height, background: "#1e293b" }}>
    <div
      className="h-full rounded-full"
      style={{
        width: `${Math.min(value, 100)}%`,
        background: `linear-gradient(90deg, ${color}cc, ${color})`,
        boxShadow: `0 0 8px ${color}66`,
        transition: "width 1s cubic-bezier(.4,0,.2,1)"
      }}
    />
  </div>
);

// ── Stat Glow Card ────────────────────────────────────────────
const GlowCard = ({ icon, label, value, color, sub }) => (
  <div className="relative rounded-2xl overflow-hidden p-4 flex flex-col gap-2 group" style={{ background: "#0f1629", border: `1px solid ${color}33` }}>
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}15 0%, transparent 70%)` }} />
    <div className="flex items-start justify-between">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
        <span className="material-symbols-outlined text-lg" style={{ color }}>{icon}</span>
      </div>
      {sub && <span className="text-[10px] text-gray-500 font-medium px-2 py-0.5 rounded-full" style={{ background: "#1e293b" }}>{sub}</span>}
    </div>
    <div>
      <p className="text-2xl font-black text-white tracking-tight" style={{ textShadow: `0 0 20px ${color}66` }}>{value}</p>
      <p className="text-[10px] text-gray-400 font-medium mt-0.5">{label}</p>
    </div>
    <MiniBar value={typeof value === "string" && value.endsWith("%") ? parseFloat(value) : 75} color={color} />
  </div>
);

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ icon, title, color = "#6366f1" }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
      <span className="material-symbols-outlined text-sm" style={{ color }}>{icon}</span>
    </div>
    <h3 className="text-xs font-bold text-white tracking-wide uppercase">{title}</h3>
    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}44, transparent)` }} />
  </div>
);

// ── Loading State ─────────────────────────────────────────────
const LoadingState = () => (
  <div className="flex items-center justify-center py-24">
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-5">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-900" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
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

  const getStatusConfig = (status, dueDate) => {
    const isOverdue = dueDate && new Date(dueDate) < new Date();
    if (status === "graded") return { color: "#22c55e", bg: "#22c55e22", border: "#22c55e", icon: "verified", text: "Graded" };
    if (status === "submitted") return { color: "#f59e0b", bg: "#f59e0b22", border: "#f59e0b", icon: "pending", text: "Submitted" };
    if (isOverdue) return { color: "#ef4444", bg: "#ef444422", border: "#ef4444", icon: "warning", text: "Overdue" };
    return { color: "#6366f1", bg: "#6366f122", border: "#6366f1", icon: "play_arrow", text: "Not Started" };
  };

  const getDifficultyColor = (diff) => ({
    easy: { color: "#4ade80", bg: "#22c55e22" },
    medium: { color: "#fbbf24", bg: "#f59e0b22" },
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
    completed: labs.filter(l => l.status === "submitted" || l.status === "graded").length,
    graded: labs.filter(l => l.status === "graded").length,
    rate: labs.length > 0
      ? Math.round((labs.filter(l => l.status === "submitted" || l.status === "graded").length / labs.length) * 100)
      : 0,
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif" }}>



      {/* Course Selector */}
      {courses.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
          <SectionHeader icon="school" title="Select Course" color="#6366f1" />
          <select
            value={selectedCourse}
            onChange={e => handleCourseChange(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer hover:bg-gray-800 transition-colors text-sm"
          >
            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <GlowCard icon="science" label="Total Labs" value={stats.total} color="#6366f1" />
        <GlowCard icon="check_circle" label="Submitted" value={stats.completed} color="#f59e0b" sub={`${stats.completed}/${stats.total}`} />
        <GlowCard icon="verified" label="Graded" value={stats.graded} color="#22c55e" />
        <GlowCard icon="trending_up" label="Completion Rate" value={`${stats.rate}%`} color="#a855f7" />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: "#1a0a0a", border: "1px solid #ef444433" }}>
          <span className="material-symbols-outlined text-red-500 text-sm">error</span>
          <p className="text-sm text-red-400 flex-1">{error}</p>
          <button onClick={() => setError("")} className="text-red-500 hover:text-red-400">
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
        className="group rounded-xl overflow-hidden transition-all duration-300 cursor-pointer hover:-translate-y-1 flex flex-col"
        style={{ background: "#0f1629", border: `1px solid ${sc.border}33` }}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
                <span className="material-symbols-outlined text-white text-base">{icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-white text-sm truncate group-hover:text-indigo-400 transition-colors">
                  {lab.title}
                </h3>
                <p className="text-[10px] text-gray-500 truncate">
                  {lab.lessonTitle}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border flex-shrink-0`} style={{ background: sc.bg, borderColor: sc.border, color: sc.color }}>
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
              <span className="material-symbols-outlined text-xs">grade</span>
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
            <div className="mb-3 p-2 rounded-lg flex-shrink-0" style={{ background: "#1e293b", border: "1px solid #22c55e33" }}>
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
            <div className="mb-3 p-2 rounded-lg flex-shrink-0" style={{ background: "#1e293b", border: "1px solid #f59e0b33" }}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-sm">pending</span>
                <p className="text-[10px] text-amber-400">Waiting for instructor review</p>
              </div>
            </div>
          )}

          {/* Spacer to push button to bottom */}
          <div className="flex-1"></div>

          {/* Action Button - Always at bottom */}
          <button className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg transition-all hover:opacity-90 mt-3 flex-shrink-0" style={{
            background: lab.status === "graded" ? "#22c55e" : lab.status === "submitted" ? "#f59e0b" : "linear-gradient(135deg, #6366f1, #818cf8)",
            color: "white"
          }}>
            <span className="material-symbols-outlined text-sm">
              {lab.status === "graded" ? "visibility" : lab.status === "submitted" ? "edit" : "play_arrow"}
            </span>
            {lab.status === "graded" ? "View Results" : lab.status === "submitted" ? "Update Submission" : "Start Lab"}
          </button>
        </div>
      </div>
    );
  })}
</div>
      ) : (
        <div className="rounded-2xl p-12 text-center" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
          <span className="material-symbols-outlined text-6xl text-gray-700 mb-4 block">science</span>
          <p className="text-gray-400 font-semibold">No Labs Available</p>
          <p className="text-sm text-gray-600 mt-1">
            {courses.length === 0 ? "Enroll in a course to access labs" : "No labs have been created for your courses yet"}
          </p>
          {courses.length === 0 && (
            <button
              onClick={() => navigate("/student/dashboard?tab=courses")}
              className="mt-4 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)", color: "white" }}
            >
              Browse Courses
            </button>
          )}
        </div>
      )}

      {/* Info Banner */}
      <div className="rounded-xl p-4" style={{ background: "#0f1629", border: "1px solid #6366f133" }}>
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
            <span className="material-symbols-outlined text-sm" style={{ color: "#6366f1" }}>info</span>
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
    </div>
  );
};

export default Labs;