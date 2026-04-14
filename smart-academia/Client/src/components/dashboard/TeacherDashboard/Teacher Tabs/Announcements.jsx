import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Announcements = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    courseId: "",
    priority: "normal",
    sendEmail: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchAnnouncements(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API}/api/courses/teacher`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCourses(data.courses || []);
        if (data.courses?.length > 0) {
          setSelectedCourse(data.courses[0]._id);
        }
      }
    } catch {
      setError("Cannot connect to server");
    }
  };

  const fetchAnnouncements = async (courseId = null) => {
    setIsLoading(true);
    try {
      const url = courseId
        ? `${API}/api/announcements/course/${courseId}`
        : `${API}/api/announcements/teacher`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAnnouncements(data.announcements || []);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: "",
      content: "",
      courseId: selectedCourse,
      priority: "normal",
      sendEmail: false,
    });
    setShowModal(true);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      courseId: announcement.courseId,
      priority: announcement.priority || "normal",
      sendEmail: false,
    });
    setShowModal(true);
  };

  const handleDelete = async (announcement) => {
    if (!window.confirm(`Delete "${announcement.title}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/api/announcements/${announcement._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchAnnouncements(selectedCourse);
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch {
      alert("Cannot connect to server");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Title and content are required");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      const url = editingAnnouncement
        ? `${API}/api/announcements/${editingAnnouncement._id}`
        : `${API}/api/announcements`;
      const method = editingAnnouncement ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }

      setShowModal(false);
      fetchAnnouncements(selectedCourse);
    } catch {
      setError("Cannot connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      case "high":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
      case "normal":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "urgent":
        return "error";
      case "high":
        return "warning";
      default:
        return "info";
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Announcements
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Create and send announcements to students
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 text-sm font-medium px-4 sm:px-5 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105 w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-base">add</span>
          New Announcement
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-600 text-sm">error</span>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Course Selector */}
      {courses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Course:</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.title}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Announcements List */}
      {isLoading ? (
        <div className="text-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-gray-500 mt-2 text-sm">Loading announcements...</p>
        </div>
      ) : announcements.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement._id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <div className="p-4 sm:p-5">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                      <span className="material-symbols-outlined text-sm">{getPriorityIcon(announcement.priority)}</span>
                      {announcement.priority?.toUpperCase() || "NORMAL"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(announcement.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(announcement)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {announcement.title}
                </h3>

                {/* Content */}
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                  {announcement.content}
                </p>

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">school</span>
                      {announcement.courseTitle || "All Courses"}
                    </span>
                    {announcement.sentEmail && (
                      <span className="flex items-center gap-1 text-green-600">
                        <span className="material-symbols-outlined text-sm">mail</span>
                        Email sent
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    By {announcement.authorName || user.fullName}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="material-symbols-outlined text-5xl sm:text-6xl text-gray-300 dark:text-gray-600 mb-4">campaign</span>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No announcements yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Create your first announcement to communicate with students</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Create Announcement
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-5 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Announcement title"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course *
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  placeholder="Write your announcement here..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>

              {/* Email Option */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={formData.sendEmail}
                  onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="sendEmail" className="text-sm text-gray-700 dark:text-gray-300">
                  Also send as email to students
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col xs:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Saving...</>
                  ) : (
                    <>{editingAnnouncement ? "Update" : "Post"} Announcement</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;