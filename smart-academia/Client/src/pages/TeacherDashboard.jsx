import React from 'react';

const TeacherDashboard = () => {
  // Mock data for courses
  const courses = [
    {
      id: 1,
      title: "Introduction to Python",
      code: "CS-101",
      students: 32,
      description: "A foundational course on Python programming, covering syntax, data structures, and basic algorithms."
    },
    {
      id: 2,
      title: "Data Structures & Algorithms",
      code: "CS-201",
      students: 28,
      description: "An in-depth look at fundamental data structures, algorithms, and complexity analysis."
    },
    {
      id: 3,
      title: "Machine Learning",
      code: "CS-305",
      students: 26,
      description: "Exploring core concepts of machine learning, including supervised and unsupervised learning models."
    }
  ];

  // Mock data for student progress
  const studentProgress = [
    {
      id: 1,
      name: "Olivia Chen",
      course: "Introduction to Python",
      progress: 95,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCA7cmsTtpmxprpoNL3hk2D9zfyG7nrHk8B8jhENZ2PMysq09baQmTguIB7YD7drdghlaf1QUmQNN_i3lc7T2mjXKuHsAvSKeR9QTit5wIekTh6OEunaCETlBI_O1gVlhpX_e5KjbUZh34JOzL5mZwf3cw86gQus9cn5VCmd62FSr6N5L6cwGg-1z_H7ANOuSLIB3gALrUy__CgsRdM1eQJMICwXEYYAkV2eDWc39OymB4LGvhGyMHXpVdNc3I26cUG3tXICiG2IIKu"
    },
    {
      id: 2,
      name: "Liam Patel",
      course: "Data Structures & Algorithms",
      progress: 82,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDR3UIICWRxpLXy2-ZT5DRGJgUPDD9B_OgP94OtA62iwt9wInk1CWtjneGF3WfNAlxi7PZP_fgkcnpjnqIhk-hKA7L1Hr89vPkL34QRw90UyiVJURBPO04Hgt4kpfcmfAIMTV5R0hASJLoXYNOtcqStVs6U-sbPCSMSy75h1Zv8ofrVUvANF53PXeiyHpsinX_6ApMlb1XRqUZn-0Kuqvp5vdNNDwi2d4ueRRhITL_rNZ0vG9H1AuDEF0JncW8r6KZnw3m8XRIyNq84"
    },
    {
      id: 3,
      name: "Ava Garcia",
      course: "Machine Learning",
      progress: 75,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtnYbxeWCt8KBRSHWtWmtUbg56WSyYWYG2jdygTpmmIz-zsXb2yPR6sURUIPz7QIcDf7at6_zCrclzK6w3pYQckCr3KrGjScsivo0IDHR6TcB7-OkrDmypmCP1L0YK8kUUlAr2hWTgRILLbdyoh2NfW__EHIU48xnBGSSVAF4-uJqatQ2fSh9taxoWk6xkAwMBOtOUE10zANYB5CleGq64KrvWFjWtPN9UbA--qTIUe0rHdnavE85Rl6Edf43KFJDx_8jcpiOFS2Z2"
    },
    {
      id: 4,
      name: "Noah Kim",
      course: "Introduction to Python",
      progress: 45,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAp85dXa58ls5nHbIXfSTaM_xH02YhIVdAjnnoY6IB9GooLVSJbia04iRnJmOo5OPOXwIIfJOgg5PJwoJFeUMHKs9J4rjASKd7-DgCV6FYvQRBOS7kEj6WbfDjw5yGz81Jhpwj7ydFnWlRlbQKH63qAdJ46NlXvVuBUE7DwqvqphU24_H8KwZQVcGrEWMb_h95o9pfG3lwfd5ZM_q72kLK5HNxXGulu78dZY4TDsQvsew2GaduceAfDri0tDa37dXxGBup4YDJTTTgH"
    }
  ];

  // Stats data
  const stats = [
    {
      icon: "school",
      title: "Courses",
      value: "4",
      color: "bg-indigo-100 dark:bg-indigo-900/50 text-primary"
    },
    {
      icon: "quiz",
      title: "Quizzes Created",
      value: "12",
      color: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500"
    },
    {
      icon: "groups",
      title: "Students",
      value: "86",
      color: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-500"
    },
    {
      icon: "trending_up",
      title: "Average Progress",
      value: "78%",
      color: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-500"
    }
  ];

  // Menu items
  const menuItems = [
    { icon: "dashboard", label: "Dashboard", active: true },
    { icon: "book", label: "Course Management" },
    { icon: "quiz", label: "Quiz Management" },
    { icon: "science", label: "Lab Management" },
    { icon: "bar_chart", label: "Student Progress" },
    { icon: "campaign", label: "Announcements" },
    { icon: "smart_toy", label: "AI Tutor" }
  ];

  // User data
  const user = {
    name: "Dr. Eleanor Vance",
    role: "Professor of CS",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfPTeEMhMiED4qhmQAOotpYXPxbkz0JE7o_K1HptVxnuBK0HyuUSfhIm98TfaNun5NY90nyLCnQkvq2J2vUgeP450wvExuY5o9hjOaM-Pg7e-Oc-ozwfkYAAzNCK2iwrhZ3fyRKLXx8ixuezruT0auBF5fx6XQbKOWmqTHVkMQVi3JsPGBo8cUXOkn6XksgBKMLMyRBUx6pzCeuUAxWjyqQHxqStSoaYm4Fwc1LZ19b0rwJcldaBrC2XHz2OOTAya6ZP-9Ci2TtJ01"
  };

  // Event handlers
  const handleViewLessons = (courseId) => {
    console.log(`View lessons for course ${courseId}`);
  };

  const handleManageQuizzes = (courseId) => {
    console.log(`Manage quizzes for course ${courseId}`);
  };

  const handleSendAnnouncement = (courseId) => {
    console.log(`Send announcement for course ${courseId}`);
  };

  const handleAITutorClick = () => {
    console.log('Open AI Tutor');
  };

  const handleLogout = () => {
    console.log('Logout');
  };

  const handleNotifications = () => {
    console.log('Notifications');
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen">
      <div className="relative flex min-h-screen w-full">
        {/* Sidebar */}
        <aside className="flex h-screen w-64 flex-col border-r border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-4 sticky top-0">
          {/* Logo */}
          <div className="flex items-center gap-2 px-3 py-2 mb-6">
            <span className="font-bold text-2xl text-primary">S</span>
            <h1 className="text-xl font-semibold text-text-light-primary dark:text-text-dark-primary">SmartAcademia</h1>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex flex-col gap-1">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                    item.active
                      ? "bg-primary/10 dark:bg-primary/20 text-primary font-semibold"
                      : "text-text-light-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-light-primary dark:hover:text-text-dark-primary transition-colors"
                  }`}
                  href="#"
                >
                  <span className={`material-symbols-outlined ${item.active ? "fill" : ""}`}>
                    {item.icon}
                  </span>
                  <p className="text-sm">{item.label}</p>
                </a>
              ))}
            </div>
          </div>

          {/* User Profile */}
          <div className="flex gap-3 items-center border-t border-border-light dark:border-border-dark pt-4 mt-4">
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
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-light dark:border-border-dark px-6 md:px-10 py-3 bg-card-light/80 dark:bg-card-dark/80 backdrop-blur-sm sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <span className="font-bold text-2xl text-primary lg:hidden">S</span>
              <h1 className="text-xl font-semibold text-text-light-primary dark:text-text-dark-primary lg:hidden">SmartAcademia</h1>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <button 
                onClick={handleNotifications}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-text-light-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-border-dark transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">notifications</span>
              </button>
              <button 
                onClick={handleLogout}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-text-light-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-border-dark transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">logout</span>
              </button>
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                style={{ backgroundImage: `url("${user.avatar}")` }}
              ></div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 md:p-10">
            {/* Dashboard Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <div className="flex flex-col gap-1">
                <p className="text-text-light-primary dark:text-text-dark-primary text-3xl font-bold leading-tight tracking-tight">
                  Dashboard
                </p>
                <p className="text-text-light-secondary dark:text-text-dark-secondary text-base font-normal leading-normal">
                  Welcome back, Dr. Vance! Here's your overview.
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-start gap-4 rounded-xl p-6 bg-card-light dark:bg-card-dark shadow-soft">
                  <div className={`flex items-center justify-center size-12 rounded-lg ${stat.color}`}>
                    <span className="material-symbols-outlined text-3xl">{stat.icon}</span>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm font-medium">
                      {stat.title}
                    </p>
                    <p className="text-text-light-primary dark:text-text-dark-primary tracking-tight text-3xl font-bold">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* My Courses Section */}
            <div>
              <h2 className="text-text-light-primary dark:text-text-dark-primary text-xl font-bold leading-tight tracking-tight mb-4">
                My Courses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {courses.map((course) => (
                  <div key={course.id} className="flex flex-col rounded-xl bg-card-light dark:bg-card-dark shadow-soft-md overflow-hidden border border-border-light dark:border-border-dark transition-all hover:shadow-lg">
                    <div className="p-6 flex-grow">
                      <h3 className="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary mb-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-4">
                        {course.code} • {course.students} Students
                      </p>
                      <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary leading-relaxed">
                        {course.description}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 p-4 bg-background-light dark:bg-background-dark/50">
                      <button 
                        onClick={() => handleViewLessons(course.id)}
                        className="w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg text-white bg-primary hover:bg-primary/90 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">play_lesson</span> 
                        View Lessons
                      </button>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleManageQuizzes(course.id)}
                          className="flex-1 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-text-light-secondary dark:text-text-dark-secondary bg-white dark:bg-card-dark border border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-border-dark/50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">quiz</span> 
                          Manage Quizzes
                        </button>
                        <button 
                          onClick={() => handleSendAnnouncement(course.id)}
                          className="flex-1 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-text-light-secondary dark:text-text-dark-secondary bg-white dark:bg-card-dark border border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-border-dark/50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">campaign</span> 
                          Send Announcement
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Student Progress Section */}
            <div>
              <h2 className="text-text-light-primary dark:text-text-dark-primary text-xl font-bold leading-tight tracking-tight mb-4">
                Recent Student Progress
              </h2>
              <div className="rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark shadow-soft overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="border-b border-border-light dark:border-border-dark">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-text-light-secondary dark:text-text-dark-secondary uppercase text-xs tracking-wider" scope="col">
                        Student Name
                      </th>
                      <th className="px-6 py-4 font-semibold text-text-light-secondary dark:text-text-dark-secondary uppercase text-xs tracking-wider" scope="col">
                        Course
                      </th>
                      <th className="px-6 py-4 font-semibold text-text-light-secondary dark:text-text-dark-secondary uppercase text-xs tracking-wider" scope="col">
                        Progress
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentProgress.map((student) => (
                      <tr key={student.id} className="border-b border-border-light dark:border-border-dark last:border-b-0">
                        <td className="px-6 py-4 font-medium text-text-light-primary dark:text-text-dark-primary whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img 
                              className="h-9 w-9 rounded-full object-cover" 
                              src={student.avatar} 
                              alt={`Profile of ${student.name}`} 
                            />
                            {student.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-text-light-secondary dark:text-text-dark-secondary">
                          {student.course}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  student.progress >= 70 ? 'bg-primary' : 'bg-amber-500'
                                }`} 
                                style={{ width: `${student.progress}%` }}
                              ></div>
                            </div>
                            <span className="font-medium text-text-light-primary dark:text-text-dark-primary text-sm">
                              {student.progress}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>

        {/* Floating AI Tutor Button */}
        <button 
          onClick={handleAITutorClick}
          className="fixed bottom-6 right-6 h-16 w-16 flex items-center justify-center rounded-2xl bg-secondary text-white shadow-lg hover:bg-secondary/90 transition-transform hover:scale-105"
        >
          <span className="material-symbols-outlined text-3xl fill">smart_toy</span>
        </button>
      </div>
    </div>
  );
};

export default TeacherDashboard;