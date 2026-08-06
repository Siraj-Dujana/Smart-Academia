import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const token = localStorage.getItem("token");

// ── Color palette ──────────────────────────────────────────────
// Two-color semantic rule, matching every other redesigned page:
// white (accent) = neutral/default, green = success, red = danger.
// No amber, no purple/indigo, no cyan.
const C = {
  bg: "#070d1a", surface: "#0f1629", surface2: "#0a0f1e",
  border: "#1e293b", border2: "#334155",
  accent: "#ffffff", green: "#22c55e", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textFaint: "#64748b",
  greenLight: "#4ade80", redLight: "#f87171",
};

// ── Mini Progress Bar ─────────────────────────────────────────
const MiniBar = ({ value = 0, color = C.accent, height = 5, animated = true }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height, background: C.border }}>
    <div
      className="h-full rounded-full"
      style={{
        width: `${Math.min(Math.max(value, 0), 100)}%`,
        background: color,
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

const ProgressLineChart = ({ attempts, title, passingScore = 70, color = C.accent }) => {
  if (!attempts || attempts.length === 0) return null;
  const maxH = 90;
  const single = attempts.length === 1;

  const xPos = (i) => single ? 50 : (i / (attempts.length - 1)) * 100;

  return (
    <div className="mt-3">
      <p className="text-[10px] font-semibold text-gray-500 mb-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">trending_up</span>
        {title} - Score Progression
      </p>
      <div className="relative" style={{ height: maxH + 30 }}>
        {/* Gridlines at 0/25/50/75/100 */}
        {[0, 25, 50, 75, 100].map(v => (
          <div key={v} className="absolute left-0 right-0 border-t" style={{ top: `${(1 - v / 100) * maxH}px`, borderColor: C.border, opacity: 0.5 }}>
            <span className="absolute -left-0 -top-2.5 text-[8px]" style={{ color: C.textFaint }}>{v}</span>
          </div>
        ))}
        {/* Passing line */}
        <div className="absolute left-0 right-0 border-t border-dashed" style={{ top: `${(1 - passingScore / 100) * maxH}px`, borderColor: C.green, zIndex: 2 }}>
          <span className="absolute right-0 -top-3 text-[8px] font-bold" style={{ color: C.green }}>Pass: {passingScore}%</span>
        </div>

        <svg width="100%" height={maxH} viewBox={`0 0 100 ${maxH}`} preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0 }}>
          {!single && (
            <polyline
              points={attempts.map((a, i) => `${xPos(i)},${(1 - a.score / 100) * maxH}`).join(' ')}
              fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
              style={{ filter: `drop-shadow(0 0 3px ${color}66)` }}
            />
          )}
          {attempts.map((a, i) => (
            <circle key={i} cx={`${xPos(i)}%`} cy={(1 - a.score / 100) * maxH} r="3" vectorEffect="non-scaling-stroke"
              fill={a.passed ? C.green : color} stroke={C.surface} strokeWidth="1.5" />
          ))}
        </svg>

        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[8px]" style={{ color: C.textFaint, top: maxH + 5 }}>
          {attempts.map((a, i) => (
            <span key={i} className="text-center" style={{ width: `${100 / attempts.length}%`, flexShrink: 0 }}>
              #{a.attemptNumber}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Attempt History Modal ──────────────────────────────────────
const AttemptHistoryModal = ({ item, type, onClose }) => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttempts();
  }, [item, type]);

  const fetchAttempts = async () => {
    try {
      const endpoint = type === 'quiz' 
        ? `/api/student/quiz/${item._id}/attempts`
        : `/api/student/lab/${item._id}/attempts`;
      const res = await fetch(`${API}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAttempts(data.attempts || []);
    } catch (err) {
      console.error("Failed to fetch attempts:", err);
    } finally {
      setLoading(false);
    }
  };

  const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score || a.finalScore || 0)) : null;
  const improvement = attempts.length >= 2 
    ? (attempts[attempts.length - 1].score || attempts[attempts.length - 1].finalScore || 0) - (attempts[0].score || attempts[0].finalScore || 0)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300" onClick={onClose}>
      <div className="rounded-2xl w-full max-w-lg overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ background: C.surface2, borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-white">{type === 'quiz' ? 'quiz' : 'science'}</span>
            <h3 className="font-bold text-white text-sm">{item.title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors duration-300">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        
        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-8"><LoadingSpinner size="sm" /></div>
          ) : attempts.length === 0 ? (
            <p className="text-center text-gray-500 text-sm">No attempts found</p>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 rounded-lg transition-all duration-300" style={{ background: C.surface2 }}>
                  <p className="text-2xl font-bold text-white">{attempts.length}</p>
                  <p className="text-[9px] text-gray-500">Total Attempts</p>
                </div>
                <div className="text-center p-2 rounded-lg transition-all duration-300" style={{ background: C.surface2 }}>
                  <p className="text-2xl font-bold" style={{ color: bestScore >= 70 ? C.greenLight : C.redLight }}>{bestScore || 0}%</p>
                  <p className="text-[9px] text-gray-500">Best Score</p>
                </div>
                <div className="text-center p-2 rounded-lg transition-all duration-300" style={{ background: C.surface2 }}>
                  <p className="text-2xl font-bold" style={{ color: improvement >= 0 ? C.greenLight : C.redLight }}>
                    {improvement >= 0 ? `+${improvement}` : improvement}%
                  </p>
                  <p className="text-[9px] text-gray-500">Improvement</p>
                </div>
              </div>
              
              {/* Progress Chart */}
              <ProgressLineChart 
                attempts={attempts.map(a => ({ 
                  attemptNumber: a.attemptNumber, 
                  score: a.score || a.finalScore || a.percentage || 0,
                  passed: a.passed || (a.score >= 70)
                }))} 
                title="Score Progression"
                passingScore={70}
                color={C.accent}
              />
              
              {/* Attempts List */}
              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {attempts.map((a, i) => {
                  const score = a.score || a.finalScore || a.percentage || 0;
                  const passed = a.passed || (score >= 70);
                  const isBest = score === bestScore;
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl transition-all duration-300" style={{ background: isBest ? `${C.green}15` : C.surface2, border: isBest ? `1px solid ${C.green}44` : `1px solid ${C.border}` }}>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-500 w-12">#{a.attemptNumber}</span>
                        <span className="text-xs text-gray-400">{new Date(a.submittedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: passed ? C.greenLight : C.redLight }}>{score}%</span>
                        {passed && <span className="text-[10px] text-emerald-400">✓</span>}
                        {isBest && <span className="text-[10px] text-gray-400">★ Best</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Stat Card — icon-free, all cards identical, live percentage bar ───
const StatCard = ({ label, value, percentage, sub, delay = 0 }) => (
  <div
    className="relative rounded-2xl overflow-hidden p-4 flex flex-col gap-2 group opacity-0 animate-fadeInUp transition-all duration-300 ease-out hover:-translate-y-1"
    style={{ background: C.surface, border: "1px solid rgba(255,255,255,0.1)", animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
  >
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />
    <div className="flex items-start justify-between relative z-10">
      <p className="text-xs font-medium" style={{ color: C.textDim }}>{label}</p>
      {percentage != null && <span className="text-xs font-bold text-white transition-all duration-300">{percentage}%</span>}
    </div>
    <p className="text-2xl font-black text-white tracking-tight relative z-10" style={{ textShadow: "0 0 20px rgba(255,255,255,0.25)" }}>{value ?? "—"}</p>
    {sub && <p className="text-[10px] relative z-10" style={{ color: C.textFaint }}>{sub}</p>}
    {percentage != null && <div className="relative z-10"><MiniBar value={percentage} /></div>}
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
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10
              bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none"
              style={{ border: `1px solid ${C.border2}` }}>
              {item.label}: {item.value}{label}
            </div>
            <div className="w-full rounded-t-lg transition-all duration-700 relative overflow-hidden"
              style={{ height: Math.max(barH, 2), background: color, minHeight: 2,
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
            style={{ filter: `drop-shadow(0 0 4px ${seg.color}66)`, transition: "stroke-dasharray 0.8s ease" }} />
        );
      })}
    </svg>
  );
};

// ── Score Badge ───────────────────────────────────────────────
// Letter grade for information, but color is strictly pass/fail (>=70),
// matching the passing-score rule used everywhere else — not five separate hues.
const ScoreBadge = ({ score }) => {
  if (score == null) return <span className="text-xs" style={{ color: C.textFaint }}>—</span>;
  const label = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : "F";
  const passed = score >= 70;
  const color = passed ? C.greenLight : C.redLight;
  const bg = passed ? "#22c55e22" : "#ef444422";
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black transition-all duration-300"
      style={{ background: bg, color, border: `1px solid ${color}44` }}>
      {label} · {score}%
    </span>
  );
};

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({  title, rightElement }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <h3 className="text-sm font-bold text-white tracking-wide uppercase">{title}</h3>
      <div className="flex-1 h-px w-20" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.15), transparent)" }} />
    </div>
    {rightElement}
  </div>
);

// ── Loading Spinner ───────────────────────────────────────────
const LoadingSpinner = ({ size = "md" }) => {
  const dimensions = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-16 h-16" : "w-12 h-12";
  return (
    <div className={`relative ${dimensions} mx-auto`}>
      <div className="absolute inset-0 rounded-full border-4 border-white/10" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin" />
      <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-white/40 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
    </div>
  );
};

// ── Course Card (Student View) ──────────────────────────────────
const CourseCard = ({ course, expanded, onToggle }) => {
  // Three-tier, two-color rule: green = completed, red = struggling (<30%),
  // white = normal in-progress. No amber middle tier.
  const hue = course.isCompleted ? C.green : course.progress < 30 ? C.red : C.accent;
  const scoreColor = course.weightedScore >= 70 ? C.greenLight : course.weightedScore >= 50 ? C.text : C.redLight;

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300" style={{ background: C.surface, border: `1px solid ${hue === C.accent ? "rgba(255,255,255,0.1)" : hue + "33"}` }}>
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
                <span className="text-xs text-gray-300 font-medium">{course.completedLessons}/{course.totalLessons} Lessons</span>
              </div>
              {course.totalQuizzes > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: C.surface2 }}>
                  
                  <span className="text-xs text-gray-300 font-medium">{course.passedQuizzes}/{course.totalQuizzes} passed Quiz</span>
                </div>
              )}
              {course.totalLabs > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: C.surface2 }}>
                  
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
        <div className="border-t transition-all duration-300" style={{ borderColor: hue === C.accent ? "rgba(255,255,255,0.08)" : hue + "22" }}>
          <div className="p-3">
            <div className="flex items-center gap-2 px-2 pb-2 mb-1">
              <span className="material-symbols-outlined text-sm text-gray-500">format_list_bulleted</span>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lesson Progress</p>
            </div>
            {course.lessons.map((lesson, i) => {
              const done = lesson.isCompleted;
              const viewed = lesson.viewed;
              return (
                <div key={lesson._id} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/5 group">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black transition-all duration-300" 
                    style={{ background: done ? `${C.green}33` : viewed ? "rgba(255,255,255,0.12)" : C.border, 
                             border: `1px solid ${done ? C.green : viewed ? "rgba(255,255,255,0.3)" : C.border2}`, 
                             color: done ? C.greenLight : viewed ? "#ffffff" : C.textFaint }}>
                    {done ? "✓" : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-300 truncate group-hover:text-white transition-colors duration-300">{lesson.title}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {lesson.quiz && (
                      <div className="flex items-center gap-1.5">
                        {/* <span className="material-symbols-outlined text-xs text-white/50">quiz</span> */}
                        <span  className="text-xs font-bold" style={{ color: lesson.quiz.passed ? C.greenLight : lesson.quiz.bestScore != null ? C.redLight : C.textFaint }}>Quiz Score&nbsp;
                          {lesson.quiz.bestScore != null ? `${lesson.quiz.bestScore}%` : "—"}
                        </span>
                      </div>
                    )}
                    {lesson.lab && (
                      <div className="flex items-center gap-1.5">
                        {/* <span className="material-symbols-outlined text-xs text-white/50">science</span> */}
                        <span className="text-xs font-bold" style={{ color: lesson.lab.scorePercent != null ? "#ffffff" : C.textFaint }}> Lab Score &nbsp;
                          {lesson.lab.scorePercent != null ? `${lesson.lab.scorePercent}%` : lesson.lab.status === "submitted" ? "⌛" : "—"}
                        </span>
                      </div>
                    )}
                    <span className="material-symbols-outlined text-sm" style={{ color: done ? C.greenLight : viewed ? "#ffffff" : C.border2 }}>
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
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);

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

  const openAttemptHistory = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setModalType(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 rounded-2xl flex items-center gap-3 transition-all duration-300" style={{ background: "#1a0a0a", border: "1px solid #ef444433" }}>
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
    { key: "overview",  label: "Courses" },
    { key: "quizzes",  label: "Quizzes" },
    { key: "labs",  label: "Labs" },
    { key: "credits", label: "Credits" },
  ];

  // Quiz Data
  const allQuizzes = courses.flatMap(c =>
    c.lessons.filter(l => l.quiz).map(l => ({ ...l.quiz, lessonTitle: l.title, courseName: c.title, courseCode: c.code, _id: l.quiz._id }))
  );

  const quizPassed = allQuizzes.filter(q => q.passed).length;
  const quizAvgScore = allQuizzes.filter(q => q.bestScore != null).length
    ? Math.round(allQuizzes.filter(q => q.bestScore != null).reduce((a, b) => a + b.bestScore, 0) / allQuizzes.filter(q => q.bestScore != null).length)
    : null;

  // Lab Data
  const allLabs = courses.flatMap(c =>
    c.lessons.filter(l => l.lab).map(l => ({ ...l.lab, lessonTitle: l.title, courseName: c.title, _id: l.lab._id }))
  );

  const labSubmitted = allLabs.filter(l => l.submitted).length;
  const labGraded = allLabs.filter(l => l.status === "graded").length;
  const labAvgScore = allLabs.filter(l => l.scorePercent != null).length
    ? Math.round(allLabs.filter(l => l.scorePercent != null).reduce((a, b) => a + b.scorePercent, 0) / allLabs.filter(l => l.scorePercent != null).length)
    : null;

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif", background: C.bg, minHeight: "100vh" }}>
      
      {/* Modal for Attempt History */}
      {selectedItem && modalType && (
        <AttemptHistoryModal item={selectedItem} type={modalType} onClose={closeModal} />
      )}

      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full animate-pulse bg-white" />
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Progress</p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Your Performance at a Glance
        </h1>
      </div>

      {/* Stats Cards — all identical styling, live percentage bars, no fixed caps */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        <StatCard label="Courses Enrolled" value={overall.totalCourses} percentage={100} delay={0} />
        <StatCard label="Courses Completed" value={overall.completedCourses}  percentage={overall.totalCourses > 0 ? Math.round((overall.completedCourses / overall.totalCourses) * 100) : 0} delay={90} />
        <StatCard label="Credits Earned" value={overall.earnedCredits.toFixed(1)}  percentage={overall.totalCredits > 0 ? Math.round((overall.earnedCredits / overall.totalCredits) * 100) : 0} delay={180} />
        <StatCard label="Quizzes Passed" value={`${quizPassed}/${allQuizzes.length}`} percentage={allQuizzes.length > 0 ? Math.round((quizPassed / allQuizzes.length) * 100) : 0} delay={270} />
        <StatCard label="Labs Graded" value={`${labGraded}/${allLabs.length}`} percentage={allLabs.length > 0 ? Math.round((labGraded / allLabs.length) * 100) : 0} delay={360} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Completion Donut */}
        <div className="rounded-2xl p-5 transition-all duration-300" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-white">donut_large</span>
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
                  <div className="w-3 h-3 rounded-full flex-shrink-0 bg-white" />
                  <span className="text-xs" style={{ color: C.textDim }}>In Progress</span>
                </div>
                <span className="text-xs font-bold text-white">{overall.totalCourses - overall.completedCourses}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Distribution */}
        <div className="rounded-2xl p-5 transition-all duration-300" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-white">bar_chart</span>
            Progress Distribution
          </p>
          <BarChart
            data={Object.entries(progressBuckets).map(([label, value]) => ({ label, value }))}
            maxVal={Math.max(...Object.values(progressBuckets), 1)}
            color={C.accent}
            label=""
          />
        </div>

        {/* Quick Stats */}
        <div className="rounded-2xl p-5 transition-all duration-300" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-white">analytics</span>
            Learning Summary
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 rounded-lg transition-all duration-300" style={{ background: C.surface2 }}>
              <span className="text-xs" style={{ color: C.textDim }}>Total Quizzes Taken</span>
              <span className="text-sm font-bold text-white">{overall.totalQuizAttempts}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg transition-all duration-300" style={{ background: C.surface2 }}>
              <span className="text-xs" style={{ color: C.textDim }}>Labs Submitted</span>
              <span className="text-sm font-bold text-white">{overall.totalLabSubmissions}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg transition-all duration-300" style={{ background: C.surface2 }}>
              <span className="text-xs" style={{ color: C.textDim }}>Best Quiz Score</span>
              <span className="text-sm font-bold text-white">
                {Math.max(...allQuizzes.filter(q => q.bestScore != null).map(q => q.bestScore), 0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 rounded-xl p-1.5 transition-all duration-300" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        {tabs.map(t => (
        <button
  key={t.key}
  onClick={() => setActiveTab(t.key)}
  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-white/10"
  style={activeTab === t.key ? { background: "#ffffff", color: "#0a0f1e" } : { color: C.textDim }}
>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-3">
          {courses.length === 0 ? (
            <div className="text-center py-16 rounded-2xl transition-all duration-300" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
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
            <StatCard label="Total Quizzes" value={allQuizzes.length} percentage={100} delay={0} />
            <StatCard label="Passed" value={quizPassed} percentage={allQuizzes.length > 0 ? Math.round((quizPassed / allQuizzes.length) * 100) : 0} delay={90} />
            <StatCard label="Avg Score" value={quizAvgScore !== null ? `${quizAvgScore}%` : "—"} percentage={quizAvgScore ?? 0} delay={180} />
          </div>

          {/* Quiz List */}
          <div className="rounded-2xl overflow-hidden transition-all duration-300" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <div className="px-5 py-4 border-b" style={{ background: C.surface2, borderColor: C.border }}>
              <SectionHeader  title="All Quiz Results" />
            </div>
            <div className="divide-y max-h-96 overflow-y-auto" style={{ borderColor: C.border }}>
              {allQuizzes.map((q, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                  onClick={() => openAttemptHistory(q, 'quiz')}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300" style={{ background: q.passed ? `${C.green}22` : q.bestScore != null ? "rgba(255,255,255,0.08)" : C.surface2, border: `1px solid ${q.passed ? C.green : q.bestScore != null ? "rgba(255,255,255,0.2)" : C.border}` }}>
                    <span className="material-symbols-outlined text-sm" style={{ color: q.passed ? C.greenLight : q.bestScore != null ? "#ffffff" : C.textFaint }}>
                      {q.passed ? "emoji_events" : q.bestScore != null ? "replay" : "lock"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{q.title || q.lessonTitle}</p>
                    <p className="text-xs" style={{ color: C.textFaint }}>{q.courseName} · {q.totalAttempts || 0}/{q.maxAttempts} attempts</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <ScoreBadge score={q.bestScore} />
                    <p className="text-[10px]" style={{ color: C.textFaint }}>Click to view attempts</p>
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
            <StatCard label="Submitted" value={labSubmitted} percentage={allLabs.length > 0 ? Math.round((labSubmitted / allLabs.length) * 100) : 0} delay={0} />
            <StatCard label="Graded" value={labGraded} percentage={allLabs.length > 0 ? Math.round((labGraded / allLabs.length) * 100) : 0} delay={90} />
            <StatCard label="Avg Score" value={labAvgScore !== null ? `${labAvgScore}%` : "—"} percentage={labAvgScore ?? 0} delay={180} />
          </div>
          dashboard

          {/* Lab List */}
          <div className="rounded-2xl overflow-hidden transition-all duration-300" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <div className="px-5 py-4 border-b" style={{ background: C.surface2, borderColor: C.border }}>
              <SectionHeader  title="Lab Submissions" />
            </div>
            <div className="divide-y max-h-96 overflow-y-auto" style={{ borderColor: C.border }}>
              {allLabs.map((l, i) => {
                // easy = success, hard = danger, medium = neutral — no amber tier.
                const diffColors = { 
                  easy: { color: C.greenLight, bg: `${C.green}22` }, 
                  medium: { color: "#e2e8f0", bg: C.border }, 
                  hard: { color: C.redLight, bg: `${C.red}22` } 
                };
                const dc = diffColors[l.difficulty] || diffColors.medium;
                return (
                  <div 
                    key={i} 
                    className="px-5 py-4 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                    onClick={() => openAttemptHistory(l, 'lab')}
                  >
                    <div className="flex items-start gap-4">
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{l.title}</p>
                        <p className="text-xs mb-2" style={{ color: C.textFaint }}>{l.courseName}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: dc.bg, color: dc.color, border: `1px solid ${dc.color}44` }}>{l.difficulty}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: l.status === "graded" ? `${C.green}22` : "rgba(255,255,255,0.08)", border: `1px solid ${l.status === "graded" ? C.green : "rgba(255,255,255,0.2)"}`, color: l.status === "graded" ? C.greenLight : "#e2e8f0" }}>
                            {l.status}
                          </span>
                        </div>
                        {l.feedback && (
                          <p className="text-xs mt-2 italic border-l-2 pl-2" style={{ borderColor: "rgba(255,255,255,0.3)", color: C.textFaint }}>"{l.feedback}"</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {l.scorePercent != null ? (
                          <>
                            <RingProgress value={l.scorePercent} size={52} stroke={5} color={C.accent} trackColor={C.border} />
                            <p className="text-[10px]" style={{ color: C.textFaint }}>{l.finalScore ?? l.marks}/{l.totalMarks} pts</p>
                          </>
                        ) : (
                          <span className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: C.surface2, color: C.textFaint }}>
                            {l.status === "submitted" ? "Awaiting review" : "Not submitted"}
                          </span>
                        )}
                        <p className="text-[9px] text-gray-600 mt-1">Click to view attempts</p>
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
          <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 transition-all duration-300" style={{ background: C.surface, border: "1px solid rgba(255,255,255,0.1)" }}>
            <RingProgress value={Math.round((overall.earnedCredits / overall.totalCredits) * 100)} size={120} stroke={10} color={C.accent} trackColor="#1e2d3d" />
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Credits Earned</p>
              <p className="text-5xl font-black text-white leading-none">{overall.earnedCredits.toFixed(1)}<span className="text-2xl" style={{ color: C.textFaint }}>/{overall.totalCredits}</span></p>
              <p className="text-sm mt-2" style={{ color: C.textDim }}>
                {overall.completedCourses} of {overall.totalCourses} courses fully completed
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span className="text-xs" style={{ color: C.textFaint }}>Each completed course awards its full credit weight</span>
              </div>
            </div>
          </div>

          <SectionHeader  title="Per-Course Credits" />

          {courses.map(c => {
            const earned = ((c.weightedScore / 100) * c.credits).toFixed(1);
            const barPct = Math.min((earned / c.credits) * 100, 100);
            // green = completed, red = struggling, white = normal — no amber tier.
            const color = c.isCompleted ? C.green : c.weightedScore >= 60 ? C.accent : C.red;
            return (
              <div key={c._id} className="rounded-xl p-4 transition-all duration-300" style={{ background: C.surface, border: `1px solid ${color === C.accent ? "rgba(255,255,255,0.1)" : color + "33"}` }}>
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

export default StudentAnalytics;