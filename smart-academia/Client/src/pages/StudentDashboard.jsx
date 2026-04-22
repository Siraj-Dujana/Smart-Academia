import React, { useState, useEffect } from "react";
import Dashboard from "../components/dashboard/StudentDashboard/Student Tabs/Dashboard";
import Courses from "../components/dashboard/StudentDashboard/Student Tabs/Courses";
import Quizzes from "../components/dashboard/StudentDashboard/Student Tabs/Quizzes";
import Labs from "../components/dashboard/StudentDashboard/Student Tabs/Labs";
import ProgressReport from "../components/dashboard/StudentDashboard/Student Tabs/ProgressReport";
import AITutor from "../components/dashboard/StudentDashboard/Student Tabs/AITutor";
import AIAssistant from "../components/dashboard/StudentDashboard/Student Tabs/AIAssistant";
import FloatingButtons from '../components/sections/LandingPage/FloatingButtons';
import ProfileManagement from '../components/dashboard/StudentDashboard/Student Tabs/Profilemanagement';
import { useNavigate, useLocation } from "react-router-dom";
import Notifications from "../components/dashboard/StudentDashboard/Student Tabs/Notifications";
import NotificationBell from "../components/notifications/NotificationBell";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [user, setUser] = useState({ name: "", role: "", avatar: "", fullName: "", studentId: "" });

  // Create a reusable function to load user
  const loadUserFromStorage = () => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
  };

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  // Listen for profile updates
  useEffect(() => {
    window.addEventListener("profileUpdated", loadUserFromStorage);
    return () => window.removeEventListener("profileUpdated", loadUserFromStorage);
  }, []);

  // Read ?tab= from URL query params and switch to that tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveMenu(tab);
    }
  }, [location.search]);

  // Menu items
  const menuItems = [
    { icon: "dashboard", label: "Dashboard", key: 'dashboard' },
    { icon: "import_contacts", label: "Courses", key: 'courses' },
    { icon: "quiz", label: "Quizzes", key: 'quizzes' },
    { icon: "science", label: "Labs", key: 'labs' },
    { icon: "bar_chart_4_bars", label: "Progress", key: 'progress' },
    { icon: "smart_toy", label: "AI Tutor", key: 'ai-tutor' },
    { icon: "assistant", label: "AI Assistant", key: 'ai-assistant' },
    { icon: 'person', label: 'My Profile', key: 'profile' },
    { icon: "notifications", label: "Notifications", key: "notifications" },
  ];

  const handleMenuClick = (menuKey) => {
    setActiveMenu(menuKey);
    setSidebarOpen(false);
    navigate(`/student/dashboard?tab=${menuKey}`, { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleNotifications = () => {
    console.log('Notifications');
  };

  // Render active tab content
  const renderActiveTab = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <Dashboard />;
      case 'courses':
        return <Courses />;
      case 'quizzes':
        return <Quizzes />;
      case 'labs':
        return <Labs />;
      case 'progress':
        return <ProgressReport />;
      case 'ai-tutor':
        return <AITutor />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'profile':
        return <ProfileManagement />;
      case "notifications": return <Notifications />;
      default:
        return <Dashboard />;
    }
  };

  // Use dynamic values
  const displayName = user.fullName || user.name || "Student";
  const userRole = user.role || "Student";
  // const studentId = user.studentId || "N/A";
  // const studentId = user.studentId || user.employeeId || user.id?.slice(-6) || "N/A";
  const studentId = user.studentId || user.employeeId || "N/A";
  const userAvatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;

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
        <aside className={`flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed  inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out h-screen overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <span className="material-symbols-outlined text-blue-600 text-2xl sm:text-3xl animate-pulse">school</span>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">SmartAcademia</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 py-3 sm:py-4 overflow-y-auto">
            <div className="flex flex-col gap-0.5 px-2 sm:px-3">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleMenuClick(item.key)}
                  className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg transition-all duration-200 ${
                    activeMenu === item.key
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  } group`}
                >
                  <span className={`material-symbols-outlined text-xl transition-transform duration-200 ${
                    activeMenu === item.key ? "scale-110" : "group-hover:scale-110"
                  }`}>
                    {item.icon}
                  </span>
                  <p className="text-sm font-medium">{item.label}</p>
                  {activeMenu === item.key && (
                    <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* User Profile */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 shrink-0">
            <div 
              className="flex items-center gap-3 group cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              onClick={() => handleMenuClick('profile')}
            >
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-indigo-200 dark:group-hover:ring-indigo-400 transition-all duration-200"
                style={{ backgroundImage: `url("${userAvatar}")` }}
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {displayName}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {userRole} • ID: {studentId}
                </p>
              </div>
              <span className="material-symbols-outlined text-gray-400 text-base group-hover:text-indigo-500 transition-colors duration-200">
                expand_more
              </span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-30">
            {/* Left Section */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <span className="material-symbols-outlined text-xl">menu</span>
              </button>
              <div className="flex items-center gap-2 lg:hidden">
                <span className="material-symbols-outlined text-indigo-600 text-xl">school</span>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">SmartAcademia</h1>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Notifications */}
              <NotificationBell />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl">logout</span>
              </button>

              {/* Avatar */}
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-8 h-8 sm:w-10 sm:h-10 ring-2 ring-gray-200 dark:ring-gray-600 hover:ring-indigo-300 dark:hover:ring-indigo-400 transition-all duration-200 cursor-pointer hover:scale-105"
                style={{ backgroundImage: `url("${userAvatar}")` }}
                onClick={() => handleMenuClick('profile')}
              />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 overflow-x-auto">
            <div className="animate-fadeIn">
              {renderActiveTab()}
            </div>
          </main>
        </div>
      </div>

      {/* AI Assistant Floating Button */}
      <FloatingButtons
        showScrollTop={false}
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onChatClick={() => handleMenuClick('ai-tutor')}
        chatTooltip="AI Tutor Assistant"
        scrollTooltip="Scroll to Top"
        chatIcon="smart_toy"
        scrollIcon="arrow_upward"
        chatPosition="bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8"
        scrollPosition="bottom-20 right-4 sm:bottom-24 sm:right-6 md:bottom-28 md:right-8"
        chatColor="from-indigo-600 to-indigo-700"
        scrollColor="from-indigo-600 to-indigo-700"
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default StudentDashboard;