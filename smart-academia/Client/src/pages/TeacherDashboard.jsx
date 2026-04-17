import React, { useState, useEffect } from "react";
import Dashboard        from "../components/dashboard/TeacherDashboard/Teacher Tabs/Dashboard";
import CourseManagement from "../components/dashboard/TeacherDashboard/Teacher Tabs/CourseManagement";
import LessonManagement from "../components/dashboard/TeacherDashboard/Teacher Tabs/LessonManagement";
import LabSubmissions   from "../components/dashboard/TeacherDashboard/Teacher Tabs/LabSubmissions";
import StudentProgress  from "../components/dashboard/TeacherDashboard/Teacher Tabs/StudentProgress";
import Announcements    from "../components/dashboard/TeacherDashboard/Teacher Tabs/Announcements";
import AITutor          from "../components/dashboard/TeacherDashboard/Teacher Tabs/AITutor";
import FloatingButtons  from "../components/sections/LandingPage/FloatingButtons";
import { useNavigate, useLocation }  from "react-router-dom";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu,  setActiveMenu]  = useState("dashboard");
  const [user, setUser] = useState({ fullName: "", specialization: "", avatar: "" });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
  }, []);

  // ✅ FIXED: Read ?tab= from URL query params and switch to that tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveMenu(tab);
    }
  }, [location.search]);

  const menuItems = [
    { icon: "dashboard",    label: "Dashboard",         key: "dashboard"       },
    { icon: "book",         label: "Course Management", key: "courses"         },
    { icon: "menu_book",    label: "Lesson Management", key: "lessons"         },
    { icon: "grading",      label: "Grade Labs",        key: "lab-submissions" },
    { icon: "bar_chart",    label: "Student Progress",  key: "progress"        },
    { icon: "campaign",     label: "Announcements",     key: "announcements"   },
    { icon: "smart_toy",    label: "AI Tutor",          key: "ai-tutor"        },
  ];

  const handleMenuClick = (key) => {
    setActiveMenu(key);
    setSidebarOpen(false);
    // Update URL without full navigation so back button works
    navigate(`/teacher/dashboard?tab=${key}`, { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderActiveTab = () => {
    switch (activeMenu) {
      case "dashboard":       return <Dashboard />;
      case "courses":         return <CourseManagement />;
      case "lessons":         return <LessonManagement />;
      case "lab-submissions": return <LabSubmissions />;
      case "progress":        return <StudentProgress />;
      case "announcements":   return <Announcements />;
      case "ai-tutor":        return <AITutor />;
      default:                return <Dashboard />;
    }
  };

  const displayName = user.fullName || "Teacher";
  const userInitial = displayName.charAt(0).toUpperCase();
  const userSpecialization = user.specialization || "Educator";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-white transition-colors duration-300">
      <div className="relative flex min-h-screen w-full">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out h-screen overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}>

          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <span className="material-symbols-outlined text-blue-600 text-2xl sm:text-3xl animate-pulse">school</span>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">SmartAcademia</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Nav items */}
          <div className="flex-1 overflow-y-auto py-3 sm:py-4">
            <div className="flex flex-col gap-0.5 px-2 sm:px-3">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleMenuClick(item.key)}
                  className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg transition-all duration-200 group ${
                    activeMenu === item.key
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <span className={`material-symbols-outlined text-xl transition-transform duration-200 ${
                    activeMenu === item.key ? "scale-110" : "group-hover:scale-110"
                  }`}>{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                  {activeMenu === item.key && (
                    <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"/>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* User profile */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 shrink-0">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm flex-shrink-0">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {userSpecialization}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Header */}
          <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-30">
            {/* Left Section */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">menu</span>
              </button>
              <div className="flex items-center gap-2 lg:hidden">
                <span className="material-symbols-outlined text-indigo-600 text-xl">school</span>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">SmartAcademia</h1>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105">
                <span className="material-symbols-outlined text-xl sm:text-2xl">notifications</span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"/>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105"
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl">logout</span>
              </button>
              <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs sm:text-sm ring-2 ring-gray-200 dark:ring-gray-600">
                {userInitial}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 overflow-x-auto">
            <div className="animate-fadeIn">
              {renderActiveTab()}
            </div>
          </main>
        </div>
      </div>

      <FloatingButtons
        showScrollTop={false}
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onChatClick={() => handleMenuClick("ai-tutor")}
        chatTooltip="AI Tutor Assistant"
        chatIcon="smart_toy"
        chatPosition="bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8"
        chatColor="from-indigo-600 to-indigo-700"
      />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;