import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const token = localStorage.getItem("token");

// ── Circular Progress Ring ────────────────────────────────────
const RingProgress = ({ value = 0, size = 80, stroke = 7, color = "#6366f1", trackColor = "#1e293b", label, sublabel }) => {
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

// ── Mini Bar ──────────────────────────────────────────────────
const MiniBar = ({ value = 0, color = "#6366f1", height = 6 }) => (
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

// ── Score Badge ───────────────────────────────────────────────
const ScoreBadge = ({ score }) => {
  if (score == null) return <span className="text-gray-500 text-sm font-medium">—</span>;
  const grade = score >= 90 ? { label: "A+", bg: "#22c55e22", border: "#22c55e", text: "#4ade80" }
    : score >= 80 ? { label: "A", bg: "#22c55e22", border: "#22c55e", text: "#4ade80" }
    : score >= 70 ? { label: "B", bg: "#3b82f622", border: "#3b82f6", text: "#60a5fa" }
    : score >= 60 ? { label: "C", bg: "#f59e0b22", border: "#f59e0b", text: "#fbbf24" }
    : { label: "F", bg: "#ef444422", border: "#ef4444", text: "#f87171" };
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black border" style={{ background: grade.bg, borderColor: grade.border, color: grade.text }}>
      {grade.label} · {score}%
    </span>
  );
};

// ── Stat Glow Card ────────────────────────────────────────────
const GlowCard = ({ icon, label, value, color, sub }) => (
  <div className="relative rounded-2xl overflow-hidden p-5 flex flex-col gap-3 group" style={{ background: "#0f1629", border: `1px solid ${color}33` }}>
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}15 0%, transparent 70%)` }} />
    <div className="flex items-start justify-between">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
        <span className="material-symbols-outlined text-xl" style={{ color }}>{icon}</span>
      </div>
      {sub && <span className="text-[10px] text-gray-500 font-medium bg-gray-800 px-2 py-0.5 rounded-full">{sub}</span>}
    </div>
    <div>
      <p className="text-3xl font-black text-white tracking-tight" style={{ textShadow: `0 0 20px ${color}66` }}>{value}</p>
      <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
    </div>
    <MiniBar value={typeof value === "string" && value.endsWith("%") ? parseFloat(value) : 75} color={color} />
  </div>
);

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ icon, title, color = "#6366f1" }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
      <span className="material-symbols-outlined text-base" style={{ color }}>{icon}</span>
    </div>
    <h3 className="text-sm font-bold text-white tracking-wide uppercase">{title}</h3>
    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}44, transparent)` }} />
  </div>
);

// ── Lesson Row ────────────────────────────────────────────────
const LessonRow = ({ lesson, index }) => {
  const done = lesson.isCompleted;
  const viewed = lesson.viewed;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 group">
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black" style={{ background: done ? "#22c55e33" : viewed ? "#3b82f633" : "#1e293b", border: `1px solid ${done ? "#22c55e" : viewed ? "#3b82f6" : "#374151"}`, color: done ? "#4ade80" : viewed ? "#60a5fa" : "#6b7280" }}>
        {done ? "✓" : index + 1}
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
              {lesson.lab.scorePercent != null ? `${lesson.lab.scorePercent}%` : lesson.lab.status === "submitted" ? "⏳" : "—"}
            </span>
          </div>
        )}
        <span className="material-symbols-outlined text-sm" style={{ color: done ? "#4ade80" : viewed ? "#60a5fa" : "#374151" }}>
          {done ? "task_alt" : viewed ? "visibility" : "lock"}
        </span>
      </div>
    </div>
  );
};

// ── Course Card ───────────────────────────────────────────────
const CourseCard = ({ course, expanded, onToggle }) => {
  const hue = course.isCompleted ? "#22c55e" : course.progress >= 60 ? "#6366f1" : course.progress >= 30 ? "#f59e0b" : "#ef4444";
  const scoreColor = course.weightedScore >= 70 ? "#4ade80" : course.weightedScore >= 50 ? "#fbbf24" : "#f87171";

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300" style={{ background: "#0f1629", border: `1px solid ${hue}33` }}>
      <button onClick={onToggle} className="w-full p-5 text-left group">
        <div className="flex items-start gap-4">
          {/* Progress Ring */}
          <RingProgress value={course.progress} size={68} stroke={6} color={hue} trackColor="#1e2d3d" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-white text-base leading-tight">{course.title}</h3>
              {course.isCompleted && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#22c55e22", color: "#4ade80", border: "1px solid #22c55e44" }}>COMPLETED</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-3">{course.code} · {course.teacher} · {course.credits} credits</p>

            {/* Mini stats row */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "#1e293b" }}>
                <span className="material-symbols-outlined text-xs text-indigo-400">menu_book</span>
                <span className="text-xs text-gray-300 font-medium">{course.completedLessons}/{course.totalLessons}</span>
              </div>
              {course.totalQuizzes > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "#1e293b" }}>
                  <span className="material-symbols-outlined text-xs text-amber-400">quiz</span>
                  <span className="text-xs text-gray-300 font-medium">{course.passedQuizzes}/{course.totalQuizzes} passed</span>
                </div>
              )}
              {course.totalLabs > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "#1e293b" }}>
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

        {/* Progress bar */}
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
            {course.lessons.map((lesson, i) => (
              <LessonRow key={lesson._id} lesson={lesson} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Quiz History Tab ──────────────────────────────────────────
const QuizHistory = ({ courses }) => {
  const allQuizzes = courses.flatMap(c =>
    c.lessons.filter(l => l.quiz).map(l => ({ ...l.quiz, lessonTitle: l.title, courseName: c.title, courseCode: c.code }))
  );

  if (!allQuizzes.length) return <EmptyTab icon="quiz" title="No quiz attempts yet" subtitle="Complete a lesson quiz to see your history here" />;

  const passed = allQuizzes.filter(q => q.passed).length;
  const avgScore = allQuizzes.filter(q => q.bestScore != null).length
    ? Math.round(allQuizzes.filter(q => q.bestScore != null).reduce((a, b) => a + b.bestScore, 0) / allQuizzes.filter(q => q.bestScore != null).length)
    : null;

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Quizzes", value: allQuizzes.length, icon: "quiz", color: "#f59e0b" },
          { label: "Passed", value: passed, icon: "verified", color: "#22c55e" },
          { label: "Avg Score", value: avgScore != null ? `${avgScore}%` : "—", icon: "bar_chart", color: "#6366f1" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-4 flex flex-col gap-2" style={{ background: "#0f1629", border: `1px solid ${s.color}33` }}>
            <span className="material-symbols-outlined text-sm" style={{ color: s.color }}>{s.icon}</span>
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-[10px] text-gray-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "#1e293b" }}>
          <SectionHeader icon="quiz" title="All Quiz Results" color="#f59e0b" />
        </div>
        <div className="divide-y" style={{ borderColor: "#1e293b" }}>
          {allQuizzes.map((q, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: q.passed ? "#22c55e22" : q.bestScore != null ? "#f59e0b22" : "#1e293b", border: `1px solid ${q.passed ? "#22c55e44" : q.bestScore != null ? "#f59e0b44" : "#374151"}` }}>
                <span className="material-symbols-outlined text-sm" style={{ color: q.passed ? "#4ade80" : q.bestScore != null ? "#fbbf24" : "#4b5563" }}>
                  {q.passed ? "emoji_events" : q.bestScore != null ? "replay" : "lock"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{q.title || q.lessonTitle}</p>
                <p className="text-xs text-gray-500">{q.courseName} · {q.totalAttempts || 0}/{q.maxAttempts} attempts</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <ScoreBadge score={q.bestScore} />
                <p className="text-[10px] text-gray-600">Best score</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Lab Reports Tab ───────────────────────────────────────────
const LabReports = ({ courses }) => {
  const allLabs = courses.flatMap(c =>
    c.lessons.filter(l => l.lab).map(l => ({ ...l.lab, lessonTitle: l.title, courseName: c.title }))
  );

  if (!allLabs.length) return <EmptyTab icon="biotech" title="No lab submissions yet" subtitle="Submit a lab to track your progress" />;

  const graded = allLabs.filter(l => l.status === "graded").length;
  const pending = allLabs.filter(l => l.status === "submitted").length;
  const avgScore = allLabs.filter(l => l.scorePercent != null).length
    ? Math.round(allLabs.filter(l => l.scorePercent != null).reduce((a, b) => a + b.scorePercent, 0) / allLabs.filter(l => l.scorePercent != null).length)
    : null;

  const diffColors = { easy: { color: "#4ade80", bg: "#22c55e22" }, medium: { color: "#fbbf24", bg: "#f59e0b22" }, hard: { color: "#f87171", bg: "#ef444422" } };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Submitted", value: allLabs.length, icon: "upload", color: "#6366f1" },
          { label: "Graded", value: graded, icon: "grading", color: "#22c55e" },
          { label: "Avg Score", value: avgScore != null ? `${avgScore}%` : "—", icon: "analytics", color: "#a855f7" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-4 flex flex-col gap-2" style={{ background: "#0f1629", border: `1px solid ${s.color}33` }}>
            <span className="material-symbols-outlined text-sm" style={{ color: s.color }}>{s.icon}</span>
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-[10px] text-gray-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "#1e293b" }}>
          <SectionHeader icon="biotech" title="Lab Submissions" color="#a855f7" />
        </div>
        <div className="divide-y" style={{ borderColor: "#1e293b" }}>
          {allLabs.map((l, i) => {
            const dc = diffColors[l.difficulty] || diffColors.medium;
            return (
              <div key={i} className="px-5 py-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: l.status === "graded" ? "#a855f722" : "#1e293b", border: `1px solid ${l.status === "graded" ? "#a855f744" : "#374151"}` }}>
                    <span className="material-symbols-outlined text-sm" style={{ color: l.status === "graded" ? "#c084fc" : l.status === "submitted" ? "#fbbf24" : "#4b5563" }}>
                      {l.status === "graded" ? "verified" : l.status === "submitted" ? "pending" : "upload"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{l.title}</p>
                    <p className="text-xs text-gray-500 mb-2">{l.courseName}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: dc.bg, color: dc.color }}>{l.difficulty}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${l.status === "graded" ? "text-green-400" : "text-amber-400"}`} style={{ background: l.status === "graded" ? "#22c55e22" : "#f59e0b22" }}>
                        {l.status}
                      </span>
                    </div>
                    {l.feedback && (
                      <p className="text-xs text-gray-500 mt-2 italic border-l-2 pl-2" style={{ borderColor: "#a855f7" }}>"{l.feedback}"</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {l.scorePercent != null ? (
                      <>
                        <RingProgress value={l.scorePercent} size={52} stroke={5} color="#a855f7" trackColor="#1e293b" />
                        <p className="text-[10px] text-gray-500">{l.marks}/{l.totalMarks} pts</p>
                      </>
                    ) : (
                      <span className="text-xs text-gray-600 font-medium px-3 py-1.5 rounded-lg" style={{ background: "#1e293b" }}>
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
  );
};

// ── Credit Breakdown Tab ──────────────────────────────────────
const CreditBreakdown = ({ overall, courses }) => {
  const pct = overall.totalCredits > 0 ? (overall.earnedCredits / overall.totalCredits) * 100 : 0;
  return (
    <div className="space-y-4">
      {/* Big ring */}
      <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6" style={{ background: "#0f1629", border: "1px solid #6366f133" }}>
        <RingProgress value={Math.round(pct)} size={120} stroke={10} color="#6366f1" trackColor="#1e2d3d" />
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Credits Earned</p>
          <p className="text-5xl font-black text-white leading-none">{overall.earnedCredits.toFixed(1)}<span className="text-2xl text-gray-500">/{overall.totalCredits}</span></p>
          <p className="text-sm text-gray-400 mt-2">
            {overall.completedCourses} of {overall.totalCourses} courses fully completed
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className="w-2 h-2 rounded-full" style={{ background: "#6366f1" }} />
            <span className="text-xs text-gray-500">Each completed course awards its full credit weight</span>
          </div>
        </div>
      </div>

      <SectionHeader icon="school" title="Per-Course Credits" color="#6366f1" />

      {courses.map(c => {
        const earned = ((c.weightedScore / 100) * c.credits).toFixed(1);
        const barPct = Math.min((earned / c.credits) * 100, 100);
        const color = c.isCompleted ? "#22c55e" : c.weightedScore >= 60 ? "#6366f1" : "#f59e0b";
        return (
          <div key={c._id} className="rounded-xl p-4" style={{ background: "#0f1629", border: `1px solid ${color}33` }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-white text-sm">{c.title}</p>
                <p className="text-[10px] text-gray-500">{c.code} · {c.credits} total credits</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black" style={{ color }}>{earned}</p>
                <p className="text-[10px] text-gray-500">of {c.credits} credits</p>
              </div>
            </div>
            <MiniBar value={barPct} color={color} />
          </div>
        );
      })}
    </div>
  );
};

// ── Empty / Loading / Error States ───────────────────────────
const EmptyTab = ({ icon, title, subtitle }) => (
  <div className="rounded-2xl p-12 text-center" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
    <span className="material-symbols-outlined text-5xl text-gray-700 mb-4 block">{icon}</span>
    <p className="text-gray-400 font-semibold">{title}</p>
    <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
  </div>
);

const LoadingState = () => (
  <div className="flex items-center justify-center py-24">
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-5">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-900" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
      </div>
      <p className="text-sm font-medium text-gray-500">Loading your analytics…</p>
    </div>
  </div>
);

const ErrorState = ({ error }) => (
  <div className="p-5 rounded-2xl flex items-center gap-3" style={{ background: "#1a0a0a", border: "1px solid #ef444433" }}>
    <span className="material-symbols-outlined text-red-500 text-2xl">error</span>
    <div>
      <p className="font-semibold text-red-400">Failed to load analytics</p>
      <p className="text-sm text-red-700">{error}</p>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────
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

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!analytics) return null;

  const { overall, courses } = analytics;
  const passRate = overall.totalQuizAttempts > 0
    ? Math.round((overall.totalQuizPasses / overall.totalQuizAttempts) * 100)
    : null;

  const tabs = [
    { key: "overview", icon: "dashboard", label: "Courses" },
    { key: "quizzes", icon: "quiz", label: "Quizzes" },
    { key: "labs", icon: "biotech", label: "Labs" },
    { key: "credits", icon: "trophy", label: "Credits" },
  ];

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif" }}>

      {/* ── Hero ───────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", border: "1px solid #1e293b" }}>
        {/* Glowing blobs */}
        <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "#6366f1" }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: "#a855f7" }} />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#6366f1" }} />
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">SmartAcademia · Analytics</p>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
              Your Performance<br />
              <span style={{ background: "linear-gradient(90deg, #818cf8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                at a Glance
              </span>
            </h1>
            {overall.currentStreak > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold" style={{ background: "#f59e0b22", border: "1px solid #f59e0b44", color: "#fbbf24" }}>
                <span className="material-symbols-outlined text-base">local_fire_department</span>
                {overall.currentStreak}-day learning streak
              </div>
            )}
          </div>

          {/* Ring cluster */}
          <div className="flex items-center gap-4 sm:gap-6">
            <RingProgress value={overall.avgProgress} size={90} stroke={8} color="#6366f1" trackColor="#1e2d3d" label="Progress" sublabel="Overall" />
            {overall.overallQuizAvg != null && (
              <RingProgress value={overall.overallQuizAvg} size={90} stroke={8} color="#f59e0b" trackColor="#1e2d3d" label="Quiz Avg" sublabel="All courses" />
            )}
            {overall.overallLabAvg != null && (
              <RingProgress value={overall.overallLabAvg} size={90} stroke={8} color="#a855f7" trackColor="#1e2d3d" label="Lab Avg" sublabel="Graded" />
            )}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <GlowCard icon="school" label="Courses Enrolled" value={overall.totalCourses} color="#6366f1" />
        <GlowCard icon="emoji_events" label="Courses Completed" value={overall.completedCourses} color="#22c55e" sub={`of ${overall.totalCourses}`} />
        <GlowCard icon="workspace_premium" label="Credits Earned" value={`${overall.earnedCredits.toFixed(1)}`} color="#f59e0b" sub={`of ${overall.totalCredits}`} />
        <GlowCard icon="verified" label="Quiz Pass Rate" value={passRate != null ? `${passRate}%` : "—"} color="#a855f7" sub={passRate != null ? `${overall.totalQuizPasses}/${overall.totalQuizAttempts}` : undefined} />
      </div>

      {/* ── Tab Bar ────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl p-1.5" style={{ background: "#0a0f1e", border: "1px solid #1e293b" }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-sm font-semibold transition-all duration-200"
            style={activeTab === t.key
              ? { background: "#1e293b", color: "#818cf8", boxShadow: "0 0 20px #6366f120" }
              : { color: "#4b5563" }
            }
          >
            <span className="material-symbols-outlined text-base">{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab Content ────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-3">
          {courses.length === 0
            ? <EmptyTab icon="school" title="No enrolled courses" subtitle="Enroll in a course to see analytics" />
            : courses.map(c => (
              <CourseCard
                key={c._id}
                course={c}
                expanded={expandedCourse === c._id}
                onToggle={() => setExpandedCourse(expandedCourse === c._id ? null : c._id)}
              />
            ))
          }
        </div>
      )}

      {activeTab === "quizzes" && <QuizHistory courses={courses} />}
      {activeTab === "labs" && <LabReports courses={courses} />}
      {activeTab === "credits" && <CreditBreakdown overall={overall} courses={courses} />}
    </div>
  );
};

export default StudentAnalytics;