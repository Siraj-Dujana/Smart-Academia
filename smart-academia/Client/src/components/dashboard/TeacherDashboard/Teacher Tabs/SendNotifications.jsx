// components/dashboard/TeacherDashboard/Teacher Tabs/SendNotifications.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";

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

const NOTIF_TYPES = [
  { value: "announcement",        label: "Announcement",         desc: "General course announcement", icon: "campaign", color: C.cyan },
  { value: "quiz_deadline",       label: "Quiz Deadline",        desc: "Remind students of a quiz deadline", icon: "quiz", color: C.amber },
  { value: "lab_deadline",        label: "Lab Deadline",         desc: "Remind students of a lab deadline", icon: "science", color: C.accent2 },
  { value: "assignment_deadline", label: "Assignment Deadline",  desc: "Remind students of an assignment", icon: "assignment", color: C.red },
];

const NOTIF_PRIORITIES = [
  { value: "low",    label: "Low",    color: C.greenLight, bg: "#22c55e22", border: "#22c55e44" },
  { value: "normal", label: "Normal", color: C.indigoLight, bg: "#6366f122", border: "#6366f144" },
  { value: "high",   label: "High",   color: C.amberLight, bg: "#f59e0b22", border: "#f59e0b44" },
  { value: "urgent", label: "Urgent", color: C.redLight,   bg: "#ef444422", border: "#ef444444" },
];

