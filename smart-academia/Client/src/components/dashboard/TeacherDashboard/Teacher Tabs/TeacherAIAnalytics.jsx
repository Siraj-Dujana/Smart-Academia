// frontend/src/components/Teacher/TeacherAIAnalytics.jsx
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

const TeacherAIAnalytics = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("weak");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchAnalysis();
    }
  }, [selectedCourseId]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/ai-progress/teacher/courses`, {
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

  const fetchAnalysis = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/ai-progress/teacher/course/${selectedCourseId}`, {
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
        <p className="text-sm text-gray-500">Create a course to see AI-powered class analytics</p>
      </div>
    );
  }

  const selectedCourse = courses.find(c => c._id === selectedCourseId);

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif", background: C.bg, minHeight: "100vh" }}>
      
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", border: `1px solid ${C.border}` }}>
        <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: C.accent }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: C.accent2 }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.accent }} />
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">AI · Class Analytics</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Class Performance Insights</h1>
          <p className="text-sm text-gray-400 mt-1">AI-powered analysis of student performance and learning patterns</p>
        </div>
      </div>

      {/* Course Selector */}
      <div className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Select Course</label>
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

      {loading ? (
        <div className="py-20"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="p-5 rounded-2xl flex items-center gap-3" style={{ background: "#1a0a0a", border: "1px solid #ef444433" }}>
          <span className="material-symbols-outlined text-red-500 text-2xl">error</span>
          <div>
            <p className="font-semibold text-red-400">Failed to load analysis</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      ) : analysis ? (
        <>
          {/* Class Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Students", value: analysis.classMetrics?.totalStudents || 0, color: C.accent },
              { label: "Avg Progress", value: `${analysis.classMetrics?.avgProgress || 0}%`, color: C.amber },
              { label: "Avg Quiz", value: `${analysis.classMetrics?.avgQuizScore || 0}%`, color: C.accent2 },
              { label: "Pass Rate", value: `${analysis.classMetrics?.passRate || 0}%`, color: C.green },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* At Risk Alert */}
          {analysis.atRiskStudents?.count > 0 && (
            <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: `${C.red}22`, border: `1px solid ${C.red}44` }}>
              <span className="material-symbols-outlined text-red-400 text-2xl">warning</span>
              <div>
                <p className="font-semibold text-red-400">{analysis.atRiskStudents.count} Students At Risk</p>
                <p className="text-sm text-red-300/80">{analysis.atRiskStudents.indicators?.join(", ")}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 rounded-xl p-1.5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            {[
              { key: "weak", label: "Weak Areas", icon: "warning", color: C.red },
              { key: "strengths", label: "Strengths", icon: "emoji_events", color: C.green },
              { key: "recommendations", label: "Recommendations", icon: "lightbulb", color: C.accent },
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

          {/* Weak Areas */}
          {activeTab === "weak" && (
            <div className="space-y-3">
              {analysis.weakAreas?.length === 0 ? (
                <div className="text-center py-12 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                  <span className="material-symbols-outlined text-5xl text-gray-700 mb-2 block">check_circle</span>
                  <p className="text-white font-semibold">No weak areas identified!</p>
                  <p className="text-sm text-gray-500">Class is performing well across all assessments.</p>
                </div>
              ) : (
                analysis.weakAreas.map((area, i) => (
                  <div key={i} className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.red}44` }}>
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-white">{area.area}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        area.severity === "high" ? "text-red-400 bg-red-400/20" : 
                        area.severity === "medium" ? "text-amber-400 bg-amber-400/20" : "text-yellow-400 bg-yellow-400/20"
                      }`}>
                        {area.severity.toUpperCase()} priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{area.description}</p>
                    <p className="text-xs text-gray-400 mt-2">Affected: {area.affectedStudents}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Strengths */}
          {activeTab === "strengths" && (
            <div className="space-y-3">
              {analysis.strengths?.length === 0 ? (
                <div className="text-center py-12 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                  <span className="material-symbols-outlined text-5xl text-gray-700 mb-2 block">trending_up</span>
                  <p className="text-white font-semibold">No strengths identified yet</p>
                </div>
              ) : (
                analysis.strengths.map((strength, i) => (
                  <div key={i} className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.green}44` }}>
                    <p className="font-semibold text-white">{strength.area}</p>
                    <p className="text-sm text-gray-300 mt-1">{strength.description}</p>
                    <p className="text-xs text-gray-400 mt-2">Performance: {strength.performance}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Recommendations */}
          {activeTab === "recommendations" && (
            <div className="space-y-3">
              <div className="rounded-xl p-4" style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44` }}>
                <p className="text-sm text-gray-300">{analysis.summary || "Review the data above to identify areas needing attention."}</p>
              </div>
              {analysis.recommendations?.map((rec, i) => (
                <div key={i} className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.accent}44` }}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-white">{rec.action}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      rec.priority === "high" ? "text-red-400 bg-red-400/20" : 
                      rec.priority === "medium" ? "text-amber-400 bg-amber-400/20" : "text-green-400 bg-green-400/20"
                    }`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{rec.reason}</p>
                  <p className="text-xs text-gray-400 mt-2">Target: {rec.target}</p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default TeacherAIAnalytics;