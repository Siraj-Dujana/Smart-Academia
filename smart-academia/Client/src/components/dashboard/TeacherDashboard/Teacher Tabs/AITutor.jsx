/**
 * AITutor.jsx — Teacher AI Teaching Assistant (Enhanced)
 *
 * Features implemented:
 *  1.  Auth check + redirect
 *  2.  Collision-safe message IDs via useRef counter
 *  3.  AbortController — cancels in-flight requests on unmount
 *  4.  Per-message retry button for failed sends
 *  5.  Copy-to-clipboard on AI messages
 *  6.  4 000-char input limit + live counter
 *  7.  Export as JSON / Markdown / plain text
 *  8.  In-chat search with highlight
 *  9.  Typing indicator + improved loading animation
 * 10.  Descriptive error messages
 * 11.  Mobile: 16 px inputs, 44 px touch targets, responsive layout
 * 12.  localStorage size guard + auto-trim
 * 13.  Paste image → base64 attachment preview
 * 14.  Keyboard shortcuts: Ctrl+K search, Ctrl+L clear, Ctrl+Enter send
 * 15.  Conversation threads (named, saved, timestamp)
 * 16.  Code block syntax-highlight regions + copy per block
 * 17.  React.memo on MessageBubble, debounced localStorage save
 * 18.  ARIA labels, live region for new messages, focus management
 * 19.  Animated typing dots while AI is composing
 * 20.  Voice input via Web Speech API
 */

import React, {
  useState, useEffect, useRef, useCallback,
  useMemo, memo,
} from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const MAX_CHARS        = 4000;
const LS_THREADS_KEY   = "ai_teacher_threads";
const LS_ACTIVE_KEY    = "ai_teacher_active_thread";
const LS_SIZE_WARN     = 4.5 * 1024 * 1024; // 4.5 MB
const DEBOUNCE_MS      = 800;

const CONTEXTS = [
  { id: "general",          label: "General",           icon: "psychology" },
  { id: "lesson_planning",  label: "Lesson Planning",   icon: "edit_note" },
  { id: "assessment",       label: "Assessment",        icon: "grading" },
  { id: "student_support",  label: "Student Support",   icon: "support_agent" },
  { id: "content_generation", label: "Content Gen",     icon: "auto_awesome" },
];

/* ─────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────── */
let _uid = 0;
const uid = () => `msg_${Date.now()}_${++_uid}`;

const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const formatDate = (ts) =>
  new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const lsBytes = (str) => new Blob([str]).size;

/** Debounce helper */
function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

/** Escape regex special chars */
const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ─────────────────────────────────────────────
   CODE BLOCK PARSER
   Splits text into plain segments + code blocks
───────────────────────────────────────────── */
function parseBlocks(text) {
  const regex = /```(\w*)\n?([\s\S]*?)```/g;
  const parts = [];
  let last = 0, m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: "text", content: text.slice(last, m.index) });
    parts.push({ type: "code", lang: m[1] || "text", content: m[2].trimEnd() });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: "text", content: text.slice(last) });
  return parts;
}

