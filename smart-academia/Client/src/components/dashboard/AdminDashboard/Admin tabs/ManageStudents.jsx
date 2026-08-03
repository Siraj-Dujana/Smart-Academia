import React, { useState, useEffect, useRef } from "react";
import { Chart } from 'chart.js/auto';
import { apiFetch } from "../../../../utils/api";

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
      <span className="material-symbols-outlined text-sm text-white">{icon}</span>
    </div>
    <h3 className="text-xs font-bold text-white tracking-wide uppercase">{title}</h3>
    <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.15), transparent)" }} />
  </div>
);

// ── Mini Bar ──────────────────────────────────────────────────
const MiniBar = ({ value = 0, height = 6 }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height, background: "#1e293b" }}>
    <div
      className="h-full rounded-full bg-white"
      style={{
        width: `${Math.min(Math.max(value, 0), 100)}%`,
        boxShadow: "0 0 8px rgba(255,255,255,0.4)",
        transition: "width 1s cubic-bezier(.4,0,.2,1)"
      }}
    />
  </div>
);

// ── Progress Stat Card (icon-free, no hardcoded ceiling) ───────
// `total` is derived from the live data itself (the highest value among
// the current stats), not a made-up fixed target.
const ProgressStatCard = ({ label, value, total, isLoading, delay = 0 }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div
      className="relative rounded-2xl overflow-hidden p-5 flex flex-col gap-3 group opacity-0 animate-fadeInUp transition-all duration-300 ease-out hover:-translate-y-1"
      style={{
        background: "#0f1629",
        border: "1px solid rgba(255,255,255,0.1)",
        animationDelay: `${delay}ms`,
        animationFillMode: "forwards",
      }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />
      <div className="flex items-start justify-between">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <span className="text-xs font-bold text-white transition-all duration-300">{percentage}%</span>
      </div>
      <div>
        {isLoading ? (
          <div className="h-9 w-16 rounded-lg overflow-hidden relative" style={{ background: "#1a2338" }}>
            <div className="absolute inset-0 animate-shimmer" style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
            }} />
          </div>
        ) : (
          <p className="text-3xl font-black text-white tracking-tight" style={{ textShadow: "0 0 20px rgba(255,255,255,0.25)" }}>
            {value}
          </p>
        )}
        <p className="text-xs text-gray-400 font-medium mt-1">{label}</p>
      </div>
      <MiniBar value={percentage} />
    </div>
  );
};

