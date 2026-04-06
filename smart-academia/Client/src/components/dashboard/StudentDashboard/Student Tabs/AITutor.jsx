import React, { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Format message text — convert markdown-like syntax to JSX
const formatMessage = (text) => {
  const lines = text.split("\n");
  const elements = [];
  let inCodeBlock = false;
  let codeLines = [];
  let codeLanguage = "";

  lines.forEach((line, i) => {
    if (line.startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
        codeLines = [];
      } else {
        inCodeBlock = false;
        elements.push(
          <div key={i} className="my-3 rounded-xl overflow-hidden border border-gray-700">
            {codeLanguage && (
              <div className="bg-gray-800 px-4 py-1.5 text-xs text-gray-400 font-mono flex items-center justify-between">
                <span>{codeLanguage}</span>
                <button onClick={() => navigator.clipboard.writeText(codeLines.join("\n"))}
                  className="text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
                  <span className="material-symbols-outlined text-xs">content_copy</span>
                  Copy
                </button>
              </div>
            )}
            <pre className="bg-gray-900 text-gray-100 p-4 text-sm overflow-x-auto font-mono">
              {codeLines.join("\n")}
            </pre>
          </div>
        );
        codeLines = [];
        codeLanguage = "";
      }
      return;
    }

    if (inCodeBlock) { codeLines.push(line); return; }

    // Bold text **text**
    const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Inline code `code`
    const withCode = boldText.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-blue-600 dark:text-blue-400">$1</code>');

    if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="font-bold text-base mt-3 mb-1 text-gray-900 dark:text-white">{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="font-bold text-lg mt-4 mb-2 text-gray-900 dark:text-white">{line.slice(3)}</h2>);
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      elements.push(
        <div key={i} className="flex items-start gap-2 my-0.5">
          <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
          <span dangerouslySetInnerHTML={{ __html: withCode }} />
        </div>
      );
    } else if (line.match(/^\d+\.\s/)) {
      elements.push(
        <div key={i} className="flex items-start gap-2 my-0.5">
          <span className="text-blue-500 font-medium flex-shrink-0 min-w-[20px]">{line.match(/^\d+/)[0]}.</span>
          <span dangerouslySetInnerHTML={{ __html: withCode }} />
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(<p key={i} className="my-0.5" dangerouslySetInnerHTML={{ __html: withCode }} />);
    }
  });

  return <div className="text-sm leading-relaxed">{elements}</div>;
};

// Suggested questions
const SUGGESTIONS = [
  "Explain recursion with a simple example",
  "What is the difference between stack and queue?",
  "How does binary search work?",
  "Explain object-oriented programming concepts",
  "What is time complexity and why does it matter?",
  "Help me understand linked lists",
];

const AITutor = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    fetchCourses();
    // Welcome message
    setMessages([{
      role: "assistant",
      content: `Hello ${user.fullName?.split(" ")[0] || "there"}! 👋 I'm your AI Tutor. I'm here to help you understand concepts, debug code, and answer any academic questions you have.\n\nWhat would you like to learn today?`,
      timestamp: new Date(),
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API}/api/courses/enrolled`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCourses(data.courses);
    } catch { /* silent */ }
  };

  const handleSend = async (messageText = null) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    setInput("");
    setShowSuggestions(false);
    setError("");

    const userMessage = { role: "user", content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build history for context (exclude timestamps)
      const history = messages
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          history,
          courseId: selectedCourse || null,
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
        tokens: data.usage,
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

  const handleClearChat = () => {
    setMessages([{
      role: "assistant",
      content: `Chat cleared! I'm ready for your next question, ${user.fullName?.split(" ")[0] || ""}. What would you like to learn?`,
      timestamp: new Date(),
    }]);
    setShowSuggestions(true);
    setError("");
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[800px]">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">smart_toy</span>
            AI Tutor
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-0.5 text-sm">
            Powered by Claude AI — ask me anything about your studies
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Course context selector */}
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
            className="text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent max-w-[180px]">
            <option value="">No course context</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.code} — {c.title.slice(0, 20)}</option>)}
          </select>
          <button onClick={handleClearChat}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Clear chat">
            <span className="material-symbols-outlined">delete_sweep</span>
          </button>
        </div>
      </div>

      {/* Chat container */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>

              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gradient-to-br from-purple-500 to-blue-600 text-white"
              }`}>
                {msg.role === "user"
                  ? user.fullName?.charAt(0).toUpperCase() || "S"
                  : <span className="material-symbols-outlined text-sm">smart_toy</span>
                }
              </div>

              {/* Message bubble */}
              <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div className={`px-4 py-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-tl-sm"
                }`}>
                  {msg.role === "user"
                    ? <p className="text-sm leading-relaxed">{msg.content}</p>
                    : formatMessage(msg.content)
                  }
                </div>
                <span className="text-xs text-gray-400 px-1">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}/>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {showSuggestions && messages.length <= 1 && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">Try asking...</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTIONS.map((suggestion, i) => (
                  <button key={i} onClick={() => handleSend(suggestion)}
                    className="text-left text-sm px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 transition-all duration-200 group">
                    <span className="material-symbols-outlined text-blue-500 text-sm mr-2 group-hover:text-blue-600">lightbulb</span>
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
          <div className="mx-4 mb-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-sm">error</span>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  // Auto resize
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything... (Enter to send, Shift+Enter for new line)"
                disabled={isLoading}
                rows={1}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all disabled:opacity-50 text-sm"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95">
              {isLoading
                ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                : <span className="material-symbols-outlined">send</span>
              }
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            AI can make mistakes. Verify important information with your instructor.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AITutor;