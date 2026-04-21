import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AITutor = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ✅ Load from localStorage
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('teacher_ai_tutor_chat_history');
    if (saved && saved !== "undefined") {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [context, setContext] = useState("general");
  const [courseContext, setCourseContext] = useState("");
  const [courses, setCourses] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  // ✅ Edit state
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);
  const editTextareaRef = useRef(null);

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
    { value: "general", label: "General", icon: "school" },
    { value: "lesson_planning", label: "Planning", icon: "menu_book" },
    { value: "assessment", label: "Assessment", icon: "quiz" },
    { value: "student_support", label: "Support", icon: "support_agent" },
    { value: "content_generation", label: "Generate", icon: "auto_awesome" },
  ];

  // ✅ Save to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('teacher_ai_tutor_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    fetchCourses();
    if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `Hello ${user.fullName?.split(" ")[0] || "Teacher"}! 👋 I'm your AI Teaching Assistant. I can help you with lesson planning, creating assessments, generating quiz questions, providing student support strategies, and much more.\n\nHow can I assist you with your teaching today?`,
        timestamp: new Date(),
        id: Date.now(),
      }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (editingId !== null && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = editTextareaRef.current.scrollHeight + 'px';
    }
  }, [editingId]);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API}/api/courses/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCourses(data.courses || []);
    } catch { /* silent */ }
  };

  const handleSend = async (messageText = null) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    setInput("");
    setShowSuggestions(false);
    setError("");

    const userMessage = { 
      role: "user", 
      content: text, 
      timestamp: new Date(), 
      id: Date.now() 
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => m.role !== "system")
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
        id: Date.now() + 1,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch {
      setError("Cannot connect to server. Make sure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Edit functions
  const startEdit = (index) => {
    setEditingId(index);
    setEditText(messages[index].content);
  };

  const saveEdit = async (index) => {
    if (!editText.trim()) return;
    
    const originalMessage = messages[index];
    const nextMessage = messages[index + 1];
    
    setMessages(prev => prev.map((msg, i) => 
      i === index 
        ? { 
            ...msg, 
            content: editText, 
            edited: true, 
            originalContent: originalMessage.content,
            editedAt: new Date() 
          } 
        : msg
    ));
    
    setEditingId(null);
    setEditText("");
    
    if (nextMessage && nextMessage.role === "assistant") {
      setMessages(prev => prev.filter((_, i) => i !== index + 1));
      
      setIsLoading(true);
      
      try {
        const history = messages
          .filter((_, i) => i < index && messages[i].role !== "system")
          .map(m => ({ role: m.role, content: m.content }));
        
        history.push({ role: "user", content: editText });
        
        const res = await fetch(`${API}/api/ai/teacher-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: editText,
            history: history.slice(0, -1),
            context,
            courseContext: courseContext || null,
          }),
        });
  
        const data = await res.json();
  
        if (!res.ok) {
          setError(data.message || "Failed to get response");
          return;
        }
  
        const newAiMessage = {
          role: "assistant",
          content: data.reply,
          timestamp: new Date(),
          id: Date.now(),
          isRegenerated: true
        };
        
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages.splice(index + 1, 0, newAiMessage);
          return newMessages;
        });
      } catch {
        setError("Cannot connect to server. Make sure backend is running.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  // ✅ Delete individual message
  const deleteMessage = (index) => {
    if (window.confirm('Delete this message?')) {
      setMessages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  // ✅ Clear all chat
  const clearChat = () => {
    if (window.confirm("Delete ALL chat history? This cannot be undone!")) {
      setMessages([{
        role: "assistant",
        content: `Chat cleared! I'm ready to help with your teaching needs, ${user.fullName?.split(" ")[0] || "Teacher"}. What would you like assistance with?`,
        timestamp: new Date(),
        id: Date.now(),
      }]);
      setShowSuggestions(true);
      setError("");
      localStorage.removeItem('teacher_ai_tutor_chat_history');
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-180px)]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-2xl sm:text-3xl">smart_toy</span>
            AI Teaching Assistant
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            Powered by Gemini AI — {messages.length} messages
          </p>
        </div>
        <button
          onClick={clearChat}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Clear chat"
        >
          <span className="material-symbols-outlined text-xl">delete_sweep</span>
        </button>
      </div>

      {/* Context Selector */}
      <div className="mb-4 flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Context:</span>
            <div className="flex flex-wrap gap-1.5">
              {contextOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setContext(opt.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    context === opt.value
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {courses.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <select
                value={courseContext}
                onChange={e => setCourseContext(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
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
      <div 
        ref={chatContainerRef}
        className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden"
        style={{ minHeight: "500px" }}
      >

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`group flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-gradient-to-br from-indigo-500 to-blue-600 text-white"
              }`}>
                {msg.role === "user"
                  ? user.fullName?.charAt(0).toUpperCase() || "T"
                  : <span className="material-symbols-outlined text-sm">smart_toy</span>
                }
              </div>

              <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                
                {/* Edit mode */}
                {editingId === index ? (
                  <div className="w-full min-w-[260px] sm:min-w-[300px]">
                    <textarea
                      ref={editTextareaRef}
                      value={editText}
                      onChange={(e) => {
                        setEditText(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                      }}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => saveEdit(index)}
                        className="px-3 py-1 text-xs sm:text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      >
                        Save & Regenerate
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 text-xs sm:text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`px-4 py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-sm"
                      : "bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-tl-sm"
                  }`}>
                    {msg.role === "user" ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 text-sm leading-relaxed">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                          li: ({ children }) => <li className="text-sm">{children}</li>,
                          h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-3">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-bold mb-1.5 mt-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2">{children}</h3>,
                          code: ({ children }) => (
                            <code className="bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 px-1 py-0.5 rounded text-xs font-mono">
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="bg-gray-900 text-gray-100 p-3 rounded-xl text-xs font-mono overflow-x-auto my-2">
                              {children}
                            </pre>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                    {msg.edited && (
                      <span className="text-[10px] opacity-70 mt-1 block">(edited)</span>
                    )}
                    {msg.isRegenerated && (
                      <span className="text-[10px] opacity-70 mt-1 block">(regenerated)</span>
                    )}
                  </div>
                )}
                
                {/* Timestamp and actions */}
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] text-gray-400">{formatTime(msg.timestamp)}</span>
                  {!editingId && msg.role === "user" && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => startEdit(index)}
                        className="text-[10px] text-gray-400 hover:text-indigo-500"
                        title="Edit message"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteMessage(index)}
                        className="text-[10px] text-gray-400 hover:text-red-500"
                        title="Delete message"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}/>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}/>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}/>
                </div>
              </div>
            </div>
          )}

          {showSuggestions && messages.length <= 1 && (
            <div className="mt-6">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">Try asking...</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {teacherSuggestions.slice(0, 6).map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(suggestion)}
                    className="text-left text-sm px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-700 dark:text-gray-300 transition-all duration-200 group"
                  >
                    <span className="material-symbols-outlined text-indigo-500 text-sm mr-2 group-hover:text-indigo-600 align-middle">lightbulb</span>
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="mx-4 mb-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-sm">error</span>
            <p className="text-sm text-red-600 dark:text-red-400 flex-1">{error}</p>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask for teaching help... (Enter to send, Shift+Enter for new line)"
                disabled={isLoading}
                rows={1}
                className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all disabled:opacity-50"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
            >
              {isLoading
                ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                : <span className="material-symbols-outlined text-2xl">send</span>
              }
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            AI can help with lesson planning, assessment creation, student support, and content generation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AITutor;