/* ─────────────────────────────────────────────
   INLINE FORMATTER
   Bold **x**, italic *x*, inline `code`, links
───────────────────────────────────────────── */
function InlineText({ text, highlight }) {
  // highlight search term
  const withHL = (str) => {
    if (!highlight) return str;
    const rx = new RegExp(`(${escapeRx(highlight)})`, "gi");
    const parts = str.split(rx);
    return parts.map((p, i) =>
      rx.test(p)
        ? <mark key={i} style={{ background: "#fbbf2455", color: "#fbbf24", borderRadius: 2 }}>{p}</mark>
        : p
    );
  };

  // Very lightweight inline markdown
  const renderInline = (raw) => {
    const segments = [];
    const patterns = [
      { rx: /\*\*(.*?)\*\*/g,  render: (s, i) => <strong key={i} style={{ color: "#c084fc" }}>{withHL(s)}</strong> },
      { rx: /\*(.*?)\*/g,      render: (s, i) => <em key={i} style={{ color: "#94a3b8" }}>{withHL(s)}</em> },
      { rx: /`([^`]+)`/g,      render: (s, i) => (
        <code key={i} style={{ background: "#1e293b", color: "#818cf8", padding: "1px 5px", borderRadius: 4, fontSize: "0.85em", fontFamily: "monospace" }}>{s}</code>
      )},
      { rx: /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, render: (s, i, href) => (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", textDecoration: "underline" }}>{withHL(s)}</a>
      )},
    ];

    // simple sequential pass (not full markdown — fast)
    let result = raw;
    // We'll just render the plain text with HL for now at line level
    return withHL(raw);
  };

  return <>{renderInline(text)}</>;
}

/* ─────────────────────────────────────────────
   CODE BLOCK COMPONENT
───────────────────────────────────────────── */
const CodeBlock = memo(function CodeBlock({ lang, content }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div style={{ margin: "10px 0", borderRadius: 10, overflow: "hidden", border: "1px solid #334155" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#0a0f1e", padding: "6px 12px",
        borderBottom: "1px solid #334155",
      }}>
        <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1 }}>
          {lang || "code"}
        </span>
        <button
          onClick={copy}
          aria-label="Copy code"
          style={{
            display: "flex", alignItems: "center", gap: 4, fontSize: 10,
            color: copied ? "#4ade80" : "#64748b", background: "none", border: "none",
            cursor: "pointer", padding: "2px 6px", borderRadius: 4, transition: "color 0.2s",
          }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            {copied ? "check" : "content_copy"}
          </span>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre style={{
        margin: 0, padding: "14px 16px", overflowX: "auto", fontSize: 13,
        lineHeight: 1.6, background: "#020817", color: "#e2e8f0",
        fontFamily: "'Fira Code', 'Cascadia Code', monospace",
      }}>
        <code>{content}</code>
      </pre>
    </div>
  );
});

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

/* ─────────────────────────────────────────────
   MESSAGE BUBBLE - Full Markdown Support
───────────────────────────────────────────── */
const MessageBubble = memo(function MessageBubble({
  msg, onRetry, highlight, showDate,
}) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";
  const isFailed = msg.status === "failed";

  const copyMsg = () => {
    navigator.clipboard.writeText(msg.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Function to highlight search terms in text
  const highlightText = (text) => {
    if (!highlight) return text;
    const regex = new RegExp(`(${escapeRx(highlight)})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark key={i} style={{ background: "#fbbf2455", color: "#fbbf24", borderRadius: 2, padding: "0 2px" }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <>
      {showDate && (
        <div style={{ textAlign: "center", margin: "12px 0 4px" }}>
          <span style={{ fontSize: 10, color: "#475569", background: "#0f1629", padding: "2px 10px", borderRadius: 99, border: "1px solid #1e293b" }}>
            {formatDate(msg.timestamp)}
          </span>
        </div>
      )}

      <div
        className={`group flex items-start gap-2 w-full ${isUser ? "flex-row-reverse" : "flex-row"}`}
        role="article"
        aria-label={`${isUser ? "You" : "AI Assistant"}: ${msg.content?.slice(0, 60)}`}
      >
        {/* Avatar */}
        <div style={{
          flexShrink: 0, width: 32, height: 32, borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: isUser
            ? "linear-gradient(135deg, #6366f1, #818cf8)"
            : "linear-gradient(135deg, #7c3aed, #6366f1)",
          boxShadow: `0 0 12px ${isUser ? "#6366f188" : "#7c3aed88"}`,
        }}>
          {isUser
            ? <span style={{ fontSize: 13, fontWeight: 900, color: "white" }}>T</span>
            : <span className="material-symbols-outlined" style={{ fontSize: 16, color: "white" }}>smart_toy</span>}
        </div>

        {/* Bubble */}
        <div style={{ maxWidth: "calc(100% - 80px)", display: "flex", flexDirection: "column", gap: 4,
          alignItems: isUser ? "flex-end" : "flex-start" }}>
          <div style={{
            padding: "10px 14px",
            borderRadius: isUser ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
            background: isUser
              ? "linear-gradient(135deg, #6366f1, #818cf8)"
              : "#1e293b",
            border: isUser ? "none" : "1px solid #334155",
            color: isUser ? "white" : "#cbd5e1",
            boxShadow: isUser ? "0 0 20px #6366f144" : "none",
            opacity: isFailed ? 0.6 : 1,
            position: "relative",
          }}>
            {isUser ? (
              // User messages - plain text with highlight
              <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
                {highlight ? highlightText(msg.content) : msg.content}
              </p>
            ) : (
              // AI messages - FULL Markdown support
            // AI messages - FULL Markdown support
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeRaw]}
  components={{
    // Paragraphs - smaller font
    p: ({ children }) => (
      <p style={{ margin: "0 0 6px 0", fontSize: 12, lineHeight: 1.6 }}>
        {children}
      </p>
    ),
    
    // Bold text
    strong: ({ children }) => (
      <strong style={{ color: "#c084fc", fontWeight: 700, fontSize: 12 }}>
        {children}
      </strong>
    ),
    
    // Italic text
    em: ({ children }) => (
      <em style={{ color: "#94a3b8", fontSize: 12 }}>
        {children}
      </em>
    ),
    
    // Bullet lists (unordered)
    ul: ({ children }) => (
      <ul style={{ 
        margin: "4px 0 6px 18px", 
        paddingLeft: 0,
        listStyleType: "disc",
        listStylePosition: "outside",
        fontSize: 12,
      }}>
        {children}
      </ul>
    ),
    
    // Numbered lists (ordered)
    ol: ({ children }) => (
      <ol style={{ 
        margin: "4px 0 6px 18px", 
        paddingLeft: 0,
        listStyleType: "decimal",
        listStylePosition: "outside",
        fontSize: 12,
      }}>
        {children}
      </ol>
    ),
    
    // List items
    li: ({ children }) => (
      <li style={{ 
        marginBottom: 3,
        lineHeight: 1.5,
        fontSize: 12,
      }}>
        {children}
      </li>
    ),
    
    // Headers - smaller
    h1: ({ children }) => (
      <h1 style={{ fontSize: 16, fontWeight: "bold", marginTop: 10, marginBottom: 5, color: "#e2e8f0" }}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 style={{ fontSize: 14, fontWeight: "bold", marginTop: 8, marginBottom: 4, color: "#e2e8f0" }}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 style={{ fontSize: 13, fontWeight: "bold", marginTop: 6, marginBottom: 3, color: "#e2e8f0" }}>
        {children}
      </h3>
    ),
    
    // Inline code
    code: ({ children, inline }) => inline 
      ? <code style={{ background: "#1e293b", color: "#818cf8", padding: "1px 4px", borderRadius: 4, fontSize: 11, fontFamily: "monospace" }}>{children}</code>
      : <code style={{ display: "block", background: "#020817", padding: 10, borderRadius: 8, overflowX: "auto", fontSize: 11, fontFamily: "monospace" }}>{children}</code>,
    
    // Preformatted code blocks
    pre: ({ children }) => (
      <pre style={{ margin: "6px 0", overflow: "auto" }}>
        {children}
      </pre>
    ),
    
    // Links
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", textDecoration: "underline", fontSize: 12 }}>
        {children}
      </a>
    ),
    
    // Horizontal rule
    hr: () => <hr style={{ borderColor: "#334155", margin: "10px 0" }} />,
    
    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote style={{ borderLeft: `3px solid #6366f1`, paddingLeft: 10, margin: "6px 0", color: "#94a3b8", fontStyle: "italic", fontSize: 12 }}>
        {children}
      </blockquote>
    ),
  }}
>
  {msg.content}
</ReactMarkdown>
            )}
          </div>

          {/* Meta row - timestamp, edit badge, retry, copy */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, paddingInline: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, color: "#475569" }}>{formatTime(msg.timestamp)}</span>

            {msg.edited && (
              <span style={{ fontSize: 9, color: "#475569" }}>(edited)</span>
            )}

            {isFailed && (
              <>
                <span style={{ fontSize: 10, color: "#f87171" }}>⚠ Failed</span>
                {onRetry && (
                  <button
                    onClick={() => onRetry(msg)}
                    aria-label="Retry sending this message"
                    style={{
                      fontSize: 10, color: "#818cf8", background: "#6366f122",
                      border: "1px solid #6366f144", borderRadius: 6,
                      padding: "1px 7px", cursor: "pointer", display: "flex",
                      alignItems: "center", gap: 3,
                    }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>refresh</span>
                    Retry
                  </button>
                )}
              </>
            )}

            {!isUser && (
              <button
                onClick={copyMsg}
                aria-label="Copy message"
                className="group-hover:opacity-100"
                style={{
                  opacity: 0, fontSize: 10, color: copied ? "#4ade80" : "#64748b",
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 3,
                  transition: "opacity 0.2s, color 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                onMouseLeave={e => { if (!copied) e.currentTarget.style.opacity = "0"; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                  {copied ? "check" : "content_copy"}
                </span>
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
});

/* ─────────────────────────────────────────────
   TYPING DOTS
───────────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-start gap-2 w-full" aria-live="polite" aria-label="AI is typing">
      <div style={{
        flexShrink: 0, width: 32, height: 32, borderRadius: 10,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #7c3aed, #6366f1)",
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: "white" }}>smart_toy</span>
      </div>
      <div style={{
        padding: "12px 16px", borderRadius: "4px 18px 18px 18px",
        background: "#1e293b", border: "1px solid #334155",
      }}>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#6366f1",
              animation: "typingBounce 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
              display: "inline-block",
            }} />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TOAST NOTIFICATION
───────────────────────────────────────────── */
function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    info:    { bg: "#6366f122", border: "#6366f1", text: "#818cf8" },
    success: { bg: "#22c55e22", border: "#22c55e", text: "#4ade80" },
    warning: { bg: "#f59e0b22", border: "#f59e0b", text: "#fbbf24" },
    error:   { bg: "#ef444422", border: "#ef4444", text: "#f87171" },
  };
  const c = colors[type] || colors.info;

  return (
    <div role="alert" aria-live="assertive" style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      padding: "10px 16px", borderRadius: 12,
      background: c.bg, border: `1px solid ${c.border}`,
      color: c.text, fontSize: 13, fontWeight: 600,
      display: "flex", alignItems: "center", gap: 8,
      boxShadow: `0 8px 32px ${c.border}33`,
      animation: "slideInRight 0.3s ease",
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
        {type === "success" ? "check_circle" : type === "error" ? "error" : type === "warning" ? "warning" : "info"}
      </span>
      {message}
      <button onClick={onClose} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", marginLeft: 4 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
      </button>
      <style>{`@keyframes slideInRight { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   THREAD MANAGER
   A minimal conversation manager sidebar
───────────────────────────────────────────── */
function ThreadPanel({ threads, activeId, onSelect, onCreate, onDelete, onRename, onClose }) {
  const [renaming, setRenaming] = useState(null);
  const [renameVal, setRenameVal] = useState("");

  return (
    <div style={{
      position: "absolute", top: 0, left: 0, bottom: 0, width: 240,
      background: "#070d1a", borderRight: "1px solid #1e293b",
      zIndex: 30, display: "flex", flexDirection: "column",
      animation: "slideInLeft 0.25s ease",
    }}>
      <style>{`@keyframes slideInLeft { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }`}</style>
      <div style={{
        padding: "14px 16px", display: "flex", alignItems: "center",
        justifyContent: "space-between", borderBottom: "1px solid #1e293b",
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>Conversations</span>
        <button onClick={onClose} aria-label="Close conversations panel"
          style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18 }}>✕</button>
      </div>

      <button onClick={onCreate} style={{
        margin: "10px 12px 4px",
        background: "linear-gradient(135deg, #6366f1, #818cf8)",
        border: "none", borderRadius: 10, padding: "9px 14px",
        color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span>
        New Conversation
      </button>

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px" }}>
        {threads.map(t => (
          <div key={t.id}
            style={{
              borderRadius: 10, marginBottom: 4, padding: "10px 12px",
              background: t.id === activeId ? "#6366f122" : "transparent",
              border: `1px solid ${t.id === activeId ? "#6366f155" : "transparent"}`,
              cursor: "pointer", transition: "all 0.15s",
            }}
            onClick={() => onSelect(t.id)}>
            {renaming === t.id ? (
              <form onSubmit={e => { e.preventDefault(); onRename(t.id, renameVal); setRenaming(null); }}>
                <input
                  value={renameVal}
                  onChange={e => setRenameVal(e.target.value)}
                  autoFocus
                  style={{
                    width: "100%", background: "#1e293b", border: "1px solid #6366f1",
                    borderRadius: 6, padding: "4px 8px", color: "white", fontSize: 12,
                  }}
                  onBlur={() => { onRename(t.id, renameVal); setRenaming(null); }}
                />
              </form>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {t.name}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 10, color: "#64748b" }}>
                    {t.messages?.length || 0} msgs · {formatDate(t.updatedAt || t.createdAt)}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                  <button
                    onClick={e => { e.stopPropagation(); setRenaming(t.id); setRenameVal(t.name); }}
                    aria-label="Rename conversation"
                    style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 14, padding: 2 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(t.id); }}
                    aria-label="Delete conversation"
                    style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 14, padding: 2 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   IMAGE PASTE PREVIEW
───────────────────────────────────────────── */
function ImagePreview({ src, onRemove }) {
  if (!src) return null;
  return (
    <div style={{
      position: "relative", display: "inline-block",
      margin: "4px 0", borderRadius: 10, overflow: "hidden",
      border: "1px solid #334155",
    }}>
      <img src={src} alt="Pasted attachment"
        style={{ maxHeight: 120, maxWidth: 220, objectFit: "contain", display: "block", background: "#0a0f1e" }} />
      <button
        onClick={onRemove}
        aria-label="Remove attachment"
        style={{
          position: "absolute", top: 4, right: 4,
          background: "rgba(0,0,0,0.7)", border: "none",
          borderRadius: "50%", width: 20, height: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "white", fontSize: 12,
        }}>✕</button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   EXPORT UTILITIES
───────────────────────────────────────────── */
function exportJSON(thread) {
  const blob = new Blob([JSON.stringify({ name: thread.name, messages: thread.messages }, null, 2)], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = `${thread.name.replace(/\s+/g, "_")}.json`; a.click();
}

function exportMarkdown(thread) {
  const md = thread.messages.map(m =>
    `**${m.role === "user" ? "Teacher" : "AI Assistant"}** (${formatTime(m.timestamp)})\n\n${m.content}\n\n---\n`
  ).join("\n");
  const blob = new Blob([`# ${thread.name}\n\n${md}`], { type: "text/markdown" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = `${thread.name.replace(/\s+/g, "_")}.md`; a.click();
}

function exportText(thread) {
  const txt = thread.messages.map(m =>
    `[${m.role === "user" ? "Teacher" : "AI"}] ${formatTime(m.timestamp)}\n${m.content}`
  ).join("\n\n---\n\n");
  const blob = new Blob([txt], { type: "text/plain" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = `${thread.name.replace(/\s+/g, "_")}.txt`; a.click();
}

/* ─────────────────────────────────────────────
   THREAD HELPERS
───────────────────────────────────────────── */
function blankThread(name = "New Conversation") {
  return {
    id: `thread_${Date.now()}_${++_uid}`,
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    context: "general",
  };
}

function loadThreads() {
  try {
    const raw = localStorage.getItem(LS_THREADS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveThreads(threads) {
  try {
    const str = JSON.stringify(threads);
    if (lsBytes(str) > LS_SIZE_WARN) {
      // auto-trim: drop oldest messages from largest thread until under limit
      const sorted = [...threads].sort((a, b) => b.messages.length - a.messages.length);
      if (sorted[0].messages.length > 10) {
        sorted[0].messages = sorted[0].messages.slice(-50);
        return saveThreads(sorted);
      }
    }
    localStorage.setItem(LS_THREADS_KEY, str);
    return true;
  } catch { return false; }
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function AITutor() {
  const navigate    = useNavigate();
  const [toast, setToast] = useState(null); // { message, type }

  /* ── 1. Auth check ─────────────────────────────── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user  = JSON.parse(localStorage.getItem("user") || "null");
    if (!token || !user) navigate("/login", { replace: true });
  }, [navigate]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  /* ── Thread state ───────────────────────────────── */
  const [threads, setThreads] = useState(() => {
    const saved = loadThreads();
    if (saved && saved.length > 0) return saved;
    const t = blankThread("My First Conversation");
    return [t];
  });

  const [activeThreadId, setActiveThreadId] = useState(() => {
    const saved = localStorage.getItem(LS_ACTIVE_KEY);
    const ts = loadThreads();
    if (saved && ts?.find(t => t.id === saved)) return saved;
    return (loadThreads() || [blankThread()])[0]?.id || null;
  });

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];
  const messages     = activeThread?.messages || [];

  /* ── UI state ───────────────────────────────────── */
  const [input, setInput]           = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState("");
  const [context, setContext]       = useState(activeThread?.context || "general");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showThreads, setShowThreads] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [pastedImage, setPastedImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);

  /* ── 3. Abort controller ────────────────────────── */
  const abortRef = useRef(null);

  /* ── Refs ───────────────────────────────────────── */
  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);
  const searchRef      = useRef(null);
  const announcerRef   = useRef(null);
  const typingTimer    = useRef(null);
  const recognition    = useRef(null);

  /* ── Derived ─────────────────────────────────────── */
  const charCount  = input.length;
  const overLimit  = charCount > MAX_CHARS;
  const canSend    = input.trim().length > 0 && !isLoading && !overLimit;

  /* ── Filter messages by search ──────────────────── */
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter(m => m.content?.toLowerCase().includes(q));
  }, [messages, searchQuery]);

  /* ── Scroll to bottom ────────────────────────────── */
  useEffect(() => {
    if (!searchQuery) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, searchQuery]);

  /* ── Persist threads (debounced) ────────────────── */
  const persistThreads = useCallback((ts) => {
    const ok = saveThreads(ts);
    if (!ok) showToast("Storage full — old messages trimmed automatically", "warning");
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedPersist = useCallback(useDebounce(persistThreads, DEBOUNCE_MS), [persistThreads]);

  useEffect(() => {
    debouncedPersist(threads);
    localStorage.setItem(LS_ACTIVE_KEY, activeThreadId);
  }, [threads, activeThreadId, debouncedPersist]);

  /* ── 14. Keyboard shortcuts ─────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "k") { e.preventDefault(); setShowSearch(s => !s); setTimeout(() => searchRef.current?.focus(), 50); }
      if (ctrl && e.key === "l") { e.preventDefault(); handleClearChat(); }
      if (ctrl && e.key === "Enter") { e.preventDefault(); if (canSend) handleSend(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canSend]);

  /* ── Cleanup on unmount ─────────────────────────── */
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      clearTimeout(typingTimer.current);
      recognition.current?.stop();
    };
  }, []);

  /* ── 20. Voice input ─────────────────────────────── */
  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      showToast("Voice input not supported in this browser", "warning");
      return;
    }
    if (isListening) {
      recognition.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition.current = new SpeechRecognition();
    recognition.current.continuous      = false;
    recognition.current.interimResults  = false;
    recognition.current.lang            = "en-US";
    recognition.current.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(prev => prev + (prev ? " " : "") + transcript);
      setIsListening(false);
    };
    recognition.current.onerror = () => setIsListening(false);
    recognition.current.onend   = () => setIsListening(false);
    recognition.current.start();
    setIsListening(true);
  };

  /* ── 13. Paste image ────────────────────────────── */
  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (ev) => setPastedImage(ev.target.result);
        reader.readAsDataURL(blob);
        e.preventDefault();
        break;
      }
    }
  }, []);

  /* ── Toast helper ─────────────────────────────────── */
  const showToast = (message, type = "info") => setToast({ message, type });

  /* ── Thread operations ───────────────────────────── */
  const updateActiveThread = useCallback((updater) => {
    setThreads(prev => prev.map(t =>
      t.id === activeThreadId ? { ...updater(t), updatedAt: Date.now() } : t
    ));
  }, [activeThreadId]);

  const handleNewThread = () => {
    const t = blankThread();
    setThreads(prev => [t, ...prev]);
    setActiveThreadId(t.id);
    setInput(""); setError("");
    setShowThreads(false);
  };

  const handleSelectThread = (id) => {
    setActiveThreadId(id);
    const t = threads.find(x => x.id === id);
    if (t) setContext(t.context || "general");
    setShowThreads(false);
  };

  const handleDeleteThread = (id) => {
    if (threads.length === 1) { showToast("Cannot delete the only conversation", "warning"); return; }
    setThreads(prev => prev.filter(t => t.id !== id));
    if (activeThreadId === id) setActiveThreadId(threads.find(t => t.id !== id)?.id);
  };

  const handleRenameThread = (id, name) => {
    if (!name.trim()) return;
    setThreads(prev => prev.map(t => t.id === id ? { ...t, name: name.trim(), updatedAt: Date.now() } : t));
  };

  /* ── 17. Typing indicator ────────────────────────── */
  const handleInputChange = (e) => {
    setInput(e.target.value);
    setIsUserTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setIsUserTyping(false), 1000);
    // auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  /* ── Core send ────────────────────────────────────── */
  const handleSend = useCallback(async (retryMsg = null) => {
    const text = retryMsg ? retryMsg.content : input.trim();
    if (!text && !pastedImage) return;
    if (isLoading && !retryMsg) return;

    const newUserMsg = retryMsg || {
      id:        uid(),
      role:      "user",
      content:   text,
      image:     pastedImage,
      timestamp: Date.now(),
      status:    "sent",
    };

    if (!retryMsg) {
      setInput(""); setPastedImage(null);
      setIsUserTyping(false);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      updateActiveThread(t => ({
        ...t,
        messages: [...t.messages, newUserMsg],
        // auto-name thread from first user message
        name: t.messages.length === 0 ? text.slice(0, 40) + (text.length > 40 ? "…" : "") : t.name,
      }));
    } else {
      // mark the retried message as pending again
      updateActiveThread(t => ({
        ...t,
        messages: t.messages.map(m => m.id === retryMsg.id ? { ...m, status: "sent" } : m),
      }));
    }

    setIsLoading(true);
    setError("");

    // cancel any previous in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const token = localStorage.getItem("token");
      const history = (activeThread?.messages || [])
        .filter(m => m.status !== "failed" && m.id !== retryMsg?.id)
        .slice(-20)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API}/api/ai/teacher-chat`, {
        method:  "POST",
        signal:  abortRef.current.signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message:       text,
          history,
          context,
          courseContext: null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Server error ${res.status}`);

      const aiMsg = {
        id:        uid(),
        role:      "assistant",
        content:   data.reply,
        timestamp: Date.now(),
        status:    "sent",
      };

      updateActiveThread(t => ({ ...t, messages: [...t.messages, aiMsg] }));

      // 18. Screen reader announcement
      if (announcerRef.current) announcerRef.current.textContent = "AI responded: " + data.reply.slice(0, 80);

    } catch (err) {
      if (err.name === "AbortError") return; // unmounted or cancelled — silent

      const errMsg = err.message?.includes("fetch") || err.message?.includes("network")
        ? "Network error — check your connection and try again."
        : err.message?.includes("401")
        ? "Session expired — please log in again."
        : err.message?.includes("429")
        ? "AI service is busy — please wait a moment and retry."
        : err.message || "Something went wrong. Please retry.";

      setError(errMsg);

      // Mark user message as failed
      updateActiveThread(t => ({
        ...t,
        messages: t.messages.map(m =>
          m.id === newUserMsg.id ? { ...m, status: "failed" } : m
        ),
      }));
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [input, isLoading, pastedImage, context, activeThread, updateActiveThread]);

  /* ── Clear chat ─────────────────────────────────── */
  const handleClearChat = () => {
    if (!window.confirm("Clear this conversation? This cannot be undone.")) return;
    updateActiveThread(t => ({ ...t, messages: [] }));
    showToast("Conversation cleared", "success");
  };

  /* ── Context change ────────────────────────────── */
  const handleContextChange = (ctx) => {
    setContext(ctx);
    updateActiveThread(t => ({ ...t, context: ctx }));
  };

  /* ── Suggestions ────────────────────────────────── */
  const SUGGESTIONS = {
    general:           ["How can I improve student engagement?", "Explain active learning strategies", "Give me tips for remote teaching"],
    lesson_planning:   ["Help me design a lesson on fractions for grade 5", "Create a 45-minute lesson outline on photosynthesis", "Suggest project-based learning activities for history"],
    assessment:        ["Create a rubric for a research paper", "Design a formative assessment for algebra", "What are alternatives to traditional exams?"],
    student_support:   ["How to help a struggling student catch up?", "Strategies for managing disruptive behavior", "How to support students with learning disabilities?"],
    content_generation:["Write 5 quiz questions on the water cycle", "Create a case study for business ethics class", "Generate discussion prompts for Romeo and Juliet"],
  };

  const suggestions = SUGGESTIONS[context] || SUGGESTIONS.general;

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <div style={{ fontFamily: "'Lexend', sans-serif" }}>
      {/* Live region for screen readers — feature 18 */}
      <div ref={announcerRef} aria-live="polite" aria-atomic="true"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }} />

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── HERO ─────────────────────────────────── */}
      <div style={{
        position: "relative", borderRadius: 20, overflow: "hidden",
        padding: "28px 32px", marginBottom: 20,
        background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)",
        border: "1px solid #1e293b",
      }}>
        <div style={{ position: "absolute", top: 0, left: "25%", width: 200, height: 200, borderRadius: "50%", filter: "blur(80px)", opacity: 0.2, background: "#6366f1", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, right: "20%", width: 180, height: 180, borderRadius: "50%", filter: "blur(80px)", opacity: 0.15, background: "#a855f7", pointerEvents: "none" }} />
        <div style={{ position: "relative", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 8px #6366f1", animation: "pulse 2s infinite", display: "inline-block" }} />
              <p style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: 2, margin: 0 }}>SmartAcademia · AI Teaching Assistant</p>
            </div>
            <h1 style={{ fontSize: "clamp(20px, 4vw, 30px)", fontWeight: 900, color: "white", margin: "0 0 4px", letterSpacing: -0.5 }}>
              AI Tutor
            </h1>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
              {messages.length} messages in "{activeThread?.name || "Conversation"}"
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {/* Search toggle — Ctrl+K */}
            <button onClick={() => { setShowSearch(s => !s); setTimeout(() => searchRef.current?.focus(), 50); }}
              aria-label="Toggle search (Ctrl+K)"
              title="Search messages (Ctrl+K)"
              style={{ ...btnStyle("#334155", "#94a3b8"), display: "flex", alignItems: "center", gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>search</span>
              <span style={{ fontSize: 11 }}>Ctrl+K</span>
            </button>
            {/* Threads */}
            <button onClick={() => setShowThreads(s => !s)}
              aria-label="Manage conversations"
              style={{ ...btnStyle("#334155", "#94a3b8"), display: "flex", alignItems: "center", gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chat_bubble</span>
              <span style={{ fontSize: 11 }}>Chats</span>
            </button>
            {/* Export */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowExport(s => !s)}
                aria-label="Export conversation"
                style={{ ...btnStyle("#334155", "#94a3b8"), display: "flex", alignItems: "center", gap: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                <span style={{ fontSize: 11 }}>Export</span>
              </button>
              {showExport && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 50,
                  background: "#0f1629", border: "1px solid #1e293b", borderRadius: 12,
                  padding: 8, minWidth: 160, boxShadow: "0 16px 48px #00000088",
                }}>
                  {[
                    { label: "Export as JSON",     icon: "data_object",  fn: () => exportJSON(activeThread) },
                    { label: "Export as Markdown", icon: "description",  fn: () => exportMarkdown(activeThread) },
                    { label: "Export as Text",     icon: "article",      fn: () => exportText(activeThread) },
                  ].map(item => (
                    <button key={item.label}
                      onClick={() => { item.fn(); setShowExport(false); showToast("Exported!", "success"); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", background: "none", border: "none",
                        color: "#94a3b8", padding: "9px 12px", cursor: "pointer",
                        borderRadius: 8, fontSize: 12, fontFamily: "'Lexend', sans-serif",
                        textAlign: "left",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.color = "white"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#94a3b8"; }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Clear — Ctrl+L */}
            <button onClick={handleClearChat}
              aria-label="Clear conversation (Ctrl+L)"
              title="Clear conversation (Ctrl+L)"
              style={{ ...btnStyle("#ef444422", "#f87171"), display: "flex", alignItems: "center", gap: 6, border: "1px solid #ef444444" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete_sweep</span>
              <span style={{ fontSize: 11 }}>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTEXT SELECTOR ─────────────────────── */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }} role="group" aria-label="Select assistant mode">
        {CONTEXTS.map(c => (
          <button key={c.id}
            onClick={() => handleContextChange(c.id)}
            aria-pressed={context === c.id}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s", fontFamily: "'Lexend', sans-serif",
              background: context === c.id ? "#6366f122" : "transparent",
              color: context === c.id ? "#818cf8" : "#64748b",
              border: `1px solid ${context === c.id ? "#6366f155" : "#1e293b"}`,
              boxShadow: context === c.id ? "0 0 16px #6366f122" : "none",
              minHeight: 36, // 11. touch target
            }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{c.icon}</span>
            {c.label}
          </button>
        ))}
      </div>

      {/* ── SEARCH BAR (8) ─────────────────────────── */}
      {showSearch && (
        <div style={{ marginBottom: 12, position: "relative" }}>
          <span className="material-symbols-outlined" style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            color: "#64748b", fontSize: 18, pointerEvents: "none",
          }}>search</span>
          <input
            ref={searchRef}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search messages…"
            aria-label="Search in chat history"
            style={{
              width: "100%", paddingLeft: 40, paddingRight: 40,
              paddingBlock: 10,
              background: "#1e293b", border: "1px solid #334155",
              borderRadius: 12, color: "white", fontSize: 14,
              fontFamily: "'Lexend', sans-serif", boxSizing: "border-box",
              outline: "none",
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>✕</button>
          )}
          {searchQuery && (
            <p style={{ fontSize: 11, color: "#64748b", margin: "4px 0 0 4px" }}>
              {filteredMessages.length} result{filteredMessages.length !== 1 ? "s" : ""} for "{searchQuery}"
            </p>
          )}
        </div>
      )}

      {/* ── MAIN CHAT CONTAINER ──────────────────── */}
      <div style={{
        borderRadius: 20, overflow: "hidden",
        display: "flex", flexDirection: "column",
        background: "#0f1629", border: "1px solid #1e293b",
        height: "calc(100vh - 320px)", minHeight: 400,
        position: "relative",
      }}>
        {/* Thread panel */}
        {showThreads && (
          <ThreadPanel
            threads={threads}
            activeId={activeThreadId}
            onSelect={handleSelectThread}
            onCreate={handleNewThread}
            onDelete={handleDeleteThread}
            onRename={handleRenameThread}
            onClose={() => setShowThreads(false)}
          />
        )}

        {/* Messages */}
        <div
          role="log"
          aria-label="Chat messages"
          aria-live="polite"
          style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}
        >
          {filteredMessages.length === 0 && !isLoading && (
            <div style={{ textAlign: "center", paddingTop: 40 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20, margin: "0 auto 16px",
                background: "linear-gradient(135deg, #6366f122, #a855f722)",
                border: "1px solid #6366f133",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#6366f1" }}>smart_toy</span>
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "white", margin: "0 0 6px" }}>
                {searchQuery ? "No messages match your search" : "Ask your teaching assistant anything"}
              </p>
              {!searchQuery && (
                <>
                  <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>
                    Specialised for {CONTEXTS.find(c => c.id === context)?.label}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 420, margin: "0 auto" }}>
                    {suggestions.map(s => (
                      <button key={s} onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                        style={{
                          textAlign: "left", padding: "10px 14px", borderRadius: 12, cursor: "pointer",
                          background: "#1e293b", border: "1px solid #334155", color: "#cbd5e1",
                          fontSize: 12, fontFamily: "'Lexend', sans-serif", transition: "all 0.15s",
                          minHeight: 44, // 11. touch target
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#334155"; e.currentTarget.style.borderColor = "#6366f1"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.borderColor = "#334155"; }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle", marginRight: 8, color: "#6366f1" }}>quiz</span>
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {filteredMessages.map((msg, idx) => {
            const prev = filteredMessages[idx - 1];
            const showDate = !prev || formatDate(msg.timestamp) !== formatDate(prev.timestamp);
            return (
              <MessageBubble
                key={msg.id}
                msg={msg}
                onRetry={msg.status === "failed" ? handleSend : null}
                highlight={searchQuery}
                showDate={showDate}
              />
            );
          })}

          {/* 19. Typing indicator */}
          {isLoading && <TypingDots />}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Error banner ─────────────────────────── */}
        {error && (
          <div role="alert" style={{
            margin: "0 12px 8px", padding: "10px 14px", borderRadius: 12,
            background: "#1a0a0a", border: "1px solid #ef444433",
            display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
          }}>
            <span className="material-symbols-outlined" style={{ color: "#f87171", fontSize: 18, flexShrink: 0 }}>error</span>
            <p style={{ flex: 1, margin: 0, fontSize: 12, color: "#f87171" }}>{error}</p>
            <button onClick={() => setError("")}
              style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", lineHeight: 1 }}>✕</button>
          </div>
        )}

        {/* ── Image attachment preview ─────────────── */}
        {pastedImage && (
          <div style={{ padding: "0 12px 4px", flexShrink: 0 }}>
            <ImagePreview src={pastedImage} onRemove={() => setPastedImage(null)} />
          </div>
        )}

        {/* ── Input area ───────────────────────────── */}
        <div style={{ padding: 12, borderTop: "1px solid #1e293b", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            {/* 20. Voice button */}
            <button
              onClick={toggleVoice}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              aria-pressed={isListening}
              style={{
                flexShrink: 0, width: 40, height: 40, borderRadius: 12,
                border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                background: isListening ? "#ef444422" : "#1e293b",
                color: isListening ? "#f87171" : "#64748b",
                transition: "all 0.2s",
                animation: isListening ? "pulse 1s infinite" : "none",
                minWidth: 44, minHeight: 44, // 11. touch target
              }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {isListening ? "mic" : "mic_none"}
              </span>
            </button>

            {/* Textarea */}
            <div style={{ flex: 1, position: "relative" }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (canSend) handleSend(); }
                }}
                onPaste={handlePaste}
                placeholder={`Ask about ${CONTEXTS.find(c => c.id === context)?.label.toLowerCase()}… (Enter to send, Shift+Enter for new line)`}
                aria-label="Message input"
                aria-describedby="char-counter"
                rows={1}
                style={{
                  width: "100%", resize: "none", background: "#1e293b",
                  border: `1px solid ${overLimit ? "#ef4444" : error ? "#ef444466" : "#334155"}`,
                  borderRadius: 14, color: "white",
                  fontSize: 16, // 11. iOS zoom fix
                  fontFamily: "'Lexend', sans-serif",
                  padding: "10px 14px 10px 14px",
                  lineHeight: 1.5, outline: "none", boxSizing: "border-box",
                  minHeight: 44, maxHeight: 120, overflowY: "auto",
                  transition: "border-color 0.2s",
                }}
              />
              {/* 6. Char counter */}
              <span id="char-counter" aria-live="polite"
                style={{
                  position: "absolute", bottom: 6, right: 10,
                  fontSize: 10, color: overLimit ? "#f87171" : charCount > MAX_CHARS * 0.8 ? "#fbbf24" : "#475569",
                  pointerEvents: "none", fontVariantNumeric: "tabular-nums",
                }}>
                {charCount}/{MAX_CHARS}
              </span>
            </div>

            {/* Send */}
            <button
              onClick={() => handleSend()}
              disabled={!canSend}
              aria-label="Send message (Ctrl+Enter)"
              style={{
                flexShrink: 0, width: 44, height: 44, borderRadius: 14,
                border: "none", cursor: canSend ? "pointer" : "not-allowed",
                background: canSend ? "linear-gradient(135deg, #6366f1, #818cf8)" : "#1e293b",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: canSend ? 1 : 0.4, transition: "all 0.2s",
                boxShadow: canSend ? "0 0 16px #6366f144" : "none",
                minWidth: 44, minHeight: 44, // 11. touch target
              }}>
              {isLoading
                ? <svg style={{ animation: "spin 1s linear infinite", width: 18, height: 18 }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                : <span className="material-symbols-outlined" style={{ fontSize: 20, color: "white" }}>send</span>
              }
            </button>
          </div>

          {/* Hints */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, paddingInline: 4 }}>
            <p style={{ fontSize: 10, color: "#334155", margin: 0 }}>
              Ctrl+K search · Ctrl+L clear · Paste image to attach
            </p>
            {isUserTyping && (
              <p style={{ fontSize: 10, color: "#475569", margin: 0, fontStyle: "italic" }}>typing…</p>
            )}
          </div>
        </div>
      </div>

      {/* Global keyframe animations */}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        @keyframes spin  { to { transform: rotate(360deg); } }
        .group:hover .group-hover\\:opacity-100 { opacity: 1 !important; }
      `}</style>
    </div>
  );
}

/* ── Tiny button style helper ───────────────────── */
function btnStyle(bg, color) {
  return {
    background: bg, color, border: `1px solid ${color}33`,
    borderRadius: 10, padding: "7px 12px", cursor: "pointer",
    fontSize: 12, fontFamily: "'Lexend', sans-serif",
    fontWeight: 600, transition: "all 0.18s",
    minHeight: 36, // 11. touch target
  };
}