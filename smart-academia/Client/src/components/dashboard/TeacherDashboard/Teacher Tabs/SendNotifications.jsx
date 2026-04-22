// components/dashboard/TeacherDashboard/Teacher Tabs/SendNotifications.jsx
import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const apiFetch = (url, opts = {}) => {
  const token = localStorage.getItem("token");
  return fetch(`${API}${url}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
};

const NOTIF_TYPES = [
  { value: "announcement",        label: "📢 Announcement",         desc: "General course announcement"       },
  { value: "quiz_deadline",       label: "⏰ Quiz Deadline",          desc: "Remind students of a quiz deadline" },
  { value: "lab_deadline",        label: "🧪 Lab Deadline",           desc: "Remind students of a lab deadline"  },
  { value: "assignment_deadline", label: "📝 Assignment Deadline",    desc: "Remind students of an assignment"   },
];

const SendNotifications = () => {
  const [courses,  setCourses]  = useState([]);
  const [form, setForm]         = useState({
    courseId:   "",
    type:       "announcement",
    title:      "",
    message:    "",
    dueDate:    "",
    priority:   "normal",
    sendEmail:  false,
  });
  const [sending,  setSending]  = useState(false);
  const [success,  setSuccess]  = useState("");
  const [error,    setError]    = useState("");
  const [history,  setHistory]  = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => { fetchCourses(); fetchHistory(); }, []);
  useEffect(() => {
    if (form.courseId) fetchHistory();
  }, [form.courseId]);

  const fetchCourses = async () => {
    try {
      const res  = await apiFetch("/api/courses/my-courses");
      const data = await res.json();
      if (res.ok && data.courses?.length) {
        setCourses(data.courses);
        setForm(p => ({ ...p, courseId: data.courses[0]._id }));
      }
    } catch { /* silent */ }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res  = await apiFetch("/api/notifications?limit=8");
      const data = await res.json();
      // Show only sent (where user is sender) — filter by type on BE actually; we just show own
      if (res.ok) setHistory(data.notifications || []);
    } catch { /* silent */ }
    finally { setLoadingHistory(false); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.courseId || !form.title.trim() || !form.message.trim()) {
      setError("Course, title, and message are required");
      return;
    }
    if (form.type !== "announcement" && !form.dueDate) {
      setError("Due date is required for deadline notifications");
      return;
    }
    setSending(true); setError(""); setSuccess("");
    try {
      const isDeadline = form.type !== "announcement";
      const endpoint   = isDeadline ? "/api/notifications/deadline" : "/api/notifications/announcement";
      const body = isDeadline
        ? { courseId: form.courseId, type: form.type, title: form.title, message: form.message, dueDate: form.dueDate, sendEmail: form.sendEmail }
        : { courseId: form.courseId, title: form.title, content: form.message, priority: form.priority, sendEmail: form.sendEmail };

      const res  = await apiFetch(endpoint, { method: "POST", body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setSuccess(`✅ ${data.message}`);
      setForm(p => ({ ...p, title: "", message: "", dueDate: "", priority: "normal", sendEmail: false }));
      setTimeout(() => setSuccess(""), 5000);
    } catch { setError("Cannot connect to server"); }
    finally { setSending(false); }
  };

  const selectedType = NOTIF_TYPES.find(t => t.value === form.type);
  const isDeadline   = form.type !== "announcement";

  const enrolledCount = courses.find(c => c._id === form.courseId)?.enrolledCount || 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-600 text-2xl sm:text-3xl">send</span>
          Send Notifications
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Notify enrolled students about deadlines and announcements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Send Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSend} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-lg">edit_notifications</span>
                Compose Notification
              </h2>
            </div>

            <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
              {/* Alerts */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span className="flex-1">{error}</span>
                  <button onClick={() => setError("")}><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
              )}
              {success && (
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 text-green-600 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  {success}
                </div>
              )}

              {/* Course */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Target Course *
                </label>
                {courses.length === 0 ? (
                  <p className="text-sm text-gray-500">No courses found. Create a course first.</p>
                ) : (
                  <select value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>{c.title} ({c.enrolledCount || 0} students)</option>
                    ))}
                  </select>
                )}
                {enrolledCount > 0 && (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">group</span>
                    Will notify {enrolledCount} enrolled student{enrolledCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Notification Type *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {NOTIF_TYPES.map(t => (
                    <button key={t.value} type="button" onClick={() => setForm(p => ({ ...p, type: t.value }))}
                      className={`text-left px-3 py-2.5 rounded-xl border-2 transition-all ${
                        form.type === t.value
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700"
                      }`}>
                      <p className={`text-sm font-medium ${form.type === t.value ? "text-indigo-700 dark:text-indigo-300" : "text-gray-800 dark:text-gray-200"}`}>
                        {t.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Title *
                </label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder={isDeadline ? "e.g. Quiz 3 Due Tomorrow!" : "e.g. Important Class Update"}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Message *
                </label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  rows={4} placeholder="Write your message to students..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Due Date (for deadlines) */}
              {isDeadline && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Due Date *
                  </label>
                  <input type="datetime-local" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Priority (for announcements) */}
              {!isDeadline && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                    className="w-full sm:w-48 px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="low">🟢 Low</option>
                    <option value="normal">🔵 Normal</option>
                    <option value="high">🟠 High</option>
                    <option value="urgent">🔴 Urgent</option>
                  </select>
                </div>
              )}

              {/* Email Option */}
              <label className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                <input type="checkbox" checked={form.sendEmail} onChange={e => setForm(p => ({ ...p, sendEmail: e.target.checked }))}
                  className="rounded text-indigo-600 w-4 h-4"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-blue-600 text-base">mail</span>
                    Also send email notification
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Sends an email to each enrolled student in addition to the in-app notification
                  </p>
                </div>
              </label>

              <button type="submit" disabled={sending || !form.courseId}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
                {sending ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Sending...</>
                ) : (
                  <><span className="material-symbols-outlined text-base">send</span>Send to {enrolledCount} Student{enrolledCount !== 1 ? "s" : ""}</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips + Preview */}
        <div className="space-y-4 sm:space-y-5">
          {/* Preview Card */}
          {(form.title || form.message) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</p>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    form.type === "announcement"        ? "bg-blue-100 dark:bg-blue-900/30" :
                    form.type === "quiz_deadline"       ? "bg-amber-100 dark:bg-amber-900/30" :
                    form.type === "lab_deadline"        ? "bg-purple-100 dark:bg-purple-900/30" :
                    "bg-red-100 dark:bg-red-900/30"
                  }`}>
                    <span className={`material-symbols-outlined text-base ${
                      form.type === "announcement"        ? "text-blue-500" :
                      form.type === "quiz_deadline"       ? "text-amber-500" :
                      form.type === "lab_deadline"        ? "text-purple-500" :
                      "text-red-500"
                    }`}>
                      {form.type === "announcement" ? "campaign" : form.type === "quiz_deadline" ? "quiz" : "schedule"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{form.title || "Notification Title"}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{form.message || "Your message will appear here..."}</p>
                    {form.dueDate && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-0.5 font-medium">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        Due {new Date(form.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">just now</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700 p-4">
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">lightbulb</span>
              Tips for effective notifications
            </h3>
            <ul className="space-y-2 text-xs text-amber-700 dark:text-amber-400">
              <li className="flex items-start gap-1.5">
                <span className="material-symbols-outlined text-xs mt-0.5">check</span>
                Send deadline reminders 24–48 hours in advance
              </li>
              <li className="flex items-start gap-1.5">
                <span className="material-symbols-outlined text-xs mt-0.5">check</span>
                Keep titles concise and action-oriented
              </li>
              <li className="flex items-start gap-1.5">
                <span className="material-symbols-outlined text-xs mt-0.5">check</span>
                Use email for urgent, high-priority messages
              </li>
              <li className="flex items-start gap-1.5">
                <span className="material-symbols-outlined text-xs mt-0.5">check</span>
                Students can filter by type in their notification center
              </li>
            </ul>
          </div>

          {/* Quick stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-indigo-600">analytics</span>
              Your Courses
            </h3>
            <div className="space-y-2">
              {courses.slice(0, 4).map(c => (
                <div key={c._id} className="flex items-center justify-between gap-2">
                  <p className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1">{c.title}</p>
                  <span className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                    <span className="material-symbols-outlined text-xs">group</span>
                    {c.enrolledCount || 0}
                  </span>
                </div>
              ))}
              {courses.length === 0 && (
                <p className="text-xs text-gray-500">No courses yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendNotifications;