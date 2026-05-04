import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const token = localStorage.getItem("token");

// ── Color palette (matches TeacherAnalytics) ─────────────────
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
const RingProgress = ({ value = 0, size = 80, stroke = 7, color = C.accent, trackColor = C.border, label, sublabel }) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(value, 100) / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: "stroke-dasharray 1s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 6px ${color}88)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-black text-white leading-none">{value ?? "—"}{value != null ? "%" : ""}</span>
        </div>
      </div>
      {label && <p className="text-[10px] font-semibold text-gray-400 text-center leading-tight">{label}</p>}
      {sublabel && <p className="text-[10px] text-gray-500 text-center">{sublabel}</p>}
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

// ── Bar Chart ──────────────────────────────────────────────────
const BarChart = ({ data, maxVal = 100, color = C.accent, label = "%" }) => {
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

// ── Donut Chart ────────────────────────────────────────────────
const DonutChart = ({ segments, size = 120, thickness = 18 }) => {
  const r = (size - thickness * 2) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      {segments.map((seg, i) => {
        const pct = total > 0 ? seg.value / total : 0;
        const dash = pct * circ;
        const gap = circ - dash;
        offset += dash;
        return (
          <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
            stroke={seg.color} strokeWidth={thickness} strokeLinecap="butt"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            style={{ filter: `drop-shadow(0 0 4px ${seg.color}66)` }} />
        );
      })}
    </svg>
  );
};

// ── Score Badge ───────────────────────────────────────────────
const ScoreBadge = ({ score }) => {
  if (score == null) return <span className="text-xs" style={{ color: C.textFaint }}>—</span>;
  const grade = score >= 90 ? { label: "A+", color: C.greenLight, bg: "#22c55e22" }
    : score >= 80 ? { label: "A", color: C.greenLight, bg: "#22c55e22" }
    : score >= 70 ? { label: "B", color: "#60a5fa", bg: "#3b82f622" }
    : score >= 60 ? { label: "C", color: C.amberLight, bg: "#f59e0b22" }
    : { label: "F", color: C.redLight, bg: "#ef444422" };
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black"
      style={{ background: grade.bg, color: grade.color, border: `1px solid ${grade.color}44` }}>
      {grade.label} · {score}%
    </span>
  );
};

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ icon, title, color = C.accent, rightElement }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
        <span className="material-symbols-outlined text-base" style={{ color }}>{icon}</span>
      </div>
      <h3 className="text-sm font-bold text-white tracking-wide uppercase">{title}</h3>
      <div className="flex-1 h-px w-20" style={{ background: `linear-gradient(90deg, ${color}44, transparent)` }} />
    </div>
    {rightElement}
  </div>
);

// ── Course Card (Student View) ──────────────────────────────────
const CourseCard = ({ course, expanded, onToggle }) => {
  const hue = course.isCompleted ? C.green : course.progress >= 60 ? C.accent : course.progress >= 30 ? C.amber : C.red;
  const scoreColor = course.weightedScore >= 70 ? C.greenLight : course.weightedScore >= 50 ? C.amberLight : C.redLight;

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300" style={{ background: C.surface, border: `1px solid ${hue}33` }}>
      <button onClick={onToggle} className="w-full p-5 text-left group">
        <div className="flex items-start gap-4">
          <RingProgress value={course.progress} size={68} stroke={6} color={hue} trackColor="#1e2d3d" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-white text-base leading-tight">{course.title}</h3>
              {course.isCompleted && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${C.green}22`, color: C.greenLight, border: `1px solid ${C.green}44` }}>COMPLETED</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-3">{course.code} · {course.teacher} · {course.credits} credits</p>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: C.surface2 }}>
                <span className="material-symbols-outlined text-xs text-indigo-400">menu_book</span>
                <span className="text-xs text-gray-300 font-medium">{course.completedLessons}/{course.totalLessons}</span>
              </div>
              {course.totalQuizzes > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: C.surface2 }}>
                  <span className="material-symbols-outlined text-xs text-amber-400">quiz</span>
                  <span className="text-xs text-gray-300 font-medium">{course.passedQuizzes}/{course.totalQuizzes} passed</span>
                </div>
              )}
              {course.totalLabs > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: C.surface2 }}>
                  <span className="material-symbols-outlined text-xs text-purple-400">science</span>
                  <span className="text-xs text-gray-300 font-medium">{course.submittedLabs}/{course.totalLabs} labs</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 text-right">
            <p className="text-2xl font-black leading-none" style={{ color: scoreColor }}>{course.weightedScore ?? "—"}%</p>
            <p className="text-[10px] text-gray-500 mt-0.5">score</p>
            <span className="material-symbols-outlined text-gray-600 mt-2 block transition-transform duration-300" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>expand_more</span>
          </div>
        </div>

        <div className="mt-4">
          <MiniBar value={course.progress} color={hue} height={4} />
        </div>
      </button>

      {expanded && (
        <div className="border-t" style={{ borderColor: `${hue}22` }}>
          <div className="p-3">
            <div className="flex items-center gap-2 px-2 pb-2 mb-1">
              <span className="material-symbols-outlined text-sm text-gray-500">format_list_bulleted</span>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lesson Progress</p>
            </div>
            {course.lessons.map((lesson, i) => {
              const done = lesson.isCompleted;
              const viewed = lesson.viewed;
              return (
                <div key={lesson._id} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 group">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black" 
                    style={{ background: done ? `${C.green}33` : viewed ? `${C.accent}33` : C.border, 
                             border: `1px solid ${done ? C.green : viewed ? C.accent : C.border2}`, 
                             color: done ? C.greenLight : viewed ? C.indigoLight : C.textFaint }}>
                    {done ? "✓" : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-300 truncate group-hover:text-white transition-colors">{lesson.title}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {lesson.quiz && (
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs text-amber-400">quiz</span>
                        <span className={`text-xs font-bold ${lesson.quiz.passed ? "text-green-400" : lesson.quiz.bestScore != null ? "text-amber-400" : "text-gray-600"}`}>
                          {lesson.quiz.bestScore != null ? `${lesson.quiz.bestScore}%` : "—"}
                        </span>
                      </div>
                    )}
                    {lesson.lab && (
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs text-purple-400">science</span>
                        <span className={`text-xs font-bold ${lesson.lab.scorePercent != null ? "text-purple-400" : "text-gray-600"}`}>
                          {lesson.lab.scorePercent != null ? `${lesson.lab.scorePercent}%` : lesson.lab.status === "submitted" ? "⌛" : "—"}
                        </span>
                      </div>
                    )}
                    <span className="material-symbols-outlined text-sm" style={{ color: done ? C.greenLight : viewed ? C.indigoLight : C.border2 }}>
                      {done ? "task_alt" : viewed ? "visibility" : "lock"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main StudentAnalytics Component ────────────────────────────
const StudentAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API}/api/analytics/student`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAnalytics(data.analytics);
      else setError(data.message || "Failed to load analytics");
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-900" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 rounded-2xl flex items-center gap-3" style={{ background: "#1a0a0a", border: "1px solid #ef444433" }}>
        <span className="material-symbols-outlined text-red-500 text-2xl">error</span>
        <div>
          <p className="font-semibold text-red-400">Failed to load analytics</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const { overall, courses } = analytics;
  const passRate = overall.totalQuizAttempts > 0
    ? Math.round((overall.totalQuizPasses / overall.totalQuizAttempts) * 100)
    : null;

  // Prepare data for charts
  const progressBuckets = {
    "0-25": courses.filter(c => c.progress <= 25).length,
    "26-50": courses.filter(c => c.progress > 25 && c.progress <= 50).length,
    "51-75": courses.filter(c => c.progress > 50 && c.progress <= 75).length,
    "76-100": courses.filter(c => c.progress > 75).length,
  };

  const donutSegments = [
    { label: "Completed", value: overall.completedCourses, color: C.green },
    { label: "In Progress", value: overall.totalCourses - overall.completedCourses, color: C.accent },
    { label: "Not Started", value: 0, color: C.border2 },
  ];

  const tabs = [
    { key: "overview", icon: "dashboard", label: "Courses" },
    { key: "quizzes", icon: "quiz", label: "Quizzes" },
    { key: "labs", icon: "biotech", label: "Labs" },
    { key: "credits", icon: "trophy", label: "Credits" },
  ];

  // Quiz Data
  const allQuizzes = courses.flatMap(c =>
    c.lessons.filter(l => l.quiz).map(l => ({ ...l.quiz, lessonTitle: l.title, courseName: c.title, courseCode: c.code }))
  );

  const quizPassed = allQuizzes.filter(q => q.passed).length;
  const quizAvgScore = allQuizzes.filter(q => q.bestScore != null).length
    ? Math.round(allQuizzes.filter(q => q.bestScore != null).reduce((a, b) => a + b.bestScore, 0) / allQuizzes.filter(q => q.bestScore != null).length)
    : null;

  // Lab Data
  const allLabs = courses.flatMap(c =>
    c.lessons.filter(l => l.lab).map(l => ({ ...l.lab, lessonTitle: l.title, courseName: c.title }))
  );

  const labSubmitted = allLabs.filter(l => l.submitted).length;
  const labGraded = allLabs.filter(l => l.status === "graded").length;
  const labAvgScore = allLabs.filter(l => l.scorePercent != null).length
    ? Math.round(allLabs.filter(l => l.scorePercent != null).reduce((a, b) => a + b.scorePercent, 0) / allLabs.filter(l => l.scorePercent != null).length)
    : null;

    const colors = {
    accent: "#6366f1",
    accent2: "#a855f7",
    amber: "#f59e0b",
    green: "#22c55e",
    red: "#ef4444",
    card: "#0f1629",
    border: "#1e293b",
    muted: "#64748b",
    text: "#e2e8f0",
    textDim: "#94a3b8",
  };

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif", background: C.bg, minHeight: "100vh" }}>
      
    <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: colors.accent }} />
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#818cf8" }}>Dashboard</p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Your Performance at a Glance
        </h1>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <GlowCard icon="school" label="Courses Enrolled" value={overall.totalCourses} color={C.accent} />
        <GlowCard icon="emoji_events" label="Courses Completed" value={overall.completedCourses} color={C.green} sub={`of ${overall.totalCourses}`} />
        <GlowCard icon="workspace_premium" label="Credits Earned" value={overall.earnedCredits.toFixed(1)} color={C.amber} sub={`of ${overall.totalCredits}`} />
        <GlowCard icon="verified" label="Quiz Pass Rate" value={passRate !== null ? `${passRate}%` : "—"} color={C.accent2} sub={passRate !== null ? `${overall.totalQuizPasses}/${overall.totalQuizAttempts}` : undefined} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Completion Donut */}
        <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-base" style={{ color: C.accent }}>donut_large</span>
            Course Completion
          </p>
          <div className="flex items-center gap-5">
            <div className="flex-shrink-0">
              <DonutChart segments={donutSegments} size={110} thickness={16} />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: C.green }} />
                  <span className="text-xs" style={{ color: C.textDim }}>Completed</span>
                </div>
                <span className="text-xs font-bold text-white">{overall.completedCourses}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: C.accent }} />
                  <span className="text-xs" style={{ color: C.textDim }}>In Progress</span>
                </div>
                <span className="text-xs font-bold text-white">{overall.totalCourses - overall.completedCourses}</span>
              </div>
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
            data={Object.entries(progressBuckets).map(([label, value]) => ({ label, value }))}
            maxVal={Math.max(...Object.values(progressBuckets), 1)}
            color={C.amber}
            label=""
          />
        </div>

        {/* Quick Stats */}
        <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-base" style={{ color: C.green }}>analytics</span>
            Learning Summary
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: C.surface2 }}>
              <span className="text-xs" style={{ color: C.textDim }}>Total Quizzes Taken</span>
              <span className="text-sm font-bold text-white">{overall.totalQuizAttempts}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: C.surface2 }}>
              <span className="text-xs" style={{ color: C.textDim }}>Labs Submitted</span>
              <span className="text-sm font-bold text-white">{overall.totalLabSubmissions}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: C.surface2 }}>
              <span className="text-xs" style={{ color: C.textDim }}>Best Quiz Score</span>
              <span className="text-sm font-bold text-white">
                {Math.max(...allQuizzes.filter(q => q.bestScore != null).map(q => q.bestScore), 0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 rounded-xl p-1.5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === t.key ? "text-white shadow-md" : "hover:bg-white/5"
            }`}
            style={activeTab === t.key ? { background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` } : { color: C.textDim }}
          >
            <span className="material-symbols-outlined text-base">{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-3">
          {courses.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <span className="material-symbols-outlined text-6xl mb-4 block" style={{ color: C.border2 }}>school</span>
              <p className="font-semibold text-white">No courses enrolled</p>
              <p className="text-sm mt-1" style={{ color: C.textDim }}>Enroll in a course to see analytics</p>
            </div>
          ) : (
            courses.map(c => (
              <CourseCard
                key={c._id}
                course={c}
                expanded={expandedCourse === c._id}
                onToggle={() => setExpandedCourse(expandedCourse === c._id ? null : c._id)}
              />
            ))
          )}
        </div>
      )}

      {activeTab === "quizzes" && (
        <div className="space-y-4">
          {/* Quiz Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <GlowCard icon="quiz" label="Total Quizzes" value={allQuizzes.length} color={C.amber} />
            <GlowCard icon="verified" label="Passed" value={quizPassed} color={C.green} />
            <GlowCard icon="bar_chart" label="Avg Score" value={quizAvgScore !== null ? `${quizAvgScore}%` : "—"} color={C.accent} />
          </div>

          {/* Quiz List */}
          <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <div className="px-5 py-4 border-b" style={{ background: C.surface2, borderColor: C.border }}>
              <SectionHeader icon="quiz" title="All Quiz Results" color={C.amber} />
            </div>
            <div className="divide-y max-h-96 overflow-y-auto" style={{ borderColor: C.border }}>
              {allQuizzes.map((q, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: q.passed ? `${C.green}22` : q.bestScore != null ? `${C.amber}22` : C.surface2, border: `1px solid ${q.passed ? C.green : q.bestScore != null ? C.amber : C.border}` }}>
                    <span className="material-symbols-outlined text-sm" style={{ color: q.passed ? C.greenLight : q.bestScore != null ? C.amberLight : C.textFaint }}>
                      {q.passed ? "emoji_events" : q.bestScore != null ? "replay" : "lock"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{q.title || q.lessonTitle}</p>
                    <p className="text-xs" style={{ color: C.textFaint }}>{q.courseName} · {q.totalAttempts || 0}/{q.maxAttempts} attempts</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <ScoreBadge score={q.bestScore} />
                    <p className="text-[10px]" style={{ color: C.textFaint }}>Best score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "labs" && (
        <div className="space-y-4">
          {/* Lab Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <GlowCard icon="science" label="Submitted" value={labSubmitted} color={C.accent2} />
            <GlowCard icon="grading" label="Graded" value={labGraded} color={C.green} />
            <GlowCard icon="analytics" label="Avg Score" value={labAvgScore !== null ? `${labAvgScore}%` : "—"} color={C.accent} />
          </div>

          {/* Lab List */}
          <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <div className="px-5 py-4 border-b" style={{ background: C.surface2, borderColor: C.border }}>
              <SectionHeader icon="biotech" title="Lab Submissions" color={C.accent2} />
            </div>
            <div className="divide-y max-h-96 overflow-y-auto" style={{ borderColor: C.border }}>
              {allLabs.map((l, i) => {
                const diffColors = { 
                  easy: { color: C.greenLight, bg: `${C.green}22` }, 
                  medium: { color: C.amberLight, bg: `${C.amber}22` }, 
                  hard: { color: C.redLight, bg: `${C.red}22` } 
                };
                const dc = diffColors[l.difficulty] || diffColors.medium;
                return (
                  <div key={i} className="px-5 py-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: l.status === "graded" ? `${C.accent2}22` : C.surface2, border: `1px solid ${l.status === "graded" ? C.accent2 : C.border}` }}>
                        <span className="material-symbols-outlined text-sm" style={{ color: l.status === "graded" ? C.purpleLight : l.status === "submitted" ? C.amberLight : C.textFaint }}>
                          {l.status === "graded" ? "verified" : l.status === "submitted" ? "pending" : "upload"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{l.title}</p>
                        <p className="text-xs mb-2" style={{ color: C.textFaint }}>{l.courseName}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: dc.bg, color: dc.color, border: `1px solid ${dc.color}44` }}>{l.difficulty}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${l.status === "graded" ? "text-green-400" : "text-amber-400"}`} style={{ background: l.status === "graded" ? `${C.green}22` : `${C.amber}22`, border: `1px solid ${l.status === "graded" ? C.green : C.amber}44` }}>
                            {l.status}
                          </span>
                        </div>
                        {l.feedback && (
                          <p className="text-xs mt-2 italic border-l-2 pl-2" style={{ borderColor: C.accent2, color: C.textFaint }}>"{l.feedback}"</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {l.scorePercent != null ? (
                          <>
                            <RingProgress value={l.scorePercent} size={52} stroke={5} color={C.accent2} trackColor={C.border} />
                            <p className="text-[10px]" style={{ color: C.textFaint }}>{l.marks}/{l.totalMarks} pts</p>
                          </>
                        ) : (
                          <span className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: C.surface2, color: C.textFaint }}>
                            {l.status === "submitted" ? "Awaiting review" : "Not submitted"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "credits" && (
        <div className="space-y-4">
          {/* Big ring */}
          <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6" style={{ background: C.surface, border: `1px solid ${C.accent}33` }}>
            <RingProgress value={Math.round((overall.earnedCredits / overall.totalCredits) * 100)} size={120} stroke={10} color={C.accent} trackColor="#1e2d3d" />
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Credits Earned</p>
              <p className="text-5xl font-black text-white leading-none">{overall.earnedCredits.toFixed(1)}<span className="text-2xl" style={{ color: C.textFaint }}>/{overall.totalCredits}</span></p>
              <p className="text-sm mt-2" style={{ color: C.textDim }}>
                {overall.completedCourses} of {overall.totalCourses} courses fully completed
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="w-2 h-2 rounded-full" style={{ background: C.accent }} />
                <span className="text-xs" style={{ color: C.textFaint }}>Each completed course awards its full credit weight</span>
              </div>
            </div>
          </div>

          <SectionHeader icon="school" title="Per-Course Credits" color={C.accent} />

          {courses.map(c => {
            const earned = ((c.weightedScore / 100) * c.credits).toFixed(1);
            const barPct = Math.min((earned / c.credits) * 100, 100);
            const color = c.isCompleted ? C.green : c.weightedScore >= 60 ? C.accent : C.amber;
            return (
              <div key={c._id} className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${color}33` }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-white text-sm">{c.title}</p>
                    <p className="text-[10px]" style={{ color: C.textFaint }}>{c.code} · {c.credits} total credits</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black" style={{ color }}>{earned}</p>
                    <p className="text-[10px]" style={{ color: C.textFaint }}>of {c.credits} credits</p>
                  </div>
                </div>
                <MiniBar value={barPct} color={color} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentAnalytics;