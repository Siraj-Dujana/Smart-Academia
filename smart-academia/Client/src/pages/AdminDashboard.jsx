import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ManageTeachers from "../components/dashboard/AdminDashboard/Admin tabs/ManageTeachers";
import ManageStudents from "../components/dashboard/AdminDashboard/Admin tabs/ManageStudents";
import ManageCourses from "../components/dashboard/AdminDashboard/Admin tabs/ManageCourses";
import ProfileManagement from '../components/dashboard/AdminDashboard/Admin tabs/Profilemanagement';
import Notifications from "../components/dashboard/AdminDashboard/Admin tabs/Notifications";
import NotificationBell from "../components/dashboard/AdminDashboard/Admin tabs/AdminNotificationBell";
import FloatingButtons from '../components/sections/LandingPage/FloatingButtons';
import Dashboard from "../components/dashboard/AdminDashboard/Admin tabs/Dashboard";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * AdminChatbot — inline AI Assistant panel for the admin dashboard.
 * Same interaction model as the landing page's GeminiChatbot, restyled to
 * sit on top of the dashboard's darker background and to open upward from
 * the FloatingButtons AI button instead of a fixed bottom-right corner tied
 * to the marketing page's hero.
 */
const AdminChatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { type: 'bot', text: "Hi, I'm your admin assistant. Ask me about teachers, students, courses, or anything else on this dashboard." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/api/ai/admin-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: input,
          history: messages
            .filter((m, i) => i !== 0)
            .map(m => ({
              role: m.type === 'user' ? 'user' : 'assistant',
              content: m.text
            }))
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      setMessages(prev => [...prev, {
        type: 'bot',
        text: data.reply || data.message || "I'm not sure how to respond. Can you rephrase?"
      }]);
    } catch (error) {
      console.error('Admin chatbot error:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: error.message?.includes('fetch')
          ? "Having trouble connecting. Please try again."
          : "Something went wrong. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickReplies = [
    { text: 'How many pending teacher approvals?', id: 'teachers' },
    { text: 'Summarize student activity', id: 'students' },
    { text: 'Show course stats', id: 'courses' },
  ];

  const markdownComponents = {
    h1: ({ children }) => <h1 className="text-sm font-bold text-white mb-0.5">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xs font-bold text-gray-200 mb-0.5">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xs font-semibold text-gray-300 mb-0.5">{children}</h3>,
    p: ({ children }) => <p className="text-xs text-gray-200 leading-relaxed mb-0.5">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-3 space-y-0.5 text-xs text-gray-200">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-3 space-y-0.5 text-xs text-gray-200">{children}</ol>,
    li: ({ children }) => <li className="text-xs text-gray-200 leading-relaxed">{children}</li>,
    code: ({ children, inline }) =>
      inline ? (
        <code className="px-1 py-0.5 rounded bg-black/40 text-xs text-gray-100 font-mono">{children}</code>
      ) : (
        <pre className="bg-black/40 rounded p-2 my-1 overflow-x-auto border border-white/10">
          <code className="text-xs text-gray-100 font-mono">{children}</code>
        </pre>
      ),
    strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
    em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-white underline text-xs">
        {children}
      </a>
    ),
    table: ({ children }) => <table className="min-w-full border-collapse my-1 text-xs">{children}</table>,
    thead: ({ children }) => <thead className="bg-white/5">{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr className="border-b border-white/10">{children}</tr>,
    th: ({ children }) => <th className="px-2 py-1 text-left text-white font-semibold">{children}</th>,
    td: ({ children }) => <td className="px-2 py-1 text-gray-300">{children}</td>,
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6 md:right-8 z-50 w-[calc(100vw-2rem)] max-w-sm h-[460px] rounded-2xl shadow-2xl overflow-hidden animate-adminSlideIn flex flex-col"
      style={{ background: "#0c0e1e", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "#0c0e1e" }}>
            <span className="material-symbols-outlined text-white text-base">smart_toy</span>
          </div>
          <div>
            <span className="text-sm font-bold text-black">Admin Assistant</span>
            <span className="ml-2 text-[10px] text-black/50">Beta</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-black/50 hover:text-black transition-colors p-1 rounded-full hover:bg-black/5"
          aria-label="Close assistant"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-2 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.type === 'bot' && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0 bg-white">
                <span className="material-symbols-outlined text-black text-sm">smart_toy</span>
              </div>
            )}
            <div
              className={`px-3 py-2 rounded-xl max-w-[80%] ${msg.type === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'}`}
              style={{
                background: msg.type === 'user' ? "#ffffff" : "#1e293b",
                border: msg.type === 'bot' ? "1px solid rgba(255,255,255,0.06)" : "none"
              }}
            >
              {msg.type === 'user' ? (
                <p className="text-xs text-black whitespace-pre-wrap break-words">{msg.text}</p>
              ) : (
                <div className="text-xs text-gray-200 prose prose-invert prose-xs max-w-none break-words">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {msg.text}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0 bg-white">
              <span className="material-symbols-outlined text-black text-sm">smart_toy</span>
            </div>
            <div className="px-4 py-2 rounded-xl rounded-tl-none" style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {messages.length < 2 && (
        <div className="px-3 py-2 flex gap-2 flex-wrap flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {quickReplies.map((reply) => (
            <button
              key={reply.id}
              onClick={() => {
                setInput(reply.text);
                setTimeout(sendMessage, 100);
              }}
              className="px-3 py-1 rounded-full text-[10px] font-medium transition-all hover:scale-105"
              style={{ background: "#1e293b", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {reply.text}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask about teachers, students, courses…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 rounded-xl text-xs text-white placeholder-gray-500 outline-none transition-all focus:ring-1 focus:ring-white/30"
            style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.06)" }}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            className={`p-2 rounded-xl transition-all hover:scale-105 bg-white ${
              !input.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes adminSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-adminSlideIn { animation: adminSlideIn 0.25s ease-out; }
      `}</style>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('teachers');
  const [user, setUser] = useState({ fullName: "", role: "", avatar: "", employeeId: "" });
  const [showChatbot, setShowChatbot] = useState(false);

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
    { icon: "dashboard", label: "Dahboard", key: "dashboard" },
    { icon: "supervisor_account", label: "Manage Teachers", key: 'teachers' },
    { icon: "groups", label: "Manage Students", key: 'students' },
    { icon: "menu_book", label: "Manage Courses", key: 'courses' },
    { icon: "person", label: "My Profile", key: 'profile' },
    { icon: "notifications", label: "Notifications", key: "notifications" },
  ];

  const handleMenuClick = (menuKey) => {
    setActiveMenu(menuKey);
    setSidebarOpen(false);
    navigate(`/admin/dashboard?tab=${menuKey}`, { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderActiveTab = () => {
    switch (activeMenu) {
      
      case 'dashboard': return <Dashboard/>;
      case 'teachers': return <ManageTeachers />;
      case 'students': return <ManageStudents />;
      case 'courses': return <ManageCourses />;
      case 'profile': return <ProfileManagement />;
      case 'notifications': return <Notifications />;
      default: return <ManageTeachers />;
    }
  };

  const displayName = user.fullName || user.name || "Admin User";
  const userRole = user.role || "Administrator";
  const employeeId = user.employeeId || "N/A";
  const userAvatar = user.avatar || null;
  const userInitial = displayName.charAt(0).toUpperCase();

  // Monochrome palette - matches landing page / Login / Register theme
  const colors = {
    bg: "#0a0b10",
    sidebar: "#0c0e1e",
    card: "#0f1629",
    border: "#1e293b",
    green: "#22c55e",
    text: "#e2e8f0",
    muted: "#64748b",
    hover: "#1e293b",
  };

  // Glowing button component for sidebar - white/monochrome active state
  const SidebarButton = ({ item }) => {
    const isActive = activeMenu === item.key;
    return (
      <button
        onClick={() => handleMenuClick(item.key)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden w-full"
        style={isActive
          ? { background: "rgba(255,255,255,0.08)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.15)" }
          : { color: colors.muted }
        }
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 70%)" }}
        />
        <span className="material-symbols-outlined text-xl transition-transform duration-200 group-hover:scale-110 relative z-10">
          {item.icon}
        </span>
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
      className={`p-2 rounded-lg transition-all duration-200 relative overflow-hidden ${className}`}
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
          className={`${size} rounded-full bg-center bg-no-repeat bg-cover flex-shrink-0`}
          style={{ backgroundImage: `url("${userAvatar}")` }}
        />
      );
    }
    return (
      <div className={`${size} rounded-full flex items-center justify-center ${textSize} font-bold text-black bg-white flex-shrink-0`}>
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

          {/* User Profile */}
          <div className="p-4 shrink-0" style={{ borderTop: `1px solid ${colors.border}` }}>
            <div
              className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/5 relative overflow-hidden group"
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
                <p className="text-xs text-gray-500 truncate">{userRole} · ID: {employeeId}</p>
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
                className="cursor-pointer transition-transform hover:scale-105 relative z-10"
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

      {/* Floating Buttons - now actually opens the inline AI Assistant panel */}
      <FloatingButtons
        showScrollTop={false}
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onChatClick={() => setShowChatbot(prev => !prev)}
        chatTooltip="AI Assistant"
        scrollTooltip="Scroll to Top"
        chatIcon="smart_toy"
        scrollIcon="arrow_upward"
        chatPosition="bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8"
        scrollPosition="bottom-20 right-4 sm:bottom-24 sm:right-6 md:bottom-28 md:right-8"
      />

      <AdminChatbot isOpen={showChatbot} onClose={() => setShowChatbot(false)} />

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

export default AdminDashboard;