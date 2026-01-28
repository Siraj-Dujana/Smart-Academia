import React, { useState } from "react";

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([
    {
      id: 1,
      cmsId: "EMP-001",
      name: "Dr. Noor Nabi",
      email: "noornabi.cs@iba-suk.edu.pk",
      department: "Computer Science",
      courses: 3,
      specialization: "Artificial Intelligence",
      status: "active",
      joinDate: "2022-03-15",
      // avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfPTeEMhMiED4qhmQAOotpYXPxbkz0JE7o_K1HptVxnuBK0HyuUSfhIm98TfaNun5NY90nyLCnQkvq2J2vUgeP450wvExuY5o9hjOaM-Pg7e-Oc-ozwfkYAAzNCK2iwrhZ3fyRKLXx8ixuezruT0auBF5fx6XQbKOWmqTHVkMQVi3JsPGBo8cUXOkn6XksgBKMLMyRBUx6pzCeuUAxWjyqQHxqStSoaYm4Fwc1LZ19b0rwJcldaBrC2XHz2OOTAya6ZP-9Ci2TtJ01"
    },
    {
      id: 2,
      cmsId: "EMP-002",
      name: "Dr. Faiz Ahmed Lakhani",
      email: "faizlakhani.cs@iba-suk.edu.pk",
      department: "Computer Science",
      courses: 4,
      specialization: "Calculus",
      status: "active",
      joinDate: "2021-08-22",
      // avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDR3UIICWRxpLXy2-ZT5DRGJgUPDD9B_OgP94OtA62iwt9wInk1CWtjneGF3WfNAlxi7PZP_fgkcnpjnqIhk-hKA7L1Hr89vPkL34QRw90UyiVJURBPO04Hgt4kpfcmfAIMTV5R0hASJLoXYNOtcqStVs6U-sbPCSMSy75h1Zv8ofrVUvANF53PXeiyHpsinX_6ApMlb1XRqUZn-0Kuqvp5vdNNDwi2d4ueRRhITL_rNZ0vG9H1AuDEF0JncW8r6KZnw3m8XRIyNq84"
    },
    {
      id: 3,
      cmsId: "EMP-003",
      name: "Sir Iftikhar Ahmed",
      email: "iftikhar.math@iba-suk.edu.pk",
      department: "Mathematics",
      courses: 2,
      specialization: "Quantum Mechanics",
      status: "active",
      joinDate: "2023-01-10",
      // avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCA7cmsTtpmxprpoNL3hk2D9zfyG7nrHk8B8jhENZ2PMysq09baQmTguIB7YD7drdghlaf1QUmQNN_i3lc7T2mjXKuHsAvSKeR9QTit5wIekTh6OEunaCETlBI_O1gVlhpX_e5KjbUZh34JOzL5mZwf3cw86gQus9cn5VCmd62FSr6N5L6cwGg-1z_H7ANOuSLIB3gALrUy__CgsRdM1eQJMICwXEYYAkV2eDWc39OymB4LGvhGyMHXpVdNc3I26cUG3tXICiG2IIKu"
    },
    {
      id: 4,
      cmsId: "EMP-004",
      name: "Sir Ali Akber Shah",
      email: "aliakber.business@iba-suk.edu.pk",
      department: "Business Administration",
      courses: 3,
      specialization: "Genetics",
      status: "active",
      joinDate: "2022-11-05",
      // avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBIbkpOtI2w0Xlpq_fwmhZstv_c4JY4qjC41VHJvTozCEs61mq-RhA3iojwyqRTYZJv7ewgsmtyGpL0pbOcWgAaSkNn4keZd0Lk_UYMBxFKMHKfaeD_W5OlSlNqHQjC2iztQePW5g4tmCki_qDDlK8ld-yVaBrvpYV2f22Kz4TeATX9aIDuKa1tXyg_ujlwdYPuf3WtXu05VdpA1WS18imCWPcW9SXN2zAKq_StXpE2HRbogXjL6ukfCb0FsBXzOCgELLgE7FzQ8FR"
    },
    {
      id: 5,
      cmsId: "EMP-005",
      name: "Sir Khair Bux",
      email: "khairbux.business@iba-suk.edu.pk",
      department: "Business Administration",
      courses: 2,
      specialization: "Ancient Civilizations",
      status: "active",
      joinDate: "2023-03-20",
      // avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcf-ni8ThORU95cb_qoxVVegwcwN9_ijYqfeqOojDGOKdFAZ_oNeLU9uH0UsmjzxRpKXgnc6D2Z-NVKfHfXhzE4FKkvyMmHzePmwDlTufSUnqkxzDzw26QVWYRGbvJEjnQlDdWvGmlglf9nyVDFjOuSKXRpgcUCxo2hzREE9rrF2dOXOD5LFbX1HtHEpnL09eEL-ZbTqTt-K09wXQObeyz1ufSk4_dKFbXNQjPfYymBQs4UayJL94R3VtDKK3TbLxP3bdgZroBXD0b"
    }
  ]);

  const [newTeacher, setNewTeacher] = useState({
    cmsId: "",
    name: "",
    email: "",
    department: "",
    courses: "",
    specialization: "",
    status: "active"
  });

  const [editTeacher, setEditTeacher] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Departments
  const departments = ["Computer Science", "Mathematics", "Physics", "Biology", "Chemistry", "History", "Arts", "Engineering", "Business Administration"];

  // Filtered teachers
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = 
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.cmsId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || teacher.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Event handlers
  const handleAddNew = () => {
    setShowAddModal(true);
  };

  const handleEditTeacher = (teacher) => {
    setEditTeacher(teacher);
    setShowEditModal(true);
  };

  const handleDeleteTeacher = (teacher) => {
    if (window.confirm(`Are you sure you want to delete ${teacher.name}?`)) {
      setTeachers(teachers.filter(t => t.id !== teacher.id));
    }
  };

  const handleAddTeacher = () => {
    if (newTeacher.name && newTeacher.email && newTeacher.department && newTeacher.cmsId) {
      const teacher = {
        id: teachers.length + 1,
        ...newTeacher,
        courses: parseInt(newTeacher.courses) || 0,
        joinDate: new Date().toISOString().split('T')[0],
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkGYFou0KiLQduvDpVrVukFPGO-oipBBchzPH589jhUZPPaVHsNbQhldmzqux_NFJ0uzHeQh44AxrAG0VxEH3kqCROxpAoLinlovdD7HQN81LAMJj1_aczwVtFvSnOrDIcXaL7O2OzRUXVH4GxJkKIvQno4fQ1KhhdJVWvRTbyr2t9AOPKGg2S-hnfb-b3JBZcBDXlNE0FJ735Z1NH2KJq3EHO0InVpR-77RLL4JGgCxFTQeN7LpzJw1OwPVbDxKdvUSYJAOhnRLAD"
      };
      setTeachers([...teachers, teacher]);
      setNewTeacher({ cmsId: "", name: "", email: "", department: "", courses: "", specialization: "", status: "active" });
      setShowAddModal(false);
    }
  };

  const handleUpdateTeacher = () => {
    if (editTeacher) {
      setTeachers(teachers.map(t => 
        t.id === editTeacher.id ? { ...editTeacher, courses: parseInt(editTeacher.courses) || 0 } : t
      ));
      setShowEditModal(false);
      setEditTeacher(null);
    }
  };

  const toggleTeacherStatus = (teacher) => {
    setTeachers(teachers.map(t => 
      t.id === teacher.id ? { ...t, status: t.status === "active" ? "inactive" : "active" } : t
    ));
  };

  // Add Teacher Modal
  const AddTeacherModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add New Teacher
          </h3>
          <button 
            onClick={() => setShowAddModal(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CMS ID
            </label>
            <input
              type="text"
              value={newTeacher.cmsId}
              onChange={(e) => setNewTeacher({...newTeacher, cmsId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g., EMP-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={newTeacher.name}
              onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={newTeacher.email}
              onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department
            </label>
            <select
              value={newTeacher.department}
              onChange={(e) => setNewTeacher({...newTeacher, department: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Specialization
            </label>
            <input
              type="text"
              value={newTeacher.specialization}
              onChange={(e) => setNewTeacher({...newTeacher, specialization: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter specialization"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Number of Courses
            </label>
            <input
              type="number"
              value={newTeacher.courses}
              onChange={(e) => setNewTeacher({...newTeacher, courses: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter number of courses"
              min="0"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowAddModal(false)}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleAddTeacher}
            className="flex-1 px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200"
          >
            Add Teacher
          </button>
        </div>
      </div>
    </div>
  );

  // Edit Teacher Modal
  const EditTeacherModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Teacher
          </h3>
          <button 
            onClick={() => setShowEditModal(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CMS ID
            </label>
            <input
              type="text"
              value={editTeacher?.cmsId || ""}
              onChange={(e) => setEditTeacher({...editTeacher, cmsId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={editTeacher?.name || ""}
              onChange={(e) => setEditTeacher({...editTeacher, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={editTeacher?.email || ""}
              onChange={(e) => setEditTeacher({...editTeacher, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department
            </label>
            <select
              value={editTeacher?.department || ""}
              onChange={(e) => setEditTeacher({...editTeacher, department: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Specialization
            </label>
            <input
              type="text"
              value={editTeacher?.specialization || ""}
              onChange={(e) => setEditTeacher({...editTeacher, specialization: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Number of Courses
            </label>
            <input
              type="number"
              value={editTeacher?.courses || ""}
              onChange={(e) => setEditTeacher({...editTeacher, courses: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              min="0"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowEditModal(false)}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateTeacher}
            className="flex-1 px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200"
          >
            Update Teacher
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Manage Teachers
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage teachers enrollments and academic information
          </p>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform duration-200">
            add
          </span> 
          Add New Teacher
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Teachers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center size-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 group-hover:scale-110 transition-transform duration-200">
              <span className="material-symbols-outlined text-2xl text-indigo-600 dark:text-indigo-400">groups</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                Total Teachers
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {teachers.length}
              </p>
              <p className="text-xs font-medium text-green-600 dark:text-green-400">
                +{teachers.length} total employed
              </p>
            </div>
          </div>
        </div>

        {/* Active Teachers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center size-12 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform duration-200">
              <span className="material-symbols-outlined text-2xl text-green-600 dark:text-green-400">check_circle</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                Active Teachers
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {teachers.filter(t => t.status === 'active').length}
              </p>
              <p className="text-xs font-medium text-green-600 dark:text-green-400">
                {((teachers.filter(t => t.status === 'active').length / teachers.length) * 100).toFixed(1)}% active rate
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
                {[...new Set(teachers.map(t => t.department))].length}
              </p>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                Across all faculties
              </p>
            </div>
          </div>
        </div>

        {/* Specializations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center size-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform duration-200">
              <span className="material-symbols-outlined text-2xl text-purple-600 dark:text-purple-400">psychology</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                Specializations
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {[...new Set(teachers.map(t => t.specialization))].length}
              </p>
              <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                Various expertise areas
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
              placeholder="Search teachers by name, email, or CMS ID..."
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

      {/* Teachers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                  CMS ID & Teacher
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                  Department
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                  Courses
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                  Specialization
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                  Join Date
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTeachers.map((teacher) => (
                <tr 
                  key={teacher.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150 group"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img 
                        className="size-8 sm:size-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-indigo-200 dark:group-hover:ring-indigo-400 transition-all duration-200"
                        src={teacher.avatar} 
                        alt={`Profile of ${teacher.name}`} 
                      />
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base block">
                          {teacher.name}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-gray-500 dark:text-gray-400 text-xs font-mono">
                            ID: {teacher.cmsId}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 text-xs">
                            {teacher.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base font-medium">
                      {teacher.department}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      <span className="material-symbols-outlined text-xs">menu_book</span>
                      {teacher.courses} courses
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                      <span className="material-symbols-outlined text-xs">psychology</span>
                      {teacher.specialization}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleTeacherStatus(teacher)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${
                        teacher.status === "active" 
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50" 
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        teacher.status === "active" ? "bg-green-500" : "bg-gray-500"
                      }`}></span>
                      {teacher.status === "active" ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    {new Date(teacher.joinDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1 sm:gap-2">
                      <button 
                        onClick={() => handleEditTeacher(teacher)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Edit teacher"
                      >
                        <span className="material-symbols-outlined text-sm sm:text-base">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteTeacher(teacher)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Delete teacher"
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
      {filteredTeachers.length === 0 && (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
            supervisor_account
          </span>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No teachers found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <button 
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Add New Teacher
          </button>
        </div>
      )}

      {/* Modals */}
      {showAddModal && <AddTeacherModal />}
      {showEditModal && <EditTeacherModal />}
    </div>
  );
};

export default ManageTeachers;