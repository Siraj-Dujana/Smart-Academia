// components/notifications/AdminNotificationBell.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const apiFetch = async (url, opts = {}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}${url}`, {
    ...opts,
    headers: { 
      "Content-Type": "application/json", 
      Authorization: `Bearer ${token}`, 
      ...(opts.headers || {}) 
    },
  });
  return res;
};

// Admin specific type config
const adminTypeConfig = {
  teacher_registration: { icon: "person_add", color: "#6366f1", bg: "#6366f122", border: "#6366f144", label: "Teacher Registration" },
  student_registration: { icon: "group_add", color: "#22c55e", bg: "#22c55e22", border: "#22c55e44", label: "Student Registration" },
  course_creation: { icon: "menu_book", color: "#f59e0b", bg: "#f59e0b22", border: "#f59e0b44", label: "Course Created" },
  course_deletion: { icon: "delete", color: "#ef4444", bg: "#ef444422", border: "#ef444444", label: "Course Deleted" },
  user_report: { icon: "flag", color: "#a855f7", bg: "#a855f722", border: "#a855f744", label: "User Report" },
  system_alert: { icon: "warning", color: "#ef4444", bg: "#ef444422", border: "#ef444444", label: "System Alert" },
  system: { icon: "info", color: "#6b7280", bg: "#6b728022", border: "#6b728044", label: "System" },
};

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const AdminNotificationBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const pollRef = useRef(null);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await apiFetch("/api/notifications/admin/unread-count");
      const data = await res.json();
      if (res.ok) {
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Fetch unread count error:", error);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/notifications/admin?limit=10");
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Fetch notifications error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll every 30 seconds for new notifications
    pollRef.current = setInterval(() => {
      fetchUnreadCount();
      if (open) {
        fetchNotifications();
      }
    }, 30000);
    
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchUnreadCount, fetchNotifications, open]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

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
      try {
        await apiFetch(`/api/notifications/admin/${notif._id}/read`, { method: "PUT" });
        setNotifications(prev => 
          prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Mark read error:", error);
      }
    }
    if (notif.link) {
      setOpen(false);
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiFetch("/api/notifications/admin/read-all", { method: "PUT" });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Mark all read error:", error);
    }
  };

  const handleDelete = async (e, notifId) => {
    e.stopPropagation();
    try {
      await apiFetch(`/api/notifications/admin/${notifId}`, { method: "DELETE" });
      setNotifications(prev => prev.filter(n => n._id !== notifId));
      // Update unread count if deleted notification was unread
      const deletedNotif = notifications.find(n => n._id === notifId);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleClearRead = async () => {
    if (!window.confirm("Clear all read notifications?")) return;
    try {
      await apiFetch("/api/notifications/admin/clear-read", { method: "DELETE" });
      setNotifications(prev => prev.filter(n => !n.isRead));
    } catch (error) {
      console.error("Clear read error:", error);
    }
  };

  const unread = notifications.filter(n => !n.isRead);
  const read = notifications.filter(n => n.isRead);

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
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg transition-all duration-200 hover:scale-105 group"
        style={{ color: "#64748b" }}
        aria-label="Admin Notifications"
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
        <div className="absolute right-0 mt-3 w-[380px] sm:w-[420px] rounded-2xl shadow-2xl z-50 overflow-hidden"
          style={{ background: "#0f1629", border: "1px solid #1e293b", maxHeight: "min(520px, 80vh)" }}>
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-white text-lg">admin_panel_settings</span>
              <h3 className="font-bold text-white text-sm">Admin Alerts</h3>
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
                  className="text-[10px] text-white/80 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Mark all read
                </button>
              )}
              {read.length > 0 && (
                <button
                  onClick={handleClearRead}
                  className="text-[10px] text-white/80 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                >
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
                <p className="text-sm font-semibold text-gray-400">No admin alerts</p>
                <p className="text-xs text-gray-600 mt-1">You'll see system events here</p>
              </div>
            ) : (
              <>
                {/* Unread section */}
                {unread.length > 0 && (
                  <div>
                    <div className="px-5 py-2" style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b" }}>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">New Alerts</p>
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
  const cfg = adminTypeConfig[notif.type] || adminTypeConfig.system;

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
          {notif.priority === "high" && (
            <>
              <span className="text-[10px] text-gray-700">•</span>
              <span className="text-[10px] text-red-400 font-medium">⚠️ High Priority</span>
            </>
          )}
          {notif.priority === "urgent" && (
            <>
              <span className="text-[10px] text-gray-700">•</span>
              <span className="text-[10px] text-red-400 font-medium">🚨 URGENT</span>
            </>
          )}
        </div>
      </div>

      {/* Unread dot */}
      {!notif.isRead && (
        <div className="flex-shrink-0 w-2 h-2 rounded-full mt-1" style={{ background: "#6366f1", boxShadow: "0 0 6px #6366f1" }} />
      )}
    </div>
  );
};

export default AdminNotificationBell;