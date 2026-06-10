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
const RingProgress = ({ value = 0, size = 80, stroke = 7, color = C.accent, label = "Score" }) => {
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
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-black text-white">{value}%</span>
        <span className="text-[8px]" style={{ color: C.textFaint }}>{label}</span>
      </div>
    </div>
  );
};

// ── Tooltip Component ─────────────────────────────────────────
const Tooltip = ({ children, text }) => (
  <div className="group relative inline-block">
    {children}
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-[10px] text-gray-300 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-20">
      {text}
    </div>
  </div>
);

const StudentAIAnalytics = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("weak");
  const [selectedCourse, setSelectedCourse] = useState(null);

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
      if (res.ok) {
        // Calculate course-specific metrics with better accuracy
        const courseSnapshotsWithDetails = data.courseSnapshots?.map(course => {
          // Calculate weighted performance score (only from completed items)
          let performanceScore = 0;
          let hasQuiz = course.avgQuizScore !== null && course.avgQuizScore !== undefined;
          let hasLab = course.avgLabScore !== null && course.avgLabScore !== undefined;
          
          if (hasQuiz && hasLab) {
            performanceScore = Math.round((course.avgQuizScore * 0.5) + (course.avgLabScore * 0.5));
          } else if (hasQuiz) {
            performanceScore = Math.round(course.avgQuizScore);
          } else if (hasLab) {
            performanceScore = Math.round(course.avgLabScore);
          } else {
            performanceScore = 0;
          }
          
          // Calculate completion-weighted score (zeros for incomplete items)
          let totalAssessments = (course.totalQuizzes || 0) + (course.totalLabs || 0);
          let completedAssessments = (hasQuiz ? 1 : 0) + (hasLab ? 1 : 0);
          let weightedCompletionScore = 0;
          
          if (totalAssessments > 0) {
            let rawScore = 0;
            if (hasQuiz) rawScore += (course.avgQuizScore || 0);
            if (hasLab) rawScore += (course.avgLabScore || 0);
            weightedCompletionScore = Math.round((rawScore / totalAssessments));
          }
          
          // Determine if quiz and lab are passed
          const quizPassed = course.avgQuizScore !== null && course.avgQuizScore >= 70;
          const labPassed = course.avgLabScore !== null && course.avgLabScore >= 70;
          
          return {
            ...course,
            performanceScore, // Score based ONLY on completed work (can be high even with low progress)
            weightedCompletionScore, // Score that includes zeros for incomplete items
            quizPassed,
            labPassed,
            quizPassedCount: quizPassed ? 1 : 0,
            labPassedCount: labPassed ? 1 : 0,
          };
        });
        
        data.courseSnapshots = courseSnapshotsWithDetails;
        
        // Set first course as selected if available
        if (courseSnapshotsWithDetails?.length > 0 && !selectedCourse) {
          setSelectedCourse(courseSnapshotsWithDetails[0]);
        }
        
        setAnalysis(data);
      } else {
        setError(data.message || "Failed to load analysis");
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Filter weak areas for selected course
  const getFilteredWeakAreas = () => {
    if (!selectedCourse) return analysis?.weakAreas || [];
    return analysis?.weakAreas?.filter(area => area.course === selectedCourse.course) || [];
  };

  // Filter strengths for selected course
  const getFilteredStrengths = () => {
    if (!selectedCourse) return analysis?.strengths || [];
    return analysis?.strengths?.filter(strength => strength.course === selectedCourse.course) || [];
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

  // Get the current course data
  const currentCourse = selectedCourse || analysis.courseSnapshots?.[0];
  const filteredWeakAreas = getFilteredWeakAreas();
  const filteredStrengths = getFilteredStrengths();

  // Calculate totals for the selected course
  const totalQuizzesInCourse = currentCourse?.totalQuizzes || 0;
  const totalLabsInCourse = currentCourse?.totalLabs || 0;
  const quizzesPassedCount = currentCourse?.quizPassedCount || 0;
  const labsPassedCount = currentCourse?.labPassedCount || 0;
  
  // Calculate completed assessments count
  const hasQuiz = currentCourse?.avgQuizScore !== null && currentCourse?.avgQuizScore !== undefined;
  const hasLab = currentCourse?.avgLabScore !== null && currentCourse?.avgLabScore !== undefined;
  const completedAssessments = (hasQuiz ? 1 : 0) + (hasLab ? 1 : 0);
  const totalAssessments = totalQuizzesInCourse + totalLabsInCourse;

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

      {/* Course Selector */}
      {analysis.courseSnapshots?.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Course</label>
          <select
            value={selectedCourse?.course || ""}
            onChange={(e) => {
              const course = analysis.courseSnapshots.find(c => c.course === e.target.value);
              setSelectedCourse(course);
            }}
            className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all cursor-pointer"
          >
            {analysis.courseSnapshots.map((course, idx) => (
              <option key={idx} value={course.course}>{course.course} ({course.code})</option>
            ))}
          </select>
        </div>
      )}

      {/* Course Performance Overview */}
      {currentCourse && (
        <div className="rounded-2xl p-6" style={{ background: `linear-gradient(135deg, ${C.surface} 0%, ${C.surface2} 100%)`, border: `1px solid ${C.accent}44` }}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-black text-white">{currentCourse.course}</h2>
              <p className="text-xs text-gray-500">{currentCourse.code}</p>
            </div>
            {currentCourse.isCompleted && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${C.green}22`, color: C.greenLight, border: `1px solid ${C.green}44` }}>
                ✓ Completed
              </span>
            )}
          </div>
          
          {/* Two Score Rings Side by Side */}
          <div className="flex flex-row justify-center items-center gap-8 mb-6">
            <Tooltip text="Based only on completed quizzes/labs">
              <RingProgress 
                value={currentCourse.performanceScore || 0} 
                size={100} 
                stroke={8} 
                color={currentCourse.performanceScore >= 70 ? C.green : currentCourse.performanceScore >= 50 ? C.amber : C.red}
                label="Performance"
              />
            </Tooltip>
            <Tooltip text="Includes zeros for incomplete assessments">
              <RingProgress 
                value={currentCourse.weightedCompletionScore || 0} 
                size={100} 
                stroke={8} 
                color={currentCourse.weightedCompletionScore >= 70 ? C.green : currentCourse.weightedCompletionScore >= 50 ? C.amber : C.red}
                label="Overall Score"
              />
            </Tooltip>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Tooltip text="How much of the course you've completed">
              <div className="text-center p-3 rounded-xl" style={{ background: C.surface2 }}>
                <p className="text-2xl font-black text-white">{currentCourse.progress}%</p>
                <p className="text-[10px] text-gray-500">Course Progress</p>
              </div>
            </Tooltip>
            <Tooltip text="Your average quiz score on completed quizzes">
              <div className="text-center p-3 rounded-xl" style={{ background: C.surface2 }}>
                <p className="text-2xl font-black text-amber-400">{currentCourse.avgQuizScore || 0}%</p>
                <p className="text-[10px] text-gray-500">Quiz Avg</p>
              </div>
            </Tooltip>
            <Tooltip text="Your average lab score on completed labs">
              <div className="text-center p-3 rounded-xl" style={{ background: C.surface2 }}>
                <p className="text-2xl font-black text-purple-400">{currentCourse.avgLabScore || 0}%</p>
                <p className="text-[10px] text-gray-500">Lab Avg</p>
              </div>
            </Tooltip>
            <Tooltip text="Performance score: average of your quiz and lab scores (only completed items)">
              <div className="text-center p-3 rounded-xl" style={{ background: C.surface2 }}>
                <p className="text-2xl font-black text-indigo-400">{currentCourse.performanceScore || 0}%</p>
                <p className="text-[10px] text-gray-500">Performance</p>
              </div>
            </Tooltip>
          </div>
          
          <MiniBar value={currentCourse.progress} color={currentCourse.isCompleted ? C.green : C.accent} />
          
          {/* Assessment Completion Status */}
          <div className="mt-4 p-3 rounded-lg" style={{ background: `${C.accent}11`, border: `1px solid ${C.accent}33` }}>
            <p className="text-[10px] text-gray-400 mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">info</span>
              Assessment Completion:
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Completed: {completedAssessments}/{totalAssessments} assessments</span>
              <span className="text-gray-400">
                {Math.round((completedAssessments / totalAssessments) * 100)}% done
              </span>
            </div>
            <MiniBar value={(completedAssessments / totalAssessments) * 100} color={C.cyan} height={3} />
          </div>
          
          {/* Quiz and Lab Pass Counts */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: C.surface2 }}>
              <span className="text-xs text-gray-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-amber-400">quiz</span>
                Quizzes Passed
              </span>
              <span className="text-sm font-bold text-amber-400">
                {quizzesPassedCount}/{totalQuizzesInCourse}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: C.surface2 }}>
              <span className="text-xs text-gray-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-purple-400">science</span>
                Labs Passed
              </span>
              <span className="text-sm font-bold text-purple-400">
                {labsPassedCount}/{totalLabsInCourse}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid with Glow Cards - Overall Stats (all courses combined) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <GlowCard icon="school" label="Total Courses" value={analysis.metrics?.totalCourses || 0} color={C.accent} />
        <GlowCard icon="emoji_events" label="Courses Completed" value={`${analysis.metrics?.completedCourses || 0}/${analysis.metrics?.totalCourses || 0}`} color={C.green} />
        <GlowCard icon="quiz" label="Avg Quiz Score" value={`${analysis.metrics?.overallQuizAvg || 0}%`} color={C.amber} />
        <GlowCard icon="science" label="Avg Lab Score" value={`${analysis.metrics?.overallLabAvg || 0}%`} color={C.accent2} />
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
          {filteredWeakAreas.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <span className="material-symbols-outlined text-6xl text-gray-700 mb-4 block">check_circle</span>
              <p className="font-bold text-white text-lg">No weak areas detected!</p>
              <p className="text-sm text-gray-500">You're doing great in this course. Keep it up! 🎉</p>
            </div>
          ) : (
            filteredWeakAreas.map((area, i) => (
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
          {filteredStrengths.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <span className="material-symbols-outlined text-6xl text-gray-700 mb-4 block">trending_up</span>
              <p className="font-bold text-white text-lg">Keep building your strengths!</p>
              <p className="text-sm text-gray-500">Complete more quizzes and labs to see your strengths</p>
            </div>
          ) : (
            filteredStrengths.map((strength, i) => (
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
    </div>
  );
};

export default StudentAIAnalytics;