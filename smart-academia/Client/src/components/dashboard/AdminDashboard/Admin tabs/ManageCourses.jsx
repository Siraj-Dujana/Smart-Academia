import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ManageCourses = () => {
  const token = localStorage.getItem("token");

  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "", code: "", department: "",
    instructor: "", startDate: "", endDate: ""
  });

  const departments = [
    "Computer Science", "Mathematics", "Physics", "Biology",
    "Business Administration", "History", "Arts", "Engineering"
  ];

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/courses/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCourses(data.courses || []);
      else setError(data.message);
    } catch {
      setError("Cannot connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch(`${API}/api/admin/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTeachers(data.teachers || []);
    } catch { /* silent */ }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "all" || course.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const totalCourses     = courses.length;
  const totalTeachers    = [...new Set(courses.map(c => c.teacher?._id).filter(Boolean))].length;
  const totalDepartments = [...new Set(courses.map(c => c.department).filter(Boolean))].length;

  const handleAddCourse = () => {
    setEditingCourse(null);
    setFormData({ title: "", code: "", department: "", instructor: "", startDate: "", endDate: "" });
    setError("");
    setIsModalOpen(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setFormData({
      title:      course.title,
      code:       course.code,
      department: course.department || "",
      instructor: course.teacher?._id || "",
      startDate:  "",
      endDate:    "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleDeleteCourse = async (course) => {
    if (!window.confirm(`Are you sure you want to delete "${course.title}"?`)) return;
    try {
      // Admin can call the course delete endpoint
      const res = await fetch(`${API}/api/courses/${course._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCourses(prev => prev.filter(c => c._id !== course._id));
      } else {
        setError(data.message);
      }
    } catch {
      setError("Cannot connect to server");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Find the selected teacher object
    const selectedTeacher = teachers.find(t => t._id === formData.instructor);

    try {
      if (editingCourse) {
        // Update via course endpoint
        const res = await fetch(`${API}/api/courses/${editingCourse._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title:      formData.title,
            department: formData.department,
          }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.message); return; }
      }
      // Note: Admin cannot create courses on behalf of teachers via current API.
      // Course creation requires teacher auth. We show a notice instead.
      setIsModalOpen(false);
      fetchCourses();
    } catch {
      setError("Cannot connect to server");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Manage Courses
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            View and manage all courses across the platform
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-600 text-base">error</span>
          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex-1">{error}</p>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
        {[
          { icon: "menu_book",     label: "Total Courses",     value: totalCourses,     color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600" },
          { icon: "person",        label: "Total Teachers",     value: totalTeachers,    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
          { icon: "corporate_fare",label: "Departments",        value: totalDepartments, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg ${stat.color} group-hover:scale-110 transition-transform duration-200`}>
                <span className="material-symbols-outlined text-xl sm:text-2xl">{stat.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium mb-0.5">{stat.label}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? "..." : stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base sm:text-lg">search</span>
            <input
              type="text"
              placeholder="Search courses by title or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Loading courses...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">Course</th>
                  <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider hidden sm:table-cell">Department</th>
                  <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider hidden md:table-cell">Instructor</th>
                  <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider hidden lg:table-cell">Students</th>
                  <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">Status</th>
                  <th className="px-3 sm:px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCourses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150 group">
                    <td className="px-3 sm:px-4 py-3">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white text-sm block">{course.title}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">{course.code}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-gray-600 dark:text-gray-400 text-sm hidden sm:table-cell">
                      {course.department || "N/A"}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-gray-600 dark:text-gray-400 text-sm hidden md:table-cell">
                      {course.teacher?.fullName || "N/A"}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-gray-600 dark:text-gray-400 text-sm hidden lg:table-cell">
                      {course.enrolledCount || 0}
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                        course.isPublished
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      }`}>
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex justify-center gap-1 sm:gap-2">
                        <button
                          onClick={() => handleDeleteCourse(course)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Delete course"
                        >
                          <span className="material-symbols-outlined text-sm sm:text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <span className="material-symbols-outlined text-5xl sm:text-6xl text-gray-300 dark:text-gray-600">menu_book</span>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2 mt-3">No courses found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageCourses;