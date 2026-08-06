import React, { useState, useEffect } from "react";
import Dashboard from "../components/dashboard/StudentDashboard/Student Tabs/Dashboard";
import Courses from "../components/dashboard/StudentDashboard/Student Tabs/Courses";
import Quizzes from "../components/dashboard/StudentDashboard/Student Tabs/Quizzes";
import Labs from "../components/dashboard/StudentDashboard/Student Tabs/Labs";
import StudentAnalytics from "../components/dashboard/StudentDashboard/Student Tabs/StudentAnalytics";
import AITutor from "../components/dashboard/StudentDashboard/Student Tabs/AITutor";
import AIAssistant from "../components/dashboard/StudentDashboard/Student Tabs/AIAssistant";
import FloatingButtons from '../components/sections/LandingPage/FloatingButtons';
import ProfileManagement from '../components/dashboard/StudentDashboard/Student Tabs/Profilemanagement';
import { useNavigate, useLocation } from "react-router-dom";
import Notifications from "../components/dashboard/StudentDashboard/Student Tabs/Notifications";
import NotificationBell from "../components/notifications/NotificationBell";
import StudentAIAnalytics from "../components/dashboard/StudentDashboard/Student Tabs/StudentAIAnalytics";
import Leaderboard from "../components/dashboard/StudentDashboard/Student Tabs/Leaderboard";
import Certificates from "../components/dashboard/StudentDashboard/Student Tabs/Certificates";
import StudentViewNotes from "../components/dashboard/StudentDashboard/Student Tabs/StudentViewNotes"

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [user, setUser] = useState({ name: "", role: "", avatar: "", fullName: "", studentId: "" });

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
    if (tab) setActiveMenu(tab);
  }, [location.search]);

  const menuItems = [
    { icon: "dashboard", label: "Dashboard", key: 'dashboard' },
    { icon: "import_contacts", label: "Courses", key: 'courses' },
    { icon: "quiz", label: "Quizzes", key: 'quizzes' },
    { icon: "science", label: "Labs", key: 'labs' },
    { icon: "note_stack", label: "Notes", key: 'notes' },
    { icon: "bar_chart_4_bars", label: "Progress", key: 'progress' },
    { icon: "auto_awesome", label: "AI Insights", key: 'ai-analytics' },
    { icon: "leaderboard", label: "Leaderboard", key: 'leaderboard' },
    { icon: "workspace_premium", label: "Certificates", key: 'certificates' },
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

  const renderActiveTab = () => {
    switch (activeMenu) {
      case 'dashboard': return <Dashboard />;
      case 'courses': return <Courses />;
      case 'quizzes': return <Quizzes />;
      case 'labs': return <Labs />;
      case 'notes': return <StudentViewNotes />;
      case 'progress': return <StudentAnalytics />;
      case "ai-analytics": return <StudentAIAnalytics/>;
      case 'leaderboard': return <Leaderboard />;
      case "certificates": return <Certificates />;
      case 'ai-tutor': return <AITutor />;
      case 'ai-assistant': return <AIAssistant />;
      case 'profile': return <ProfileManagement />;
      case "notifications": return <Notifications />;
      default: return <Dashboard />;
    }
  };

  const displayName = user.fullName || user.name || "Student";
  const userRole = user.role || "Student";
  const studentId = user.studentId || user.employeeId || "N/A";
  const userAvatar = user.avatar || null;
  const userInitial = displayName.charAt(0).toUpperCase();

  // Monochrome palette - matches AdminDashboard / landing page / Login / Register theme
  const colors = {
    bg: "#0a0b10",
    sidebar: "#0c0e1e",
    card: "#0f1629",
    border: "#1e293b",
    text: "#e2e8f0",
    muted: "#64748b",
    hover: "#1e293b",
  };

  // SidebarButton component - shows icon ONLY when active
  const SidebarButton = ({ item }) => {
    const isActive = activeMenu === item.key;
    return (
      <button
        onClick={() => handleMenuClick(item.key)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative overflow-hidden w-full"
        style={isActive
          ? { background: "rgba(255,255,255,0.08)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.15)" }
          : { color: colors.muted }
        }
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 70%)" }}
        />
        {/* Icon - only show when active */}
        {isActive && (
          <span className="material-symbols-outlined text-xl transition-transform duration-300 group-hover:scale-110 relative z-10">
            dashboard
          </span>
        )}
        <p className="text-sm font-medium relative z-10">{item.label}</p>
        {isActive && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse relative z-10 bg-white" />
        )}
      </button>
    );
  };

  // Glowing icon button for header
  const HeaderIconButton = ({ onClick, icon, className = "" }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-all duration-300 relative overflow-hidden ${className}`}
      style={{ color: colors.muted }}
    >
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 70%)" }}
      />
      <span className="material-symbols-outlined text-xl relative z-10">{icon}</span>
    </button>
  );

  // User avatar - white circle / black initial, matches the site's logo mark
  const UserAvatar = ({ size = "w-10 h-10", textSize = "text-sm" }) => {
    if (userAvatar) {
      return (
        <div
          className={`${size} rounded-full bg-center bg-no-repeat bg-cover flex-shrink-0 transition-transform duration-300`}
          style={{ backgroundImage: `url("${userAvatar}")` }}
        />
      );
    }
    return (
      <div className={`${size} rounded-full flex items-center justify-center ${textSize} font-bold text-black bg-white flex-shrink-0 transition-transform duration-300`}>
        {userInitial}
      </div>
    );
  };

  return (
    <div style={{ background: colors.bg, minHeight: "100vh", fontFamily: "'Lexend', sans-serif", color: colors.text }}>
      <div className="relative flex min-h-screen w-full">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`flex flex-col w-64 fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out h-screen overflow-y-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          style={{ background: colors.sidebar, borderRight: `1px solid ${colors.border}` }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-5 shrink-0" style={{ borderBottom: `1px solid ${colors.border}` }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v7m0-7l9-5m-9 5l-9-5" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">Smart Academia</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto text-gray-500 hover:text-white transition-colors duration-300"
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

          {/* User Profile */}
          <div className="p-4 shrink-0" style={{ borderTop: `1px solid ${colors.border}` }}>
            <div
              className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-300 hover:bg-white/5 relative overflow-hidden group"
              onClick={() => handleMenuClick('profile')}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 70%)" }}
              />
              <div className="relative z-10">
                <UserAvatar />
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{userRole} · ID: {studentId}</p>
              </div>
              <span className="material-symbols-outlined text-gray-500 text-sm relative z-10">expand_more</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
          {/* Header */}
          <header
            className="flex items-center justify-between px-5 py-3 sticky top-0 z-30 backdrop-blur-md"
            style={{ background: `${colors.bg}ee`, borderBottom: `1px solid ${colors.border}` }}
          >
            <div className="flex items-center gap-3">
              <HeaderIconButton onClick={() => setSidebarOpen(true)} icon="menu" className="lg:hidden" />
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />
              <HeaderIconButton onClick={handleLogout} icon="logout" />
              <div
                className="cursor-pointer transition-transform duration-300 hover:scale-105 relative z-10"
                onClick={() => handleMenuClick('profile')}
              >
                <UserAvatar size="w-9 h-9" />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-5 lg:p-8 overflow-x-auto">
            <div className="animate-fadeIn">
              {renderActiveTab()}
            </div>
          </main>
        </div>
      </div>

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
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
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

export default StudentDashboard;