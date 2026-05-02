import React, { useState, useEffect, useRef, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const apiFetch = (url, opts = {}) => {
  const token = localStorage.getItem("token");
  return fetch(`${API}${url}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
};

// ── Color palette (matches existing dark theme) ───────────────
const C = {
  bg: "#070d1a", surface: "#0f1629", surface2: "#0a0f1e",
  border: "#1e293b", border2: "#334155",
  accent: "#6366f1", accent2: "#a855f7", amber: "#f59e0b",
  green: "#22c55e", red: "#ef4444", cyan: "#14b8a6",
  text: "#f1f5f9", textDim: "#94a3b8", textFaint: "#64748b",
  indigoLight: "#818cf8", greenLight: "#4ade80",
  amberLight: "#fbbf24", redLight: "#f87171", purpleLight: "#c084fc",
};

// ── Mini Progress Bar ─────────────────────────────────────────
const MiniBar = ({ value = 0, color = C.accent, height = 5, animated = true }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height, background: C.border }}>
    <div
      className="h-full rounded-full"
      style={{
        width: `${Math.min(Math.max(value, 0), 100)}%`,
        background: `linear-gradient(90deg, ${color}bb, ${color})`,
        boxShadow: `0 0 8px ${color}55`,
        transition: animated ? "width 1s cubic-bezier(.4,0,.2,1)" : "none",
      }}
    />
  </div>
);

// ── Ring Progress ─────────────────────────────────────────────
const Ring = ({ value = 0, size = 64, stroke = 5, color = C.accent }) => {
  const r    = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(value, 100) / 100) * circ;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 1s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 5px ${color}88)` }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-black text-white">{value}%</span>
      </div>
    </div>
  );
};

