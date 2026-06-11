// frontend/src/components/Teacher/TeacherAIAnalytics.jsx
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

// ── Mini Bar ──────────────────────────────────────────────────
const MiniBar = ({ value = 0, color = C.accent, height = 5 }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height, background: C.border }}>
    <div className="h-full rounded-full transition-all duration-700"
      style={{ width: `${Math.min(value, 100)}%`, background: `linear-gradient(90deg, ${color}bb, ${color})` }} />
  </div>
);

const TeacherAIAnalytics = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [studentsData, setStudentsData] = useState([]);
  const [studentsSummary, setStudentsSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("weak");
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchAnalysis();
      fetchStudentsData();
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

  const fetchStudentsData = async () => {
    setLoadingStudents(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/ai-progress/teacher/course/${selectedCourseId}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStudentsData(data.students || []);
        setStudentsSummary(data.summary);
      }
    } catch {
      // Silent fail - students tab will show error
    } finally {
      setLoadingStudents(false);
    }
  };

  const getStatusColor = (progress) => {
    if (progress >= 70) return C.green;
    if (progress >= 40) return C.amber;
    return C.red;
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
<div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: C.textFaint }}>Select Course</p>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {courses.map(c => {
      const isSelected = selectedCourseId === c._id;
      return (
        <button
          key={c._id}
          onClick={() => setSelectedCourseId(c._id)}
          className="relative text-left p-4 rounded-xl transition-all duration-200 hover:scale-[1.02]"
          style={{
            background: isSelected ? "#6366f122" : C.surface2,
            border: `1px solid ${isSelected ? "#6366f1" : C.border}`,
          }}
        >
          {isSelected && (
            <div className="absolute inset-0 rounded-xl opacity-20"
              style={{ background: "radial-gradient(ellipse at 50% 0%, #6366f1 0%, transparent 70%)" }} />
          )}
          <div className="relative flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: isSelected ? "#6366f133" : C.border,
                border: `1px solid ${isSelected ? "#6366f144" : C.border2}`,
              }}>
              <span className="material-symbols-outlined text-base"
                style={{ color: isSelected ? "#818cf8" : C.textFaint }}>menu_book</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate"
                style={{ color: isSelected ? "#e0e7ff" : C.textDim }}>{c.title}</p>
              <p className="text-[10px] mt-0.5 font-mono"
                style={{ color: isSelected ? "#818cf8" : C.textFaint }}>{c.code || ""}</p>
              <p className="text-[10px] mt-1" style={{ color: C.textFaint }}>
                {c.enrolledCount || 0} students
              </p>
            </div>
            {isSelected && (
              <span className="material-symbols-outlined text-base flex-shrink-0" style={{ color: "#6366f1" }}>
                check_circle
              </span>
            )}
          </div>
        </button>
      );
    })}
  </div>