// ── Loading Spinner ───────────────────────────────────────────
const LoadingSpinner = () => (
  <div className="relative w-12 h-12 mx-auto">
    <div className="absolute inset-0 rounded-full border-4 border-white/10" />
    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin" />
    <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-white/40 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
  </div>
);

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [error, setError] = useState("");

  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);

  const departments = ["Computer Science","Business Administration","Mechanical Engineering","Fine Arts","Mathematics","Physics","Biology"];

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

  // No fixed targets — each bar/percentage is scaled against the largest
  // live count among these three stats, so nothing is capped by a made-up number.
  const liveMax = Math.max(students.length, uniqueDepartments, uniqueSemesters, 1);

  const statCards = [
    { title: "Total Students", value: students.length, total: liveMax },
    { title: "Departments", value: uniqueDepartments, total: liveMax },
    { title: "Semesters Active", value: uniqueSemesters, total: liveMax },
  ];

  // Students grouped by department (only departments that actually have students)
  const departmentCounts = students.reduce((acc, s) => {
    const dept = s.department || "Unassigned";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});
  const departmentLabels = Object.keys(departmentCounts);
  const departmentValues = Object.values(departmentCounts);

  // Student distribution by semester
  const semesterCounts = students.reduce((acc, s) => {
    const sem = s.semester ? `Semester ${s.semester}` : "Unspecified";
    acc[sem] = (acc[sem] || 0) + 1;
    return acc;
  }, {});
  const semesterLabels = Object.keys(semesterCounts);
  const semesterValues = Object.values(semesterCounts);

  // Initialize charts once student data is loaded
  useEffect(() => {
    if (isLoading) return;

    if (barChartRef.current) {
      if (barChartInstance.current) barChartInstance.current.destroy();
      const barCtx = barChartRef.current.getContext('2d');
      barChartInstance.current = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: departmentLabels,
          datasets: [{
            label: 'Students',
            data: departmentValues,
            backgroundColor: '#ffffff',
            borderRadius: 8,
            hoverBackgroundColor: '#cbd5e1',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0, font: { size: 11, color: '#94a3b8' } },
              grid: { color: '#1e293b' }
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 10, color: '#94a3b8' } }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0f1629',
              titleColor: '#e2e8f0',
              bodyColor: '#94a3b8',
              borderColor: 'rgba(255,255,255,0.15)',
              borderWidth: 1,
              cornerRadius: 8,
            }
          },
          animation: { duration: 1000, easing: 'easeOutQuart' }
        }
      });
    }

    if (pieChartRef.current) {
      if (pieChartInstance.current) pieChartInstance.current.destroy();
      const pieCtx = pieChartRef.current.getContext('2d');
      const shades = ['#ffffff', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f1629'];
      pieChartInstance.current = new Chart(pieCtx, {
        type: 'pie',
        data: {
          labels: semesterLabels,
          datasets: [{
            data: semesterValues,
            backgroundColor: semesterLabels.map((_, i) => shades[i % shades.length]),
            hoverOffset: 8,
            borderWidth: 2,
            borderColor: '#0f1629',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 12,
                font: { size: 10, family: "'Lexend', sans-serif" },
                color: '#94a3b8'
              }
            },
            tooltip: {
              backgroundColor: '#0f1629',
              titleColor: '#e2e8f0',
              bodyColor: '#94a3b8',
              borderColor: 'rgba(255,255,255,0.15)',
              borderWidth: 1,
              cornerRadius: 8,
            }
          },
          animation: { duration: 1000, easing: 'easeOutQuart', animateScale: true }
        }
      });
    }

    return () => {
      if (barChartInstance.current) barChartInstance.current.destroy();
      if (pieChartInstance.current) pieChartInstance.current.destroy();
    };
  }, [isLoading, students]);

  return (
    <div className="space-y-6" style={{ fontFamily: "'Lexend', sans-serif" }}>

      {/* Hero Section */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full animate-pulse bg-white" />
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Admin · Student Management</p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Manage Students
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage student enrollments and academic information
        </p>
      </div>

      {/* Stats Grid using ProgressStatCards with ratio display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <ProgressStatCard
            key={index}
            label={stat.title}
            value={stat.value}
            total={stat.total}
            isLoading={isLoading}
            delay={index * 90}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div>
        <SectionHeader icon="bar_chart" title="Student Analytics" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Bar Chart — Students by Department */}
          <div className="lg:col-span-2 rounded-2xl p-5 transition-all duration-300" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-white text-base">show_chart</span>
              Students by Department
            </h3>
            <div className="h-72 lg:h-80">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : students.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-500">
                  No data to display yet
                </div>
              ) : (
                <canvas ref={barChartRef} />
              )}
            </div>
          </div>

          {/* Pie Chart — Semester Distribution */}
          <div className="rounded-2xl p-5 transition-all duration-300" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-white text-base">pie_chart</span>
              Semesters
            </h3>
            <div className="h-72 lg:h-80 flex items-center justify-center">
              {isLoading ? (
                <LoadingSpinner />
              ) : students.length === 0 ? (
                <div className="text-sm text-gray-500">No data to display yet</div>
              ) : (
                <canvas ref={pieChartRef} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="rounded-2xl p-5 transition-all duration-300" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
        <SectionHeader icon="filter_alt" title="Filters" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">search</span>
            <input
              type="text"
              placeholder="Search by name, email, or student ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-white/40 focus:border-transparent outline-none transition-all duration-300"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-white/40 focus:border-transparent outline-none transition-all duration-300 cursor-pointer"
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
        <div className="rounded-2xl overflow-hidden transition-all duration-300" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
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
                  <tr key={student._id} className="hover:bg-white/5 transition-colors duration-200">
                    {/* Student Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}>
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
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(255,255,255,0.06)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.15)" }}>
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
        <span className="material-symbols-outlined text-xs text-white/70 mt-0.5">info</span>
        <p className="text-[10px] text-gray-500 leading-relaxed">
          <span className="text-white/80 font-semibold">Student management:</span> View all student accounts, filter by department, and manage student enrollments. Bars scale relative to your platform's own live numbers — no fixed capacity limits.
        </p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.4s ease-out both; }

        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        .animate-shimmer { animation: shimmer 1.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default ManageStudents;