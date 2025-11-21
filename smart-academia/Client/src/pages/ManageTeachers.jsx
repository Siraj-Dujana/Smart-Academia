import React, { useState } from "react";

const ManageTeachers = () => {
  const [teachers] = useState([
    {
      id: 1,
      name: "Dr. Eleanor Vance",
      email: "eleanor.v@smartacademia.edu",
      department: "Computer Science",
      specialization: "Artificial Intelligence",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfPTeEMhMiED4qhmQAOotpYXPxbkz0JE7o_K1HptVxnuBK0HyuUSfhIm98TfaNun5NY90nyLCnQkvq2J2vUgeP450wvExuY5o9hjOaM-Pg7e-Oc-ozwfkYAAzNCK2iwrhZ3fyRKLXx8ixuezruT0auBF5fx6XQbKOWmqTHVkMQVi3JsPGBo8cUXOkn6XksgBKMLMyRBUx6pzCeuUAxWjyqQHxqStSoaYm4Fwc1LZ19b0rwJcldaBrC2XHz2OOTAya6ZP-9Ci2TtJ01"
    },
    {
      id: 2,
      name: "Dr. Ben Carter",
      email: "ben.c@smartacademia.edu",
      department: "Mathematics",
      specialization: "Calculus",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDR3UIICWRxpLXy2-ZT5DRGJgUPDD9B_OgP94OtA62iwt9wInk1CWtjneGF3WfNAlxi7PZP_fgkcnpjnqIhk-hKA7L1Hr89vPkL34QRw90UyiVJURBPO04Hgt4kpfcmfAIMTV5R0hASJLoXYNOtcqStVs6U-sbPCSMSy75h1Zv8ofrVUvANF53PXeiyHpsinX_6ApMlb1XRqUZn-0Kuqvp5vdNNDwi2d4ueRRhITL_rNZ0vG9H1AuDEF0JncW8r6KZnw3m8XRIyNq84"
    },
    {
      id: 3,
      name: "Dr. Sofia Rodriguez",
      email: "sofia.r@smartacademia.edu",
      department: "Physics",
      specialization: "Quantum Mechanics",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCA7cmsTtpmxprpoNL3hk2D9zfyG7nrHk8B8jhENZ2PMysq09baQmTguIB7YD7drdghlaf1QUmQNN_i3lc7T2mjXKuHsAvSKeR9QTit5wIekTh6OEunaCETlBI_O1gVlhpX_e5KjbUZh34JOzL5mZwf3cw86gQus9cn5VCmd62FSr6N5L6cwGg-1z_H7ANOuSLIB3gALrUy__CgsRdM1eQJMICwXEYYAkV2eDWc39OymB4LGvhGyMHXpVdNc3I26cUG3tXICiG2IIKu"
    },
    {
      id: 4,
      name: "Dr. Samuel Green",
      email: "samuel.g@smartacademia.edu",
      department: "Biology",
      specialization: "Genetics",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBIbkpOtI2w0Xlpq_fwmhZstv_c4JY4qjC41VHJvTozCEs61mq-RhA3iojwyqRTYZJv7ewgsmtyGpL0pbOcWgAaSkNn4keZd0Lk_UYMBxFKMHKfaeD_W5OlSlNqHQjC2iztQePW5g4tmCki_qDDlK8ld-yVaBrvpYV2f22Kz4TeATX9aIDuKa1tXyg_ujlwdYPuf3WtXu05VdpA1WS18imCWPcW9SXN2zAKq_StXpE2HRbogXjL6ukfCb0FsBXzOCgELLgE7FzQ8FR"
    },
    {
      id: 5,
      name: "Dr. Chloe Davis",
      email: "chloe.d@smartacademia.edu",
      department: "History",
      specialization: "Ancient Civilizations",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcf-ni8ThORU95cb_qoxVVegwcwN9_ijYqfeqOojDGOKdFAZ_oNeLU9uH0UsmjzxRpKXgnc6D2Z-NVKfHfXhzE4FKkvyMmHzePmwDlTufSUnqkxzDzw26QVWYRGbvJEjnQlDdWvGmlglf9nyVDFjOuSKXRpgcUCxo2hzREE9rrF2dOXOD5LFbX1HtHEpnL09eEL-ZbTqTt-K09wXQObeyz1ufSk4_dKFbXNQjPfYymBQs4UayJL94R3VtDKK3TbLxP3bdgZroBXD0b"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");

  const departments = [
    "All Departments",
    "Computer Science",
    "Mathematics",
    "Physics",
    "Biology",
    "History",
    "Arts"
  ];

  const user = {
    name: "Alex Morgan",
    role: "System Administrator",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkGYFou0KiLQduvDpVrVukFPGO-oipBBchzPH589jhUZPPaVHsNbQhldmzqux_NFJ0uzHeQh44AxrAG0VxEH3kqCROxpAoLinlovdD7HQN81LAMJj1_aczwVtFvSnOrDIcXaL7O2OzRUXVH4GxJkKIvQno4fQ1KhhdJVWvRTbyr2t9AOPKGg2S-hnfb-b3JBZcBDXlNE0FJ735Z1NH2KJq3EHO0InVpR-77RLL4JGgCxFTQeN7LpzJw1OwPVbDxKdvUSYJAOhnRLAD"
  };

  const handleAddTeacher = () => {
    console.log("Add new teacher clicked");
  };

  const handleEditTeacher = (teacher) => {
    console.log("Edit teacher:", teacher);
  };

  const handleDeleteTeacher = (teacher) => {
    console.log("Delete teacher:", teacher);
  };

  const handleNotifications = () => {
    console.log("Notifications clicked");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen">
      <div className="relative flex min-h-screen w-full">
        {/* Sidebar */}
        <aside className="flex h-screen w-64 flex-col border-r border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-4 sticky top-0">
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 py-2 mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">school</span>
            <h1 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">SmartAcademia</h1>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex flex-col gap-2">
              <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-light-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                <span className="material-symbols-outlined">dashboard</span>
                <p className="text-sm font-medium">Dashboard</p>
              </a>
              <a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary cursor-pointer">
                <span className="material-symbols-outlined fill">supervisor_account</span>
                <p className="text-sm font-medium">Manage Teachers</p>
              </a>
              <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-light-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                <span className="material-symbols-outlined">groups</span>
                <p className="text-sm font-medium">Manage Students</p>
              </a>
              <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-light-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                <span className="material-symbols-outlined">book</span>
                <p className="text-sm font-medium">Manage Courses</p>
              </a>
              <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-light-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                <span className="material-symbols-outlined">analytics</span>
                <p className="text-sm font-medium">Reports</p>
              </a>
              <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-light-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                <span className="material-symbols-outlined">settings</span>
                <p className="text-sm font-medium">Settings</p>
              </a>
            </div>

            {/* AI Assistance */}
            <div className="mt-auto">
              <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-light-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                <span className="material-symbols-outlined">smart_toy</span>
                <p className="text-sm font-medium">AI Assistance</p>
              </a>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex gap-3 items-center border-t border-border-light dark:border-border-dark pt-4">
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{ backgroundImage: `url("${user.avatar}")` }}
            ></div>
            <div className="flex flex-col">
              <h1 className="text-text-light-primary dark:text-text-dark-primary text-sm font-medium leading-normal">
                {user.name}
              </h1>
              <p className="text-text-light-secondary dark:text-text-dark-secondary text-xs font-normal leading-normal">
                {user.role}
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-end whitespace-nowrap border-b border-solid border-border-light dark:border-border-dark px-10 py-3 bg-card-light dark:bg-card-dark sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleNotifications}
                className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-background-light dark:bg-background-dark text-text-light-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">notifications</span>
              </button>
              <button 
                onClick={handleLogout}
                className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-background-light dark:bg-background-dark text-text-light-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
              </button>
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                style={{ backgroundImage: `url("${user.avatar}")` }}
              ></div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 md:p-10">
            <div className="flex flex-col gap-6">
              {/* Header Section */}
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex flex-col gap-2">
                  <h1 className="text-text-light-primary dark:text-text-dark-primary text-3xl font-bold leading-tight tracking-tight">
                    Manage Teachers
                  </h1>
                  <p className="text-text-light-secondary dark:text-text-dark-secondary text-base font-normal leading-normal">
                    View, add, edit, or delete teacher profiles.
                  </p>
                </div>
                <button 
                  onClick={handleAddTeacher}
                  className="flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>Add New Teacher</span>
                </button>
              </div>

              {/* Table Container */}
              <div className="rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark shadow-sm p-4 md:p-6">
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-grow">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-light-secondary dark:text-text-dark-secondary">
                      search
                    </span>
                    <input 
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary outline-none text-text-light-primary dark:text-text-dark-primary"
                    />
                  </div>
                  <div className="relative">
                    <select 
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="appearance-none w-full md:w-48 pl-4 pr-10 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary outline-none text-text-light-primary dark:text-text-dark-primary"
                    >
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-light-secondary dark:text-text-dark-secondary pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Teachers Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-background-light dark:bg-background-dark/50">
                      <tr>
                        <th className="px-6 py-3 font-medium text-text-light-secondary dark:text-text-dark-secondary" scope="col">
                          Full Name
                        </th>
                        <th className="px-6 py-3 font-medium text-text-light-secondary dark:text-text-dark-secondary" scope="col">
                          Email
                        </th>
                        <th className="px-6 py-3 font-medium text-text-light-secondary dark:text-text-dark-secondary" scope="col">
                          Department
                        </th>
                        <th className="px-6 py-3 font-medium text-text-light-secondary dark:text-text-dark-secondary" scope="col">
                          Specialization
                        </th>
                        <th className="px-6 py-3 font-medium text-text-light-secondary dark:text-text-dark-secondary text-center" scope="col">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((teacher) => (
                        <tr key={teacher.id} className="border-b border-border-light dark:border-border-dark">
                          <td className="px-6 py-4 font-medium text-text-light-primary dark:text-text-dark-primary">
                            <div className="flex items-center gap-3">
                              <img 
                                className="h-10 w-10 rounded-full object-cover"
                                src={teacher.avatar}
                                alt={`Profile picture of ${teacher.name}`}
                              />
                              <span>{teacher.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-text-light-secondary dark:text-text-dark-secondary">
                            {teacher.email}
                          </td>
                          <td className="px-6 py-4 text-text-light-secondary dark:text-text-dark-secondary">
                            {teacher.department}
                          </td>
                          <td className="px-6 py-4 text-text-light-secondary dark:text-text-dark-secondary">
                            {teacher.specialization}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => handleEditTeacher(teacher)}
                                className="p-2 text-text-light-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-primary transition-colors"
                              >
                                <span className="material-symbols-outlined text-xl">edit</span>
                              </button>
                              <button 
                                onClick={() => handleDeleteTeacher(teacher)}
                                className="p-2 text-text-light-secondary dark:text-text-dark-secondary hover:text-red-500 transition-colors"
                              >
                                <span className="material-symbols-outlined text-xl">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 mt-4 border-t border-border-light dark:border-border-dark">
                  <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-4 sm:mb-0">
                    Showing 1 to 5 of 54 teachers
                  </p>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center justify-center h-8 w-8 rounded-lg border border-border-light dark:border-border-dark text-text-light-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <span className="material-symbols-outlined text-lg">chevron_left</span>
                    </button>
                    <button className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-white text-sm font-medium">
                      1
                    </button>
                    <button className="flex items-center justify-center h-8 w-8 rounded-lg border border-border-light dark:border-border-dark text-text-light-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm">
                      2
                    </button>
                    <button className="flex items-center justify-center h-8 w-8 rounded-lg border border-border-light dark:border-border-dark text-text-light-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm">
                      3
                    </button>
                    <span className="text-text-light-secondary dark:text-text-dark-secondary">...</span>
                    <button className="flex items-center justify-center h-8 w-8 rounded-lg border border-border-light dark:border-border-dark text-text-light-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm">
                      11
                    </button>
                    <button className="flex items-center justify-center h-8 w-8 rounded-lg border border-border-light dark:border-border-dark text-text-light-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ManageTeachers;