import React, { useState, useEffect } from "react";
import { apiFetch } from "../../../../utils/api";

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [error, setError] = useState("");

  const departments = ["Computer Science","Mathematics","Physics","Biology","Chemistry","History","Arts","Engineering","Business Administration"];

  useEffect(() => { fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/admin/teachers");
      if (!res) return;
      const data = await res.json();
      if (res.ok) setTeachers(data.teachers);
      else setError(data.message);
    } catch { setError("Cannot connect to server"); }
    finally { setIsLoading(false); }
  };

  const handleDelete = async (teacher) => {
    if (!window.confirm(`Delete ${teacher.fullName}?`)) return;
    try {
      const res = await apiFetch(`/api/admin/users/${teacher._id}`, { method: "DELETE" });
      if (!res) return;
      if (res.ok) setTeachers(prev => prev.filter(t => t._id !== teacher._id));
      else { const d = await res.json(); alert(d.message); }
    } catch { alert("Cannot connect to server"); }
  };

  const filtered = teachers.filter(t => {
    const matchSearch = t.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = selectedDepartment === "all" || t.department === selectedDepartment;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Manage Teachers
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Manage teacher accounts and information
          </p>
        </div>
      </div>

      {/* Stats - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[
          { icon: "groups", label: "Total Teachers", value: teachers.length, color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600" },
          { icon: "corporate_fare", label: "Departments", value: [...new Set(teachers.map(t => t.department).filter(Boolean))].length, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
          { icon: "psychology", label: "Specializations", value: [...new Set(teachers.map(t => t.specialization).filter(Boolean))].length, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg ${stat.color} group-hover:scale-110 transition-transform duration-200`}>
                <span className="material-symbols-outlined text-xl sm:text-2xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{stat.label}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">search</span>
            <input 
              type="text" 
              placeholder="Search teachers by name, email, or CMS ID..."
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          {/* Department Filter */}
          <select 
            value={selectedDepartment} 
            onChange={e => setSelectedDepartment(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-600 text-base sm:text-lg">error</span>
          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Teachers Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Loading teachers...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    CMS ID & Teacher
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                    Department
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Specialization
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Qualification
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell">
                    Joined
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.map(teacher => (
                  <tr key={teacher._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150">
                    {/* Teacher Info */}
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm flex-shrink-0">
                          {teacher.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-[150px] sm:max-w-none">
                            {teacher.fullName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            ID: {teacher.employeeId || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px] sm:max-w-none hidden sm:block">
                            {teacher.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Department */}
                    <td className="px-3 sm:px-4 py-3 text-gray-600 dark:text-gray-400 text-sm hidden sm:table-cell">
                      {teacher.department || "N/A"}
                    </td>
                    
                    {/* Specialization */}
                    <td className="px-3 sm:px-4 py-3 hidden md:table-cell">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        {teacher.specialization || "N/A"}
                      </span>
                    </td>
                    
                    {/* Qualification */}
                    <td className="px-3 sm:px-4 py-3 text-gray-600 dark:text-gray-400 text-xs hidden lg:table-cell">
                      {teacher.qualification || "N/A"}
                    </td>
                    
                    {/* Joined Date */}
                    <td className="px-3 sm:px-4 py-3 text-gray-500 dark:text-gray-400 text-xs hidden xl:table-cell">
                      {new Date(teacher.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    
                    {/* Actions */}
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => handleDelete(teacher)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Delete teacher"
                        >
                          <span className="material-symbols-outlined text-sm sm:text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {/* Empty State */}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="text-center">
                        <span className="material-symbols-outlined text-5xl sm:text-6xl text-gray-300 dark:text-gray-600 mb-4">person</span>
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No teachers found
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Try adjusting your search or filter criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTeachers;