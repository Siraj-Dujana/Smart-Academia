import React, { useState } from "react";
import Dashboard from "../components/dashboard/StudentDashboard/Student Tabs/Dashboard";
import Courses from "../components/dashboard/StudentDashboard/Student Tabs/Courses";
import Lessons from "../components/dashboard/StudentDashboard/Student Tabs/Lessons";
import Quizzes from "../components/dashboard/StudentDashboard/Student Tabs/Quizzes";
import Labs from "../components/dashboard/StudentDashboard/Student Tabs/Labs";
import ProgressReport from "../components/dashboard/StudentDashboard/Student Tabs/ProgressReport";
import AITutor from "../components/dashboard/StudentDashboard/Student Tabs/AITutor";
import FloatingButtons from '../components/sections/LandingPage/FloatingButtons'; // Adjust path as needed
import { useNavigate } from "react-router-dom";
const StudentDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // Menu items
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
    name: "Mubeen Channa",
    role: "Student",
    studentId: "023-22-0327",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCA7cmsTtpmxprpoNL3hk2D9zfyG7nrHk8B8jhENZ2PMysq09baQmTguIB7YD7drdghlaf1QUmQNN_i3lc7T2mjXKuHsAvSKeR9QTit5wIekTh6OEunaCETlBI_O1gVlhpX_e5KjbUZh34JOzL5mZwf3cw86gQus9cn5VCmd62FSr6N5L6cwGg-1z_H7ANOuSLIB3gALrUy__CgsRdM1eQJMICwXEYYAkV2eDWc39OymB4LGvhGyMHXpVdNc3I26cUG3tXICiG2IIKu"
  };

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

  // Render active tab content
  const renderActiveTab = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <Dashboard />;
      case 'courses':
        return <Courses />;
      case 'lessons':
        return <Lessons />;
      case 'quizzes':
        return <Quizzes />;
      case 'labs':
        return <Labs />;
      case 'progress':
        return <ProgressReport />;
      case 'ai-tutor':
        return <AITutor />;
      default:
        return <Dashboard />;
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

        {/* Sidebar */}
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
          {/* Header */}
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
     <FloatingButtons
  showScrollTop={false}
  onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
  onChatClick={() => window.location.href = '/chat'}
  chatTooltip="AI Tutor Assistant"
  scrollTooltip="Scroll to Top"
  chatIcon="smart_toy"
  scrollIcon="arrow_upward"
  chatPosition="bottom-8 right-8"
  scrollPosition="bottom-8 right-8"
  chatColor="from-indigo-600 to-indigo-700"
  scrollColor="from-indigo-600 to-indigo-700"
/>
    </div>
  );
};

export default StudentDashboard;