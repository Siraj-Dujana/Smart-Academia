import React, { useState, useRef, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AITutor = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [context, setContext] = useState("general");
  const [courseContext, setCourseContext] = useState("");
  const [courses, setCourses] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Teacher-specific suggestions
  const teacherSuggestions = [
    "How can I create engaging lesson plans?",
    "Strategies for teaching difficult concepts",
    "How to assess student understanding effectively?",
    "Best practices for online teaching",
    "How to handle struggling students?",
    "Create a quiz on recursion",
    "Generate a lab assignment on linked lists",
    "Tips for classroom management",
  ];

  const contextOptions = [
    { value: "general", label: "General Teaching", icon: "school" },
    { value: "lesson_planning", label: "Lesson Planning", icon: "menu_book" },
    { value: "assessment", label: "Assessment Design", icon: "quiz" },
    { value: "student_support", label: "Student Support", icon: "support_agent" },
    { value: "content_generation", label: "Content Generation", icon: "auto_awesome" },
  ];

  useEffect(() => {
    fetchCourses();
    // Welcome message
    setMessages([{
      role: "assistant",
      content: `Hello ${user.fullName?.split(" ")[0] || "Teacher"}! 👋 I'm your AI Teaching Assistant. I can help you with lesson planning, creating assessments, generating quiz questions, providing student support strategies, and much more.\n\nHow can I assist you with your teaching today?`,
      timestamp: new Date(),
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchCourses = async () => {
    try {
      // FIXED: Changed from /api/courses/teacher to /api/courses/my-courses
      const res = await fetch(`${API}/api/courses/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCourses(data.courses || []);
    } catch { /* silent */ }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setShowSuggestions(false);
    setError("");

    const userMessage = { role: "user", content: text, timestamp: new Date(), id: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const history = messages
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API}/api/ai/teacher-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          history,
          context,
          courseContext: courseContext || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to get response");
        return;
      }

      const aiMessage = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
        id: Date.now() + 1
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch {
      setError("Cannot connect to server. Make sure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const clearChat = () => {
    if (window.confirm("Clear all conversation history?")) {
      setMessages([{
        role: "assistant",
        content: `Chat cleared! I'm ready to help with your teaching needs, ${user.fullName?.split(" ")[0] || "Teacher"}. What would you like assistance with?`,
        timestamp: new Date(),
      }]);
      setShowSuggestions(true);
      setError("");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[800px]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-600 text-2xl sm:text-3xl">smart_toy</span>
            AI Teaching Assistant
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            Powered by Gemini AI — Get help with lesson planning, assessments, and teaching strategies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearChat}
            className="p-1.5 sm:p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Clear chat">
            <span className="material-symbols-outlined text-xl sm:text-2xl">delete_sweep</span>
          </button>
        </div>
      </div>

      {/* Context Selector */}
      <div className="mb-4 flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Teaching Context:</span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {contextOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setContext(opt.value)}
                  className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    context === opt.value
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}>
                  <span className="material-symbols-outlined text-sm">{opt.icon}</span>
                  <span className="hidden xs:inline">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Course selector for context */}
          {courses.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <select
                value={courseContext}
                onChange={e => setCourseContext(e.target.value)}
                className="w-full sm:w-64 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500">
                <option value="">All Courses (General)</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Chat container */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">

          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-2 sm:gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>

              {/* Avatar */}
              <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                msg.role === "user"
                  ? "bg-purple-600 text-white"
                  : "bg-gradient-to-br from-purple-500 to-pink-600 text-white"
              }`}>
                {msg.role === "user"
                  ? user.fullName?.charAt(0).toUpperCase() || "T"
                  : <span className="material-symbols-outlined text-sm">smart_toy</span>
                }
              </div>

              {/* Message bubble */}
              <div className={`max-w-[85%] sm:max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white rounded-tr-sm"
                    : "bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-tl-sm"
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] sm:text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-tl-sm">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}/>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}/>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}/>
                </div>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {showSuggestions && messages.length <= 1 && (
            <div className="mt-4">
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">Try asking...</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {teacherSuggestions.slice(0, 6).map((suggestion, i) => (
                  <button key={i} onClick={() => {
                    setInput(suggestion);
                    setTimeout(() => handleSend(), 100);
                  }}
                    className="text-left text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300 transition-all duration-200 group">
                    <span className="material-symbols-outlined text-purple-500 text-sm mr-2 group-hover:text-purple-600 align-middle">lightbulb</span>
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-3 sm:mx-4 mb-2 p-2 sm:p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-sm">error</span>
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex-1">{error}</p>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-end gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask for teaching help... (Enter to send)"
                disabled={isLoading}
                rows={1}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all disabled:opacity-50"
                style={{ minHeight: "42px", maxHeight: "100px" }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95">
              {isLoading
                ? <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                : <span className="material-symbols-outlined text-xl sm:text-2xl">send</span>
              }
            </button>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-2 text-center">
            AI can help with lesson planning, assessment creation, student support strategies, and content generation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AITutor;