</div>

      {/* Main Tabs */}
      <div className="flex gap-1 rounded-xl p-1.5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        {[
          { key: "weak", label: "Class Weak Areas", icon: "warning", color: C.red },
          { key: "strengths", label: "Class Strengths", icon: "emoji_events", color: C.green },
          { key: "recommendations", label: "Recommendations", icon: "lightbulb", color: C.accent },
          { key: "students", label: "Student Weak Areas", icon: "groups", color: C.accent2 },
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

      {/* ==================== CLASS WEAK AREAS TAB ==================== */}
      {activeTab === "weak" && (
        loading ? (
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
            {/* Class Metrics Glow Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <GlowCard icon="groups" label="Total Students" value={analysis.classMetrics?.totalStudents || 0} color={C.accent} />
              <GlowCard icon="trending_up" label="Avg Progress" value={`${analysis.classMetrics?.avgProgress || 0}%`} color={C.amber} />
              <GlowCard icon="quiz" label="Avg Quiz Score" value={`${analysis.classMetrics?.avgQuizScore || 0}%`} color={C.accent2} />
              <GlowCard icon="verified" label="Pass Rate" value={`${analysis.classMetrics?.passRate || 0}%`} color={C.green} />
            </div>

            {/* At Risk Alert */}
            {analysis.atRiskStudents?.count > 0 && (
              <div className="rounded-2xl p-5 flex items-start gap-4" style={{ background: `${C.red}22`, border: `1px solid ${C.red}44` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${C.red}22`, border: `1px solid ${C.red}44` }}>
                  <span className="material-symbols-outlined text-lg" style={{ color: C.redLight }}>warning</span>
                </div>
                <div>
                  <p className="font-bold text-red-400 text-lg">{analysis.atRiskStudents.count} Students At Risk</p>
                  <p className="text-sm text-red-300/80 mt-1">{analysis.atRiskStudents.indicators?.join(", ")}</p>
                  {analysis.atRiskStudents.recommendations?.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-semibold text-red-300">Recommendations:</p>
                      <ul className="list-disc list-inside text-xs text-red-300/80">
                        {analysis.atRiskStudents.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Weak Areas List */}
            <div className="space-y-3">
              {analysis.weakAreas?.length === 0 ? (
                <div className="text-center py-16 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                  <span className="material-symbols-outlined text-6xl text-gray-700 mb-4 block">check_circle</span>
                  <p className="font-bold text-white text-lg">No weak areas identified!</p>
                  <p className="text-sm text-gray-500">Class is performing well across all assessments</p>
                </div>
              ) : (
                analysis.weakAreas.map((area, i) => (
                  <div key={i} className="rounded-2xl p-5 transition-all hover:scale-[1.02] duration-300" style={{ background: C.surface, border: `1px solid ${C.red}44` }}>
                    <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                      <p className="font-bold text-white text-base">{area.area}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        area.severity === "high" ? "text-red-400 bg-red-400/20 border border-red-500/30" :
                        area.severity === "medium" ? "text-amber-400 bg-amber-400/20 border border-amber-500/30" :
                        "text-yellow-400 bg-yellow-400/20 border border-yellow-500/30"
                      }`}>
                        {area.severity.toUpperCase()} priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed mb-2">{area.description}</p>
                    <p className="text-xs text-gray-400">Affected: {area.affectedStudents}</p>
                  </div>
                ))
              )}
            </div>

            {/* Quiz Analysis */}
            <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="px-5 py-3 border-b" style={{ background: C.surface2, borderColor: C.border }}>
                <SectionHeader icon="quiz" title="Quiz Performance" color={C.amber} />
              </div>
              <div className="divide-y max-h-80 overflow-y-auto" style={{ borderColor: C.border }}>
                {analysis.quizAnalysis?.map((quiz, i) => (
                  <div key={i} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-white text-sm">{quiz.title}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        quiz.avgScore >= 70 ? "text-green-400 bg-green-400/20" :
                        quiz.avgScore >= 50 ? "text-amber-400 bg-amber-400/20" :
                        "text-red-400 bg-red-400/20"
                      }`}>
                        {quiz.avgScore}% avg
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>{quiz.uniqueStudents || 0}/{analysis.classMetrics?.totalStudents || 0} attempted</span>
                      <span>Pass rate: {quiz.passRate || 0}%</span>
                    </div>
                    <div className="mt-2">
                      <MiniBar value={quiz.avgScore} color={quiz.avgScore >= 70 ? C.green : quiz.avgScore >= 50 ? C.amber : C.red} height={3} />
                    </div>
                  </div>
                ))}
                {(!analysis.quizAnalysis || analysis.quizAnalysis.length === 0) && (
                  <div className="p-8 text-center text-gray-500 text-sm">No quiz data available</div>
                )}
              </div>
            </div>
          </>
        ) : null
      )}

      {/* ==================== CLASS STRENGTHS TAB ==================== */}
      {activeTab === "strengths" && (
        loading ? (
          <div className="py-20"><Spinner size="lg" /></div>
        ) : analysis ? (
          <div className="space-y-3">
            {analysis.strengths?.length === 0 ? (
              <div className="text-center py-16 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <span className="material-symbols-outlined text-6xl text-gray-700 mb-4 block">trending_up</span>
                <p className="font-bold text-white text-lg">No strengths identified yet</p>
                <p className="text-sm text-gray-500">Complete more assessments to identify class strengths</p>
              </div>
            ) : (
              analysis.strengths.map((strength, i) => (
                <div key={i} className="rounded-2xl p-5 transition-all hover:scale-[1.02] duration-300" style={{ background: C.surface, border: `1px solid ${C.green}44` }}>
                  <p className="font-bold text-white text-base mb-2">{strength.area}</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{strength.description}</p>
                  <p className="text-xs text-gray-400 mt-2">Performance: {strength.performance}</p>
                </div>
              ))
            )}

            {/* Lab Analysis */}
            <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="px-5 py-3 border-b" style={{ background: C.surface2, borderColor: C.border }}>
                <SectionHeader icon="science" title="Lab Performance" color={C.accent2} />
              </div>
              <div className="divide-y max-h-80 overflow-y-auto" style={{ borderColor: C.border }}>
                {analysis.labAnalysis?.map((lab, i) => (
                  <div key={i} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-white text-sm">{lab.title}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        lab.avgScore >= 70 ? "text-green-400 bg-green-400/20" :
                        lab.avgScore >= 50 ? "text-amber-400 bg-amber-400/20" :
                        "text-red-400 bg-red-400/20"
                      }`}>
                        {lab.avgScore || 0}% avg
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>{lab.submissionCount || 0}/{analysis.classMetrics?.totalStudents || 0} submitted</span>
                      <span>{lab.gradedCount || 0} graded</span>
                      <span className="capitalize">{lab.difficulty}</span>
                    </div>
                    <div className="mt-2">
                      <MiniBar value={lab.avgScore} color={lab.avgScore >= 70 ? C.green : lab.avgScore >= 50 ? C.amber : C.red} height={3} />
                    </div>
                  </div>
                ))}
                {(!analysis.labAnalysis || analysis.labAnalysis.length === 0) && (
                  <div className="p-8 text-center text-gray-500 text-sm">No lab data available</div>
                )}
              </div>
            </div>

            {/* Lesson Completion Analysis */}
            <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="px-5 py-3 border-b" style={{ background: C.surface2, borderColor: C.border }}>
                <SectionHeader icon="menu_book" title="Lesson Completion" color={C.cyan} />
              </div>
              <div className="divide-y max-h-80 overflow-y-auto" style={{ borderColor: C.border }}>
                {analysis.lessonAnalysis?.map((lesson, i) => (
                  <div key={i} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-white text-sm">Lesson {lesson.order}: {lesson.title}</p>
                      <span className="text-[10px] text-gray-500">{lesson.completionRate || 0}% completed</span>
                    </div>
                    <div className="mt-2">
                      <MiniBar value={lesson.completionRate || 0} color={lesson.completionRate >= 70 ? C.green : lesson.completionRate >= 50 ? C.amber : C.red} height={3} />
                    </div>
                  </div>
                ))}
                {(!analysis.lessonAnalysis || analysis.lessonAnalysis.length === 0) && (
                  <div className="p-8 text-center text-gray-500 text-sm">No lesson data available</div>
                )}
              </div>
            </div>
          </div>
        ) : null
      )}

      {/* ==================== RECOMMENDATIONS TAB ==================== */}
      {activeTab === "recommendations" && (
        loading ? (
          <div className="py-20"><Spinner size="lg" /></div>
        ) : analysis ? (
          <div className="space-y-3">
            <div className="rounded-2xl p-5" style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44` }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-base" style={{ color: C.accent }}>summarize</span>
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">AI Summary</p>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{analysis.summary || "Review the data above to identify areas needing attention."}</p>
            </div>
            
            {analysis.recommendations?.map((rec, i) => (
              <div key={i} className="rounded-2xl p-5 transition-all hover:scale-[1.02] duration-300" style={{ background: C.surface, border: `1px solid ${C.accent}44` }}>
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <p className="font-bold text-white text-base">{rec.action}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    rec.priority === "high" ? "text-red-400 bg-red-400/20 border border-red-500/30" :
                    rec.priority === "medium" ? "text-amber-400 bg-amber-400/20 border border-amber-500/30" :
                    "text-green-400 bg-green-400/20 border border-green-500/30"
                  }`}>
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-2">{rec.reason}</p>
                <p className="text-xs text-gray-400">Target: {rec.target}</p>
              </div>
            ))}
          </div>
        ) : null
      )}

      {/* ==================== STUDENT WEAK AREAS TAB ==================== */}
      {activeTab === "students" && (
        loadingStudents ? (
          <div className="py-20"><Spinner size="lg" /></div>
        ) : studentsData.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <span className="material-symbols-outlined text-6xl text-gray-700 mb-4 block">person</span>
            <p className="font-bold text-white text-lg">No students enrolled</p>
            <p className="text-sm text-gray-500">Students will appear here once they enroll in this course</p>
          </div>
        ) : (
          <>
            {/* Student Summary Cards */}
            {studentsSummary && (
              <div className="flex gap-3">
                <div className="flex-1 rounded-xl p-4 text-center" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                  <p className="text-2xl font-bold text-white">{studentsSummary.totalStudents}</p>
                  <p className="text-[10px] text-gray-500">Total Students</p>
                </div>
                <div className="flex-1 rounded-xl p-4 text-center" style={{ background: `${C.red}22`, border: `1px solid ${C.red}44` }}>
                  <p className="text-2xl font-bold text-red-400">{studentsSummary.atRiskCount}</p>
                  <p className="text-[10px] text-red-400">At Risk</p>
                </div>
                <div className="flex-1 rounded-xl p-4 text-center" style={{ background: `${C.green}22`, border: `1px solid ${C.green}44` }}>
                  <p className="text-2xl font-bold text-green-400">{studentsSummary.excellentCount}</p>
                  <p className="text-[10px] text-green-400">Excellent</p>
                </div>
                <div className="flex-1 rounded-xl p-4 text-center" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                  <p className="text-2xl font-bold text-amber-400">{studentsSummary.avgClassProgress}%</p>
                  <p className="text-[10px] text-gray-500">Avg Progress</p>
                </div>
              </div>
            )}

            {/* Students Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {studentsData.map((student) => (
                <div
                  key={student.studentId}
                  className="rounded-2xl overflow-hidden transition-all hover:scale-[1.01] cursor-pointer"
                  style={{ background: C.surface, border: `1px solid ${C.border}` }}
                  onClick={() => setSelectedStudent(selectedStudent?.studentId === student.studentId ? null : student)}
                >
                  {/* Student Header */}
                  <div className="p-4 flex items-center gap-3" style={{ background: C.surface2, borderBottom: `1px solid ${C.border}` }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }}>
                      {student.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{student.fullName}</p>
                      <p className="text-[10px] text-gray-500">ID: {student.studentIdNumber || "N/A"} · {student.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold" style={{ color: getStatusColor(student.progress) }}>{student.progress}%</p>
                      <p className="text-[9px] text-gray-500">Progress</p>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="p-4 grid grid-cols-2 gap-3 text-center border-b" style={{ borderColor: C.border }}>
                    <div>
                      <p className="text-lg font-bold" style={{ color: student.avgQuizScore >= 70 ? C.green : student.avgQuizScore >= 50 ? C.amber : C.red }}>
                        {student.avgQuizScore !== null ? `${student.avgQuizScore}%` : "—"}
                      </p>
                      <p className="text-[10px] text-gray-500">Avg Quiz</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold" style={{ color: student.avgLabScore >= 70 ? C.green : student.avgLabScore >= 50 ? C.amber : C.red }}>
                        {student.avgLabScore !== null ? `${student.avgLabScore}%` : "—"}
                      </p>
                      <p className="text-[10px] text-gray-500">Avg Lab</p>
                    </div>
                  </div>

                  {/* Weak Areas Preview */}
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      <span className="material-symbols-outlined text-sm text-red-400">warning</span>
                      <p className="text-xs font-semibold text-red-400">Weak Areas ({student.weakAreas?.length || 0})</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {student.weakAreas?.slice(0, 3).map((area, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-1 rounded-full" style={{ background: `${C.red}22`, color: C.redLight }}>
                          {area.title}
                        </span>
                      ))}
                      {(student.weakAreas?.length || 0) > 3 && (
                        <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: C.surface2, color: C.textDim }}>
                          +{student.weakAreas.length - 3} more
                        </span>
                      )}
                      {(!student.weakAreas || student.weakAreas.length === 0) && (
                        <span className="text-[10px] text-gray-500">No weak areas identified</span>
                      )}
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {selectedStudent?.studentId === student.studentId && (
                    <div className="p-4 border-t space-y-4" style={{ background: `${C.accent}08`, borderColor: C.border }}>
                      
                      {/* All Weak Areas */}
                      {student.weakAreas?.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-red-400 mb-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">warning</span> Detailed Weak Areas
                          </p>
                          <div className="space-y-2">
                            {student.weakAreas.map((area, idx) => (
                              <div key={idx} className="p-2 rounded-lg" style={{ background: `${C.red}10`, borderLeft: `2px solid ${C.red}` }}>
                                <p className="text-xs font-semibold text-white">{area.title}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{area.message}</p>
                                <p className="text-[10px] mt-1" style={{ color: C.amberLight }}>💡 {area.suggestion}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Strengths */}
                      {student.strengths?.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-green-400 mb-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">emoji_events</span> Strengths
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {student.strengths.map((strength, idx) => (
                              <span key={idx} className="text-[10px] px-2 py-1 rounded-full" style={{ background: `${C.green}22`, color: C.greenLight }}>
                                {strength.title}: {strength.score}%
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Recommendation */}
                      {student.aiRecommendation && (
                        <div className="p-3 rounded-xl" style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44` }}>
                          <p className="text-xs font-bold text-indigo-400 mb-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">auto_awesome</span> AI Recommendation
                          </p>
                          <ul className="space-y-1">
                            {student.aiRecommendation.map((rec, idx) => (
                              <li key={idx} className="text-[11px] text-gray-300 flex items-start gap-2">
                                <span className="text-indigo-400">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Quiz Performance */}
                      {student.quizPerformance?.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">quiz</span> Quiz Scores
                          </p>
                          <div className="space-y-1.5">
                            {student.quizPerformance.map((quiz, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <span className="text-gray-400 truncate flex-1">{quiz.title}</span>
                                <span className={`font-bold ${quiz.score >= 70 ? 'text-green-400' : quiz.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                  {quiz.score > 0 ? `${quiz.score}%` : 'Not attempted'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )
      )}
    </div>
  );
};

export default TeacherAIAnalytics;