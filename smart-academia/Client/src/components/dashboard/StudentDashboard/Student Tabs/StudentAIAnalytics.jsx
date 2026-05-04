// frontend/src/components/Student/StudentAIAnalytics.jsx
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
      <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
    </div>
  );
};

const MiniBar = ({ value = 0, color = C.accent, height = 5 }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height, background: C.border }}>
    <div className="h-full rounded-full" style={{ width: `${Math.min(value, 100)}%`, background: `linear-gradient(90deg, ${color}bb, ${color})` }} />
  </div>
);

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
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif" }}>
      
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

      {/* Overall Score Card */}
      <div className="rounded-2xl p-6 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${C.accent}22, ${C.accent2}22)`, border: `1px solid ${C.accent}44` }}>
        <div>
          <p className="text-xs text-gray-400">Overall Performance Score</p>
          <p className="text-4xl font-black text-white">{analysis.overallScore || 0}%</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">{analysis.metrics?.totalCourses || 0} Courses</p>
          <p className="text-xs text-gray-400">{analysis.metrics?.completedCourses || 0} Completed</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Quiz Avg", value: `${analysis.metrics?.overallQuizAvg || 0}%`, color: C.amber },
          { label: "Lab Avg", value: `${analysis.metrics?.overallLabAvg || 0}%`, color: C.accent2 },
          { label: "Progress", value: `${analysis.metrics?.overallProgress || 0}%`, color: C.accent },
          { label: "Passed Quizzes", value: `${analysis.metrics?.passedQuizzes || 0}/${analysis.metrics?.totalAttempts || 0}`, color: C.green },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
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
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key ? "text-white shadow-md" : "hover:bg-white/5"
            }`}
            style={activeTab === tab.key ? { background: `linear-gradient(135deg, ${tab.color}, ${tab.color}cc)` } : { color: C.textDim }}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Weak Areas Tab */}
      {activeTab === "weak" && (
        <div className="space-y-3">
          {analysis.weakAreas?.length === 0 ? (
            <div className="text-center py-12 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <span className="material-symbols-outlined text-5xl text-gray-700 mb-2 block">check_circle</span>
              <p className="text-white font-semibold">No weak areas detected!</p>
              <p className="text-sm text-gray-500">You're doing great in all your courses.</p>
            </div>
          ) : (
            analysis.weakAreas.map((area, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.red}44` }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-white">{area.area}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{area.course}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    area.severity === "high" ? "text-red-400 bg-red-400/20" :
                    area.severity === "medium" ? "text-amber-400 bg-amber-400/20" :
                    "text-yellow-400 bg-yellow-400/20"
                  }`}>
                    {area.severity.toUpperCase()} priority
                  </span>
                </div>
                <p className="text-sm text-gray-300">{area.reason}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Strengths Tab */}
      {activeTab === "strengths" && (
        <div className="space-y-3">
          {analysis.strengths?.length === 0 ? (
            <div className="text-center py-12 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <span className="material-symbols-outlined text-5xl text-gray-700 mb-2 block">trending_up</span>
              <p className="text-white font-semibold">Keep building your strengths!</p>
              <p className="text-sm text-gray-500">Complete more courses to see your strengths.</p>
            </div>
          ) : (
            analysis.strengths.map((strength, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.green}44` }}>
                <p className="font-semibold text-white">{strength.area}</p>
                <p className="text-xs text-gray-400 mt-0.5">{strength.course}</p>
                <p className="text-sm text-gray-300 mt-2">{strength.reason}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === "trends" && (
        <div className="space-y-3">
          {analysis.trends?.length === 0 ? (
            <div className="text-center py-12 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <span className="material-symbols-outlined text-5xl text-gray-700 mb-2 block">analytics</span>
              <p className="text-white font-semibold">More data needed</p>
              <p className="text-sm text-gray-500">Complete more quizzes and labs to see trends.</p>
            </div>
          ) : (
            analysis.trends.map((trend, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    trend.direction === "improving" ? "text-green-400 bg-green-400/20" :
                    trend.direction === "declining" ? "text-red-400 bg-red-400/20" :
                    "text-amber-400 bg-amber-400/20"
                  }`}>
                    {trend.direction.toUpperCase()}
                  </span>
                  <p className="text-sm font-semibold text-white">{trend.trend}</p>
                </div>
                <p className="text-sm text-gray-300">{trend.detail}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Study Plan Tab */}
      {activeTab === "plan" && (
        <div className="space-y-3">
          <div className="rounded-xl p-4 mb-2" style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44` }}>
            <p className="text-sm text-gray-300">{analysis.summary || "Keep working consistently to improve your performance across all courses."}</p>
          </div>
          {analysis.studyPlan?.length === 0 ? (
            <div className="text-center py-12 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <span className="material-symbols-outlined text-5xl text-gray-700 mb-2 block">menu_book</span>
              <p className="text-white font-semibold">No study plan generated yet</p>
              <p className="text-sm text-gray-500">Complete more assessments to get personalized recommendations.</p>
            </div>
          ) : (
            analysis.studyPlan.map((plan, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.accent}44` }}>
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-white">{plan.action}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    plan.priority === "high" ? "text-red-400 bg-red-400/20" :
                    plan.priority === "medium" ? "text-amber-400 bg-amber-400/20" :
                    "text-green-400 bg-green-400/20"
                  }`}>
                    {plan.priority.toUpperCase()} priority
                  </span>
                </div>
                <p className="text-xs text-gray-400">⏰ {plan.timeframe}</p>
                <p className="text-sm text-gray-300 mt-2">{plan.reason}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Course Snapshots */}
      <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <div className="px-5 py-3 border-b" style={{ background: C.surface2, borderColor: C.border }}>
          <p className="text-xs font-bold text-white uppercase tracking-wide">Course Performance</p>
        </div>
        <div className="divide-y" style={{ borderColor: C.border }}>
          {analysis.courseSnapshots?.map((course, i) => (
            <div key={i} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-white">{course.course}</p>
                  <p className="text-xs text-gray-500">{course.code}</p>
                </div>
                {course.isCompleted && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${C.green}22`, color: C.greenLight, border: `1px solid ${C.green}44` }}>
                    Completed ✓
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center">
                  <p className="text-sm font-bold text-white">{course.progress}%</p>
                  <p className="text-[10px] text-gray-500">Progress</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-amber-400">{course.avgQuizScore || 0}%</p>
                  <p className="text-[10px] text-gray-500">Quiz Avg</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-purple-400">{course.avgLabScore || 0}%</p>
                  <p className="text-[10px] text-gray-500">Lab Avg</p>
                </div>
              </div>
              <div className="mt-3">
                <MiniBar value={course.progress} color={C.accent} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentAIAnalytics;