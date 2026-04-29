// components/notifications/NotificationBell.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const apiFetch = (url, opts = {}) => {
  const token = localStorage.getItem("token");
  return fetch(`${API}${url}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
};

// Type → icon/color mapping (dark theme consistent colors)
const typeConfig = {
  quiz_deadline:       { icon: "quiz",            color: "#f59e0b",  bg: "#f59e0b22", border: "#f59e0b44", label: "Quiz Deadline"    },
  lab_deadline:        { icon: "science",         color: "#a855f7",  bg: "#a855f722", border: "#a855f744", label: "Lab Deadline"     },
  assignment_deadline: { icon: "assignment",      color: "#ef4444",  bg: "#ef444422", border: "#ef444444", label: "Assignment Due"   },
  announcement:        { icon: "campaign",        color: "#3b82f6",  bg: "#3b82f622", border: "#3b82f644", label: "Announcement"     },
  course_published:    { icon: "school",          color: "#22c55e",  bg: "#22c55e22", border: "#22c55e44", label: "Course Update"    },
  enrollment:          { icon: "check_circle",    color: "#22c55e",  bg: "#22c55e22", border: "#22c55e44", label: "Enrolled"         },
  grade_posted:        { icon: "grade",           color: "#6366f1",  bg: "#6366f122", border: "#6366f144", label: "Grade Posted"    },
  lab_graded:          { icon: "science",         color: "#6366f1",  bg: "#6366f122", border: "#6366f144", label: "Lab Graded"       },
  assignment_graded:   { icon: "assignment_turned_in", color: "#6366f1", bg: "#6366f122", border: "#6366f144", label: "Assignment Graded" },
  lesson_unlocked:     { icon: "lock_open",       color: "#14b8a6",  bg: "#14b8a622", border: "#14b8a644", label: "Unlocked"         },
  quiz_passed:         { icon: "emoji_events",    color: "#eab308",  bg: "#eab30822", border: "#eab30844", label: "Quiz Passed"      },
  course_completed:    { icon: "celebration",     color: "#22c55e",  bg: "#22c55e22", border: "#22c55e44", label: "Completed"        },
  system:              { icon: "info",            color: "#6b7280",  bg: "#6b728022", border: "#6b728044", label: "System"           },
};

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const NotificationBell = ({ dashboardTab = "dashboard" }) => {
  const navigate = useNavigate();
  const [open, setOpen]               = useState(false);
  const [notifications, setNotifs]    = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading]         = useState(false);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(true);
  const dropdownRef = useRef(null);
  const pollRef     = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res  = await apiFetch("/api/notifications/unread-count");
      const data = await res.json();
      if (res.ok) setUnreadCount(data.count);
    } catch { /* silent */ }
  }, []);

  const fetchNotifications = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const p = reset ? 1 : page;
      const res  = await apiFetch(`/api/notifications?page=${p}&limit=10`);
      const data = await res.json();
      if (res.ok) {
        setNotifs(prev => reset ? data.notifications : [...prev, ...data.notifications]);
        setUnreadCount(data.unreadCount);
        setHasMore(data.pagination.hasMore);
        if (!reset) setPage(p + 1);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => {
    fetchUnreadCount();
    pollRef.current = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(pollRef.current);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (open && notifications.length === 0) {
      setPage(1);
      fetchNotifications(true);
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkRead = async (notif) => {
    if (!notif.isRead) {
      await apiFetch(`/api/notifications/${notif._id}/read`, { method: "PUT" });
      setNotifs(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    if (notif.link) {
      setOpen(false);
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    await apiFetch("/api/notifications/read-all", { method: "PUT" });
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (e, notifId) => {
    e.stopPropagation();
    await apiFetch(`/api/notifications/${notifId}`, { method: "DELETE" });
    setNotifs(prev => prev.filter(n => n._id !== notifId));
  };

  const handleClearRead = async () => {
    await apiFetch("/api/notifications/clear-read", { method: "DELETE" });
    setNotifs(prev => prev.filter(n => !n.isRead));
  };

  const unread    = notifications.filter(n => !n.isRead);
  const read      = notifications.filter(n => n.isRead);

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="relative w-8 h-8 mx-auto">
      <div className="absolute inset-0 rounded-full border-3 border-indigo-900" />
      <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-indigo-500 animate-spin" />
      <div className="absolute inset-1 rounded-full border-3 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
    </div>
  );

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg transition-all duration-200 hover:scale-105 group"
        style={{ color: "#64748b" }}
        aria-label="Notifications"
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
          style={{ background: "radial-gradient(ellipse at 50% 50%, #6366f115 0%, transparent 70%)" }}
        />
        <span className="material-symbols-outlined text-xl relative z-10">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full px-1 animate-pulse"
            style={{ background: "#ef4444", color: "white", boxShadow: "0 0 6px #ef4444" }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 mt-3 w-[360px] sm:w-[400px] rounded-2xl shadow-2xl z-50 overflow-hidden"
          style={{ background: "#0f1629", border: "1px solid #1e293b", maxHeight: "min(520px, 80vh)" }}>
          
          {/* Header with gradient */}
          <div className="flex items-center justify-between px-5 py-3" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-white text-lg">notifications</span>
              <h3 className="font-bold text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-white/80 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">
                  Mark all read
                </button>
              )}
              {read.length > 0 && (
                <button
                  onClick={handleClearRead}
                  className="text-[10px] text-white/80 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">
                  Clear read
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto" style={{ maxHeight: "calc(min(520px, 80vh) - 52px)" }}>
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 px-6">
                <span className="material-symbols-outlined text-5xl text-gray-700 mb-3 block">
                  notifications_off
                </span>
                <p className="text-sm font-semibold text-gray-400">You're all caught up!</p>
                <p className="text-xs text-gray-600 mt-1">No notifications yet</p>
              </div>
            ) : (
              <>
                {/* Unread section */}
                {unread.length > 0 && (
                  <div>
                    <div className="px-5 py-2" style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b" }}>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">New</p>
                    </div>
                    {unread.map(notif => (
                      <NotificationItem
                        key={notif._id}
                        notif={notif}
                        onRead={handleMarkRead}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}

                {/* Read section */}
                {read.length > 0 && (
                  <div>
                    <div className="px-5 py-2" style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b" }}>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Earlier</p>
                    </div>
                    {read.map(notif => (
                      <NotificationItem
                        key={notif._id}
                        notif={notif}
                        onRead={handleMarkRead}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}

                {/* Load more */}
                {hasMore && (
                  <div className="p-3 border-t" style={{ borderColor: "#1e293b" }}>
                    <button
                      onClick={() => fetchNotifications(false)}
                      disabled={loading}
                      className="w-full py-2 text-xs font-semibold rounded-lg transition-all hover:scale-105 disabled:opacity-50"
                      style={{ background: "#6366f122", color: "#818cf8", border: "1px solid #6366f144" }}>
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="relative w-3 h-3">
                            <div className="absolute inset-0 rounded-full border-2 border-indigo-900" />
                            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                          </div>
                          Loading...
                        </div>
                      ) : (
                        "Load more notifications"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Individual notification item
const NotificationItem = ({ notif, onRead, onDelete }) => {
  const cfg = typeConfig[notif.type] || typeConfig.system;

  return (
    <div
      onClick={() => onRead(notif)}
      className={`group flex items-start gap-3 px-5 py-3 cursor-pointer transition-all duration-150 hover:bg-white/5 border-b last:border-0 ${
        !notif.isRead ? "bg-indigo-500/5" : ""
      }`}
      style={{ borderColor: "#1e293b" }}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5`}
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
        <span className={`material-symbols-outlined text-base`} style={{ color: cfg.color }}>{cfg.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs font-semibold leading-snug ${
            !notif.isRead ? "text-white" : "text-gray-400"
          }`}>
            {notif.title}
          </p>
          <button
            onClick={(e) => onDelete(e, notif._id)}
            className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
          {notif.message}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <span className="text-[10px] text-gray-600">{timeAgo(notif.createdAt)}</span>
          {notif.courseId?.title && (
            <>
              <span className="text-[10px] text-gray-700">•</span>
              <span className="text-[10px] text-indigo-400 truncate max-w-[120px]">
                {notif.courseId.title}
              </span>
            </>
          )}
          {notif.dueDate && (
            <>
              <span className="text-[10px] text-gray-700">•</span>
              <span className="text-[10px] text-red-400 font-medium flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[10px]">schedule</span>
                Due {new Date(notif.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Unread dot with glow */}
      {!notif.isRead && (
        <div className="flex-shrink-0 w-2 h-2 rounded-full mt-1" style={{ background: "#6366f1", boxShadow: "0 0 6px #6366f1" }} />
      )}
    </div>
  );
};

export default NotificationBell;