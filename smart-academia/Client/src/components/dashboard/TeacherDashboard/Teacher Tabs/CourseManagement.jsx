import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "", code: "", description: "",
    department: "Computer Science", credits: 3, semester: "Fall 2024",
  });

  const departments = ["Computer Science", "Mathematics", "Physics", "Business Administration", "Mechanical Engineering", "Electrical Engineering"];
  const semesters = ["Fall 2024", "Spring 2025", "Fall 2025", "Spring 2026"];
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/courses/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCourses(data.courses);
      else setApiError(data.message);
    } catch {
      setApiError("Cannot connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (course = null) => {
    setApiError("");
    setApiSuccess("");
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        code: course.code,
        description: course.description,
        department: course.department,
        credits: course.credits,
        semester: course.semester,
      });
    } else {
      setEditingCourse(null);
      setFormData({ title: "", code: "", description: "", department: "Computer Science", credits: 3, semester: "Fall 2024" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setIsSubmitting(true);

    try {
      const url = editingCourse
        ? `${API}/api/courses/${editingCourse._id}`
        : `${API}/api/courses`;
      const method = editingCourse ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) return setApiError(data.message);

      setApiSuccess(editingCourse ? "Course updated!" : "Course created!");
      fetchCourses();
      setTimeout(() => { setIsModalOpen(false); setApiSuccess(""); }, 1000);
    } catch {
      setApiError("Cannot connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete "${course.title}"? This will also delete all lessons.`)) return;
    try {
      const res = await fetch(`${API}/api/courses/${course._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCourses(prev => prev.filter(c => c._id !== course._id));
      } else {
        alert(data.message);
      }
    } catch {
      alert("Cannot connect to server");
    }
  };

  const handleTogglePublish = async (course) => {
    try {
      const res = await fetch(`${API}/api/courses/${course._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublished: !course.isPublished }),
      });
      if (res.ok) fetchCourses();
    } catch {
      alert("Cannot connect to server");
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Course Management</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Create and manage your courses</p>
        </div>
        <button onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 text-sm font-medium px-4 sm:px-5 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all duration-200 hover:scale-105 w-full sm:w-auto">
          <span className="material-symbols-outlined text-base">add</span>
          New Course
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform duration-200">
              <span className="material-symbols-outlined text-xl sm:text-2xl text-blue-600">menu_book</span>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Total Courses</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{courses.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform duration-200">
              <span className="material-symbols-outlined text-xl sm:text-2xl text-green-600">publish</span>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Published</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{courses.filter(c => c.isPublished).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform duration-200">
              <span className="material-symbols-outlined text-xl sm:text-2xl text-purple-600">groups</span>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Total Students</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-3 sm:p-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">search</span>
          <input type="text" placeholder="Search courses by title or code..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
        </div>
      </div>

      {/* Courses Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-gray-500 mt-2 text-sm">Loading courses...</p>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Course</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Department</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Lessons</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Students</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCourses.map(course => (
                  <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150">
                    <td className="px-3 sm:px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{course.title}</p>
                        <p className="text-xs text-gray-500">{course.code} · {course.credits} credits</p>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-gray-600 dark:text-gray-400 text-sm hidden sm:table-cell">{course.department}</td>
                    <td className="px-3 sm:px-4 py-3 text-gray-600 dark:text-gray-400 text-sm hidden md:table-cell">{course.totalLessons}</td>
                    <td className="px-3 sm:px-4 py-3 text-gray-600 dark:text-gray-400 text-sm hidden lg:table-cell">{course.enrolledCount}</td>
                    <td className="px-3 sm:px-4 py-3">
                      <button onClick={() => handleTogglePublish(course)}
                        className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium transition-colors ${
                          course.isPublished
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}>
                        {course.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleOpenModal(course)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all hover:scale-110"
                          title="Edit course">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button onClick={() => handleDelete(course)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all hover:scale-110"
                          title="Delete course">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="material-symbols-outlined text-5xl sm:text-6xl text-gray-300 dark:text-gray-600">menu_book</span>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mt-3 sm:mt-4 mb-2">No courses yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Create your first course to get started</p>
          <button onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors">
            <span className="material-symbols-outlined text-base">add</span>
            Create Course
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-5 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {editingCourse ? "Edit Course" : "Create New Course"}
                </h2>
                <button onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {apiError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {apiError}
                </div>
              )}
              {apiSuccess && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 text-green-600 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  {apiSuccess}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Title *</label>
                  <input type="text" value={formData.title}
                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    required placeholder="e.g. Introduction to Python"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Code *</label>
                    <input type="text" value={formData.code}
                      onChange={e => setFormData(p => ({ ...p, code: e.target.value }))}
                      required placeholder="e.g. CS101"
                      disabled={!!editingCourse}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Credits</label>
                    <select value={formData.credits}
                      onChange={e => setFormData(p => ({ ...p, credits: Number(e.target.value) }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} credits</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                  <textarea value={formData.description}
                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    required rows={3} placeholder="Brief description of the course..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"/>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department *</label>
                    <select value={formData.department}
                      onChange={e => setFormData(p => ({ ...p, department: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                    <select value={formData.semester}
                      onChange={e => setFormData(p => ({ ...p, semester: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                      {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col xs:flex-row justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Saving...</>
                    ) : editingCourse ? "Update Course" : "Create Course"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;