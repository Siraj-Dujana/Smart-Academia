// frontend/src/components/Student/StudentAIAnalytics.jsx
import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

// ── Glow Card Component ───────────────────────────────────────
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

// ── Mini Bar ──────────────────────────────────────────────────
const MiniBar = ({ value = 0, color = C.accent, height = 5 }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height, background: C.border }}>
    <div className="h-full rounded-full transition-all duration-700"
      style={{ width: `${Math.min(value, 100)}%`, background: `linear-gradient(90deg, ${color}bb, ${color})` }} />
  </div>
);

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ icon, title, color = C.accent }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
      <span className="material-symbols-outlined text-base" style={{ color }}>{icon}</span>
    </div>
    <h3 className="text-sm font-bold text-white tracking-wide uppercase">{title}</h3>
    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}44, transparent)` }} />
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

// ── Ring Progress ─────────────────────────────────────────────
const RingProgress = ({ value = 0, size = 80, stroke = 7, color = C.accent }) => {
  const r = (size - stroke * 2) / 2;
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

const StudentAIAnalytics = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("weak");

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/ai-progress/student`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAnalysis(data);
      else setError(data.message || "Failed to load analysis");
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20">
        <Spinner size="lg" />
        <p className="text-center text-gray-400 mt-4 text-sm">Analyzing your performance...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 rounded-2xl flex items-center gap-3" style={{ background: "#1a0a0a", border: "1px solid #ef444433" }}>
        <span className="material-symbols-outlined text-red-500 text-2xl">error</span>
        <div>
          <p className="font-semibold text-red-400">Failed to load analysis</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif", background: C.bg, minHeight: "100vh" }}>
      
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", border: `1px solid ${C.border}` }}>
        <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: C.accent }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: C.accent2 }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.accent }} />
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">AI · Smart Analysis</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Your Learning Insights</h1>
          <p className="text-sm text-gray-400 mt-1">AI-powered analysis of your strengths and areas for improvement</p>
        </div>
      </div>

      {/* Overall Score Card with Ring */}
      <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6" style={{ background: C.surface, border: `1px solid ${C.accent}33` }}>
        <div className="flex items-center gap-6">
          <RingProgress value={analysis.overallScore || 0} size={100} stroke={8} color={analysis.overallScore >= 70 ? C.green : analysis.overallScore >= 50 ? C.amber : C.red} />
          <div>
            <p className="text-xs text-gray-400">Overall Performance Score</p>
            <p className="text-3xl font-black text-white">{analysis.overallScore || 0}%</p>
            <p className="text-xs text-gray-500 mt-1">{analysis.metrics?.totalCourses || 0} Courses · {analysis.metrics?.completedCourses || 0} Completed</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-4 py-2 rounded-xl" style={{ background: C.surface2 }}>
            <p className="text-sm font-bold text-amber-400">{analysis.metrics?.overallQuizAvg || 0}%</p>
            <p className="text-[10px] text-gray-500">Quiz Avg</p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl" style={{ background: C.surface2 }}>
            <p className="text-sm font-bold text-purple-400">{analysis.metrics?.overallLabAvg || 0}%</p>
            <p className="text-[10px] text-gray-500">Lab Avg</p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl" style={{ background: C.surface2 }}>
            <p className="text-sm font-bold text-green-400">{analysis.metrics?.passedQuizzes || 0}</p>
            <p className="text-[10px] text-gray-500">Passed</p>
          </div>
        </div>
      </div>

      {/* Stats Grid with Glow Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <GlowCard icon="quiz" label="Quiz Average" value={`${analysis.metrics?.overallQuizAvg || 0}%`} color={C.amber} />
        <GlowCard icon="science" label="Lab Average" value={`${analysis.metrics?.overallLabAvg || 0}%`} color={C.accent2} />
        <GlowCard icon="trending_up" label="Course Progress" value={`${analysis.metrics?.overallProgress || 0}%`} color={C.accent} />
        <GlowCard icon="emoji_events" label="Quizzes Passed" value={`${analysis.metrics?.passedQuizzes || 0}/${analysis.metrics?.totalAttempts || 0}`} color={C.green} />
      </div>

      {/* Tabs with Gradient */}
      <div className="flex gap-1 rounded-xl p-1.5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        {[
          { key: "weak", label: "Weak Areas", icon: "warning", color: C.red },
          { key: "strengths", label: "Strengths", icon: "emoji_events", color: C.green },
          { key: "trends", label: "Trends", icon: "trending_up", color: C.amber },
          { key: "plan", label: "Study Plan", icon: "menu_book", color: C.accent },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.key ? "text-white shadow-md" : "hover:bg-white/5"
            }`}
            style={activeTab === tab.key ? { background: `linear-gradient(135deg, ${tab.color}, ${tab.color}cc)` } : { color: C.textDim }}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content with Enhanced Cards */}
      {activeTab === "weak" && (
        <div className="space-y-3">
          {analysis.weakAreas?.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <span className="material-symbols-outlined text-6xl text-gray-700 mb-4 block">check_circle</span>
              <p className="font-bold text-white text-lg">No weak areas detected!</p>
              <p className="text-sm text-gray-500">You're doing great in all your courses. Keep it up! 🎉</p>
            </div>
          ) : (
            analysis.weakAreas.map((area, i) => (
              <div key={i} className="rounded-2xl p-5 transition-all hover:scale-[1.02] duration-300" style={{ background: C.surface, border: `1px solid ${C.red}44` }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-white text-base">{area.area}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        area.severity === "high" ? "text-red-400 bg-red-400/20 border border-red-500/30" :
                        area.severity === "medium" ? "text-amber-400 bg-amber-400/20 border border-amber-500/30" :
                        "text-yellow-400 bg-yellow-400/20 border border-yellow-500/30"
                      }`}>
                        {area.severity.toUpperCase()} priority
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{area.course}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{area.reason}</p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "strengths" && (
        <div className="space-y-3">
          {analysis.strengths?.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <span className="material-symbols-outlined text-6xl text-gray-700 mb-4 block">trending_up</span>
              <p className="font-bold text-white text-lg">Keep building your strengths!</p>
              <p className="text-sm text-gray-500">Complete more quizzes and labs to see your strengths</p>
            </div>
          ) : (
            analysis.strengths.map((strength, i) => (
              <div key={i} className="rounded-2xl p-5 transition-all hover:scale-[1.02] duration-300" style={{ background: C.surface, border: `1px solid ${C.green}44` }}>
                <div className="mb-2">
                  <p className="font-bold text-white text-base">{strength.area}</p>
                  <p className="text-xs text-gray-500 mt-1">{strength.course}</p>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{strength.reason}</p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "trends" && (
        <div className="space-y-3">
          {analysis.trends?.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <span className="material-symbols-outlined text-6xl text-gray-700 mb-4 block">analytics</span>
              <p className="font-bold text-white text-lg">More data needed</p>
              <p className="text-sm text-gray-500">Complete more quizzes and labs to see performance trends</p>
            </div>
          ) : (
            analysis.trends.map((trend, i) => (
              <div key={i} className="rounded-2xl p-5 transition-all hover:scale-[1.02] duration-300" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    trend.direction === "improving" ? "text-green-400 bg-green-400/20 border border-green-500/30" :
                    trend.direction === "declining" ? "text-red-400 bg-red-400/20 border border-red-500/30" :
                    "text-amber-400 bg-amber-400/20 border border-amber-500/30"
                  }`}>
                    {trend.direction === "improving" ? "📈 IMPROVING" : trend.direction === "declining" ? "📉 DECLINING" : "➡️ STABLE"}
                  </span>
                  <p className="text-sm font-semibold text-white">{trend.trend}</p>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{trend.detail}</p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "plan" && (
        <div className="space-y-3">
          <div className="rounded-2xl p-5 mb-2" style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-base" style={{ color: C.accent }}>summarize</span>
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">AI Summary</p>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{analysis.summary || "Keep working consistently to improve your performance across all courses."}</p>
          </div>
          
          {analysis.studyPlan?.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <span className="material-symbols-outlined text-6xl text-gray-700 mb-4 block">menu_book</span>
              <p className="font-bold text-white text-lg">No study plan generated yet</p>
              <p className="text-sm text-gray-500">Complete more assessments to get personalized recommendations</p>
            </div>
          ) : (
            analysis.studyPlan.map((plan, i) => (
              <div key={i} className="rounded-2xl p-5 transition-all hover:scale-[1.02] duration-300" style={{ background: C.surface, border: `1px solid ${C.accent}44` }}>
                <div className="flex items-start justify-between mb-3">
                  <p className="font-bold text-white text-base">{plan.action}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    plan.priority === "high" ? "text-red-400 bg-red-400/20 border border-red-500/30" :
                    plan.priority === "medium" ? "text-amber-400 bg-amber-400/20 border border-amber-500/30" :
                    "text-green-400 bg-green-400/20 border border-green-500/30"
                  }`}>
                    {plan.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                  <span className="material-symbols-outlined text-xs">schedule</span>
                  {plan.timeframe}
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">{plan.reason}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Course Snapshots */}
      <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <div className="px-6 py-4 border-b" style={{ background: C.surface2, borderColor: C.border }}>
          <SectionHeader icon="school" title="Course Performance" color={C.accent} />
        </div>
        <div className="divide-y" style={{ borderColor: C.border }}>
          {analysis.courseSnapshots?.map((course, i) => {
            const progressColor = course.isCompleted ? C.green : course.progress >= 60 ? C.accent : course.progress >= 30 ? C.amber : C.red;
            return (
              <div key={i} className="p-5 hover:bg-white/5 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-white">{course.course}</p>
                    <p className="text-xs text-gray-500">{course.code}</p>
                  </div>
                  {course.isCompleted && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${C.green}22`, color: C.greenLight, border: `1px solid ${C.green}44` }}>
                      ✓ Completed
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center p-2 rounded-lg" style={{ background: C.surface2 }}>
                    <p className="text-lg font-black text-white">{course.progress}%</p>
                    <p className="text-[10px] text-gray-500">Progress</p>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ background: C.surface2 }}>
                    <p className="text-lg font-black text-amber-400">{course.avgQuizScore || 0}%</p>
                    <p className="text-[10px] text-gray-500">Quiz Avg</p>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ background: C.surface2 }}>
                    <p className="text-lg font-black text-purple-400">{course.avgLabScore || 0}%</p>
                    <p className="text-[10px] text-gray-500">Lab Avg</p>
                  </div>
                </div>
                <MiniBar value={course.progress} color={progressColor} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentAIAnalytics;