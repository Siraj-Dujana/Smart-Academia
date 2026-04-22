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

// Type → icon/color mapping
const typeConfig = {
  quiz_deadline:       { icon: "quiz",            color: "text-amber-500",  bg: "bg-amber-50 dark:bg-amber-900/20",  label: "Quiz Deadline"    },
  lab_deadline:        { icon: "science",          color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20",label: "Lab Deadline"     },
  assignment_deadline: { icon: "assignment",       color: "text-red-500",    bg: "bg-red-50 dark:bg-red-900/20",     label: "Assignment Due"   },
  announcement:        { icon: "campaign",         color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-900/20",   label: "Announcement"     },
  course_published:    { icon: "school",           color: "text-green-500",  bg: "bg-green-50 dark:bg-green-900/20", label: "Course Update"    },
  enrollment:          { icon: "check_circle",     color: "text-green-500",  bg: "bg-green-50 dark:bg-green-900/20", label: "Enrolled"         },
  grade_posted:        { icon: "grade",            color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20",label: "Grade Posted"    },
  lab_graded:          { icon: "science",          color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20",label: "Lab Graded"      },
  assignment_graded:   { icon: "assignment_turned_in", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20", label: "Assignment Graded" },
  lesson_unlocked:     { icon: "lock_open",        color: "text-teal-500",   bg: "bg-teal-50 dark:bg-teal-900/20",  label: "Unlocked"         },
  quiz_passed:         { icon: "emoji_events",     color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20",label: "Quiz Passed"     },
  course_completed:    { icon: "celebration",      color: "text-green-500",  bg: "bg-green-50 dark:bg-green-900/20", label: "Completed"        },
  system:              { icon: "info",             color: "text-gray-500",   bg: "bg-gray-50 dark:bg-gray-800",      label: "System"           },
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
    // Poll every 30 seconds
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

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined text-xl sm:text-2xl">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[380px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          style={{ maxHeight: "min(520px, 80vh)" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-blue-600">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-white text-lg">notifications</span>
              <h3 className="font-semibold text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead}
                  className="text-xs text-white/80 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">
                  Mark all read
                </button>
              )}
              {read.length > 0 && (
                <button onClick={handleClearRead}
                  className="text-xs text-white/80 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">
                  Clear read
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto" style={{ maxHeight: "calc(min(520px, 80vh) - 56px)" }}>
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <svg className="animate-spin h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 px-6">
                <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3 block">
                  notifications_off
                </span>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">You're all caught up!</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">No notifications yet</p>
              </div>
            ) : (
              <>
                {/* Unread section */}
                {unread.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-indigo-50/50 dark:bg-indigo-900/10 border-b border-gray-100 dark:border-gray-700/50">
                      <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">New</p>
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
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/30 border-y border-gray-100 dark:border-gray-700/50">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Earlier</p>
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
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => fetchNotifications(false)}
                      disabled={loading}
                      className="w-full py-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? "Loading..." : "Load more notifications"}
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
      className={`group flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-150 hover:bg-gray-50 dark:hover:bg-gray-700/40 border-b border-gray-100 dark:border-gray-700/30 last:border-0 ${
        !notif.isRead ? "bg-indigo-50/30 dark:bg-indigo-900/5" : ""
      }`}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center mt-0.5`}>
        <span className={`material-symbols-outlined text-base ${cfg.color}`}>{cfg.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs sm:text-sm font-medium leading-snug truncate ${
            !notif.isRead ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
          }`}>
            {notif.title}
          </p>
          <button
            onClick={(e) => onDelete(e, notif._id)}
            className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-0.5 rounded text-gray-400 hover:text-red-500 transition-all"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
          {notif.message}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-gray-400">{timeAgo(notif.createdAt)}</span>
          {notif.courseId?.title && (
            <>
              <span className="text-[10px] text-gray-300">•</span>
              <span className="text-[10px] text-indigo-500 dark:text-indigo-400 truncate max-w-[120px]">
                {notif.courseId.title}
              </span>
            </>
          )}
          {notif.dueDate && (
            <>
              <span className="text-[10px] text-gray-300">•</span>
              <span className="text-[10px] text-red-500 font-medium">
                Due {new Date(notif.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Unread dot */}
      {!notif.isRead && (
        <div className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-2" />
      )}
    </div>
  );
};

export default NotificationBell;