import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
const SectionHeader = ({ icon, title, color = "#6366f1", rightElement }) => (
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

// ── Student Detail Modal ──────────────────────────────────────
const StudentDetailModal = ({ student, courseId, onClose }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchStudentProgress();
  }, [student._id]);

  const fetchStudentProgress = async () => {
    try {
      const res = await fetch(`${API}/api/teacher/courses/${courseId}/students/${student._id}/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setProgress(data);
      else {
        // Fallback using student data
        setProgress({
          overallProgress: student.progress || 0,
          completedLessons: student.completedLessons || 0,
          passedQuizzes: student.passedQuizzes || 0,
          submittedLabs: student.submittedLabs || 0,
          totalLessons: student.totalLessons || 0,
          totalQuizzes: student.totalQuizzes || 0,
          totalLabs: student.totalLabs || 0,
          quizzes: student.quizzes || [],
          labs: student.labs || [],
          lessons: student.lessons || [],
          recentActivity: student.recentActivity || []
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" style={{ background: "#0f1629", border: "1px solid #1e293b" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
          <div>
            <p className="text-sm font-bold text-white">{student.name}</p>
            <p className="text-xs text-indigo-200">{student.email}</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1.5 flex-shrink-0" style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b" }}>
          {["overview", "quizzes", "labs", "lessons"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all capitalize ${
                activeTab === tab ? "text-indigo-400 bg-indigo-500/10" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {tab === "overview" && "dashboard"}
                {tab === "quizzes" && "quiz"}
                {tab === "labs" && "science"}
                {tab === "lessons" && "menu_book"}
              </span>
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-900" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
              </div>
            </div>
          ) : activeTab === "overview" ? (
            <>
              {/* Overall Progress Ring */}
              <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6" style={{ background: "#0a0f1e", border: "1px solid #1e293b" }}>
                <RingProgress value={progress?.overallProgress || 0} size={100} stroke={8} color="#6366f1" trackColor="#1e2d3d" />
                <div>
                  <p className="text-sm font-semibold text-white mb-2">Student Performance Summary</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 rounded-lg" style={{ background: "#1e293b" }}>
                      <p className="text-2xl font-bold text-indigo-400">{progress?.completedLessons || 0}</p>
                      <p className="text-[10px] text-gray-500">Lessons Completed</p>
                    </div>
                    <div className="p-2 rounded-lg" style={{ background: "#1e293b" }}>
                      <p className="text-2xl font-bold text-emerald-400">{progress?.passedQuizzes || 0}</p>
                      <p className="text-[10px] text-gray-500">Quizzes Passed</p>
                    </div>
                    <div className="p-2 rounded-lg" style={{ background: "#1e293b" }}>
                      <p className="text-2xl font-bold text-purple-400">{progress?.submittedLabs || 0}</p>
                      <p className="text-[10px] text-gray-500">Labs Submitted</p>
                    </div>
                    <div className="p-2 rounded-lg" style={{ background: "#1e293b" }}>
                      <p className="text-2xl font-bold text-amber-400">{progress?.avgQuizScore || 0}%</p>
                      <p className="text-[10px] text-gray-500">Avg Quiz Score</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              {progress?.recentActivity && progress.recentActivity.length > 0 && (
                <div className="rounded-xl p-5" style={{ background: "#0a0f1e", border: "1px solid #1e293b" }}>
                  <SectionHeader icon="history" title="Recent Activity" color="#6366f1" />
                  <div className="space-y-3">
                    {progress.recentActivity.map((activity, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${activity.color || "#6366f1"}22` }}>
                          <span className="material-symbols-outlined text-sm" style={{ color: activity.color || "#6366f1" }}>{activity.icon || "event_note"}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white">{activity.description}</p>
                          <p className="text-[10px] text-gray-500">{new Date(activity.date).toLocaleString()}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          activity.status === "completed" ? "text-green-400 bg-green-400/20" :
                          activity.status === "passed" ? "text-green-400 bg-green-400/20" :
                          "text-amber-400 bg-amber-400/20"
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : activeTab === "quizzes" ? (
            <div className="space-y-4">
              {progress?.quizzes?.map((quiz) => (
                <div key={quiz._id} className="rounded-xl p-4" style={{ background: "#0a0f1e", border: "1px solid #1e293b" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-white text-sm">{quiz.title}</p>
                      <p className="text-xs text-gray-500">Attempts: {quiz.attempts?.length || 0} / {quiz.maxAttempts}</p>
                    </div>
                    <ScoreBadge score={quiz.bestScore} />
                  </div>
                  {quiz.bestScore !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Best Score</span>
                        <span>{quiz.bestScore}% (Pass: {quiz.passingScore}%)</span>
                      </div>
                      <MiniBar value={quiz.bestScore} color={quiz.bestScore >= quiz.passingScore ? "#22c55e" : "#ef4444"} height={6} />
                    </div>
                  )}
                  {quiz.attempts?.length > 0 && (
                    <details className="mt-3">
                      <summary className="text-xs text-indigo-400 cursor-pointer hover:text-indigo-300">View all attempts</summary>
                      <div className="mt-2 space-y-2">
                        {quiz.attempts.map((attempt, i) => (
                          <div key={i} className="flex justify-between items-center p-2 rounded-lg" style={{ background: "#1e293b" }}>
                            <span className="text-xs text-gray-400">Attempt {i + 1}</span>
                            <span className="text-xs font-mono text-white">{attempt.score}%</span>
                            <span className="text-[10px] text-gray-500">{new Date(attempt.submittedAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
              {(!progress?.quizzes || progress.quizzes.length === 0) && (
                <div className="text-center py-12" style={{ background: "#0a0f1e", borderRadius: "1rem" }}>
                  <span className="material-symbols-outlined text-5xl text-gray-700 mb-2 block">quiz</span>
                  <p className="text-gray-500 text-sm">No quiz attempts yet</p>
                </div>
              )}
            </div>
          ) : activeTab === "labs" ? (
            <div className="space-y-4">
              {progress?.labs?.map((lab) => (
                <div key={lab._id} className="rounded-xl p-4" style={{ background: "#0a0f1e", border: "1px solid #1e293b" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-white text-sm">{lab.title}</p>
                      <p className="text-xs text-gray-500 capitalize">{lab.labType}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      lab.submission?.status === "graded" ? "text-green-400 bg-green-400/20" :
                      lab.submission?.status === "submitted" ? "text-amber-400 bg-amber-400/20" :
                      "text-gray-500 bg-gray-700"
                    }`}>
                      {lab.submission?.status || "Not Started"}
                    </span>
                  </div>
                  {lab.submission && lab.submission.status === "graded" && (
                    <div className="mt-2 p-3 rounded-lg" style={{ background: "#1e293b" }}>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Marks</span>
                        <span className="text-sm font-bold text-emerald-400">{lab.submission.marks} / {lab.totalMarks}</span>
                      </div>
                      {lab.submission.feedback && (
                        <p className="text-xs text-gray-300 mt-2 border-l-2 pl-2" style={{ borderColor: "#a855f7" }}>"{lab.submission.feedback}"</p>
                      )}
                    </div>
                  )}
                  {lab.submission && lab.submission.submittedAt && (
                    <p className="text-xs text-gray-500 mt-2">Submitted: {new Date(lab.submission.submittedAt).toLocaleString()}</p>
                  )}
                </div>
              ))}
              {(!progress?.labs || progress.labs.length === 0) && (
                <div className="text-center py-12" style={{ background: "#0a0f1e", borderRadius: "1rem" }}>
                  <span className="material-symbols-outlined text-5xl text-gray-700 mb-2 block">science</span>
                  <p className="text-gray-500 text-sm">No lab submissions yet</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {progress?.lessons?.map((lesson, idx) => (
                <div key={lesson._id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "#0a0f1e", border: "1px solid #1e293b" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: lesson.isCompleted ? "#22c55e22" : "#1e293b", border: `1px solid ${lesson.isCompleted ? "#22c55e" : "#374151"}`, color: lesson.isCompleted ? "#4ade80" : "#6b7280" }}>
                      {lesson.isCompleted ? "✓" : idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Lesson {lesson.order}: {lesson.title}</p>
                      <p className="text-xs text-gray-500">{lesson.duration}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    lesson.isCompleted ? "text-green-400 bg-green-400/20" :
                    lesson.viewed ? "text-blue-400 bg-blue-400/20" :
                    "text-gray-500 bg-gray-700"
                  }`}>
                    {lesson.isCompleted ? "Completed" : lesson.viewed ? "Viewed" : "Not Started"}
                  </span>
                </div>
              ))}
              {(!progress?.lessons || progress.lessons.length === 0) && (
                <div className="text-center py-12" style={{ background: "#0a0f1e", borderRadius: "1rem" }}>
                  <span className="material-symbols-outlined text-5xl text-gray-700 mb-2 block">menu_book</span>
                  <p className="text-gray-500 text-sm">No lessons available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Course Card for Teacher View ──────────────────────────────
const CourseCard = ({ course, onViewStudents }) => {
  const hue = course.isCompleted ? "#22c55e" : course.avgProgress >= 70 ? "#6366f1" : course.avgProgress >= 40 ? "#f59e0b" : "#ef4444";
  
  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300" style={{ background: "#0f1629", border: `1px solid ${hue}33` }}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <RingProgress value={course.avgProgress} size={68} stroke={6} color={hue} trackColor="#1e2d3d" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-white text-base leading-tight">{course.title}</h3>
              {course.isPublished && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#22c55e22", color: "#4ade80", border: "1px solid #22c55e44" }}>PUBLISHED</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-3">{course.code} · {course.department || "General"} · {course.credits} credits</p>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "#1e293b" }}>
                <span className="material-symbols-outlined text-xs text-indigo-400">groups</span>
                <span className="text-xs text-gray-300 font-medium">{course.enrolledCount || 0} students</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "#1e293b" }}>
                <span className="material-symbols-outlined text-xs text-indigo-400">menu_book</span>
                <span className="text-xs text-gray-300 font-medium">{course.totalLessons || 0} lessons</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "#1e293b" }}>
                <span className="material-symbols-outlined text-xs text-amber-400">quiz</span>
                <span className="text-xs text-gray-300 font-medium">{course.totalQuizzes || 0} quizzes</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "#1e293b" }}>
                <span className="material-symbols-outlined text-xs text-purple-400">science</span>
                <span className="text-xs text-gray-300 font-medium">{course.totalLabs || 0} labs</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => onViewStudents(course)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
          >
            <span className="material-symbols-outlined text-sm">groups</span>
            View Students
          </button>
        </div>
        
        <div className="mt-4">
          <MiniBar value={course.avgProgress} color={hue} height={4} />
        </div>
      </div>
    </div>
  );
};

// ── Student Row for Course View ───────────────────────────────
const StudentRow = ({ student, onViewDetails }) => {
  const progressColor = student.progress >= 70 ? "#22c55e" : student.progress >= 40 ? "#f59e0b" : "#ef4444";
  
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors border-b border-gray-800">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#1e293b", border: "1px solid #374151" }}>
        <span className="material-symbols-outlined text-sm text-gray-400">person</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{student.name}</p>
        <p className="text-xs text-gray-500">{student.email}</p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3">
          <div className="text-center">
            <p className="text-xs text-gray-500">Quizzes</p>
            <p className="text-sm font-bold text-white">{student.passedQuizzes || 0}/{student.totalQuizzes || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Labs</p>
            <p className="text-sm font-bold text-white">{student.submittedLabs || 0}/{student.totalLabs || 0}</p>
          </div>
        </div>
        
        <div className="w-20">
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>Progress</span>
            <span>{student.progress || 0}%</span>
          </div>
          <MiniBar value={student.progress || 0} color={progressColor} height={4} />
        </div>
        
        <button
          onClick={() => onViewDetails(student)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
          style={{ background: "#6366f122", color: "#818cf8", border: "1px solid #6366f144" }}
        >
          <span className="material-symbols-outlined text-sm">visibility</span>
          Details
        </button>
      </div>
    </div>
  );
};

// ── Main TeacherAnalytics Component ───────────────────────────
const TeacherAnalytics = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [overallStats, setOverallStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    avgProgress: 0,
    totalSubmissions: 0
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API}/api/courses/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.courses?.length > 0) {
        setCourses(data.courses);
        calculateOverallStats(data.courses);
      } else {
        setError("No courses found");
      }
    } catch (err) {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallStats = (coursesList) => {
    const totalStudents = coursesList.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);
    const avgProgress = coursesList.length > 0 
      ? Math.round(coursesList.reduce((sum, c) => sum + (c.avgProgress || 0), 0) / coursesList.length)
      : 0;
    
    setOverallStats({
      totalStudents,
      totalCourses: coursesList.length,
      avgProgress,
      totalSubmissions: coursesList.reduce((sum, c) => sum + (c.totalSubmissions || 0), 0)
    });
  };

  const handleViewStudents = async (course) => {
    setSelectedCourse(course);
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/courses/${course._id}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.students) {
        setStudents(data.students);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("Failed to fetch students", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" style={{ background: "#0f1629" }}>
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-900" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-16" style={{ background: "#0f1629" }}>
        <span className="material-symbols-outlined text-6xl text-gray-700 mb-4">school</span>
        <h3 className="text-lg font-medium text-white mb-2">No courses yet</h3>
        <p className="text-sm text-gray-500">Create a course to start tracking student progress</p>
        <button
          onClick={() => navigate("/teacher/dashboard?tab=courses")}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
        >
          <span className="material-symbols-outlined text-base">add</span>
          Create Course
        </button>
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <div className="space-y-5" style={{ fontFamily: "'Lexend', sans-serif" }}>
        {/* Back button */}
        <button
          onClick={() => setSelectedCourse(null)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{ background: "#6366f122", color: "#818cf8", border: "1px solid #6366f144" }}
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Courses
        </button>

        {/* Course Header */}
        <div className="relative rounded-2xl overflow-hidden p-6" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", border: "1px solid #1e293b" }}>
          <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "#6366f1" }} />
          <div className="relative">
            <h1 className="text-2xl font-black text-white">{selectedCourse.title}</h1>
            <p className="text-sm text-gray-400 mt-1">{selectedCourse.code} · {selectedCourse.department}</p>
            <div className="flex gap-3 mt-4">
              <div className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "#1e293b", color: "#818cf8" }}>
                {students.length} Students Enrolled
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "#1e293b", color: "#4ade80" }}>
                {Math.round(students.reduce((sum, s) => sum + (s.progress || 0), 0) / (students.length || 1))}% Avg Progress
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base">search</span>
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Students List */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "#1e293b" }}>
            <SectionHeader icon="groups" title="Enrolled Students" color="#6366f1" rightElement={
              <span className="text-xs text-gray-500">{students.length} total</span>
            } />
          </div>
          
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-gray-700 mb-2 block">search_off</span>
              <p className="text-gray-500 text-sm">No students found</p>
            </div>
          ) : (
            filteredStudents.map(student => (
              <StudentRow key={student._id} student={student} onViewDetails={setSelectedStudent} />
            ))
          )}
        </div>

        {/* Student Detail Modal */}
        {selectedStudent && (
          <StudentDetailModal
            student={selectedStudent}
            courseId={selectedCourse._id}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif" }}>
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", border: "1px solid #1e293b" }}>
        <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "#6366f1" }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: "#a855f7" }} />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#6366f1" }} />
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">SmartAcademia · Teacher Analytics</p>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
              Student Performance<br />
              <span style={{ background: "linear-gradient(90deg, #818cf8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Dashboard
              </span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <RingProgress value={overallStats.avgProgress} size={90} stroke={8} color="#6366f1" trackColor="#1e2d3d" label="Avg Progress" sublabel="All Courses" />
            <RingProgress value={Math.round((overallStats.totalSubmissions / (overallStats.totalStudents * 5)) * 100) || 0} size={90} stroke={8} color="#a855f7" trackColor="#1e2d3d" label="Engagement" sublabel="Overall" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <GlowCard icon="school" label="Total Courses" value={overallStats.totalCourses} color="#6366f1" />
        <GlowCard icon="groups" label="Total Students" value={overallStats.totalStudents} color="#22c55e" />
        <GlowCard icon="trending_up" label="Avg Progress" value={`${overallStats.avgProgress}%`} color="#f59e0b" />
        <GlowCard icon="assignment_turned_in" label="Submissions" value={overallStats.totalSubmissions} color="#a855f7" />
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-5 rounded-2xl flex items-center gap-3" style={{ background: "#1a0a0a", border: "1px solid #ef444433" }}>
          <span className="material-symbols-outlined text-red-500 text-2xl">error</span>
          <div>
            <p className="font-semibold text-red-400">Failed to load analytics</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Courses List */}
      <div className="space-y-3">
        <SectionHeader icon="menu_book" title="Your Courses" color="#6366f1" />
        {courses.map(course => (
          <CourseCard key={course._id} course={course} onViewStudents={handleViewStudents} />
        ))}
      </div>
    </div>
  );
};

export default TeacherAnalytics;