import React, { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Format message text — convert markdown-like syntax to JSX with table support
const formatMessage = (text) => {
  const lines = text.split("\n");
  const elements = [];
  let inCodeBlock = false;
  let codeLines = [];
  let codeLanguage = "";
  let inTable = false;
  let tableRows = [];
  let tableAlignments = [];

  const renderTable = () => {
    if (tableRows.length === 0) return null;
    
    return (
      <div className="my-3 overflow-x-auto">
        <table className="min-w-full border-collapse border" style={{ borderColor: "#334155" }}>
          <thead>
            <tr style={{ background: "#1e293b" }}>
              {tableRows[0].map((cell, i) => (
                <th 
                  key={i} 
                  className="border px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-white"
                  style={{ borderColor: "#334155" }}
                >
                  {cell.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(1).map((row, rowIdx) => (
              <tr key={rowIdx} style={{ background: rowIdx % 2 === 0 ? "#0f1629" : "#1a1f2e" }}>
                {row.map((cell, cellIdx) => (
                  <td 
                    key={cellIdx} 
                    className="border px-2 sm:px-3 py-1.5 sm:py-2 text-gray-300"
                    style={{ borderColor: "#334155" }}
                  >
                    {cell.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const parseTableRow = (line) => {
    const match = line.match(/^\|(.+)\|$/);
    if (!match) return null;
    const cells = match[1].split('|').map(cell => cell.trim());
    return cells;
  };

  const parseTableAlignment = (line) => {
    const match = line.match(/^\|(.+)\|$/);
    if (!match) return null;
    const alignments = match[1].split('|').map(cell => {
      const trimmed = cell.trim();
      if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
      if (trimmed.endsWith(':')) return 'right';
      if (trimmed.startsWith(':')) return 'left';
      return 'left';
    });
    return alignments;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
        codeLines = [];
      } else {
        inCodeBlock = false;
        elements.push(
          <div key={i} className="my-3 rounded-xl overflow-hidden" style={{ background: "#0a0f1e", border: "1px solid #334155" }}>
            {codeLanguage && (
              <div className="px-3 sm:px-4 py-1.5 text-xs text-gray-400 font-mono flex flex-wrap items-center justify-between gap-2" style={{ background: "#0f1629", borderBottom: "1px solid #334155" }}>
                <span>{codeLanguage}</span>
                <button onClick={() => navigator.clipboard.writeText(codeLines.join("\n"))}
                  className="text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
                  <span className="material-symbols-outlined text-xs">content_copy</span>
                  <span className="text-[10px] sm:text-xs">Copy</span>
                </button>
              </div>
            )}
            <pre className="p-3 sm:p-4 text-xs sm:text-sm overflow-x-auto font-mono text-gray-300">
              {codeLines.join("\n")}
            </pre>
          </div>
        );
        codeLines = [];
        codeLanguage = "";
      }
      continue;
    }

    if (inCodeBlock) { 
      codeLines.push(line); 
      continue; 
    }

    // Handle tables
    if (line.startsWith('|') && line.endsWith('|')) {
      if (line.includes('---')) {
        tableAlignments = parseTableAlignment(line) || [];
        continue;
      }
      
      const row = parseTableRow(line);
      if (row) {
        if (!inTable) {
          inTable = true;
          tableRows = [row];
        } else {
          tableRows.push(row);
        }
      }
      continue;
    } else if (inTable) {
      elements.push(renderTable());
      inTable = false;
      tableRows = [];
      tableAlignments = [];
    }

    // Bold text **text**
    const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-400">$1</strong>');
    // Inline code `code`
    const withCode = boldText.replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded text-xs font-mono" style="background: #1e293b; color: #818cf8;">$1</code>');
    // Italic *text*
    const withItalic = withCode.replace(/\*(.*?)\*/g, '<em class="text-gray-400">$1</em>');

    if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="font-bold text-sm mt-3 mb-1 text-white">{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="font-bold text-base mt-4 mb-2 text-white">{line.slice(3)}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="font-bold text-lg mt-5 mb-3 text-white">{line.slice(2)}</h1>);
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      elements.push(
        <div key={i} className="flex items-start gap-2 my-0.5">
          <span className="text-indigo-500 mt-0.5 flex-shrink-0 text-sm">•</span>
          <span dangerouslySetInnerHTML={{ __html: withItalic }} className="text-sm text-gray-300" />
        </div>
      );
    } else if (line.match(/^\d+\.\s/)) {
      elements.push(
        <div key={i} className="flex items-start gap-2 my-0.5">
          <span className="text-indigo-500 font-medium flex-shrink-0 min-w-[20px] text-sm">{line.match(/^\d+/)[0]}.</span>
          <span dangerouslySetInnerHTML={{ __html: withItalic }} className="text-sm text-gray-300" />
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(<p key={i} className="my-0.5 text-sm text-gray-300" dangerouslySetInnerHTML={{ __html: withItalic }} />);
    }
  }

  if (inTable) {
    elements.push(renderTable());
  }

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

// ── Section Header Component ────────────────────────────────
const SectionHeader = ({ icon, title, color = "#6366f1" }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
      <span className="material-symbols-outlined text-base" style={{ color }}>{icon}</span>
    </div>
    <h3 className="text-sm font-bold text-white tracking-wide uppercase">{title}</h3>
    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}44, transparent)` }} />
  </div>
);

const AITutor = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('ai_tutor_chat_history');
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
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const editTextareaRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ai_tutor_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    fetchCourses();
    if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `Hello ${user.fullName?.split(" ")[0] || "there"}! 👋 I'm your AI Tutor. I'm here to help you understand concepts, debug code, and answer any academic questions you have.\n\nWhat would you like to learn today?`,
        timestamp: new Date(),
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

      const res = await fetch(`${API}/api/ai/student-chat`, {
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
        id: Date.now() + 1
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch {
      setError("Cannot connect to server. Make sure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (index) => {
    setEditingId(index);
    setEditText(messages[index].content);
  };

  const saveEdit = async (index) => {
    if (!editText.trim()) return;
    
    const nextMessage = messages[index + 1];
    
    setMessages(prev => prev.map((msg, i) => 
      i === index 
        ? { 
            ...msg, 
            content: editText, 
            edited: true, 
            originalContent: messages[index].content,
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
        
        const res = await fetch(`${API}/api/ai/student-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: editText,
            history: history.slice(0, -1),
            courseId: selectedCourse || null,
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

  const deleteMessage = (index) => {
    if (window.confirm('Delete this message?')) {
      setMessages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Delete ALL chat history? This cannot be undone!')) {
      setMessages([{
        role: "assistant",
        content: `Chat cleared! I'm ready for your next question, ${user.fullName?.split(" ")[0] || ""}. What would you like to learn?`,
        timestamp: new Date(),
      }]);
      setShowSuggestions(true);
      setError("");
      localStorage.removeItem('ai_tutor_chat_history');
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

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif" }}>

      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", border: "1px solid #1e293b" }}>
        <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "#6366f1" }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: "#a855f7" }} />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#6366f1" }} />
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">SmartAcademia · AI Assistant</p>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
              AI Tutor<br />
            </h1>
            <p className="text-gray-400 text-sm mt-2"> {messages.length} messages exchanged</p>
          </div>

          <div className="flex items-center gap-3">
        
            <button 
              onClick={handleClearChat}
              className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
              <span className="text-sm hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
   <div className="rounded-2xl overflow-hidden flex flex-col w-full" style={{ background: "#0f1629", border: "1px solid #1e293b", height: "calc(100vh - 280px)", minHeight: "400px" }}>
  
  {/* Messages Area */}
  <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3 w-full">
    
    {messages.map((msg, index) => (
      <div key={index} className={`group flex items-start gap-2 w-full ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>

        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shadow-lg ${
          msg.role === "user"
            ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white"
            : "bg-gradient-to-br from-purple-600 to-indigo-600 text-white"
        }`}>
          {msg.role === "user"
            ? user.fullName?.charAt(0).toUpperCase() || "S"
            : <span className="material-symbols-outlined text-sm">smart_toy</span>
          }
        </div>

        {/* Message Bubble */}
        <div className={`flex-1 max-w-[calc(100%-80px)] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
          
          {editingId === index ? (
            <div className="w-full">
              <textarea
                ref={editTextareaRef}
                value={editText}
                onChange={(e) => {
                  setEditText(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                }}
                className="w-full px-3 py-2 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-xs"
                rows={2}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => saveEdit(index)}
                  className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">save</span>
                  <span>Save</span>
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">close</span>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={`px-3 py-2 rounded-2xl break-words ${
                msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"
              } shadow-md w-full`} style={{
                background: msg.role === "user" 
                  ? "linear-gradient(135deg, #6366f1, #818cf8)" 
                  : "#1e293b",
                border: msg.role === "assistant" ? "1px solid #334155" : "none"
              }}>
                {msg.role === "user"
                  ? <p className="text-xs leading-relaxed whitespace-pre-wrap break-words text-white">{msg.content}</p>
                  : <div className="text-xs leading-relaxed break-words">{formatMessage(msg.content)}</div>
                }
                {(msg.edited || msg.isRegenerated) && (
                  <span className="text-[9px] opacity-70 mt-0.5 block text-gray-400">
                    {msg.edited ? "(edited)" : msg.isRegenerated ? "(regenerated)" : ""}
                  </span>
                )}
              </div>
              
              {/* Timestamp and Actions */}
              <div className="flex items-center gap-1.5 px-1">
                <span className="text-[9px] text-gray-500">{formatTime(msg.timestamp)}</span>
                {!editingId && msg.role === "user" && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                    <button
                      onClick={() => startEdit(index)}
                      className="text-gray-500 hover:text-indigo-400 transition p-0.5"
                      title="Edit message"
                    >
                      <span className="material-symbols-outlined text-xs">edit</span>
                    </button>
                    <button
                      onClick={() => deleteMessage(index)}
                      className="text-gray-500 hover:text-red-400 transition p-0.5"
                      title="Delete message"
                    >
                      <span className="material-symbols-outlined text-xs">delete</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    ))}

    {/* Loading Indicator */}
    {isLoading && (
      <div className="flex items-start gap-2 w-full">
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
        </div>
        <div className="px-3 py-2 rounded-2xl rounded-tl-sm shadow-md" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}/>
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}/>
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}/>
          </div>
        </div>
      </div>
    )}

    {/* Suggestions */}
    {showSuggestions && messages.length <= 1 && (
      <div className="mt-4 w-full">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#f59e0b22", border: "1px solid #f59e0b44" }}>
            <span className="material-symbols-outlined text-sm" style={{ color: "#f59e0b" }}>lightbulb</span>
          </div>
          <h3 className="text-xs font-bold text-white tracking-wide uppercase">Try asking...</h3>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, #f59e0b44, transparent)" }} />
        </div>
        <div className="flex flex-col gap-2 w-full">
          {SUGGESTIONS.slice(0, 4).map((suggestion, i) => (
            <button 
              key={i} 
              onClick={() => handleSend(suggestion)}
              className="text-left text-xs px-3 py-2 rounded-xl transition-all duration-200 text-gray-300 w-full"
              style={{ background: "#1e293b", border: "1px solid #334155" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#334155";
                e.currentTarget.style.borderColor = "#6366f1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#1e293b";
                e.currentTarget.style.borderColor = "#334155";
              }}
            >
              <span className="material-symbols-outlined text-indigo-500 text-xs mr-2 align-middle">quiz</span>
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    )}

    <div ref={messagesEndRef} />
  </div>

  {/* Error Banner */}
  {error && (
    <div className="mx-3 mb-2 p-2 rounded-xl flex items-center gap-2 flex-shrink-0" style={{ background: "#1a0a0a", border: "1px solid #ef444433" }}>
      <span className="material-symbols-outlined text-red-500 text-xs flex-shrink-0">error</span>
      <p className="text-xs text-red-400 flex-1 break-words">{error}</p>
      <button onClick={() => setError("")} className="text-red-500 hover:text-red-400 flex-shrink-0">
        <span className="material-symbols-outlined text-xs">close</span>
      </button>
    </div>
  )}

  {/* Input Area */}
  <div className="p-3 border-t flex-shrink-0 w-full" style={{ borderColor: "#1e293b" }}>
    <div className="flex items-end gap-2 w-full">
      <div className="flex-1 min-w-0 relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px";
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything... (Enter to send)"
          disabled={isLoading}
          rows={1}
          className="w-full px-3 py-2 rounded-xl resize-none transition-all disabled:opacity-50 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            color: "#f1f5f9",
            minHeight: "40px",
            maxHeight: "80px"
          }}
        />
      </div>
      <button
        onClick={() => handleSend()}
        disabled={!input.trim() || isLoading}
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg"
      >
        {isLoading
          ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          : <span className="material-symbols-outlined text-lg">send</span>
        }
      </button>
    </div>
    <p className="text-[10px] text-gray-600 mt-2 text-center">
      AI can make mistakes. Verify important information.
    </p>
  </div>
</div>
      
    </div>
  );
};

export default AITutor;