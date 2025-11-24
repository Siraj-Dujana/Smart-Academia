import React, { useEffect, useRef, useState } from "react";
import { Chart } from 'chart.js/auto';

const StudentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  // Chart refs and instances
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);

  // Menu items - Updated to match admin dashboard styling
  const menuItems = [
    { icon: "dashboard", label: "Dashboard", key: 'dashboard' },
    { icon: "import_contacts", label: "Courses", key: 'courses' },
    { icon: "play_lesson", label: "Lessons", key: 'lessons' },
    { icon: "quiz", label: "Quizzes", key: 'quizzes' },
    { icon: "science", label: "Labs", key: 'labs' },
    { icon: "bar_chart_4_bars", label: "Progress Report", key: 'progress' },
    { icon: "smart_toy", label: "AI Tutor", key: 'ai-tutor' }
  ];

  // User data
  const user = {
    name: "Olivia Chen",
    role: "Student",
    studentId: "58293",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCA7cmsTtpmxprpoNL3hk2D9zfyG7nrHk8B8jhENZ2PMysq09baQmTguIB7YD7drdghlaf1QUmQNN_i3lc7T2mjXKuHsAvSKeR9QTit5wIekTh6OEunaCETlBI_O1gVlhpX_e5KjbUZh34JOzL5mZwf3cw86gQus9cn5VCmd62FSr6N5L6cwGg-1z_H7ANOuSLIB3gALrUy__CgsRdM1eQJMICwXEYYAkV2eDWc39OymB4LGvhGyMHXpVdNc3I26cUG3tXICiG2IIKu"
  };

  // Course data
  const courses = [
    {
      title: "Introduction to Python",
      code: "CS-101",
      instructor: "Dr. Eleanor Vance",
      progress: 95,
      nextLesson: "Chapter 5: Dictionaries",
      color: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-500"
    },
    {
      title: "Data Structures & Algorithms",
      code: "CS-201",
      instructor: "Dr. Eleanor Vance",
      progress: 82,
      nextLesson: "Chapter 8: Graphs",
      color: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-500"
    },
    {
      title: "Machine Learning",
      code: "CS-305",
      instructor: "Dr. Eleanor Vance",
      progress: 75,
      nextLesson: "Chapter 4: Neural Networks",
      color: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500"
    }
  ];

  // Stats data - Updated to match admin dashboard styling
  const stats = [
    {
      icon: "import_contacts",
      title: "Courses Enrolled",
      value: "4",
      color: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-500",
      trend: "+1 this semester",
      trendColor: "text-green-500"
    },
    {
      icon: "task_alt",
      title: "Completed Lessons",
      value: "42",
      color: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-500",
      trend: "+5 this week",
      trendColor: "text-green-500"
    },
    {
      icon: "pending_actions",
      title: "Pending Quizzes",
      value: "3",
      color: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500",
      trend: "2 due today",
      trendColor: "text-red-500"
    },
    {
      icon: "trending_up",
      title: "Overall Progress",
      value: "85%",
      color: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-500",
      trend: "+2% this week",
      trendColor: "text-green-500"
    },
    {
      icon: "quiz",
      title: "Active Quizzes",
      value: "22",
      color: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-500",
      trend: "Up from 18 last week",
      trendColor: "text-green-500"
    }
  ];

  // Initialize charts - Same as admin dashboard
  useEffect(() => {
    // Bar Chart
    if (barChartRef.current) {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }

      const barCtx = barChartRef.current.getContext('2d');
      barChartInstance.current = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: ['Python', 'DSA', 'ML', 'Web Dev', 'DBMS', 'Networking'],
          datasets: [{
            label: 'Progress %',
            data: [95, 82, 75, 68, 90, 60],
            backgroundColor: '#4f46e5',
            borderColor: '#4f46e5',
            borderWidth: 1,
            borderRadius: 8,
            hoverBackgroundColor: '#6366f1',
            hoverBorderColor: '#6366f1',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
              },
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: '#4f46e5',
              borderWidth: 1,
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  return `Progress: ${context.parsed.y}%`;
                }
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'index',
          },
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          }
        }
      });
    }

    // Pie Chart
    if (pieChartRef.current) {
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }

      const pieCtx = pieChartRef.current.getContext('2d');
      pieChartInstance.current = new Chart(pieCtx, {
        type: 'pie',
        data: {
          labels: ['Completed', 'In Progress', 'Not Started'],
          datasets: [{
            label: 'Course Status',
            data: [65, 25, 10],
            backgroundColor: [
              '#10b981',
              '#f59e0b',
              '#ef4444'
            ],
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 8,
            hoverBorderWidth: 3,
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
                padding: 20,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: '#4f46e5',
              borderWidth: 1,
              cornerRadius: 8,
            }
          },
          animation: {
            duration: 1000,
            easing: 'easeOutQuart',
            animateScale: true,
            animateRotate: true
          },
          cutout: '0%',
        }
      });
    }

    return () => {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }
    };
  }, []);

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

  const handleGenerateReport = () => {
    console.log('Generate AI report');
  };

  // Render active tab content
  const renderActiveTab = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardContent 
          courses={courses} 
          stats={stats}
          barChartRef={barChartRef}
          pieChartRef={pieChartRef}
          onGenerateReport={handleGenerateReport}
        />;
      case 'courses':
        return <CoursesContent />;
      case 'lessons':
        return <LessonsContent />;
      case 'quizzes':
        return <QuizzesContent />;
      case 'labs':
        return <LabsContent />;
      case 'progress':
        return <ProgressContent />;
      case 'ai-tutor':
        return <AITutorContent />;
      default:
        return <DashboardContent 
          courses={courses} 
          stats={stats}
          barChartRef={barChartRef}
          pieChartRef={pieChartRef}
          onGenerateReport={handleGenerateReport}
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

        {/* Sidebar - Same styling as admin dashboard */}
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
                  {user.role} • ID: {user.studentId}
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
          {/* Header - Same styling as admin dashboard */}
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

// Dashboard Content Component with admin dashboard styling
const DashboardContent = ({ courses, stats, barChartRef, pieChartRef, onGenerateReport }) => {
  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            Student Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base">
            Welcome back, Olivia! Here's your learning overview.
          </p>
        </div>
      </div>

      {/* Stats Grid - Same as admin dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
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


      {/* Courses Section - Updated with admin dashboard styling */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          My Courses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <CourseCard key={index} course={course} />
          ))}
        </div>
      </div>

   
    </div>
  );
};

// Course Card Component - Updated with admin dashboard styling
const CourseCard = ({ course }) => {
  const circumference = 2 * Math.PI * 16;
  const strokeDashoffset = circumference - (course.progress / 100) * circumference;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {course.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {course.code} • {course.instructor}
            </p>
          </div>
          <div className={`flex items-center justify-center size-12 rounded-lg ${course.color}`}>
            <span className="material-symbols-outlined text-xl">menu_book</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative size-16">
              <svg className="size-full" height="36" viewBox="0 0 36 36" width="36" xmlns="http://www.w3.org/2000/svg">
                <circle 
                  className="stroke-current text-gray-200 dark:text-gray-700" 
                  cx="18" cy="18" fill="none" r="16" strokeWidth="3"
                ></circle>
                <circle 
                  className="stroke-current text-indigo-600" 
                  cx="18" cy="18" fill="none" r="16" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeWidth="3" 
                  transform="rotate(-90 18 18)"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-indigo-600">
                {course.progress}%
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Progress</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{course.progress}% Complete</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Next Lesson:</span>
            <span className="text-gray-900 dark:text-white font-medium">{course.nextLesson}</span>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
        <button className="w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 group">
          Continue Learning 
          <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform duration-200">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
};

// Placeholder components for other tabs with admin dashboard styling
const CoursesContent = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          My Courses
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your course enrollments and progress
        </p>
      </div>
    </div>
    <div className="text-center py-12">
      <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
        import_contacts
      </span>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Courses Content
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        This section is under development
      </p>
    </div>
  </div>
);

const LessonsContent = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Lessons
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Access and manage your learning materials
        </p>
      </div>
    </div>
    <div className="text-center py-12">
      <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
        play_lesson
      </span>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Lessons Content
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        This section is under development
      </p>
    </div>
  </div>
);

const QuizzesContent = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Quizzes
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Take quizzes and track your performance
        </p>
      </div>
    </div>
    <div className="text-center py-12">
      <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
        quiz
      </span>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Quizzes Content
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        This section is under development
      </p>
    </div>
  </div>
);

const LabsContent = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Labs
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Access laboratory sessions and practical work
        </p>
      </div>
    </div>
    <div className="text-center py-12">
      <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
        science
      </span>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Labs Content
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        This section is under development
      </p>
    </div>
  </div>
);

const ProgressContent = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Progress Report
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your academic progress and performance
        </p>
      </div>
    </div>
    <div className="text-center py-12">
      <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
        bar_chart_4_bars
      </span>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Progress Report Content
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
          Get personalized learning assistance
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

export default StudentDashboard;