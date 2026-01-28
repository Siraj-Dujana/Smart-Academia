import React, { useState } from "react";

const ManageStudents = () => {
  const [students, setStudents] = useState([
    {
      id: 1,
      cmsId: "023-22-0327",
      name: "Mubeen Channa",
      email: "mubeenchanna.bscs22@iba-suk.edu.pk",
      department: "Computer Science",
      semester: "Fall 2024",
      enrollmentDate: "2023-09-01",
      status: "active",
      // avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
    },
    {
      id: 2,
      cmsId: "023-22-0328",
      name: "Manthar Ali",
      email: "mantharali.bscs22@iba-suk.edu.pk",
      department: "Computer Science",
      semester: "Fall 2024",
      enrollmentDate: "2023-09-01",
      status: "active",
      // avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
    },
    {
      id: 3,
      cmsId: "023-22-0329",
      name: "Abdul Qadeer Odhano",
      email: "abdulqadeer.bscs22@iba-suk.edu.pk",
      department: "Computer Science",
      semester: "Fall 2024",
      enrollmentDate: "2023-09-01",
      status: "active",
      // avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
    },
    {
      id: 4,
      cmsId: "023-22-0330",
      name: "Saifullah Soomro",
      email: "saifullah.bscs22@iba-suk.edu.pk",
      department: "Computer Science",
      semester: "Fall 2024",
      enrollmentDate: "2023-09-01",
      status: "active",
      // avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
    },
    {
      id: 5,
      cmsId: "023-22-0331",
      name: "Sameer Ahmed",
      email: "sameerahmed.bba22@iba-suk.edu.pk",
      department: "Business Administration",
      semester: "Spring 2024",
      enrollmentDate: "2023-09-01",
      status: "active",
      // avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");

  const departments = [
    "Computer Science", 
    "Business Administration", 
    "Mechanical Engineering", 
    "Fine Arts",
    "Mathematics", 
    "Physics", 
    "Biology"
  ];

  const semesters = [
    "Fall 2024", 
    "Spring 2024", 
    "Summer 2024",
    "Fall 2023", 
    "Spring 2023"
  ];

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cmsId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === "all" || student.department === selectedDepartment;
    const matchesSemester = selectedSemester === "all" || student.semester === selectedSemester;
    
    return matchesSearch && matchesDepartment && matchesSemester;
  });

  const handleAddStudent = () => {
    console.log("Add new student");
    // You can navigate to registration page or open a modal here
  };

  const handleEditStudent = (student) => {
    console.log("Edit student:", student);
    // Open edit modal or navigate to edit page
  };

  const handleDeleteStudent = (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.name} (${student.cmsId})?`)) {
      setStudents(students.filter(s => s.id !== student.id));
    }
  };

  const toggleStudentStatus = (student) => {
    setStudents(students.map(s => 
      s.id === student.id ? { 
        ...s, 
        status: s.status === "active" ? "inactive" : "active" 
      } : s
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Manage Students
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage student enrollments and academic information
          </p>
        </div>
        <button 
          onClick={handleAddStudent}
          className="flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform duration-200">
            add
          </span> 
          Add New Student
        </button>
      </div>

      
     {/* Summary Stats */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
  {/* Total Students */}
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
    <div className="flex items-start gap-4">
      <div className="flex items-center justify-center size-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 group-hover:scale-110 transition-transform duration-200">
        <span className="material-symbols-outlined text-2xl text-indigo-600 dark:text-indigo-400">groups</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
          Total Students
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {students.length}
        </p>
        <p className="text-xs font-medium text-green-600 dark:text-green-400">
          +{students.length} total enrolled
        </p>
      </div>
    </div>
  </div>

  {/* Active Students */}
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
    <div className="flex items-start gap-4">
      <div className="flex items-center justify-center size-12 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform duration-200">
        <span className="material-symbols-outlined text-2xl text-green-600 dark:text-green-400">check_circle</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
          Active Students
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {students.filter(s => s.status === 'active').length}
        </p>
        <p className="text-xs font-medium text-green-600 dark:text-green-400">
          {((students.filter(s => s.status === 'active').length / students.length) * 100).toFixed(1)}% active rate
        </p>
      </div>
    </div>
  </div>

  {/* Departments */}
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
    <div className="flex items-start gap-4">
      <div className="flex items-center justify-center size-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform duration-200">
        <span className="material-symbols-outlined text-2xl text-blue-600 dark:text-blue-400">corporate_fare</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
          Departments
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {[...new Set(students.map(s => s.department))].length}
        </p>
        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
          Across all faculties
        </p>
      </div>
    </div>
  </div>

  {/* Semesters */}
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
    <div className="flex items-start gap-4">
      <div className="flex items-center justify-center size-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform duration-200">
        <span className="material-symbols-outlined text-2xl text-purple-600 dark:text-purple-400">calendar_today</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
          Semesters
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {[...new Set(students.map(s => s.semester))].length}
        </p>
        <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
          Current academic sessions
        </p>
      </div>
    </div>
  </div>
</div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, email, or CMS ID..."
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

          {/* Semester Filter */}
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">All Semesters</option>
            {semesters.map(sem => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                  CMS ID & Student
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                  Department
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                  Semester
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                  Enrollment Date
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map((student) => (
                <tr 
                  key={student.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150 group"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img 
                        className="size-8 sm:size-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-indigo-200 dark:group-hover:ring-indigo-400 transition-all duration-200"
                        src={student.avatar} 
                        alt={`Profile of ${student.name}`} 
                      />
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base block">
                          {student.name}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-gray-500 dark:text-gray-400 text-xs font-mono">
                            ID: {student.cmsId}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 text-xs">
                            {student.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base font-medium">
                      {student.department}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      <span className="material-symbols-outlined text-xs">calendar_today</span>
                      {student.semester}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    {new Date(student.enrollmentDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStudentStatus(student)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${
                        student.status === "active" 
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50" 
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        student.status === "active" ? "bg-green-500" : "bg-gray-500"
                      }`}></span>
                      {student.status === "active" ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1 sm:gap-2">
                      <button 
                        onClick={() => handleEditStudent(student)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Edit student"
                      >
                        <span className="material-symbols-outlined text-sm sm:text-base">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteStudent(student)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Delete student"
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
      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
            groups
          </span>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No students found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <button 
            onClick={handleAddStudent}
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Add New Student
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;