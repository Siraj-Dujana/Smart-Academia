// components/dashboard/StudentDashboard/Student Tabs/Notifications.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const apiFetch = (url, opts = {}) => {
  const token = localStorage.getItem("token");
  return fetch(`${API}${url}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
};

const typeConfig = {
  quiz_deadline:       { icon: "quiz",                 color: "text-amber-500",  bg: "bg-amber-100 dark:bg-amber-900/30",   badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", label: "Quiz Deadline"    },
  lab_deadline:        { icon: "science",              color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30", badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", label: "Lab Deadline"  },
  assignment_deadline: { icon: "assignment",           color: "text-red-500",    bg: "bg-red-100 dark:bg-red-900/30",       badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",       label: "Assignment Due"   },
  announcement:        { icon: "campaign",             color: "text-blue-500",   bg: "bg-blue-100 dark:bg-blue-900/30",     badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",     label: "Announcement"     },
  course_published:    { icon: "school",               color: "text-green-500",  bg: "bg-green-100 dark:bg-green-900/30",   badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",  label: "Course Update"    },
  enrollment:          { icon: "check_circle",         color: "text-green-500",  bg: "bg-green-100 dark:bg-green-900/30",   badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",  label: "Enrolled"         },
  grade_posted:        { icon: "grade",                color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/30", badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300", label: "Grade Posted"   },
  lab_graded:          { icon: "science",              color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/30", badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300", label: "Lab Graded"     },
  assignment_graded:   { icon: "assignment_turned_in", color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/30", badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300", label: "Assignment Graded"},
  lesson_unlocked:     { icon: "lock_open",            color: "text-teal-500",   bg: "bg-teal-100 dark:bg-teal-900/30",     badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",     label: "Unlocked"         },
  quiz_passed:         { icon: "emoji_events",         color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30", badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300", label: "Quiz Passed"    },
  course_completed:    { icon: "celebration",          color: "text-green-500",  bg: "bg-green-100 dark:bg-green-900/30",   badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",  label: "Completed"        },
  system:              { icon: "info",                 color: "text-gray-500",   bg: "bg-gray-100 dark:bg-gray-700",        badge: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",         label: "System"           },
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
  { key: "all",       label: "All",        icon: "notifications"    },
  { key: "unread",    label: "Unread",     icon: "mark_email_unread" },
  { key: "deadlines", label: "Deadlines",  icon: "schedule"         },
  { key: "grades",    label: "Grades",     icon: "grade"            },
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
    { label: "Total",    value: notifications.length, icon: "notifications",    color: "text-indigo-600" },
    { label: "Unread",   value: unreadCount,           icon: "mark_email_unread", color: "text-red-500"    },
    { label: "Deadlines",value: notifications.filter(n => n.type?.includes("deadline")).length, icon: "schedule", color: "text-amber-500" },
    { label: "Grades",   value: notifications.filter(n => n.type?.includes("graded") || n.type === "grade_posted").length, icon: "grade", color: "text-green-500" },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-2xl sm:text-3xl">notifications</span>
            Notifications
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Stay updated on deadlines, grades, and course activities
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-sm">done_all</span>
              Mark all read
            </button>
          )}
          {notifications.some(n => n.isRead) && (
            <button onClick={handleClearRead}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
              Clear read
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all hover:scale-105 group">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <span className={`material-symbols-outlined text-lg ${s.color}`}>{s.icon}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {FILTER_TABS.map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 py-3 text-xs sm:text-sm font-medium transition-all ${
                filter === tab.key
                  ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/30"
              }`}>
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              <span className="hidden xs:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">
                notifications_off
              </span>
              <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                {filter === "unread" ? "No unread notifications" :
                 filter === "deadlines" ? "No deadline notifications" :
                 filter === "grades" ? "No grade notifications" :
                 "No notifications yet"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filter === "all" ? "You'll see notifications from your courses here" : "Try a different filter"}
              </p>
            </div>
          ) : (
            groupOrder.map(group => {
              if (!grouped[group]?.length) return null;
              return (
                <div key={group}>
                  <div className="px-4 sm:px-5 py-2 bg-gray-50 dark:bg-gray-700/30">
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {group}
                    </p>
                  </div>
                  {grouped[group].map(notif => {
                    const cfg = typeConfig[notif.type] || typeConfig.system;
                    return (
                      <div key={notif._id}
                        className={`group flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/30 ${
                          !notif.isRead ? "bg-indigo-50/40 dark:bg-indigo-900/5" : ""
                        }`}
                        onClick={() => handleRead(notif)}
                      >
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center mt-0.5`}>
                          <span className={`material-symbols-outlined text-lg ${cfg.color}`}>{cfg.icon}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                <p className={`text-sm font-medium leading-snug ${
                                  !notif.isRead ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                                }`}>
                                  {notif.title}
                                </p>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${cfg.badge}`}>
                                  {cfg.label}
                                </span>
                                {notif.priority === "high" || notif.priority === "urgent" ? (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">
                                    {notif.priority === "urgent" ? "🚨 Urgent" : "⚠️ High"}
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                {notif.message}
                              </p>
                            </div>

                            {/* Delete */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(notif._id); }}
                              className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>

                          {/* Meta */}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-gray-400">{timeAgo(notif.createdAt)}</span>
                            {notif.courseId?.title && (
                              <>
                                <span className="text-[10px] text-gray-300">•</span>
                                <span className="text-[10px] text-indigo-500 dark:text-indigo-400 truncate max-w-[150px]">
                                  {notif.courseId.title}
                                </span>
                              </>
                            )}
                            {notif.dueDate && (
                              <>
                                <span className="text-[10px] text-gray-300">•</span>
                                <span className="flex items-center gap-0.5 text-[10px] text-red-500 font-medium">
                                  <span className="material-symbols-outlined text-xs">schedule</span>
                                  Due {new Date(notif.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                              </>
                            )}
                            {notif.link && (
                              <span className="text-[10px] text-indigo-500 dark:text-indigo-400 flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-xs">open_in_new</span>
                                View
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Unread dot */}
                        {!notif.isRead && (
                          <div className="flex-shrink-0 w-2.5 h-2.5 bg-indigo-500 rounded-full mt-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}

          {/* Load more */}
          {hasMore && !loading && (
            <div className="p-4">
              <button onClick={() => fetchNotifications(false)} disabled={loadingMore}
                className="w-full py-2.5 text-sm text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loadingMore ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Loading...</>
                ) : (
                  <><span className="material-symbols-outlined text-sm">expand_more</span>Load more</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;