// ── Stat Glow Card ────────────────────────────────────────────
const GlowCard = ({ icon, label, value, color, sub }) => (
  <div className="relative rounded-2xl overflow-hidden p-5 flex flex-col gap-2 group"
    style={{ background: C.surface, border: `1px solid ${color}33` }}>
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}18 0%, transparent 70%)` }} />
    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
      style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
      <span className="material-symbols-outlined text-lg" style={{ color }}>{icon}</span>
    </div>
    <p className="text-2xl font-black text-white tracking-tight relative z-10"
      style={{ textShadow: `0 0 20px ${color}55` }}>{value ?? "—"}</p>
    <p className="text-xs font-medium relative z-10" style={{ color: C.textDim }}>{label}</p>
    {sub && <p className="text-[10px] relative z-10" style={{ color: C.textFaint }}>{sub}</p>}
  </div>
);

// ── Loading Spinner ───────────────────────────────────────────
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

// ── Bar Chart (pure SVG) ──────────────────────────────────────
const BarChart = ({ data, maxVal = 100, color = C.accent, label = "%" }) => {
  const bars = data.length;
  const w = 100 / bars;
  const maxH = 60;
  return (
    <div className="flex items-end gap-1.5 w-full" style={{ height: maxH + 24 }}>
      {data.map((item, i) => {
        const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
        const barH = (pct / 100) * maxH;
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1 group relative">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10
              bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none"
              style={{ border: `1px solid ${C.border2}` }}>
              {item.label}: {item.value}{label}
            </div>
            <div className="w-full rounded-t-lg transition-all duration-700 relative overflow-hidden"
              style={{ height: Math.max(barH, 2), background: `linear-gradient(180deg, ${color}, ${color}88)`, minHeight: 2,
                boxShadow: `0 0 12px ${color}44` }}>
              <div className="absolute inset-0 opacity-30"
                style={{ background: "linear-gradient(180deg, white 0%, transparent 100%)" }} />
            </div>
            <p className="text-[9px] text-center truncate w-full" style={{ color: C.textFaint }}>
              {item.label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

// ── Simple Donut Chart ────────────────────────────────────────
const DonutChart = ({ segments, size = 120, thickness = 18 }) => {
  const r = (size - thickness * 2) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      {segments.map((seg, i) => {
        const pct  = total > 0 ? seg.value / total : 0;
        const dash = pct * circ;
        const gap  = circ - dash;
        const el = (
          <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
            stroke={seg.color} strokeWidth={thickness} strokeLinecap="butt"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            style={{ filter: `drop-shadow(0 0 4px ${seg.color}66)` }} />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
};

// ── Score Badge ───────────────────────────────────────────────
const ScoreBadge = ({ score }) => {
  if (score == null) return <span className="text-xs" style={{ color: C.textFaint }}>—</span>;
  const { label, color, bg } =
    score >= 90 ? { label: "A+", color: C.greenLight, bg: "#22c55e22" } :
    score >= 80 ? { label: "A",  color: C.greenLight, bg: "#22c55e22" } :
    score >= 70 ? { label: "B",  color: "#60a5fa",    bg: "#3b82f622" } :
    score >= 60 ? { label: "C",  color: C.amberLight, bg: "#f59e0b22" } :
                  { label: "F",  color: C.redLight,   bg: "#ef444422" };
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black"
      style={{ background: bg, color, border: `1px solid ${color}44` }}>
      {label} · {score}%
    </span>
  );
};

// ── Student Detail Modal ──────────────────────────────────────
const StudentDetailModal = ({ student, course, onClose }) => {
  if (!student) return null;
  const { stats, lessons, enrollment } = student;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
      onClick={onClose}>
      <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white"
              style={{ background: "rgba(255,255,255,0.2)" }}>
              {student.student.avatar
                ? <img src={student.student.avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
                : student.student.fullName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-black text-white">{student.student.fullName}</h2>
              <p className="text-sm text-indigo-200">{student.student.email}</p>
              {student.student.studentId && (
                <p className="text-xs text-indigo-300 mt-0.5">ID: {student.student.studentId}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Stats strip */}
       {/* Stats strip - 5 columns instead of 4 */}
<div className="grid grid-cols-5 gap-px flex-shrink-0" style={{ background: C.border }}>
  {[
    { label: "Progress",  value: `${stats.progressPct}%`,    color: C.accent },
    { label: "Credits",   value: stats.creditsEarned?.toFixed(1) || "0", color: C.green },
    { label: "Lessons",   value: `${stats.completedLessons}/${stats.totalLessons}`, color: C.cyan },
    { label: "Quiz Avg",  value: stats.avgQuizScore != null ? `${stats.avgQuizScore}%` : "—", color: C.amber },
    { label: "Lab Avg",   value: stats.avgLabScore  != null ? `${stats.avgLabScore}%`  : "—", color: C.accent2 },
  ].map((s, i) => (
    <div key={i} className="flex flex-col items-center py-4" style={{ background: C.surface2 }}>
      <p className="text-lg font-black text-white">{s.value}</p>
      <p className="text-[10px] font-medium" style={{ color: C.textFaint }}>{s.label}</p>
    </div>
  ))}
</div>

        {/* Lesson breakdown */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.textFaint }}>
            Lesson Breakdown
          </p>
          {lessons.map((lesson, i) => {
            const statusColor = lesson.isCompleted ? C.green : lesson.viewed ? C.accent : C.border2;
            const icon = lesson.isCompleted ? "task_alt" : lesson.viewed ? "visibility" : "lock";
            return (
              <div key={lesson._id} className="rounded-xl p-4"
                style={{ background: C.surface2, border: `1px solid ${statusColor}33` }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${statusColor}22`, border: `1px solid ${statusColor}44` }}>
                    <span className="material-symbols-outlined text-sm" style={{ color: statusColor }}>{icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {i + 1}. {lesson.title}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {lesson.quiz && (
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-xs" style={{ color: C.amberLight }}>quiz</span>
                          <span className="text-[10px]" style={{ color: lesson.quiz.passed ? C.greenLight : C.textFaint }}>
                            {lesson.quiz.passed ? `Passed (${lesson.quiz.bestScore}%)` :
                             lesson.quiz.bestScore != null ? `${lesson.quiz.bestScore}% (${lesson.quiz.totalAttempts}/${lesson.quiz.maxAttempts} att.)` :
                             "Not attempted"}
                          </span>
                        </div>
                      )}
                      {lesson.lab && (
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-xs" style={{ color: C.purpleLight }}>science</span>
                          <span className="text-[10px]" style={{ color:
                            lesson.lab.status === "graded" ? C.greenLight :
                            lesson.lab.submitted ? C.amberLight : C.textFaint }}>
                            {lesson.lab.status === "graded"
                              ? `${lesson.lab.marks}/${lesson.lab.totalMarks} pts`
                              : lesson.lab.submitted ? "Submitted" : "Not submitted"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Main StudentProgress Component ────────────────────────────
const TeacherAnalytics = () => {
  const [courses, setCourses]       = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [sortBy, setSortBy]         = useState("progress"); // progress | name | quiz | lab | score
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewMode, setViewMode]     = useState("cards"); // cards | table

  // Fetch teacher's courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch progress when course changes
  useEffect(() => {
    if (selectedCourse) fetchProgress(selectedCourse._id);
  }, [selectedCourse?._id]);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const res  = await apiFetch("/api/teacher/courses");
      const data = await res.json();
      if (res.ok && data.courses?.length > 0) {
        setCourses(data.courses);
        setSelectedCourse(data.courses[0]);
      } else if (res.ok) {
        setCourses([]);
      } else {
        setError(data.message || "Failed to load courses");
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchProgress = async (courseId) => {
    setLoadingProgress(true);
    setError("");
    setProgressData(null);
    try {
      const res  = await apiFetch(`/api/teacher/courses/${courseId}/progress`);
      const data = await res.json();
      if (res.ok) setProgressData(data);
      else setError(data.message || "Failed to load progress");
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoadingProgress(false);
    }
  };

  // Filter + sort students
  const filteredStudents = progressData?.students
    ? progressData.students
        .filter(s =>
          s.student.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          s.student.email?.toLowerCase().includes(search.toLowerCase()) ||
          s.student.studentId?.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
          if (sortBy === "progress") return b.enrollment.progress - a.enrollment.progress;
          if (sortBy === "name")     return a.student.fullName?.localeCompare(b.student.fullName);
          if (sortBy === "quiz")     return (b.stats.avgQuizScore ?? -1) - (a.stats.avgQuizScore ?? -1);
          if (sortBy === "lab")      return (b.stats.avgLabScore ?? -1) - (a.stats.avgLabScore ?? -1);
          if (sortBy === "score")    return b.stats.weightedScore - a.stats.weightedScore;
          return 0;
        })
    : [];

  const summary = progressData?.summary;
  const donutSegments = summary ? [
    { label: "Completed",   value: summary.completedCount,  color: C.green },
    { label: "In Progress", value: summary.inProgressCount, color: C.accent },
    { label: "Not Started", value: summary.notStartedCount, color: C.border2 },
  ] : [];

  if (loadingCourses) return (
    <div className="flex items-center justify-center py-24">
      <Spinner size="lg" />
    </div>
  );

  if (courses.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="material-symbols-outlined text-6xl mb-4" style={{ color: C.border2 }}>school</span>
      <p className="font-bold text-white text-lg">No courses yet</p>
      <p className="text-sm mt-1" style={{ color: C.textDim }}>Create a course to start tracking student progress</p>
    </div>
  );

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif" }}>
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.accent }} />
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.indigoLight }}>
            Teacher Dashboard
          </p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Student Progress</h1>
      </div>

      {/* ── Course Selector ── */}
      <div className="rounded-2xl p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: C.textFaint }}>
          Select Course
        </p>
        <div className="flex flex-wrap gap-2">
          {courses.map(c => (
            <button key={c._id}
              onClick={() => setSelectedCourse(c)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: selectedCourse?._id === c._id ? `${C.accent}22` : "transparent",
                color: selectedCourse?._id === c._id ? C.indigoLight : C.textDim,
                border: `1px solid ${selectedCourse?._id === c._id ? C.accent + "55" : C.border}`,
              }}>
              <span className="material-symbols-outlined text-sm">menu_book</span>
              <span className="truncate max-w-[160px]">{c.title}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ background: C.border, color: C.textFaint }}>
                {c.enrolledCount || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl flex items-center gap-3"
          style={{ background: "#1a0a0a", border: "1px solid #ef444433" }}>
          <span className="material-symbols-outlined text-red-400">error</span>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {loadingProgress ? (
        <div className="flex items-center justify-center py-20"><Spinner /></div>
      ) : progressData ? (
        <>
      {/* ── Summary Cards ── */}
<div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
  <GlowCard icon="group" label="Enrolled Students" value={summary.totalStudents}
    color={C.accent} sub={`${summary.completedCount} completed`} />
  <GlowCard icon="trending_up" label="Avg Progress" value={`${summary.avgProgress}%`}
    color={C.amber} sub={`${summary.inProgressCount} in progress`} />
  <GlowCard icon="workspace_premium" label="Credits Earned" 
    value={summary.totalCreditsEarned?.toFixed(1) || "0"}
    color={C.green} sub={`of ${summary.totalCredits || 0} total credits`} />
  <GlowCard icon="quiz" label="Avg Quiz Score"
    value={summary.courseAvgQuiz != null ? `${summary.courseAvgQuiz}%` : "N/A"}
    color={C.cyan} sub={`${summary.totalQuizzes} quizzes`} />
  <GlowCard icon="science" label="Avg Lab Score"
    value={summary.courseAvgLab != null ? `${summary.courseAvgLab}%` : "N/A"}
    color={C.accent2} sub={`${summary.totalLabs} labs`} />
</div>

          {/* ── Charts Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Completion Donut */}
            <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-base" style={{ color: C.accent }}>donut_large</span>
                Completion Status
              </p>
              <div className="flex items-center gap-5">
                <div className="flex-shrink-0">
                  <DonutChart segments={donutSegments} size={110} thickness={16} />
                </div>
                <div className="flex-1 space-y-2">
                  {donutSegments.map(seg => (
                    <div key={seg.label} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                        <span className="text-xs" style={{ color: C.textDim }}>{seg.label}</span>
                      </div>
                      <span className="text-xs font-bold text-white">{seg.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Distribution */}
            <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-base" style={{ color: C.amber }}>bar_chart</span>
                Progress Distribution
              </p>
              <BarChart
                data={Object.entries(summary.progressBuckets).map(([label, value]) => ({ label, value }))}
                maxVal={Math.max(...Object.values(summary.progressBuckets), 1)}
                color={C.amber}
                label=""
              />
            </div>

            {/* Top Performers */}
            <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-base" style={{ color: C.green }}>emoji_events</span>
                Top Performers
              </p>
              <div className="space-y-2">
                {[...progressData.students]
                  .sort((a, b) => b.stats.weightedScore - a.stats.weightedScore)
                  .slice(0, 4)
                  .map((s, i) => (
                    <div key={s.student._id} className="flex items-center gap-2.5 group cursor-pointer"
                      onClick={() => setSelectedStudent(s)}>
                      <span className={`text-xs font-black w-5 flex-shrink-0 ${
                        i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-gray-600"
                      }`}>#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">
                          {s.student.fullName}
                        </p>
                        <MiniBar value={s.stats.weightedScore} color={C.green} height={3} />
                      </div>
                      <span className="text-xs font-bold flex-shrink-0" style={{ color: C.greenLight }}>
                        {s.stats.weightedScore}%
                      </span>
                    </div>
                  ))}
                {progressData.students.length === 0 && (
                  <p className="text-xs text-center py-4" style={{ color: C.textFaint }}>No students enrolled</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Student List Controls ── */}
          {progressData.students.length > 0 && (
            <div className="rounded-xl p-4 flex flex-col sm:flex-row gap-3"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: C.textFaint }}>search</span>
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search students by name, email, ID..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg outline-none transition-all"
                  style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                />
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg outline-none cursor-pointer"
                  style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}>
                  <option value="progress">Sort: Progress</option>
                  <option value="score">Sort: Score</option>
                  <option value="quiz">Sort: Quiz Avg</option>
                  <option value="lab">Sort: Lab Avg</option>
                  <option value="name">Sort: Name</option>
                </select>
                <button onClick={() => setViewMode(v => v === "cards" ? "table" : "cards")}
                  className="px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: C.surface2, color: C.textDim, border: `1px solid ${C.border}` }}>
                  <span className="material-symbols-outlined text-sm">
                    {viewMode === "cards" ? "table_rows" : "grid_view"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ── Student Cards / Table ── */}
          {progressData.students.length === 0 ? (
            <div className="rounded-2xl p-12 text-center"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <span className="material-symbols-outlined text-5xl mb-4 block" style={{ color: C.border2 }}>group</span>
              <p className="font-semibold text-white">No students enrolled yet</p>
              <p className="text-sm mt-1" style={{ color: C.textDim }}>Share the course code for students to join</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="rounded-2xl p-12 text-center"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <span className="material-symbols-outlined text-5xl mb-4 block" style={{ color: C.border2 }}>search_off</span>
              <p className="font-semibold text-white">No students match your search</p>
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredStudents.map(s => {
                const prog = s.enrollment.progress;
                const progressColor =
                  prog === 100 ? C.green :
                  prog >= 60   ? C.accent :
                  prog >= 30   ? C.amber  : C.red;
                return (
                  <div key={s.student._id}
                    onClick={() => setSelectedStudent(s)}
                    className="rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group border hover:-translate-y-1"
                    style={{ background: C.surface, borderColor: `${progressColor}33` }}>
                    {/* Card header */}
                    <div className="p-4 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-black text-white"
                        style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }}>
                        {s.student.avatar
                          ? <img src={s.student.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                          : s.student.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate group-hover:text-indigo-400 transition-colors">
                          {s.student.fullName}
                        </p>
                        <p className="text-xs truncate" style={{ color: C.textFaint }}>
                          {s.student.studentId ? `ID: ${s.student.studentId}` : s.student.email}
                        </p>
                      </div>
                      <Ring value={prog} size={52} stroke={4} color={progressColor} />
                    </div>

                    {/* Progress bar */}
                    <div className="px-4 pb-3">
                      <MiniBar value={prog} color={progressColor} height={4} />
                    </div>

                  {/* Stats row - change to 4 columns */}
<div className="grid grid-cols-4 gap-px" style={{ background: C.border }}>
  {[
    { label: "Lessons", value: `${s.stats.completedLessons}/${s.stats.totalLessons}`, color: C.cyan },
    { label: "Credits", value: s.stats.creditsEarned?.toFixed(1) || "0", color: C.green },
    { label: "Quiz",    value: s.stats.avgQuizScore != null ? `${s.stats.avgQuizScore}%` : "—", color: C.amber },
    { label: "Lab",     value: s.stats.avgLabScore  != null ? `${s.stats.avgLabScore}%`  : "—", color: C.accent2 },
  ].map(stat => (
    <div key={stat.label} className="flex flex-col items-center py-3"
      style={{ background: C.surface2 }}>
      <p className="text-sm font-black" style={{ color: stat.color }}>{stat.value}</p>
      <p className="text-[9px] font-medium" style={{ color: C.textFaint }}>{stat.label}</p>
    </div>
  ))}
</div>

                    {/* Footer */}
                    <div className="px-4 py-3 flex items-center justify-between"
                      style={{ borderTop: `1px solid ${C.border}` }}>
                      <ScoreBadge score={s.stats.weightedScore} />
                      <div className="flex items-center gap-1.5">
                        {s.enrollment.isCompleted && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                            style={{ background: "#22c55e22", color: C.greenLight, border: "1px solid #22c55e44" }}>
                            Done ✓
                          </span>
                        )}
                        <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-0.5"
                          style={{ color: C.textFaint }}>chevron_right</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Table view
            <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
  <tr style={{ background: C.surface2, borderBottom: `1px solid ${C.border}` }}>
    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textFaint }}>Student</th>
    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textFaint }}>Progress</th>
    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textFaint }}>Lessons</th>
    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textFaint }}>Credits</th>
    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textFaint }}>Quiz Avg</th>
    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textFaint }}>Lab Avg</th>
    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textFaint }}>Score</th>
    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textFaint }}>Status</th>
  </tr>
