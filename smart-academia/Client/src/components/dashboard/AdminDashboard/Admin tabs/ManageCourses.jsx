import React, { useState } from "react";

const ManageCourses = () => {
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: "Introduction to Computer Science",
      code: "CS101",
      department: "Computer Science",
      instructor: "Dr. Noor Nabi",
      enrolled: 45,
      capacity: 60,
      startDate: "2024-01-15",
      endDate: "2024-05-15"
    },
    {
      id: 2,
      title: "Calculus I",
      code: "MATH201",
      department: "Mathematics",
      instructor: "Dr. Iftikhar Ahmed",
      enrolled: 38,
      capacity: 50,
      startDate: "2024-01-15",
      endDate: "2024-05-15"
    },
    {
      id: 3,
      title: "Object-Oriented Programming",
      code: "CS301",
      department: "Computer Science",
      instructor: "Dr. Faiz Ahmed Lakhani",
      enrolled: 28,
      capacity: 40,
      startDate: "2024-01-15",
      endDate: "2024-05-15"
    },
    {
      id: 4,
      title: "Financial Management",
      code: "BUS202",
      department: "Business Administration",
      instructor: "Dr. Khair Bux",
      enrolled: 32,
      capacity: 50,
      startDate: "2024-01-15",
      endDate: "2024-05-15"
    },
    {
      id: 5,
      title: "Web Development",
      code: "CS302",
      department: "Computer Science",
      instructor: "Dr. Noor Nabi",
      enrolled: 42,
      capacity: 50,
      startDate: "2024-01-15",
      endDate: "2024-05-15"
    },
    {
      id: 6,
      title: "Statistics",
      code: "MATH202",
      department: "Mathematics",
      instructor: "Dr. Iftikhar Ahmed",
      enrolled: 25,
      capacity: 40,
      startDate: "2023-09-01",
      endDate: "2023-12-15"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const departments = ["Computer Science", "Mathematics", "Physics", "Biology", "Business Administration", "History", "Arts"];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || course.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Calculate statistics
  const totalCourses = courses.length;
  const totalTeachers = [...new Set(courses.map(c => c.instructor))].length;
  const totalDepartments = [...new Set(courses.map(c => c.department))].length;

  const handleAddCourse = () => {
    console.log("Add new course");
  };

  const handleEditCourse = (course) => {
    console.log("Edit course:", course);
  };

  const handleDeleteCourse = (course) => {
    if (window.confirm(`Are you sure you want to delete ${course.title}?`)) {
      setCourses(courses.filter(c => c.id !== course.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Manage Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage course catalog and curriculum
          </p>
        </div>
        <button 
          onClick={handleAddCourse}
          className="flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform duration-200">
            add
          </span> 
          Add New Course
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Courses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center size-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 group-hover:scale-110 transition-transform duration-200">
              <span className="material-symbols-outlined text-2xl text-indigo-600 dark:text-indigo-400">menu_book</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                Total Courses
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {totalCourses}
              </p>
            </div>
          </div>
        </div>

        {/* Total Teachers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center size-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform duration-200">
              <span className="material-symbols-outlined text-2xl text-blue-600 dark:text-blue-400">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                Total Teachers
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {totalTeachers}
              </p>
            </div>
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center size-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform duration-200">
              <span className="material-symbols-outlined text-2xl text-purple-600 dark:text-purple-400">corporate_fare</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                Departments
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {totalDepartments}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search courses by title or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Teacher Filter (placeholder) */}
          <select
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            disabled
          >
            <option value="all">All Teachers</option>
          </select>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                  Course
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                  Department
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                  Instructor
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCourses.map((course) => (
                <tr 
                  key={course.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150 group"
                >
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base block">
                        {course.title}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {course.code}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    {course.department}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    {course.instructor}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1 sm:gap-2">
                      <button 
                        onClick={() => handleEditCourse(course)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Edit course"
                      >
                        <span className="material-symbols-outlined text-sm sm:text-base">edit</span>
                      </button>
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
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
            menu_book
          </span>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No courses found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <button 
            onClick={handleAddCourse}
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Add New Course
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;