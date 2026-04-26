// components/dashboard/StudentDashboard/Student Tabs/Notifications.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ icon, title, color = "#6366f1" }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
      <span className="material-symbols-outlined text-sm" style={{ color }}>{icon}</span>
    </div>
    <h3 className="text-xs font-bold text-white tracking-wide uppercase">{title}</h3>
    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}44, transparent)` }} />
  </div>
);

// ── Glow Card ─────────────────────────────────────────────────
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
    <MiniBar value={75} color={color} />
  </div>
);

// ── Loading Spinner ───────────────────────────────────────────
const LoadingSpinner = ({ size = "md" }) => {
  const dimensions = size === "sm" ? "w-10 h-10" : size === "lg" ? "w-16 h-16" : "w-12 h-12";
  return (
    <div className={`relative ${dimensions} mx-auto`}>
      <div className="absolute inset-0 rounded-full border-4 border-indigo-900" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
      <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
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
  quiz_deadline:       { icon: "quiz",                 color: "#f59e0b",  bg: "#f59e0b22", border: "#f59e0b44", label: "Quiz Deadline"    },
  lab_deadline:        { icon: "science",              color: "#a855f7", bg: "#a855f722", border: "#a855f744", label: "Lab Deadline"  },
  assignment_deadline: { icon: "assignment",           color: "#ef4444", bg: "#ef444422", border: "#ef444444", label: "Assignment Due"   },
  announcement:        { icon: "campaign",             color: "#3b82f6", bg: "#3b82f622", border: "#3b82f644", label: "Announcement"     },
  course_published:    { icon: "school",               color: "#22c55e", bg: "#22c55e22", border: "#22c55e44", label: "Course Update"    },
  enrollment:          { icon: "check_circle",         color: "#22c55e", bg: "#22c55e22", border: "#22c55e44", label: "Enrolled"         },
  grade_posted:        { icon: "grade",                color: "#6366f1", bg: "#6366f122", border: "#6366f144", label: "Grade Posted"   },
  lab_graded:          { icon: "science",              color: "#6366f1", bg: "#6366f122", border: "#6366f144", label: "Lab Graded"     },
  assignment_graded:   { icon: "assignment_turned_in", color: "#6366f1", bg: "#6366f122", border: "#6366f144", label: "Assignment Graded"},
  lesson_unlocked:     { icon: "lock_open",            color: "#14b8a6", bg: "#14b8a622", border: "#14b8a644", label: "Unlocked"         },
  quiz_passed:         { icon: "emoji_events",         color: "#eab308", bg: "#eab30822", border: "#eab30844", label: "Quiz Passed"    },
  course_completed:    { icon: "celebration",          color: "#22c55e", bg: "#22c55e22", border: "#22c55e44", label: "Completed"        },
  system:              { icon: "info",                 color: "#6b7280", bg: "#6b728022", border: "#6b728044", label: "System"           },
};

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)     return "just now";
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const FILTER_TABS = [
  { key: "all",       label: "All",        icon: "notifications",    color: "#6366f1" },
  { key: "unread",    label: "Unread",     icon: "mark_email_unread", color: "#ef4444" },
  { key: "deadlines", label: "Deadlines",  icon: "schedule",         color: "#f59e0b" },
  { key: "grades",    label: "Grades",     icon: "grade",            color: "#22c55e" },
];

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifs]  = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState("all");
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNotifications = useCallback(async (reset = true, filterOverride = null) => {
    reset ? setLoading(true) : setLoadingMore(true);
    try {
      const p = reset ? 1 : page;
      const activeFilter = filterOverride ?? filter;

      let url = `/api/notifications?page=${p}&limit=15`;
      if (activeFilter === "unread")    url += "&unreadOnly=true";
      if (activeFilter === "deadlines") url += "&type=quiz_deadline,lab_deadline,assignment_deadline";
      if (activeFilter === "grades")    url += "&type=lab_graded,assignment_graded,grade_posted";

      const res  = await apiFetch(url);
      const data = await res.json();
      if (res.ok) {
        setNotifs(prev => reset ? data.notifications : [...prev, ...data.notifications]);
        setUnreadCount(data.unreadCount);
        setHasMore(data.pagination.hasMore);
        if (!reset) setPage(p + 1);
        else setPage(2);
      }
    } catch { /* silent */ }
    finally { reset ? setLoading(false) : setLoadingMore(false); }
  }, [filter, page]);

  useEffect(() => {
    fetchNotifications(true);
  }, [filter]);

  const handleRead = async (notif) => {
    if (!notif.isRead) {
      await apiFetch(`/api/notifications/${notif._id}/read`, { method: "PUT" });
      setNotifs(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    if (notif.link) navigate(notif.link);
  };

  const handleDelete = async (notifId) => {
    await apiFetch(`/api/notifications/${notifId}`, { method: "DELETE" });
    setNotifs(prev => prev.filter(n => n._id !== notifId));
  };

  const handleMarkAllRead = async () => {
    await apiFetch("/api/notifications/read-all", { method: "PUT" });
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleClearRead = async () => {
    if (!window.confirm("Clear all read notifications?")) return;
    await apiFetch("/api/notifications/clear-read", { method: "DELETE" });
    setNotifs(prev => prev.filter(n => !n.isRead));
  };

  // Group notifications by date
  const grouped = notifications.reduce((acc, notif) => {
    const date = new Date(notif.createdAt);
    const now  = new Date();
    let label;
    const dayDiff = Math.floor((now - date) / 86400000);
    if (dayDiff === 0)      label = "Today";
    else if (dayDiff === 1) label = "Yesterday";
    else if (dayDiff < 7)   label = "This Week";
    else                    label = "Earlier";
    if (!acc[label]) acc[label] = [];
    acc[label].push(notif);
    return acc;
  }, {});

  const groupOrder = ["Today", "Yesterday", "This Week", "Earlier"];

  const stats = [
    { label: "Total",    value: notifications.length, icon: "notifications",     color: "#6366f1" },
    { label: "Unread",   value: unreadCount,           icon: "mark_email_unread", color: "#ef4444" },
    { label: "Deadlines",value: notifications.filter(n => n.type?.includes("deadline")).length, icon: "schedule", color: "#f59e0b" },
    { label: "Grades",   value: notifications.filter(n => n.type?.includes("graded") || n.type === "grade_posted").length, icon: "grade", color: "#22c55e" },
  ];

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif" }}>

     

      {/* ── Stats Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <GlowCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} />
        ))}
      </div>

      {/* ── Filter Tabs ────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl p-1.5" style={{ background: "#0a0f1e", border: "1px solid #1e293b" }}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-sm font-semibold transition-all duration-200"
            style={filter === tab.key
              ? { background: "#1e293b", color: "#818cf8", boxShadow: "0 0 20px #6366f120" }
              : { color: "#4b5563" }
            }
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Notification List ──────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
        {loading ? (
          <div className="py-20">
            <LoadingSpinner />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-gray-700 mb-4 block">
              notifications_off
            </span>
            <h3 className="text-base font-bold text-gray-400 mb-1">
              {filter === "unread" ? "No unread notifications" :
               filter === "deadlines" ? "No deadline notifications" :
               filter === "grades" ? "No grade notifications" :
               "No notifications yet"}
            </h3>
            <p className="text-sm text-gray-600">
              {filter === "all" ? "You'll see notifications from your courses here" : "Try a different filter"}
            </p>
          </div>
        ) : (
          groupOrder.map(group => {
            if (!grouped[group]?.length) return null;
            return (
              <div key={group}>
                <div className="px-5 py-2.5" style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b" }}>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {group}
                  </p>
                </div>
                <div className="divide-y" style={{ borderColor: "#1e293b" }}>
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
                        <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center mt-0.5`}
                          style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                          <span className={`material-symbols-outlined text-lg`} style={{ color: cfg.color }}>{cfg.icon}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <p className={`text-sm font-semibold leading-snug ${
                                  !notif.isRead ? "text-white" : "text-gray-300"
                                }`}>
                                  {notif.title}
                                </p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold`}
                                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                                  {cfg.label}
                                </span>
                                {notif.priority === "high" || notif.priority === "urgent" ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                                    style={{ background: "#ef444422", border: "1px solid #ef444444", color: "#f87171" }}>
                                    {notif.priority === "urgent" ? "🚨 Urgent" : "⚠️ High"}
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                {notif.message}
                              </p>
                            </div>

                            {/* Delete */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(notif._id); }}
                              className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>

                          {/* Meta */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-[10px] text-gray-500">{timeAgo(notif.createdAt)}</span>
                            {notif.courseId?.title && (
                              <>
                                <span className="text-[10px] text-gray-600">•</span>
                                <span className="text-[10px] text-indigo-400 truncate max-w-[150px]">
                                  {notif.courseId.title}
                                </span>
                              </>
                            )}
                            {notif.dueDate && (
                              <>
                                <span className="text-[10px] text-gray-600">•</span>
                                <span className="flex items-center gap-0.5 text-[10px] text-red-400 font-medium">
                                  <span className="material-symbols-outlined text-xs">schedule</span>
                                  Due {new Date(notif.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                              </>
                            )}
                            {notif.link && (
                              <span className="text-[10px] text-indigo-400 flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-xs">open_in_new</span>
                                View
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Unread dot */}
                        {!notif.isRead && (
                          <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full mt-2" style={{ background: "#6366f1", boxShadow: "0 0 6px #6366f1" }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <div className="p-5 border-t" style={{ borderColor: "#1e293b" }}>
            <button onClick={() => fetchNotifications(false)} disabled={loadingMore}
              className="w-full py-3 text-sm font-semibold rounded-xl transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: "#6366f122", color: "#818cf8", border: "1px solid #6366f144" }}>
              {loadingMore ? (
                <><div className="relative w-4 h-4"><div className="absolute inset-0 rounded-full border-2 border-indigo-900" /><div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" /></div>Loading...</>
              ) : (
                <><span className="material-symbols-outlined text-sm">expand_more</span>Load more</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Info Banner ────────────────────────────────────── */}
      <div className="rounded-xl p-3 flex items-start gap-3" style={{ background: "#0f1629", border: "1px solid #6366f133" }}>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
          <span className="material-symbols-outlined text-xs" style={{ color: "#6366f1" }}>info</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          <strong className="text-indigo-400">Stay informed:</strong> Notifications include deadlines, grade updates, and important announcements from your courses. Click any notification to view details.
        </p>
      </div>
    </div>
  );
};

export default Notifications;