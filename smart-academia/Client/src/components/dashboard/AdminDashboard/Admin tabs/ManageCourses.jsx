import React, { useState, useEffect, useRef } from "react";
import { Chart } from 'chart.js/auto';

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-3 mb-4">
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
    >
      <span className="material-symbols-outlined text-sm text-white">
        {icon}
      </span>
    </div>
    <h3 className="text-xs font-bold text-white tracking-wide uppercase">
      {title}
    </h3>
    <div
      className="flex-1 h-px"
      style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.15), transparent)" }}
    />
  </div>
);

// ── Mini Bar ──────────────────────────────────────────────────
const MiniBar = ({ value = 0, height = 6 }) => (
  <div
    className="w-full rounded-full overflow-hidden"
    style={{ height, background: "#1e293b" }}
  >
    <div
      className="h-full rounded-full bg-white"
      style={{
        width: `${Math.min(Math.max(value, 0), 100)}%`,
        boxShadow: "0 0 8px rgba(255,255,255,0.4)",
        transition: "width 1s cubic-bezier(.4,0,.2,1)",
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
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 70%)" }}
      />
      <div className="flex items-start justify-between">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <span className="text-xs font-bold text-white transition-all duration-300">
          {percentage}%
        </span>
      </div>
      <div>
        {isLoading ? (
          <div className="h-9 w-16 rounded-lg overflow-hidden relative" style={{ background: "#1a2338" }}>
            <div className="absolute inset-0 animate-shimmer" style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
            }} />
          </div>
        ) : (
          <p
            className="text-3xl font-black text-white tracking-tight"
            style={{ textShadow: "0 0 20px rgba(255,255,255,0.25)" }}
          >
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
    <div
      className="absolute inset-2 rounded-full border-4 border-transparent border-t-white/40 animate-spin"
      style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
    />
  </div>
);

const ManageCourses = () => {
  const token = localStorage.getItem("token");

  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [error, setError] = useState("");
  const [reassigningCourse, setReassigningCourse] = useState(null);
  const [selectedNewTeacher, setSelectedNewTeacher] = useState("");
  const [reassignLoading, setReassignLoading] = useState(false);

  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);

  const departments = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Biology",
    "Business Administration",
    "History",
    "Arts",
    "Engineering",
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

  const handleReassign = async () => {
    if (!selectedNewTeacher) return;
    setReassignLoading(true);
    try {
      const res = await fetch(
        `${API}/api/admin/courses/${reassigningCourse._id}/reassign`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newTeacherId: selectedNewTeacher }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.message);
        return;
      }
      setCourses((prev) =>
        prev.map((c) => (c._id === reassigningCourse._id ? data.course : c)),
      );
      setReassigningCourse(null);
      setSelectedNewTeacher("");
    } catch {
      alert("Cannot connect to server");
    } finally {
      setReassignLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch(`${API}/api/admin/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTeachers(data.teachers || []);
    } catch {
      /* silent */
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "all" || course.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const totalCourses = courses.length;
  const totalTeachers = [
    ...new Set(courses.map((c) => c.teacher?._id).filter(Boolean)),
  ].length;
  const totalDepartments = [
    ...new Set(courses.map((c) => c.department).filter(Boolean)),
  ].length;

  // No fixed targets — each bar/percentage is scaled against the largest
  // live count among these three stats, so nothing is capped by a made-up number.
  const liveMax = Math.max(totalCourses, totalTeachers, totalDepartments, 1);

  const statCards = [
    { title: "Total Courses", value: totalCourses, total: liveMax },
    { title: "Active Teachers", value: totalTeachers, total: liveMax },
    { title: "Departments", value: totalDepartments, total: liveMax },
  ];

  // Courses grouped by department (only departments that actually have courses)
  const departmentCounts = courses.reduce((acc, c) => {
    const dept = c.department || "Unassigned";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});
  const departmentLabels = Object.keys(departmentCounts);
  const departmentValues = Object.values(departmentCounts);

  // Published vs draft distribution
  const publishedCount = courses.filter((c) => c.isPublished).length;
  const draftCount = courses.length - publishedCount;

  // Initialize charts once course data is loaded
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
            label: 'Courses',
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
      pieChartInstance.current = new Chart(pieCtx, {
        type: 'pie',
        data: {
          labels: ['Published', 'Draft'],
          datasets: [{
            data: [publishedCount, draftCount],
            backgroundColor: ['#ffffff', '#334155'],
            hoverBackgroundColor: ['#cbd5e1', '#475569'],
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
  }, [isLoading, courses]);

  return (
    <div className="space-y-6" style={{ fontFamily: "'Lexend', sans-serif" }}>
      {/* Hero Section */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full animate-pulse bg-white" />
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Admin · Course Management
          </p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Manage Courses
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          View all courses across the platform (Read-only)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="rounded-xl p-3 flex items-center gap-2"
          style={{ background: "#ef444422", border: "1px solid #ef444444" }}
        >
          <span className="material-symbols-outlined text-sm text-red-400">
            error
          </span>
          <p className="text-sm text-red-400 flex-1">{error}</p>
          <button
            onClick={() => setError("")}
            className="text-red-400 hover:text-red-300"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

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
        <SectionHeader icon="bar_chart" title="Course Analytics" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Bar Chart — Courses by Department */}
          <div
            className="lg:col-span-2 rounded-2xl p-5 transition-all duration-300"
            style={{ background: "#0f1629", border: "1px solid #1e293b" }}
          >
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-white text-base">show_chart</span>
              Courses by Department
            </h3>
            <div className="h-72 lg:h-80">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : courses.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-500">
                  No data to display yet
                </div>
              ) : (
                <canvas ref={barChartRef} />
              )}
            </div>
          </div>

          {/* Pie Chart — Published vs Draft */}
          <div
            className="rounded-2xl p-5 transition-all duration-300"
            style={{ background: "#0f1629", border: "1px solid #1e293b" }}
          >
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-white text-base">pie_chart</span>
              Publish Status
            </h3>
            <div className="h-72 lg:h-80 flex items-center justify-center">
              {isLoading ? (
                <LoadingSpinner />
              ) : courses.length === 0 ? (
                <div className="text-sm text-gray-500">No data to display yet</div>
              ) : (
                <canvas ref={pieChartRef} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div
        className="rounded-2xl p-5 transition-all duration-300"
        style={{ background: "#0f1629", border: "1px solid #1e293b" }}
      >
        <SectionHeader icon="filter_alt" title="Filters" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Search courses by title or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-white/40 focus:border-transparent outline-none transition-all duration-300"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-white/40 focus:border-transparent outline-none transition-all duration-300 cursor-pointer"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Table - READ ONLY (No Actions except Reassign) */}
      {isLoading ? (
        <div
          className="text-center py-16 rounded-2xl"
          style={{ background: "#0f1629", border: "1px solid #1e293b" }}
        >
          <LoadingSpinner />
          <p className="text-gray-500 mt-3 text-sm">Loading courses...</p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden transition-all duration-300"
          style={{ background: "#0f1629", border: "1px solid #1e293b" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead
                style={{
                  background: "#0a0f1e",
                  borderBottom: "1px solid #1e293b",
                }}
              >
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Instructor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Students
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "#1e293b" }}>
                {filteredCourses.map((course) => (
                  <tr
                    key={course._id}
                    className="hover:bg-white/5 transition-colors duration-200"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-white text-sm">
                          {course.title}
                        </p>
                        <p className="text-gray-500 text-xs font-mono mt-0.5">
                          {course.code}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm hidden sm:table-cell">
                      {course.department || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm hidden md:table-cell">
                      {course.teacher?.fullName || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm hidden lg:table-cell">
                      {course.enrolledCount || 0}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-[10px] font-medium ${
                          course.isPublished
                            ? "text-emerald-400"
                            : "text-gray-500"
                        }`}
                        style={{
                          background: course.isPublished
                            ? "#22c55e22"
                            : "#1e293b",
                          border: `1px solid ${course.isPublished ? "#22c55e44" : "#334155"}`,
                        }}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button
                          onClick={() => {
                            setReassigningCourse(course);
                            setSelectedNewTeacher("");
                          }}
                          className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Reassign teacher"
                        >
                          <span className="material-symbols-outlined text-base">
                            swap_horiz
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredCourses.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-gray-700 mb-3 block">
                menu_book
              </span>
              <h3 className="text-base font-semibold text-gray-400 mb-1">
                No courses found
              </h3>
              <p className="text-sm text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      )}

      {/* Info Banner */}
      <div
        className="rounded-xl p-3 flex items-start gap-2"
        style={{ background: "#0a0f1e", border: "1px solid #1e293b" }}
      >
        <span className="material-symbols-outlined text-xs text-white/70 mt-0.5">
          info
        </span>
        <p className="text-[10px] text-gray-500 leading-relaxed">
          <span className="text-white/80 font-semibold">
            Course management:
          </span>{" "}
          View all courses across departments. Course creation and editing are
          managed by teachers. Admins have read-only access to course data, aside
          from reassigning a course's teacher.
        </p>
      </div>

      {/* Reassign Modal */}
      {reassigningCourse && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300"
          onClick={() => setReassigningCourse(null)}
        >
          <div
            className="rounded-2xl w-full max-w-md animate-fadeInUp"
            style={{ background: "#0f1629", border: "1px solid #1e293b" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4" style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b" }}>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Reassign Course</h2>
                <button onClick={() => setReassigningCourse(null)} className="text-gray-500 hover:text-gray-400 transition-colors duration-200">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Course</p>
                <p className="text-sm font-semibold text-white">{reassigningCourse.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">Current teacher: {reassigningCourse.teacher?.fullName || "—"}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">New Teacher *</label>
                <select
                  value={selectedNewTeacher}
                  onChange={e => setSelectedNewTeacher(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-white/40 outline-none transition-all duration-300"
                >
                  <option value="">Select a teacher…</option>
                  {teachers
                    .filter(t => t._id !== reassigningCourse.teacher?._id)
                    .map(t => (
                      <option key={t._id} value={t._id}>{t.fullName} ({t.email})</option>
                    ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setReassigningCourse(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105"
                  style={{ background: "#1e293b", color: "#94a3b8" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReassign}
                  disabled={!selectedNewTeacher || reassignLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  style={{ background: "#ffffff", color: "#0a0f1e" }}
                >
                  {reassignLoading ? "Reassigning..." : "Reassign"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default ManageCourses;