const SendNotifications = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [form, setForm] = useState({
    type: "announcement",
    title: "",
    content: "",
    dueDate: "",
    priority: "normal",
    sendEmail: false,
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [totalNotifCount, setTotalNotifCount] = useState(0);

  useEffect(() => {
    fetchCourses();
    fetchHistory();
    fetchAnalytics();
    fetchTotalCount();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchHistory();
    }
  }, [selectedCourseId]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/teacher/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.courses?.length) {
        setCourses(data.courses);
        setSelectedCourseId(data.courses[0]._id);
      }
    } catch {
      // silent
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/notifications?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(data.notifications || []);
        // Update total count from pagination
        if (data.pagination?.total !== undefined) {
          setTotalNotifCount(data.pagination.total);
        }
      }
    } catch {
      // silent
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchTotalCount = async () => {
    try {
      const token = localStorage.getItem("token");
      // Fetch just 1 notification to get the total count from pagination
      const res = await fetch(`${API}/api/notifications?limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.pagination?.total !== undefined) {
        setTotalNotifCount(data.pagination.total);
      }
    } catch {
      // silent
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAnalytics({
          totalSent: totalNotifCount,
          unreadCount: data.count || 0,
          activeCourses: courses.length,
        });
      }
    } catch {
      // silent
    }
  };

  // Update analytics when totalNotifCount or courses change
  useEffect(() => {
    if (analytics !== null) {
      setAnalytics(prev => ({
        ...prev,
        totalSent: totalNotifCount,
        activeCourses: courses.length,
      }));
    } else {
      setAnalytics({
        totalSent: totalNotifCount,
        unreadCount: 0,
        activeCourses: courses.length,
      });
    }
  }, [totalNotifCount, courses.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!selectedCourseId) {
      setError("Please select a course");
      return;
    }
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!form.content.trim()) {
      setError("Content is required");
      return;
    }
    if (form.type !== "announcement" && !form.dueDate) {
      setError("Due date is required for deadline notifications");
      return;
    }

    setSending(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const isDeadline = form.type !== "announcement";
      const endpoint = isDeadline ? "/api/notifications/deadline" : "/api/notifications/announcement";
      
      const body = {
        courseId: selectedCourseId,
        title: form.title,
        sendEmail: form.sendEmail,
      };
      
      if (isDeadline) {
        body.type = form.type;
        body.message = form.content;
        if (form.dueDate) {
          body.dueDate = form.dueDate;
        }
      } else {
        body.content = form.content;
        body.priority = form.priority;
      }

      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || "Failed to send notification");
        return;
      }
      
      setSuccess(data.message || "Notification sent successfully!");
      setForm(prev => ({
        ...prev,
        title: "",
        content: "",
        dueDate: "",
        sendEmail: false,
      }));
      
      // Refresh all data after send
      await fetchHistory();
      await fetchTotalCount();
      await fetchAnalytics();
      
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error("Send error:", err);
      setError("Cannot connect to server");
    } finally {
      setSending(false);
    }
  };

  const selectedType = NOTIF_TYPES.find(t => t.value === form.type);
  const isDeadline = form.type !== "announcement";
  const selectedPriority = NOTIF_PRIORITIES.find(p => p.value === form.priority);
  const selectedCourse = courses.find(c => c._id === selectedCourseId);

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif", background: C.bg }}>
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", border: "1px solid #1e293b" }}>
        <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: C.accent }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: C.accent2 }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.accent }} />
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">SmartAcademia · Teacher Tools</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Send Notifications</h1>
          <p className="text-sm text-gray-400 mt-1">Notify students about deadlines, announcements, and important updates</p>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <GlowCard icon="send" label="Notifications Sent" value={analytics.totalSent || 0} color={C.accent} />
          <GlowCard icon="notifications" label="Unread" value={analytics.unreadCount || 0} color={C.amber} />
          <GlowCard icon="school" label="Active Courses" value={analytics.activeCourses || 0} color={C.green} />
          <GlowCard icon="group" label="Total Students" value={selectedCourse?.enrolledCount || 0} color={C.accent2} sub={selectedCourse?.title} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Send Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <div className="px-6 py-4 border-b" style={{ background: C.surface2, borderColor: C.border }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44` }}>
                  <span className="material-symbols-outlined text-base" style={{ color: C.accent }}>edit_notifications</span>
                </div>
                <h2 className="text-sm font-bold text-white tracking-wide uppercase">Compose Notification</h2>
                <div className="flex-1 h-px w-20" style={{ background: `linear-gradient(90deg, ${C.accent}44, transparent)` }} />
              </div>
            </div>

            <form onSubmit={handleSend} className="p-6 space-y-5">
              {/* Error & Success */}
              {error && (
                <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: `${C.red}22`, border: `1px solid ${C.red}44` }}>
                  <span className="material-symbols-outlined text-sm" style={{ color: C.redLight }}>error</span>
                  <span className="text-sm flex-1" style={{ color: C.redLight }}>{error}</span>
                  <button onClick={() => setError("")}><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
              )}
              {success && (
                <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: `${C.green}22`, border: `1px solid ${C.green}44` }}>
                  <span className="material-symbols-outlined text-sm" style={{ color: C.greenLight }}>check_circle</span>
                  <span className="text-sm flex-1" style={{ color: C.greenLight }}>{success}</span>
                </div>
              )}

              {/* Course Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>
                  Select Course
                </label>
                {courses.length === 0 ? (
                  <div className="p-4 text-center rounded-xl" style={{ background: C.surface2, border: `1px solid ${C.border}` }}>
                    <p className="text-sm" style={{ color: C.textDim }}>No courses found. Create a course first.</p>
                  </div>
                ) : (
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                    style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                  >
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.title} ({c.enrolledCount || 0} students)
                      </option>
                    ))}
                  </select>
                )}
                {selectedCourse && (
                  <p className="text-xs mt-2 flex items-center gap-1" style={{ color: C.textFaint }}>
                    <span className="material-symbols-outlined text-xs">group</span>
                    Sending to {selectedCourse.enrolledCount || 0} enrolled student{selectedCourse.enrolledCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Notification Type */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>
                  Notification Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {NOTIF_TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, type: t.value }))}
                      className={`text-left p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                        form.type === t.value ? "bg-opacity-20" : "bg-opacity-0"
                      }`}
                      style={{
                        background: form.type === t.value ? `${t.color}22` : "transparent",
                        borderColor: form.type === t.value ? `${t.color}55` : C.border,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm" style={{ color: t.color }}>{t.icon}</span>
                        <p className="text-sm font-medium" style={{ color: form.type === t.value ? t.color : C.text }}>
                          {t.label}
                        </p>
                      </div>
                      <p className="text-xs mt-0.5 ml-7" style={{ color: C.textFaint }}>{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>
                  Title
                </label>
                <input
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={isDeadline ? "Example: Quiz 3 Due Tomorrow" : "Example: Important Class Update"}
                  className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                  style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                  onFocus={e => e.target.style.borderColor = C.accent}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>

              {/* Content / Message */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>
                  {isDeadline ? "Message" : "Content"}
                </label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={5}
                  placeholder={isDeadline ? "Write your deadline reminder message..." : "Write your announcement content..."}
                  className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all resize-none"
                  style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                  onFocus={e => e.target.style.borderColor = C.accent}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>

              {/* Due Date (for deadlines) */}
              {isDeadline && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={form.dueDate}
                    onChange={e => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                    style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                    onFocus={e => e.target.style.borderColor = C.accent}
                    onBlur={e => e.target.style.borderColor = C.border}
                  />
                </div>
              )}

              {/* Priority (for announcements only) */}
              {!isDeadline && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>
                    Priority
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {NOTIF_PRIORITIES.map(p => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, priority: p.value }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
                          form.priority === p.value ? "ring-2 ring-offset-1" : "opacity-70"
                        }`}
                        style={{
                          background: form.priority === p.value ? p.bg : "transparent",
                          color: p.color,
                          border: `1px solid ${p.border}`,
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Option */}
              <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:scale-105"
                style={{ background: `${C.cyan}22`, border: `1px solid ${C.cyan}44` }}>
                <input
                  type="checkbox"
                  checked={form.sendEmail}
                  onChange={e => setForm(prev => ({ ...prev, sendEmail: e.target.checked }))}
                  className="rounded w-4 h-4"
                  style={{ accentColor: C.accent }}
                />
                <div>
                  <p className="text-sm font-medium flex items-center gap-1.5" style={{ color: C.text }}>
                    <span className="material-symbols-outlined text-base" style={{ color: C.cyan }}>mail</span>
                    Also send email notification
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: C.textFaint }}>
                    Sends an email to each student in addition to the in-app notification
                  </p>
                </div>
              </label>

              {/* Submit Button */}
              
              {/* Submit Button - GLOW CARD STYLE WITH CENTERED CONTENT */}
<button
  type="submit"
  disabled={sending || !selectedCourseId || !form.title.trim() || !form.content.trim()}
  className="relative rounded-xl overflow-hidden w-full group disabled:opacity-50 disabled:cursor-not-allowed"
>
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
    style={{ background: `radial-gradient(ellipse at 50% 0%, ${C.accent}40 0%, transparent 70%)` }} />
  <div className="relative py-3 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center"
    style={{ 
      background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
    }}
  >
    {sending ? (
      <div className="flex items-center justify-center gap-2">
        <Spinner size="sm" />
        <span>Sending...</span>
      </div>
    ) : (
      <div className="flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-base">send</span>
        {isDeadline ? "Send Deadline Reminder" : "Send Announcement"}
      </div>
    )}
  </div>
</button>


            </form>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Live Preview */}
          {(form.title || form.content) && (
            <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="px-5 py-3 border-b" style={{ background: C.surface2, borderColor: C.border }}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm" style={{ color: C.accent }}>preview</span>
                  <p className="text-xs font-bold text-white uppercase tracking-wide">Live Preview</p>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: selectedPriority?.bg || `${C.accent}22`, border: `1px solid ${selectedPriority?.border || C.accent}44` }}>
                    <span className="material-symbols-outlined text-base" style={{ color: selectedType?.color || C.accent }}>
                      {selectedType?.icon || "notifications"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: C.text }}>{form.title || "Notification Title"}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: C.textDim }}>{form.content || "Your message will appear here..."}</p>
                    {isDeadline && form.dueDate && (
                      <p className="text-xs mt-1 flex items-center gap-0.5 font-medium" style={{ color: C.amberLight }}>
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        Due {new Date(form.dueDate).toLocaleString()}
                      </p>
                    )}
                    <p className="text-[10px] mt-1" style={{ color: C.textFaint }}>Preview only</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Best Practices */}
          <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.amber}33` }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-sm" style={{ color: C.amber }}>lightbulb</span>
              <p className="text-xs font-bold text-white uppercase tracking-wide">Best Practices</p>
            </div>
            <ul className="space-y-2">
              {[
                "Send deadline reminders 24 to 48 hours in advance",
                "Keep titles concise and action-oriented",
                "Use clear, specific language in notifications",
                "Include relevant links when applicable",
                "Schedule notifications during active hours for better engagement",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: C.textDim }}>
                  <span className="material-symbols-outlined text-xs" style={{ color: C.amber }}>check</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Course Stats */}
          <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <div className="px-5 py-3 border-b" style={{ background: C.surface2, borderColor: C.border }}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm" style={{ color: C.accent }}>analytics</span>
                <p className="text-xs font-bold text-white uppercase tracking-wide">Your Courses</p>
              </div>
            </div>
            <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
              {courses.slice(0, 5).map(c => (
                <div key={c._id} className="flex items-center justify-between gap-2">
                  <p className="text-xs truncate flex-1" style={{ color: C.text }}>{c.title}</p>
                  <span className="flex items-center gap-1 text-xs flex-shrink-0" style={{ color: C.textFaint }}>
                    <span className="material-symbols-outlined text-xs">group</span>
                    {c.enrolledCount || 0}
                  </span>
                </div>
              ))}
              {courses.length === 0 && (
                <p className="text-xs text-center" style={{ color: C.textFaint }}>No courses yet</p>
              )}
            </div>
          </div>

          {/* Recent Notifications */}
          {loadingHistory ? (
            <div className="flex justify-center py-8"><Spinner size="sm" /></div>
          ) : history.length > 0 ? (
            <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="px-5 py-3 border-b" style={{ background: C.surface2, borderColor: C.border }}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm" style={{ color: C.accent }}>history</span>
                  <p className="text-xs font-bold text-white uppercase tracking-wide">Recent Notifications</p>
                </div>
              </div>
              <div className="divide-y max-h-64 overflow-y-auto" style={{ borderColor: C.border }}>
                {history.slice(0, 5).map(n => {
                  const notifType = NOTIF_TYPES.find(t => t.value === n.type);
                  return (
                    <div key={n._id} className="p-3 hover:bg-white/5 transition-colors">
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${notifType?.color || C.accent}22`, border: `1px solid ${notifType?.color || C.accent}44` }}>
                          <span className="material-symbols-outlined text-xs" style={{ color: notifType?.color || C.accent }}>
                            {notifType?.icon || "notifications"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium" style={{ color: C.text }}>{n.title}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: C.textFaint }}>
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SendNotifications;