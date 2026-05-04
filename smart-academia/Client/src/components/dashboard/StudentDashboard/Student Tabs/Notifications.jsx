// components/dashboard/StudentDashboard/Student Tabs/Notifications.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

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

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ icon, title, color = C.accent }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
      <span className="material-symbols-outlined text-sm" style={{ color }}>{icon}</span>
    </div>
    <h3 className="text-xs font-bold text-white tracking-wide uppercase">{title}</h3>
    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}44, transparent)` }} />
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

const apiFetch = (url, opts = {}) => {
  const token = localStorage.getItem("token");
  return fetch(`${API}${url}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
};

const typeConfig = {
  quiz_deadline:       { icon: "quiz",                 color: C.amber,   bg: `${C.amber}22`, border: `${C.amber}44`, label: "Quiz Deadline" },
  lab_deadline:        { icon: "science",              color: C.accent2, bg: `${C.accent2}22`, border: `${C.accent2}44`, label: "Lab Deadline" },
  assignment_deadline: { icon: "assignment",           color: C.red,     bg: `${C.red}22`, border: `${C.red}44`, label: "Assignment Due" },
  announcement:        { icon: "campaign",             color: C.cyan,    bg: `${C.cyan}22`, border: `${C.cyan}44`, label: "Announcement" },
  course_published:    { icon: "school",               color: C.green,   bg: `${C.green}22`, border: `${C.green}44`, label: "Course Update" },
  enrollment:          { icon: "check_circle",         color: C.green,   bg: `${C.green}22`, border: `${C.green}44`, label: "Enrolled" },
  grade_posted:        { icon: "grade",                color: C.accent,  bg: `${C.accent}22`, border: `${C.accent}44`, label: "Grade Posted" },
  lab_graded:          { icon: "science",              color: C.accent,  bg: `${C.accent}22`, border: `${C.accent}44`, label: "Lab Graded" },
  assignment_graded:   { icon: "assignment_turned_in", color: C.accent,  bg: `${C.accent}22`, border: `${C.accent}44`, label: "Assignment Graded" },
  lesson_unlocked:     { icon: "lock_open",            color: C.cyan,    bg: `${C.cyan}22`, border: `${C.cyan}44`, label: "Unlocked" },
  quiz_passed:         { icon: "emoji_events",         color: C.green,   bg: `${C.green}22`, border: `${C.green}44`, label: "Quiz Passed" },
  course_completed:    { icon: "celebration",          color: C.green,   bg: `${C.green}22`, border: `${C.green}44`, label: "Completed" },
  system:              { icon: "info",                 color: C.textFaint, bg: `${C.textFaint}22`, border: `${C.textFaint}44`, label: "System" },
};

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)     return "just now";
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const FILTER_TABS = [
  { key: "all",       label: "All",        icon: "notifications",       color: C.accent },
  { key: "unread",    label: "Unread",     icon: "mark_email_unread",    color: C.red },
  { key: "deadlines", label: "Deadlines",  icon: "schedule",             color: C.amber },
  { key: "grades",    label: "Grades",     icon: "grade",                color: C.green },
];

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNotifications = useCallback(async (reset = true, filterOverride = null) => {
    reset ? setLoading(true) : setLoadingMore(true);
    try {
      const currentPage = reset ? 1 : page;
      const activeFilter = filterOverride !== null ? filterOverride : filter;

      let url = `/api/notifications?page=${currentPage}&limit=15`;
      if (activeFilter === "unread") url += "&unreadOnly=true";
      if (activeFilter === "deadlines") url += "&type=quiz_deadline,lab_deadline,assignment_deadline";
      if (activeFilter === "grades") url += "&type=lab_graded,assignment_graded,grade_posted";

      const res = await apiFetch(url);
      const data = await res.json();
      
      if (res.ok) {
        if (reset) {
          setNotifs(data.notifications || []);
          setPage(2);
        } else {
          setNotifs(prev => [...prev, ...(data.notifications || [])]);
          setPage(currentPage + 1);
        }
        setUnreadCount(data.unreadCount || 0);
        setHasMore(data.pagination?.hasMore || false);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      reset ? setLoading(false) : setLoadingMore(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchNotifications(true);
  }, [filter]);

  const handleRead = async (notif) => {
    if (actionLoading) return;
    
    try {
      if (!notif.isRead) {
        setActionLoading(true);
        await apiFetch(`/api/notifications/${notif._id}/read`, { method: "PUT" });
        setNotifs(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        setActionLoading(false);
      }
      if (notif.link) navigate(notif.link);
    } catch (err) {
      console.error("Mark read error:", err);
      setActionLoading(false);
    }
  };

  const handleDelete = async (notifId, e) => {
    e.stopPropagation();
    if (actionLoading) return;
    
    if (!window.confirm("Delete this notification?")) return;
    
    try {
      setActionLoading(true);
      await apiFetch(`/api/notifications/${notifId}`, { method: "DELETE" });
      const deletedNotif = notifications.find(n => n._id === notifId);
      setNotifs(prev => prev.filter(n => n._id !== notifId));
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setActionLoading(false);
    } catch (err) {
      console.error("Delete error:", err);
      setActionLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (actionLoading || unreadCount === 0) return;
    
    if (!window.confirm(`Mark all ${unreadCount} unread notifications as read?`)) return;
    
    try {
      setActionLoading(true);
      await apiFetch("/api/notifications/read-all", { method: "PUT" });
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      setActionLoading(false);
    } catch (err) {
      console.error("Mark all read error:", err);
      setActionLoading(false);
    }
  };

  const handleClearRead = async () => {
    const readCount = notifications.filter(n => n.isRead).length;
    if (readCount === 0) {
      alert("No read notifications to clear");
      return;
    }
    
    if (!window.confirm(`Clear ${readCount} read notifications?`)) return;
    
    try {
      setActionLoading(true);
      await apiFetch("/api/notifications/clear-read", { method: "DELETE" });
      setNotifs(prev => prev.filter(n => !n.isRead));
      setActionLoading(false);
    } catch (err) {
      console.error("Clear read error:", err);
      setActionLoading(false);
    }
  };

  // Group notifications by date
  const grouped = notifications.reduce((acc, notif) => {
    const date = new Date(notif.createdAt);
    const now = new Date();
    let label;
    const dayDiff = Math.floor((now - date) / 86400000);
    if (dayDiff === 0) label = "Today";
    else if (dayDiff === 1) label = "Yesterday";
    else if (dayDiff < 7) label = "This Week";
    else label = "Earlier";
    if (!acc[label]) acc[label] = [];
    acc[label].push(notif);
    return acc;
  }, {});

  const groupOrder = ["Today", "Yesterday", "This Week", "Earlier"];

  const stats = [
    { label: "Total", value: notifications.length, icon: "notifications", color: C.accent },
    { label: "Unread", value: unreadCount, icon: "mark_email_unread", color: C.red },
    { label: "Deadlines", value: notifications.filter(n => n.type?.includes("deadline")).length, icon: "schedule", color: C.amber },
    { label: "Grades", value: notifications.filter(n => n.type?.includes("graded") || n.type === "grade_posted").length, icon: "grade", color: C.green },
  ];

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
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#818cf8" }}>Notifications</p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Stay Updated with Notifications
        </h1>
      </div>
      

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <GlowCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} />
        ))}
      </div>

      {/* Actions Bar */}
      <div className="rounded-xl p-4 flex flex-wrap items-center justify-between gap-3" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <div className="flex gap-1 rounded-xl p-1" style={{ background: C.surface2, border: `1px solid ${C.border}` }}>
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab.key 
                  ? "text-white shadow-md" 
                  : "hover:bg-white/5"
              }`}
              style={filter === tab.key ? { background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` } : { color: C.textDim }}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: `${C.accent}22`, color: C.indigoLight, border: `1px solid ${C.accent}44` }}
            >
              Mark all as read
            </button>
          )}
          <button
            onClick={handleClearRead}
            disabled={actionLoading}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: `${C.red}22`, color: C.redLight, border: `1px solid ${C.red}44` }}
          >
            Clear read
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        {loading ? (
          <div className="py-20">
            <Spinner size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl mb-4 block" style={{ color: C.border2 }}>notifications_off</span>
            <h3 className="font-bold text-white text-base mb-1">
              {filter === "unread" ? "No unread notifications" :
               filter === "deadlines" ? "No deadline notifications" :
               filter === "grades" ? "No grade notifications" :
               "No notifications yet"}
            </h3>
            <p className="text-sm" style={{ color: C.textFaint }}>
              {filter === "all" ? "You'll see notifications from your courses here" : "Try a different filter"}
            </p>
          </div>
        ) : (
          groupOrder.map(group => {
            if (!grouped[group]?.length) return null;
            return (
              <div key={group}>
                <div className="px-5 py-2.5" style={{ background: C.surface2, borderBottom: `1px solid ${C.border}` }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textFaint }}>
                    {group}
                  </p>
                </div>
                <div className="divide-y" style={{ borderColor: C.border }}>
                  {grouped[group].map(notif => {
                    const cfg = typeConfig[notif.type] || typeConfig.system;
                    return (
                      <div
                        key={notif._id}
                        className={`group flex items-start gap-4 px-5 py-4 cursor-pointer transition-all hover:bg-white/5 ${
                          !notif.isRead ? "bg-indigo-500/5" : ""
                        }`}
                        onClick={() => handleRead(notif)}
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center mt-0.5"
                          style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                          <span className="material-symbols-outlined text-lg" style={{ color: cfg.color }}>{cfg.icon}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <p className={`text-sm font-semibold leading-snug ${!notif.isRead ? "text-white" : "text-gray-300"}`}>
                                  {notif.title}
                                </p>
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                                  {cfg.label}
                                </span>
                                {(notif.priority === "high" || notif.priority === "urgent") && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                                    style={{ background: `${C.red}22`, border: `1px solid ${C.red}44`, color: C.redLight }}>
                                    {notif.priority === "urgent" ? "Urgent" : "High Priority"}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs leading-relaxed" style={{ color: C.textDim }}>
                                {notif.message}
                              </p>
                            </div>

                            {/* Delete Button */}
                            <button
                              onClick={(e) => handleDelete(notif._id, e)}
                              disabled={actionLoading}
                              className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30"
                              style={{ color: C.textFaint }}
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>

                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-[10px]" style={{ color: C.textFaint }}>{timeAgo(notif.createdAt)}</span>
                            {notif.courseId?.title && (
                              <>
                                <span className="text-[10px]" style={{ color: C.border2 }}>•</span>
                                <span className="text-[10px]" style={{ color: C.indigoLight }}>{notif.courseId.title}</span>
                              </>
                            )}
                            {notif.dueDate && (
                              <>
                                <span className="text-[10px]" style={{ color: C.border2 }}>•</span>
                                <span className="flex items-center gap-0.5 text-[10px] font-medium" style={{ color: C.amberLight }}>
                                  <span className="material-symbols-outlined text-xs">schedule</span>
                                  Due {new Date(notif.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                              </>
                            )}
                            {notif.link && (
                              <>
                                <span className="text-[10px]" style={{ color: C.border2 }}>•</span>
                                <span className="text-[10px] flex items-center gap-0.5" style={{ color: C.indigoLight }}>
                                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                                  Click to view
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Unread Dot */}
                        {!notif.isRead && (
                          <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full mt-2" style={{ background: C.accent, boxShadow: `0 0 6px ${C.accent}` }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* Load More Button */}
        {hasMore && !loading && notifications.length > 0 && (
          <div className="p-5 border-t" style={{ borderColor: C.border }}>
            <button
              onClick={() => fetchNotifications(false)}
              disabled={loadingMore}
              className="w-full py-3 text-sm font-semibold rounded-xl transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: `${C.accent}22`, color: C.indigoLight, border: `1px solid ${C.accent}44` }}
            >
              {loadingMore ? (
                <>
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: C.border }} />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                  </div>
                  Loading...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                  Load more
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: C.surface, border: `1px solid ${C.accent}33` }}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44` }}>
          <span className="material-symbols-outlined text-sm" style={{ color: C.accent }}>info</span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: C.textDim }}>
          <span className="font-semibold" style={{ color: C.indigoLight }}>Stay informed:</span> Notifications include deadlines, grade updates, and important announcements from your courses. Click any notification to view details, and use the filters to focus on specific types.
        </p>
      </div>
    </div>
  );
};

export default Notifications;