// components/dashboard/AdminDashboard/Admin Tabs/AdminNotifications.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

// ── Progress Stat Card ─────────────────────────────────────────
const ProgressStatCard = ({ icon, label, value, total, color, isLoading }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <div className="relative rounded-2xl overflow-hidden p-5 flex flex-col gap-3 group" style={{ background: "#0f1629", border: `1px solid ${color}33` }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}15 0%, transparent 70%)` }} />
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
          <span className="material-symbols-outlined text-xl" style={{ color }}>{icon}</span>
        </div>
        <span className="text-xs font-bold" style={{ color }}>{percentage}%</span>
      </div>
      <div>
        {isLoading ? (
          <div className="h-9 w-16 bg-gray-800 rounded-lg animate-pulse" />
        ) : (
          <>
            <p className="text-3xl font-black text-white tracking-tight" style={{ textShadow: `0 0 20px ${color}66` }}>
              {value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              <span className="text-gray-400">out of</span> {total}
            </p>
          </>
        )}
        <p className="text-xs text-gray-400 font-medium mt-1">{label}</p>
      </div>
      <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: "#1e293b" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: `0 0 8px ${color}66`,
            transition: "width 1s cubic-bezier(.4,0,.2,1)"
          }}
        />
      </div>
    </div>
  );
};

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
  // Admin specific types
  teacher_registration: { icon: "person_add", color: "#6366f1", bg: "#6366f122", border: "#6366f144", label: "Teacher Registration" },
  student_registration: { icon: "group_add", color: "#22c55e", bg: "#22c55e22", border: "#22c55e44", label: "Student Registration" },
  course_creation: { icon: "menu_book", color: "#f59e0b", bg: "#f59e0b22", border: "#f59e0b44", label: "Course Created" },
  course_deletion: { icon: "delete", color: "#ef4444", bg: "#ef444422", border: "#ef444444", label: "Course Deleted" },
  user_report: { icon: "flag", color: "#a855f7", bg: "#a855f722", border: "#a855f744", label: "User Report" },
  system_alert: { icon: "warning", color: "#ef4444", bg: "#ef444422", border: "#ef444444", label: "System Alert" },
  backup_completed: { icon: "backup", color: "#22c55e", bg: "#22c55e22", border: "#22c55e44", label: "Backup Completed" },
  maintenance: { icon: "build", color: "#f59e0b", bg: "#f59e0b22", border: "#f59e0b44", label: "Maintenance" },
  
  // Shared types
  announcement: { icon: "campaign", color: "#3b82f6", bg: "#3b82f622", border: "#3b82f644", label: "Announcement" },
  system: { icon: "info", color: "#6b7280", bg: "#6b728022", border: "#6b728044", label: "System" },
};

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const FILTER_TABS = [
  { key: "all", label: "All", icon: "notifications", color: "#6366f1" },
  { key: "unread", label: "Unread", icon: "mark_email_unread", color: "#ef4444" },
  { key: "users", label: "Users", icon: "people", color: "#22c55e" },
  { key: "courses", label: "Courses", icon: "menu_book", color: "#f59e0b" },
  { key: "system", label: "System", icon: "settings", color: "#a855f7" },
];

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Target values for stats
  const MAX_NOTIFICATIONS_TARGET = 500;
  const MAX_UNREAD_TARGET = 100;
  const MAX_USER_NOTIFS_TARGET = 200;
  const MAX_COURSE_NOTIFS_TARGET = 150;

  const fetchNotifications = useCallback(async (reset = true, filterOverride = null) => {
    reset ? setLoading(true) : setLoadingMore(true);
    try {
      const p = reset ? 1 : page;
      const activeFilter = filterOverride ?? filter;

      // ✅ FIXED: Use correct API endpoint (notifications/admin, not admin/notifications)
      let url = `/api/notifications/admin?page=${p}&limit=15`;
      if (activeFilter === "unread") url += "&unreadOnly=true";
      if (activeFilter === "users") url += "&type=teacher_registration,student_registration,user_report";
      if (activeFilter === "courses") url += "&type=course_creation,course_deletion";
      if (activeFilter === "system") url += "&type=system_alert,backup_completed,maintenance";

      const res = await apiFetch(url);
      const data = await res.json();
      if (res.ok) {
        setNotifs(prev => reset ? data.notifications : [...prev, ...data.notifications]);
        setUnreadCount(data.unreadCount);
        setHasMore(data.pagination.hasMore);
        if (!reset) setPage(p + 1);
        else setPage(2);
      }
    } catch (err) { 
      console.error("Fetch error:", err);
    }
    finally { reset ? setLoading(false) : setLoadingMore(false); }
  }, [filter, page]);

  useEffect(() => {
    fetchNotifications(true);
  }, [filter]);

  const handleRead = async (notif) => {
    if (!notif.isRead) {
      // ✅ FIXED: Use correct API endpoint
      await apiFetch(`/api/notifications/admin/${notif._id}/read`, { method: "PUT" });
      setNotifs(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    if (notif.link) navigate(notif.link);
  };

  const handleDelete = async (notifId) => {
    // ✅ FIXED: Use correct API endpoint
    await apiFetch(`/api/notifications/admin/${notifId}`, { method: "DELETE" });
    setNotifs(prev => prev.filter(n => n._id !== notifId));
  };

  const handleMarkAllRead = async () => {
    // ✅ FIXED: Use correct API endpoint
    await apiFetch("/api/notifications/admin/read-all", { method: "PUT" });
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleClearRead = async () => {
    if (!window.confirm("Clear all read notifications?")) return;
    // ✅ FIXED: Use correct API endpoint
    await apiFetch("/api/notifications/admin/clear-read", { method: "DELETE" });
    setNotifs(prev => prev.filter(n => !n.isRead));
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

  const userNotifsCount = notifications.filter(n => 
    n.type === "teacher_registration" || n.type === "student_registration" || n.type === "user_report"
  ).length;
  
  const courseNotifsCount = notifications.filter(n => 
    n.type === "course_creation" || n.type === "course_deletion"
  ).length;
  
  const systemNotifsCount = notifications.filter(n => 
    n.type === "system_alert" || n.type === "backup_completed" || n.type === "maintenance"
  ).length;

  const stats = [
    { label: "Total", value: notifications.length, total: MAX_NOTIFICATIONS_TARGET, icon: "notifications", color: "#6366f1" },
    { label: "Unread", value: unreadCount, total: MAX_UNREAD_TARGET, icon: "mark_email_unread", color: "#ef4444" },
    { label: "User Events", value: userNotifsCount, total: MAX_USER_NOTIFS_TARGET, icon: "people", color: "#22c55e" },
    { label: "Course Events", value: courseNotifsCount, total: MAX_COURSE_NOTIFS_TARGET, icon: "menu_book", color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6" style={{ fontFamily: "'Lexend', sans-serif" }}>
      
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden p-6" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", border: "1px solid #1e293b" }}>
        <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "#6366f1" }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: "#a855f7" }} />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#6366f1" }} />
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Admin Portal · Notifications</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
            Admin Notifications
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Stay updated on system events, user registrations, and course activities
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all hover:scale-105"
            style={{ background: "#6366f122", color: "#818cf8", border: "1px solid #6366f144" }}
          >
            <span className="material-symbols-outlined text-sm">done_all</span>
            Mark all read
          </button>
        )}
        {notifications.some(n => n.isRead) && (
          <button
            onClick={handleClearRead}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all hover:scale-105"
            style={{ background: "#ef444422", color: "#f87171", border: "1px solid #ef444444" }}
          >
            <span className="material-symbols-outlined text-sm">delete_sweep</span>
            Clear read
          </button>
        )}
      </div>

      {/* Stats Grid with Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <ProgressStatCard
            key={s.label}
            icon={s.icon}
            label={s.label}
            value={s.value}
            total={s.total}
            color={s.color}
            isLoading={loading}
          />
        ))}
      </div>

      {/* Filter Tabs */}
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

      {/* Notification List */}
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
               filter === "users" ? "No user event notifications" :
               filter === "courses" ? "No course event notifications" :
               filter === "system" ? "No system notifications" :
               "No notifications yet"}
            </h3>
            <p className="text-sm text-gray-600">
              {filter === "all" ? "You'll see admin notifications here" : "Try a different filter"}
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
                            {notif.userName && (
                              <>
                                <span className="text-[10px] text-gray-600">•</span>
                                <span className="text-[10px] text-indigo-400 truncate max-w-[150px]">
                                  User: {notif.userName}
                                </span>
                              </>
                            )}
                            {notif.courseName && (
                              <>
                                <span className="text-[10px] text-gray-600">•</span>
                                <span className="text-[10px] text-amber-400 truncate max-w-[150px]">
                                  Course: {notif.courseName}
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

      {/* Info Banner */}
      <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "#0a0f1e", border: "1px solid #1e293b" }}>
        <span className="material-symbols-outlined text-xs text-indigo-400 mt-0.5">info</span>
        <p className="text-[10px] text-gray-500 leading-relaxed">
          <strong className="text-indigo-400">Admin notifications:</strong> Track system events, user registrations, course creations, and other administrative activities. Unread notifications are highlighted with a glowing dot.
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default AdminNotifications;