</thead>
                  <tbody className="divide-y" style={{ borderColor: C.border }}>
                    {filteredStudents.map(s => (
                     <tr key={s.student._id}
  onClick={() => setSelectedStudent(s)}
  className="cursor-pointer transition-colors hover:bg-white/5 group">
  <td className="px-4 py-3">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-black text-white"
        style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }}>
        {s.student.fullName?.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
          {s.student.fullName}
        </p>
        <p className="text-[10px]" style={{ color: C.textFaint }}>
          {s.student.studentId || s.student.email}
        </p>
      </div>
    </div>
  </td>
  <td className="px-4 py-3">
    <div className="flex items-center gap-2 min-w-[100px]">
      <MiniBar value={s.enrollment.progress} height={4}
        color={s.enrollment.progress === 100 ? C.green :
               s.enrollment.progress >= 50 ? C.accent : C.amber} />
      <span className="text-xs font-bold text-white flex-shrink-0">
        {s.enrollment.progress}%
      </span>
    </div>
  </td>
  <td className="px-4 py-3">
    <span className="text-sm font-semibold text-white">
      {s.stats.completedLessons}<span style={{ color: C.textFaint }}>/{s.stats.totalLessons}</span>
    </span>
  </td>
  {/* ADD THIS CREDITS COLUMN */}
  <td className="px-4 py-3">
    <span className="text-sm font-semibold text-green-400">
      {s.stats.creditsEarned?.toFixed(1) || "0"}
    </span>
    <span className="text-[10px]" style={{ color: C.textFaint }}>
      /{s.stats.totalCredits || 0}
    </span>
  </td>
  <td className="px-4 py-3">
    <ScoreBadge score={s.stats.avgQuizScore} />
  </td>
  <td className="px-4 py-3">
    <ScoreBadge score={s.stats.avgLabScore} />
  </td>
  <td className="px-4 py-3">
    <ScoreBadge score={s.stats.weightedScore} />
  </td>
  <td className="px-4 py-3">
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold`}
      style={s.enrollment.isCompleted
        ? { background: "#22c55e22", color: C.greenLight, border: "1px solid #22c55e44" }
        : s.enrollment.progress > 0
        ? { background: "#6366f122", color: C.indigoLight, border: "1px solid #6366f144" }
        : { background: C.border, color: C.textFaint, border: `1px solid ${C.border2}` }
      }>
      {s.enrollment.isCompleted ? "Completed" :
       s.enrollment.progress > 0 ? "In Progress" : "Not Started"}
    </span>
  </td>
</tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 text-xs" style={{ color: C.textFaint, borderTop: `1px solid ${C.border}` }}>
                Showing {filteredStudents.length} of {progressData.students.length} students
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          course={progressData?.course}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};

export default TeacherAnalytics;