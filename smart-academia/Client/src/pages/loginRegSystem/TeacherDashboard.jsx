import React, { useState } from "react";

const TeacherDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // Menu items
  const menuItems = [
    { icon: "dashboard", label: "Dashboard", key: 'dashboard' },
    { icon: "book", label: "Course Management", key: 'courses' },
    { icon: "quiz", label: "Quiz Management", key: 'quizzes' },
    { icon: "science", label: "Lab Management", key: 'labs' },
    { icon: "bar_chart", label: "Student Progress", key: 'progress' },
    { icon: "campaign", label: "Announcements", key: 'announcements' },
    { icon: "smart_toy", label: "AI Tutor", key: 'ai-tutor' }
  ];

  // User data
  const user = {
    name: "Dr. Eleanor Vance",
    role: "Professor of CS",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfPTeEMhMiED4qhmQAOotpYXPxbkz0JE7o_K1HptVxnuBK0HyuUSfhIm98TfaNun5NY90nyLCnQkvq2J2vUgeP450wvExuY5o9hjOaM-Pg7e-Oc-ozwfkYAAzNCK2iwrhZ3fyRKLXx8ixuezruT0auBF5fx6XQbKOWmqTHVkMQVi3JsPGBo8cUXOkn6XksgBKMLMyRBUx6pzCeuUAxWjyqQHxqStSoaYm4Fwc1LZ19b0rwJcldaBrC2XHz2OOTAya6ZP-9Ci2TtJ01"
  };

  // Stats data
  const stats = [
    {
      icon: "school",
      title: "Courses",
      value: "4",
      color: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-500",
      trend: "+1 this semester",
      trendColor: "text-green-500"
    },
    {
      icon: "quiz",
      title: "Quizzes Created",
      value: "12",
      color: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500",
      trend: "+3 this month",
      trendColor: "text-green-500"
    },
    {
      icon: "groups",
      title: "Students",
      value: "86",
      color: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-500",
      trend: "+5 this semester",
      trendColor: "text-green-500"
    },
    {
      icon: "trending_up",
      title: "Average Progress",
      value: "78%",
      color: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-500",
      trend: "+2% this week",
      trendColor: "text-green-500"
    }
  ];

  // Courses data
  const courses = [
    {
      title: "Introduction to Python",
      code: "CS-101",
      students: "32 Students",
      description: "A foundational course on Python programming, covering syntax, data structures, and basic algorithms.",
      color: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-500"
    },
    {
      title: "Data Structures & Algorithms",
      code: "CS-201",
      students: "28 Students",
      description: "An in-depth look at fundamental data structures, algorithms, and complexity analysis.",
      color: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-500"
    },
    {
      title: "Machine Learning",
      code: "CS-305",
      students: "26 Students",
      description: "Exploring core concepts of machine learning, including supervised and unsupervised learning models.",
      color: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500"
    }
  ];

  // Student progress data
  const studentProgress = [
    {
      name: "Olivia Chen",
      course: "Introduction to Python",
      progress: 95,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCA7cmsTtpmxprpoNL3hk2D9zfyG7nrHk8B8jhENZ2PMysq09baQmTguIB7YD7drdghlaf1QUmQNN_i3lc7T2mjXKuHsAvSKeR9QTit5wIekTh6OEunaCETlBI_O1gVlhpX_e5KjbUZh34JOzL5mZwf3cw86gQus9cn5VCmd62FSr6N5L6cwGg-1z_H7ANOuSLIB3gALrUy__CgsRdM1eQJMICwXEYYAkV2eDWc39OymB4LGvhGyMHXpVdNc3I26cUG3tXICiG2IIKu"
    },
    {
      name: "Liam Patel",
      course: "Data Structures & Algorithms",
      progress: 82,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDR3UIICWRxpLXy2-ZT5DRGJgUPDD9B_OgP94OtA62iwt9wInk1CWtjneGF3WfNAlxi7PZP_fgkcnpjnqIhk-hKA7L1Hr89vPkL34QRw90UyiVJURBPO04Hgt4kpfcmfAIMTV5R0hASJLoXYNOtcqStVs6U-sbPCSMSy75h1Zv8ofrVUvANF53PXeiyHpsinX_6ApMlb1XRqUZn-0Kuqvp5vdNNDwi2d4ueRRhITL_rNZ0vG9H1AuDEF0JncW8r6KZnw3m8XRIyNq84"
    },
    {
      name: "Ava Garcia",
      course: "Machine Learning",
      progress: 75,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtnYbxeWCt8KBRSHWtWmtUbg56WSyYWYG2jdygTpmmIz-zsXb2yPR6sURUIPz7QIcDf7at6_zCrclzK6w3pYQckCr3KrGjScsivo0IDHR6TcB7-OkrDmypmCP1L0YK8kUUlAr2hWTgRILLbdyoh2NfW__EHIU48xnBGSSVAF4-uJqatQ2fSh9taxoWk6xkAwMBOtOUE10zANYB5CleGq64KrvWFjWtPN9UbA--qTIUe0rHdnavE85Rl6Edf43KFJDx_8jcpiOFS2Z2"
    },
    {
      name: "Noah Kim",
      course: "Introduction to Python",
      progress: 45,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAp85dXa58ls5nHbIXfSTaM_xH02YhIVdAjnnoY6IB9GooLVSJbia04iRnJmOo5OPOXwIIfJOgg5PJwoJFeUMHKs9J4rjASKd7-DgCV6FYvQRBOS7kEj6WbfDjw5yGz81Jhpwj7ydFnWlRlbQKH63qAdJ46NlXvVuBUE7DwqvqphU24_H8KwZQVcGrEWMb_h95o9pfG3lwfd5ZM_q72kLK5HNxXGulu78dZY4TDsQvsew2GaduceAfDri0tDa37dXxGBup4YDJTTTgH"
    }
  ];

  const handleMenuClick = (menuKey) => {
    setActiveMenu(menuKey);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    console.log('Logout');
  };

  const handleNotifications = () => {
    console.log('Notifications');
  };

  const handleAIAssistance = () => {
    console.log('AI Assistance');
  };

  const handleViewLessons = (course) => {
    console.log('View lessons for:', course.title);
  };

  const handleManageQuizzes = (course) => {
    console.log('Manage quizzes for:', course.title);
  };

  const handleSendAnnouncement = (course) => {
    console.log('Send announcement for:', course.title);
  };

  // Render active tab content
  const renderActiveTab = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardContent 
          stats={stats}
          courses={courses}
          studentProgress={studentProgress}
          onViewLessons={handleViewLessons}
          onManageQuizzes={handleManageQuizzes}
          onSendAnnouncement={handleSendAnnouncement}
        />;
      case 'courses':
        return <CourseManagementContent />;
      case 'quizzes':
        return <QuizManagementContent />;
      case 'labs':
        return <LabManagementContent />;
      case 'progress':
        return <StudentProgressContent />;
      case 'announcements':
        return <AnnouncementsContent />;
      case 'ai-tutor':
        return <AITutorContent />;
      default:
        return <DashboardContent 
          stats={stats}
          courses={courses}
          studentProgress={studentProgress}
          onViewLessons={handleViewLessons}
          onManageQuizzes={handleManageQuizzes}
          onSendAnnouncement={handleSendAnnouncement}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-white transition-colors duration-300">
      <div className="relative flex min-h-screen w-full">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Same styling as Student Dashboard */}
        <aside className={`flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out h-screen ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <span className="material-symbols-outlined text-blue-600 text-2xl sm:text-3xl animate-pulse">school</span>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">SmartAcademia</h1>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Navigation */}
         <div className="flex-1 py-2 lg:py-4">
  <div className="flex flex-col gap-0.5 lg:gap-1 px-2 lg:px-3">
    {menuItems.map((item) => (
      <button
        key={item.key}
        onClick={() => handleMenuClick(item.key)}
        className={`flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-3 rounded-lg transition-all duration-200 ${
          activeMenu === item.key
            ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
        } group`}
      >
        <span className={`material-symbols-outlined text-lg lg:text-base transition-transform duration-200 ${
          activeMenu === item.key ? "fill scale-110" : "group-hover:scale-110"
        }`}>
          {item.icon}
        </span>
        <p className="text-xs lg:text-sm font-medium">{item.label}</p>
        {activeMenu === item.key && (
          <div className="ml-auto w-1.5 h-1.5 lg:w-2 lg:h-2 bg-indigo-600 rounded-full animate-pulse" />
        )}
      </button>
    ))}
  </div>

  {/* AI Assistance */}
  <div className="mt-4 lg:mt-6 px-2 lg:px-3">
    <button 
      onClick={handleAIAssistance}
      className="flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 hover:text-gray-900 dark:hover:text-white transition-all duration-200 group w-full"
    >
      <span className="material-symbols-outlined text-lg lg:text-base text-purple-500 group-hover:scale-110 transition-transform duration-200">
        smart_toy
      </span>
      <p className="text-xs lg:text-sm font-medium">AI Tutor</p>
      <span className="ml-auto material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        arrow_forward
      </span>
    </button>
  </div>
</div>

          {/* User Profile */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 shrink-0">
            <div className="flex items-center gap-3 group cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-indigo-200 dark:group-hover:ring-indigo-400 transition-all duration-200"
                style={{ backgroundImage: `url("${user.avatar}")` }}
              ></div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.role}
                </p>
              </div>
              <span className="material-symbols-outlined text-gray-400 text-sm group-hover:text-indigo-500 transition-colors duration-200">
                expand_more
              </span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-0 min-w-0">
          {/* Header - Same styling as Student Dashboard */}
          <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <div className="flex items-center gap-2 lg:hidden">
                <span className="material-symbols-outlined text-indigo-600 text-xl">school</span>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">SmartAcademia</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={handleNotifications}
                className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
              >
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
              
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 sm:size-10 ring-2 ring-gray-200 dark:ring-gray-600 hover:ring-indigo-300 dark:hover:ring-indigo-400 transition-all duration-200 cursor-pointer hover:scale-105"
                style={{ backgroundImage: `url("${user.avatar}")` }}
              ></div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            {renderActiveTab()}
          </main>
        </div>
      </div>

      {/* AI Assistant Floating Button */}
      <button 
        onClick={handleAIAssistance}
        className="fixed z-30 bottom-8 right-8 h-16 w-16 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-transform duration-300 hover:scale-110"
      >
        <span className="material-symbols-outlined text-3xl">smart_toy</span>
      </button>
    </div>
  );
};

// Dashboard Content Component with Student Dashboard styling
const DashboardContent = ({ stats, courses, studentProgress, onViewLessons, onManageQuizzes, onSendAnnouncement }) => {
  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base">
            Welcome back, Dr. Vance! Here's your overview.
          </p>
        </div>
      </div>

      {/* Stats Grid - Same as Student Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group"
          >
            <div className="flex items-start gap-4">
              <div className={`flex items-center justify-center size-12 rounded-lg ${stat.color} group-hover:scale-110 transition-transform duration-200`}>
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </p>
                <p className={`text-xs font-medium ${stat.trendColor}`}>
                  {stat.trend}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Courses Section - Updated with Student Dashboard styling */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          My Courses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <CourseCard 
              key={index} 
              course={course}
              onViewLessons={onViewLessons}
              onManageQuizzes={onManageQuizzes}
              onSendAnnouncement={onSendAnnouncement}
            />
          ))}
        </div>
      </div>

      {/* Student Progress Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Recent Student Progress
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider" scope="col">
                    Student Name
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider" scope="col">
                    Course
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider" scope="col">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {studentProgress.map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150 group">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img 
                          className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-indigo-200 dark:group-hover:ring-indigo-400 transition-all duration-200"
                          src={student.avatar} 
                          alt={`Profile of ${student.name}`}
                        />
                        {student.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {student.course}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              student.progress >= 70 ? 'bg-indigo-600' : 'bg-amber-500'
                            }`} 
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
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
      </div>
    </div>
  );
};

