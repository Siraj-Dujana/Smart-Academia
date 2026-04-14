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
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 text-xs sm:text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              {tableRows[0].map((cell, i) => (
                <th 
                  key={i} 
                  className={`border border-gray-300 dark:border-gray-600 px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-900 dark:text-white ${
                    tableAlignments[i] === 'center' ? 'text-center' : 
                    tableAlignments[i] === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {cell.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(1).map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                {row.map((cell, cellIdx) => (
                  <td 
                    key={cellIdx} 
                    className={`border border-gray-300 dark:border-gray-600 px-2 sm:px-3 py-1.5 sm:py-2 text-gray-700 dark:text-gray-300 ${
                      tableAlignments[cellIdx] === 'center' ? 'text-center' : 
                      tableAlignments[cellIdx] === 'right' ? 'text-right' : 'text-left'
                    }`}
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
          <div key={i} className="my-3 rounded-xl overflow-hidden border border-gray-700">
            {codeLanguage && (
              <div className="bg-gray-800 px-3 sm:px-4 py-1.5 text-xs text-gray-400 font-mono flex flex-wrap items-center justify-between gap-2">
                <span>{codeLanguage}</span>
                <button onClick={() => navigator.clipboard.writeText(codeLines.join("\n"))}
                  className="text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
                  <span className="material-symbols-outlined text-xs">content_copy</span>
                  <span className="text-[10px] sm:text-xs">Copy</span>
                </button>
              </div>
            )}
            <pre className="bg-gray-900 text-gray-100 p-3 sm:p-4 text-xs sm:text-sm overflow-x-auto font-mono">
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
    const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Inline code `code`
    const withCode = boldText.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400">$1</code>');
    // Italic *text*
    const withItalic = withCode.replace(/\*(.*?)\*/g, '<em>$1</em>');

    if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="font-bold text-sm mt-3 mb-1 text-gray-900 dark:text-white">{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="font-bold text-base mt-4 mb-2 text-gray-900 dark:text-white">{line.slice(3)}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="font-bold text-lg mt-5 mb-3 text-gray-900 dark:text-white">{line.slice(2)}</h1>);
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      elements.push(
        <div key={i} className="flex items-start gap-2 my-0.5">
          <span className="text-blue-500 mt-0.5 flex-shrink-0 text-sm">•</span>
          <span dangerouslySetInnerHTML={{ __html: withItalic }} className="text-sm" />
        </div>
      );
    } else if (line.match(/^\d+\.\s/)) {
      elements.push(
        <div key={i} className="flex items-start gap-2 my-0.5">
          <span className="text-blue-500 font-medium flex-shrink-0 min-w-[20px] text-sm">{line.match(/^\d+/)[0]}.</span>
          <span dangerouslySetInnerHTML={{ __html: withItalic }} className="text-sm" />
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(<p key={i} className="my-0.5 text-sm" dangerouslySetInnerHTML={{ __html: withItalic }} />);
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
        
        const res = await fetch(`${API}/api/ai/chat`, {
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
          tokens: data.usage,
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
    <div className="flex flex-col h-[calc(100vh-100px)] sm:h-[calc(100vh-120px)] max-h-[800px]">

      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-2xl sm:text-3xl">smart_toy</span>
            AI Tutor
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            Powered by Gemini AI — {messages.length} messages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
            className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent max-w-[140px] sm:max-w-[180px] truncate">
            <option value="">No course context</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.code} — {c.title.slice(0, 20)}</option>)}
          </select>
          <button onClick={handleClearChat}
            className="p-1.5 sm:p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Clear chat">
            <span className="material-symbols-outlined text-xl sm:text-2xl">delete_sweep</span>
          </button>
        </div>
      </div>

      {/* Chat container */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">

          {messages.map((msg, index) => (
            <div key={index} className={`group flex items-start gap-2 sm:gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>

              {/* Avatar */}
              <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold ${
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
              <div className={`max-w-[85%] sm:max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                
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
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => saveEdit(index)}
                        className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-tl-sm"
                  }`}>
                    {msg.role === "user"
                      ? <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                      : formatMessage(msg.content)
                    }
                    {msg.edited && (
                      <span className="text-[10px] sm:text-xs opacity-70 mt-1 block">
                        (edited)
                      </span>
                    )}
                    {msg.isRegenerated && (
                      <span className="text-[10px] sm:text-xs opacity-70 mt-1 block">
                        (regenerated)
                      </span>
                    )}
                  </div>
                )}
                
                {/* Timestamp and edit/delete buttons */}
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] sm:text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
                  {!editingId && msg.role === "user" && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => startEdit(index)}
                        className="text-[10px] sm:text-xs text-gray-400 hover:text-blue-500"
                        title="Edit message"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteMessage(index)}
                        className="text-[10px] sm:text-xs text-gray-400 hover:text-red-500"
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

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-tl-sm">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}/>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}/>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}/>
                </div>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {showSuggestions && messages.length <= 1 && (
            <div className="mt-4">
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">Try asking...</p>
              <div className="grid grid-cols-1 gap-2">
                {SUGGESTIONS.map((suggestion, i) => (
                  <button key={i} onClick={() => handleSend(suggestion)}
                    className="text-left text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 transition-all duration-200 group">
                    <span className="material-symbols-outlined text-blue-500 text-sm mr-2 group-hover:text-blue-600 align-middle">lightbulb</span>
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
                placeholder="Ask me anything... (Enter to send)"
                disabled={isLoading}
                rows={1}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all disabled:opacity-50 text-sm"
                style={{ minHeight: "42px", maxHeight: "100px" }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95">
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
            AI can make mistakes. Verify important information with your instructor.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AITutor;