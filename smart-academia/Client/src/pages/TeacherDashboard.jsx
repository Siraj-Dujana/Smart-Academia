import React, { useState, useEffect } from "react";
import Dashboard        from "../components/dashboard/TeacherDashboard/Teacher Tabs/Dashboard";
import CourseManagement from "../components/dashboard/TeacherDashboard/Teacher Tabs/CourseManagement";
import LessonManagement from "../components/dashboard/TeacherDashboard/Teacher Tabs/LessonManagement";
import LabSubmissions   from "../components/dashboard/TeacherDashboard/Teacher Tabs/LabSubmissions";
import TeacherAnalytics  from "../components/dashboard/TeacherDashboard/Teacher Tabs/TeacherAnalytics";
import AITutor          from "../components/dashboard/TeacherDashboard/Teacher Tabs/AITutor";
import FloatingButtons  from "../components/sections/LandingPage/FloatingButtons";
import ProfileManagement from '../components/dashboard/TeacherDashboard/Teacher Tabs/Profilemanagement';
import SendNotifications from "../components/dashboard/TeacherDashboard/Teacher Tabs/SendNotifications";
import NotificationBell from "../components/notifications/NotificationBell";
import { useNavigate, useLocation }  from "react-router-dom";
import TeacherAIAnalytics from "../components/dashboard/TeacherDashboard/Teacher Tabs/TeacherAIAnalytics";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu,  setActiveMenu]  = useState("dashboard");
  const [user, setUser] = useState({ fullName: "", specialization: "", avatar: "", employeeId: "" });

  const loadUserFromStorage = () => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
  };

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  useEffect(() => {
    window.addEventListener("profileUpdated", loadUserFromStorage);
    return () => window.removeEventListener("profileUpdated", loadUserFromStorage);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveMenu(tab);
    }
  }, [location.search]);

  const menuItems = [
  { icon: "dashboard",    label: "Dashboard",         key: "dashboard",        color: "#6366f1" },
  { icon: "book",         label: "Course Management", key: "courses",          color: "#22c55e" },
  { icon: "menu_book",    label: "Lesson Management", key: "lessons",          color: "#f59e0b" },
  { icon: "grading",      label: "Grade Labs",        key: "lab-submissions",  color: "#a855f7" },
  { icon: "bar_chart",    label: "Student Progress",  key: "progress",         color: "#3b82f6" },
  { icon: "auto_awesome", label: "AI Insights",       key: "ai-analytics",     color: "#a855f7" },  // ← ADD THIS
  { icon: "smart_toy",    label: "AI Tutor",          key: "ai-tutor",         color: "#14b8a6" },
  { icon: "send",         label: "Send Notifications",key: "send-notifications",color: "#f59e0b" },
  { icon: "person",       label: "My Profile",        key: "profile",          color: "#6366f1" }
];

  const handleMenuClick = (key) => {
    setActiveMenu(key);
    setSidebarOpen(false);
    navigate(`/teacher/dashboard?tab=${key}`, { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderActiveTab = () => {
    switch (activeMenu) {
      case "dashboard":         return <Dashboard />;
      case "courses":           return <CourseManagement />;
      case "lessons":           return <LessonManagement />;
      case "lab-submissions":   return <LabSubmissions />;
      case "progress":          return <TeacherAnalytics />;
      case "ai-tutor":          return <AITutor />;
      case "send-notifications": return <SendNotifications />;
      case "profile":           return <ProfileManagement />;
      case "ai-analytics":      return <TeacherAIAnalytics />;
      default:                  return <Dashboard />;
    }
  };

  const displayName = user.fullName || "Teacher";
  const userInitial = displayName.charAt(0).toUpperCase();
  const userSpecialization = user.specialization || "Educator";
  const teacherId = user.employeeId || "";
  const userAvatar = user.avatar || null;

  const colors = {
    bg: "#0a0b10",
    sidebar: "#0c0e1e",
    card: "#0f1629",
    border: "#1e293b",
    accent: "#6366f1",
    accent2: "#a855f7",
    text: "#e2e8f0",
    muted: "#64748b",
  };

  // Sidebar button component
  const SidebarButton = ({ item }) => {
    const isActive = activeMenu === item.key;
    return (
      <button
        onClick={() => handleMenuClick(item.key)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden w-full"
        style={isActive
          ? { background: `${colors.accent}18`, color: "#c7d2fe", border: `1px solid ${colors.accent}33`, boxShadow: `0 0 20px ${colors.accent}15` }
          : { color: colors.muted }
        }
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${colors.accent}10 0%, transparent 70%)` }}
        />
        <span className="material-symbols-outlined text-xl transition-transform duration-200 group-hover:scale-110 relative z-10">
          {item.icon}
        </span>
        <p className="text-sm font-medium relative z-10">{item.label}</p>
        {isActive && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse relative z-10" style={{ background: colors.accent }} />
        )}
      </button>
    );
  };

  // Header icon button component
  const HeaderIconButton = ({ onClick, icon, className = "" }) => (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-lg transition-all duration-200 hover:scale-105 group ${className}`}
      style={{ color: colors.muted }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
        style={{ background: `radial-gradient(ellipse at 50% 50%, ${colors.accent}15 0%, transparent 70%)` }}
      />
      <span className="material-symbols-outlined text-xl relative z-10">{icon}</span>
    </button>
  );

  return (
    <div style={{ background: colors.bg, minHeight: "100vh", fontFamily: "'Lexend', sans-serif", color: colors.text }}>
      <div className="relative flex min-h-screen w-full">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`flex flex-col w-72 fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out h-screen overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`} style={{ background: colors.sidebar, borderRight: `1px solid ${colors.border}` }}>

          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-5 border-b shrink-0" style={{ borderColor: colors.border }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${colors.accent}22`, border: `1px solid ${colors.accent}44` }}>
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l9-5-9 5-9-5m9 5v5m0-5v5m0 0l-9-5m9 5l9-5" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">Smart<span style={{ color: colors.accent }}>Academia</span></h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto text-gray-500 hover:text-white"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 py-4 overflow-y-auto">
            <div className="flex flex-col gap-0.5 px-3">
              {menuItems.map((item) => (
                <SidebarButton key={item.key} item={item} />
              ))}
            </div>
          </div>

          {/* User Profile - Sidebar Footer */}
          <div className="p-4 shrink-0" style={{ borderTop: `1px solid ${colors.border}` }}>
            <div
              className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/5 relative overflow-hidden group"
              onClick={() => handleMenuClick('profile')}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${colors.accent}10 0%, transparent 70%)` }}
              />
              {userAvatar ? (
                <div
                  className="w-10 h-10 rounded-full bg-center bg-no-repeat bg-cover flex-shrink-0 relative z-10"
                  style={{ backgroundImage: `url("${userAvatar}")` }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 relative z-10"
                  style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})` }}>
                  {userInitial}
                </div>
              )}
              <div className="flex-1 min-w-0 relative z-10">
                <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{userSpecialization}{teacherId ? ` • ID: ${teacherId}` : ""}</p>
              </div>
              <span className="material-symbols-outlined text-gray-500 text-sm relative z-10">expand_more</span>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col lg:ml-72 min-w-0">

          {/* Header */}
          <header className="flex items-center justify-between px-5 py-3 sticky top-0 z-30 backdrop-blur-md" style={{ background: `${colors.bg}ee`, borderBottom: `1px solid ${colors.border}` }}>
            <div className="flex items-center gap-3">
              <HeaderIconButton onClick={() => setSidebarOpen(true)} icon="menu" className="lg:hidden" />
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />
              <HeaderIconButton onClick={handleLogout} icon="logout" />
              <div
                className="cursor-pointer transition-transform hover:scale-105 relative z-10"
                onClick={() => handleMenuClick('profile')}
              >
                {userAvatar ? (
                  <div
                    className="w-9 h-9 rounded-full bg-center bg-no-repeat bg-cover ring-2 ring-offset-2 ring-offset-transparent"
                    style={{ backgroundImage: `url("${userAvatar}")`, ringColor: colors.accent }}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})` }}>
                    {userInitial}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-5 lg:p-8 overflow-x-auto">
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;