// Course Card Component - Updated with Student Dashboard styling
const CourseCard = ({ course, onViewLessons, onManageQuizzes, onSendAnnouncement }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {course.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {course.code} • {course.students}
            </p>
          </div>
          <div className={`flex items-center justify-center size-12 rounded-lg ${course.color}`}>
            <span className="material-symbols-outlined text-xl">menu_book</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
          {course.description}
        </p>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
        <button 
          onClick={() => onViewLessons(course)}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 group"
        >
          <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform duration-200">
            play_lesson
          </span> 
          View Lessons
        </button>
        <div className="flex items-center gap-2 mt-2">
          <button 
            onClick={() => onManageQuizzes(course)}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-base">quiz</span> 
            Quizzes
          </button>
          <button 
            onClick={() => onSendAnnouncement(course)}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-base">campaign</span> 
            Announce
          </button>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other tabs with same styling
const CourseManagementContent = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Course Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your courses and curriculum
        </p>
      </div>
    </div>
    <div className="text-center py-12">
      <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
        book
      </span>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Course Management Content
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        This section is under development
      </p>
    </div>
  </div>
);

const QuizManagementContent = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Quiz Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create and manage quizzes and assessments
        </p>
      </div>
    </div>
    <div className="text-center py-12">
      <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
        quiz
      </span>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Quiz Management Content
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        This section is under development
      </p>
    </div>
  </div>
);

const LabManagementContent = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Lab Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage laboratory sessions and practical work
        </p>
      </div>
    </div>
    <div className="text-center py-12">
      <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
        science
      </span>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Lab Management Content
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        This section is under development
      </p>
    </div>
  </div>
);

const StudentProgressContent = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Student Progress
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track and analyze student performance
        </p>
      </div>
    </div>
    <div className="text-center py-12">
      <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
        bar_chart
      </span>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Student Progress Content
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        This section is under development
      </p>
    </div>
  </div>
);

const AnnouncementsContent = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Announcements
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create and send announcements to students
        </p>
      </div>
    </div>
    <div className="text-center py-12">
      <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
        campaign
      </span>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Announcements Content
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        This section is under development
      </p>
    </div>
  </div>
);

const AITutorContent = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          AI Tutor
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Get AI-powered teaching assistance
        </p>
      </div>
    </div>
    <div className="text-center py-12">
      <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
        smart_toy
      </span>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        AI Tutor Content
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        This section is under development
      </p>
    </div>
  </div>
);

export default TeacherDashboard;