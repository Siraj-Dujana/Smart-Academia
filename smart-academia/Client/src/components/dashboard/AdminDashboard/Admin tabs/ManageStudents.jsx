import React, { useState, useEffect } from "react";
import { apiFetch } from "../../../../utils/api";

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ icon, title, color = "#6366f1" }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
      <span className="material-symbols-outlined text-sm" style={{ color }}>{icon}</span>
    </div>
    <h3 className="text-xs font-bold text-white tracking-wide uppercase">{title}</h3>
    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}44, transparent)` }} />
  </div>
);

// ── Mini Bar ──────────────────────────────────────────────────
const MiniBar = ({ value = 0, color = "#6366f1", height = 6 }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height, background: "#1e293b" }}>
    <div
      className="h-full rounded-full"
      style={{
        width: `${Math.min(Math.max(value, 0), 100)}%`,
        background: `linear-gradient(90deg, ${color}cc, ${color})`,
        boxShadow: `0 0 8px ${color}66`,
        transition: "width 1s cubic-bezier(.4,0,.2,1)"
      }}
    />
  </div>
);

// Update the ProgressStatCard in ManageStudents.jsx
const ProgressStatCard = ({ icon, label, value, total, color, isLoading }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <div className="relative rounded-2xl overflow-hidden p-5 flex flex-col gap-3 group" style={{ background: "#0f1629", border: `1px solid ${color}33` }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}15 0%, transparent 70%)` }} />
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
          <span className="material-symbols-outlined text-xl" style={{ color }}>{icon}</span>
        </div>
        <span className="text-xs font-bold" style={{ color }}>{percentage}%</span>
      </div>
      <div>
        {isLoading ? (
          <div className="h-9 w-16 bg-gray-800 rounded-lg animate-pulse" />
        ) : (
          <>
            <p className="text-3xl font-black text-white tracking-tight" style={{ textShadow: `0 0 20px ${color}66` }}>
              {value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              <span className="text-gray-400">out of</span> {total}
            </p>
          </>
        )}
        <p className="text-xs text-gray-400 font-medium mt-1">{label}</p>
      </div>
      <MiniBar value={percentage} color={color} />
    </div>
  );
};

// ── Loading Spinner ───────────────────────────────────────────
const LoadingSpinner = () => (
  <div className="relative w-12 h-12 mx-auto">
    <div className="absolute inset-0 rounded-full border-4 border-indigo-900" />
    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
    <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
  </div>
);

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [error, setError] = useState("");

  const departments = ["Computer Science","Business Administration","Mechanical Engineering","Fine Arts","Mathematics","Physics","Biology"];
  
  // Target values for progress bars (max capacity or goals)
  const MAX_STUDENTS_TARGET = 100;
  const MAX_DEPARTMENTS_TARGET = 20;
  const MAX_SEMESTERS_TARGET = 8; // 8 semesters total

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/admin/students");
      if (!res) return;
      const data = await res.json();
      if (res.ok) setStudents(data.students);
      else setError(data.message);
    } catch { setError("Cannot connect to server"); }
    finally { setIsLoading(false); }
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Delete ${student.fullName} (${student.studentId})?`)) return;
    try {
      const res = await apiFetch(`/api/admin/users/${student._id}`, { method: "DELETE" });
      if (!res) return;
      if (res.ok) setStudents(prev => prev.filter(s => s._id !== student._id));
      else { const d = await res.json(); alert(d.message); }
    } catch { alert("Cannot connect to server"); }
  };

  const filtered = students.filter(s => {
    const matchSearch = s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = selectedDepartment === "all" || s.department === selectedDepartment;
    return matchSearch && matchDept;
  });

  const uniqueDepartments = [...new Set(students.map(s => s.department).filter(Boolean))].length;
  const uniqueSemesters = [...new Set(students.map(s => s.semester).filter(Boolean))].length;

  return (
    <div className="space-y-6" style={{ fontFamily: "'Lexend', sans-serif" }}>
      
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden p-6" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", border: "1px solid #1e293b" }}>
        <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "#6366f1" }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: "#a855f7" }} />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#6366f1" }} />
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Admin · Student Management</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
            Manage Students
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage student enrollments and academic information
          </p>
        </div>
      </div>

      {/* Stats Grid with Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProgressStatCard 
          icon="groups" 
          label="Total Students" 
          value={students.length} 
          total={MAX_STUDENTS_TARGET}
          color="#6366f1"
          isLoading={isLoading}
        />
        <ProgressStatCard 
          icon="corporate_fare" 
          label="Departments" 
          value={uniqueDepartments} 
          total={MAX_DEPARTMENTS_TARGET}
          color="#22c55e"
          isLoading={isLoading}
        />
        <ProgressStatCard 
          icon="calendar_today" 
          label="Semesters Active" 
          value={uniqueSemesters} 
          total={MAX_SEMESTERS_TARGET}
          color="#a855f7"
          isLoading={isLoading}
        />
      </div>

      {/* Filters Card */}
      <div className="rounded-2xl p-5" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
        <SectionHeader icon="filter_alt" title="Filters" color="#6366f1" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">search</span>
            <input 
              type="text" 
              placeholder="Search by name, email, or student ID..."
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          
          {/* Department Filter */}
          <select 
            value={selectedDepartment} 
            onChange={e => setSelectedDepartment(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all cursor-pointer"
          >
            <option value="all">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#ef444422", border: "1px solid #ef444444" }}>
          <span className="material-symbols-outlined text-sm text-red-400">error</span>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Students Table */}
      {isLoading ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
          <LoadingSpinner />
          <p className="text-gray-500 mt-3 text-sm">Loading students...</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b" }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Semester
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Enrolled
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "#1e293b" }}>
                {filtered.map(student => (
                  <tr key={student._id} className="hover:bg-white/5 transition-colors duration-150">
                    {/* Student Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)", color: "white" }}>
                          {student.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm truncate max-w-[150px] sm:max-w-none">
                            {student.fullName}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            ID: {student.studentId || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-none hidden sm:block">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Department */}
                    <td className="px-4 py-3 text-gray-400 text-sm hidden sm:table-cell">
                      {student.department || "—"}
                    </td>
                    
                    {/* Semester */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      {student.semester ? (
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium" style={{ background: "#22c55e22", color: "#4ade80", border: "1px solid #22c55e44" }}>
                          {student.semester} Semester
                        </span>
                      ) : "—"}
                    </td>
                    
                    {/* Enrolled Date */}
                    <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                      {new Date(student.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => handleDelete(student)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Delete student"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {/* Empty State */}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <div className="text-center">
                        <span className="material-symbols-outlined text-5xl text-gray-700 mb-3 block">groups_off</span>
                        <h3 className="text-base font-semibold text-gray-400 mb-1">
                          No students found
                        </h3>
                        <p className="text-sm text-gray-600">
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

      {/* Info Banner */}
      <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "#0a0f1e", border: "1px solid #1e293b" }}>
        <span className="material-symbols-outlined text-xs text-indigo-400 mt-0.5">info</span>
        <p className="text-[10px] text-gray-500 leading-relaxed">
          <span className="text-indigo-400 font-semibold">Student management:</span> View all student accounts, filter by department, and manage student enrollments. Progress bars show capacity against targets (Max students: 500, Departments: 20, Semesters: 8).
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default ManageStudents;