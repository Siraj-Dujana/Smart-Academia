/**
 * StudentAITutor.jsx — Student AI Learning Assistant
 * 
 * Features:
 *  1.  Auth check + redirect
 *  2.  Collision-safe message IDs via useRef counter
 *  3.  AbortController — cancels in-flight requests on unmount
 *  4.  Per-message retry button for failed sends
 *  5.  Copy-to-clipboard on AI messages
 *  6.  4000-char input limit + live counter
 *  7.  Export as JSON / Markdown / plain text
 *  8.  In-chat search with highlight
 *  9.  Typing indicator + improved loading animation
 * 10.  Descriptive error messages
 * 11.  Mobile: 16px inputs, 44px touch targets, responsive layout
 * 12.  localStorage size guard + auto-trim
 * 13.  Paste image → base64 attachment preview
 * 14.  Keyboard shortcuts: Ctrl+K search, Ctrl+L clear, Ctrl+Enter send
 * 15.  Conversation threads (named, saved, timestamp)
 * 16.  Code block syntax highlighting + copy per block
 * 17.  React.memo on MessageBubble, debounced localStorage save
 * 18.  ARIA labels, live region for new messages
 * 19.  Animated typing dots
 * 20.  Voice input via Web Speech API
 * 21.  Course context selector
 * 22.  Full Markdown support with tables, lists, code blocks
 */

import React, {
  useState, useEffect, useRef, useCallback,
  useMemo, memo,
} from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const MAX_CHARS = 4000;
const LS_THREADS_KEY = "ai_student_threads";
const LS_ACTIVE_KEY = "ai_student_active_thread";
const LS_SIZE_WARN = 4.5 * 1024 * 1024;
const DEBOUNCE_MS = 800;

const COURSE_CONTEXTS = [
  { id: "all", label: "All Courses", icon: "school", color: "#6366f1" },
  { id: "programming", label: "Programming Help", icon: "code", color: "#22c55e" },
  { id: "math", label: "Math & Logic", icon: "calculate", color: "#f59e0b" },
  { id: "science", label: "Science", icon: "science", color: "#a855f7" },
  { id: "writing", label: "Writing Help", icon: "edit_note", color: "#14b8a6" },
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

function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ─────────────────────────────────────────────
   COLOR PALETTE
───────────────────────────────────────────── */
const C = {
  bg: "#070d1a", surface: "#0f1629", surface2: "#0a0f1e",
  border: "#1e293b", border2: "#334155",
  accent: "#6366f1", accent2: "#a855f7", amber: "#f59e0b",
  green: "#22c55e", red: "#ef4444", cyan: "#14b8a6",
  text: "#f1f5f9", textDim: "#94a3b8", textFaint: "#64748b",
  indigoLight: "#818cf8", greenLight: "#4ade80",
  amberLight: "#fbbf24", redLight: "#f87171", purpleLight: "#c084fc",
};

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
    <div style={{ margin: "10px 0", borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border2}` }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: C.surface2, padding: "6px 12px",
        borderBottom: `1px solid ${C.border2}`,
      }}>
        <span style={{ fontSize: 10, color: C.textFaint, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1 }}>
          {lang || "code"}
        </span>
        <button
          onClick={copy}
          aria-label="Copy code"
          style={{
            display: "flex", alignItems: "center", gap: 4, fontSize: 10,
            color: copied ? C.greenLight : C.textFaint, background: "none", border: "none",
            cursor: "pointer", padding: "2px 6px", borderRadius: 4, transition: "color 0.2s",
          }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            {copied ? "check" : "content_copy"}
          </span>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre style={{
        margin: 0, padding: "14px 16px", overflowX: "auto", fontSize: 12,
        lineHeight: 1.6, background: "#020817", color: C.textDim,
        fontFamily: "'Fira Code', 'Cascadia Code', monospace",
      }}>
        <code>{content}</code>
      </pre>
    </div>
  );
});

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

  const highlightText = (text) => {
    if (!highlight) return text;
    const regex = new RegExp(`(${escapeRx(highlight)})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark key={i} style={{ background: `${C.amber}55`, color: C.amberLight, borderRadius: 2, padding: "0 2px" }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Function to highlight text inside ReactMarkdown children
  const highlightChildren = (children) => {
    if (typeof children === 'string') return highlightText(children);
    if (Array.isArray(children)) {
      return children.map(child => {
        if (typeof child === 'string') return highlightText(child);
        return child;
      });
    }
    return children;
  };

  return (
    <>
      {showDate && (
        <div style={{ textAlign: "center", margin: "12px 0 4px" }}>
          <span style={{ fontSize: 10, color: C.textFaint, background: C.surface, padding: "2px 10px", borderRadius: 99, border: `1px solid ${C.border}` }}>
            {formatDate(msg.timestamp)}
          </span>
        </div>
      )}

      <div
        className={`group flex items-start gap-2 w-full ${isUser ? "flex-row-reverse" : "flex-row"}`}
        role="article"
        aria-label={`${isUser ? "You" : "AI Tutor"}: ${msg.content?.slice(0, 60)}`}
      >
        {/* Avatar */}
        <div style={{
          flexShrink: 0, width: 32, height: 32, borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: isUser
            ? `linear-gradient(135deg, ${C.accent}, ${C.accent2})`
            : `linear-gradient(135deg, ${C.accent2}, ${C.accent})`,
          boxShadow: `0 0 12px ${isUser ? `${C.accent}88` : `${C.accent2}88`}`,
        }}>
          {isUser
            ? <span style={{ fontSize: 13, fontWeight: 900, color: "white" }}>S</span>
            : <span className="material-symbols-outlined" style={{ fontSize: 16, color: "white" }}>smart_toy</span>}
        </div>

        {/* Bubble */}
        <div style={{ maxWidth: "calc(100% - 80px)", display: "flex", flexDirection: "column", gap: 4,
          alignItems: isUser ? "flex-end" : "flex-start" }}>
          <div style={{
            padding: "10px 14px",
            borderRadius: isUser ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
            background: isUser ? `linear-gradient(135deg, ${C.accent}, ${C.accent2})` : C.surface2,
            border: isUser ? "none" : `1px solid ${C.border}`,
            color: isUser ? "white" : C.text,
            boxShadow: isUser ? `0 0 20px ${C.accent}44` : "none",
            opacity: isFailed ? 0.6 : 1,
            position: "relative",
          }}>
            {isUser ? (
              <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
                {highlight ? highlightText(msg.content) : msg.content}
              </p>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({ children }) => <p style={{ margin: "0 0 6px 0", fontSize: 12, lineHeight: 1.6 }}>{highlightChildren(children)}</p>,
                  strong: ({ children }) => <strong style={{ color: C.purpleLight, fontWeight: 700, fontSize: 12 }}>{children}</strong>,
                  em: ({ children }) => <em style={{ color: C.textDim, fontSize: 12 }}>{children}</em>,
                  ul: ({ children }) => <ul style={{ margin: "4px 0 6px 18px", paddingLeft: 0, listStyleType: "disc", fontSize: 12 }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ margin: "4px 0 6px 18px", paddingLeft: 0, listStyleType: "decimal", fontSize: 12 }}>{children}</ol>,
                  li: ({ children }) => <li style={{ marginBottom: 3, lineHeight: 1.5, fontSize: 12 }}>{children}</li>,
                  h1: ({ children }) => <h1 style={{ fontSize: 16, fontWeight: "bold", marginTop: 10, marginBottom: 5, color: C.text }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ fontSize: 14, fontWeight: "bold", marginTop: 8, marginBottom: 4, color: C.text }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ fontSize: 13, fontWeight: "bold", marginTop: 6, marginBottom: 3, color: C.text }}>{children}</h3>,
                  code: ({ children, inline }) => inline
                    ? <code style={{ background: C.border, color: C.indigoLight, padding: "1px 4px", borderRadius: 4, fontSize: 11, fontFamily: "monospace" }}>{children}</code>
                    : <CodeBlock lang="javascript" content={String(children)} />,
                  pre: ({ children }) => <pre style={{ margin: "6px 0", overflow: "auto" }}>{children}</pre>,
                  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: C.cyan, textDecoration: "underline", fontSize: 12 }}>{children}</a>,
                  hr: () => <hr style={{ borderColor: C.border, margin: "10px 0" }} />,
                  blockquote: ({ children }) => <blockquote style={{ borderLeft: `3px solid ${C.accent}`, paddingLeft: 10, margin: "6px 0", color: C.textDim, fontStyle: "italic", fontSize: 12 }}>{children}</blockquote>,
                  table: ({ children }) => <div className="overflow-x-auto my-2"><table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>{children}</table></div>,
                  th: ({ children }) => <th style={{ border: `1px solid ${C.border}`, padding: "6px 8px", background: C.surface2, color: C.text, fontWeight: "bold" }}>{children}</th>,
                  td: ({ children }) => <td style={{ border: `1px solid ${C.border}`, padding: "6px 8px", color: C.textDim }}>{children}</td>,
                }}
              >
                {msg.content}
              </ReactMarkdown>
            )}
          </div>

          {/* Meta row */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, paddingInline: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, color: C.textFaint }}>{formatTime(msg.timestamp)}</span>

            {msg.edited && <span style={{ fontSize: 9, color: C.textFaint }}>(edited)</span>}

            {isFailed && (
              <>
                <span style={{ fontSize: 10, color: C.redLight }}>Failed</span>
                {onRetry && (
                  <button
                    onClick={() => onRetry(msg)}
                    aria-label="Retry sending this message"
                    style={{
                      fontSize: 10, color: C.indigoLight, background: `${C.accent}22`,
                      border: `1px solid ${C.accent}44`, borderRadius: 6,
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
                  opacity: 0, fontSize: 10, color: copied ? C.greenLight : C.textFaint,
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
        background: `linear-gradient(135deg, ${C.accent2}, ${C.accent})`,
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: "white" }}>smart_toy</span>
      </div>
      <div style={{
        padding: "10px 14px", borderRadius: "4px 18px 18px 18px",
        background: C.surface2, border: `1px solid ${C.border}`,
      }}>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              width: 7, height: 7, borderRadius: "50%",
              background: C.accent,
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
    info: { bg: `${C.accent}22`, border: C.accent, text: C.indigoLight },
    success: { bg: `${C.green}22`, border: C.green, text: C.greenLight },
    warning: { bg: `${C.amber}22`, border: C.amber, text: C.amberLight },
    error: { bg: `${C.red}22`, border: C.red, text: C.redLight },
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
───────────────────────────────────────────── */
function ThreadPanel({ threads, activeId, onSelect, onCreate, onDelete, onRename, onClose }) {
  const [renaming, setRenaming] = useState(null);
  const [renameVal, setRenameVal] = useState("");

  return (
    <div style={{
      position: "absolute", top: 0, left: 0, bottom: 0, width: 240,
      background: C.bg, borderRight: `1px solid ${C.border}`,
      zIndex: 30, display: "flex", flexDirection: "column",
      animation: "slideInLeft 0.25s ease",
    }}>
      <style>{`@keyframes slideInLeft { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }`}</style>
      <div style={{
        padding: "14px 16px", display: "flex", alignItems: "center",
        justifyContent: "space-between", borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Conversations</span>
        <button onClick={onClose} aria-label="Close conversations panel"
          style={{ background: "none", border: "none", color: C.textFaint, cursor: "pointer", fontSize: 18 }}>✕</button>
      </div>

      <button onClick={onCreate} style={{
        margin: "10px 12px 4px",
        background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
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
              background: t.id === activeId ? `${C.accent}22` : "transparent",
              border: `1px solid ${t.id === activeId ? `${C.accent}55` : "transparent"}`,
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
                    width: "100%", background: C.surface2, border: `1px solid ${C.accent}`,
                    borderRadius: 6, padding: "4px 8px", color: C.text, fontSize: 12,
                  }}
                  onBlur={() => { onRename(t.id, renameVal); setRenaming(null); }}
                />
              </form>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {t.name}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 10, color: C.textFaint }}>
                    {t.messages?.length || 0} messages · {formatDate(t.updatedAt || t.createdAt)}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                  <button
                    onClick={e => { e.stopPropagation(); setRenaming(t.id); setRenameVal(t.name); }}
                    aria-label="Rename conversation"
                    style={{ background: "none", border: "none", color: C.textFaint, cursor: "pointer", fontSize: 14, padding: 2 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(t.id); }}
                    aria-label="Delete conversation"
                    style={{ background: "none", border: "none", color: C.textFaint, cursor: "pointer", fontSize: 14, padding: 2 }}>
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
      border: `1px solid ${C.border}`,
    }}>
      <img src={src} alt="Pasted attachment"
        style={{ maxHeight: 120, maxWidth: 220, objectFit: "contain", display: "block", background: C.surface2 }} />
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
    `**${m.role === "user" ? "Student" : "AI Tutor"}** (${formatTime(m.timestamp)})\n\n${m.content}\n\n---\n`
  ).join("\n");
  const blob = new Blob([`# ${thread.name}\n\n${md}`], { type: "text/markdown" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = `${thread.name.replace(/\s+/g, "_")}.md`; a.click();
}

function exportText(thread) {
  const txt = thread.messages.map(m =>
    `[${m.role === "user" ? "Student" : "AI"}] ${formatTime(m.timestamp)}\n${m.content}`
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
    context: "all",
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
   MAIN COMPONENT - Student AI Tutor
───────────────────────────────────────────── */
export default function StudentAITutor() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  /* Auth check */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!token || !user) navigate("/login", { replace: true });
  }, [navigate]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  /* Thread state */
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
  const messages = activeThread?.messages || [];

  /* UI state */
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [context, setContext] = useState(activeThread?.context || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showThreads, setShowThreads] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [pastedImage, setPastedImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  /* Abort controller */
  const abortRef = useRef(null);

  /* Refs */
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const searchRef = useRef(null);
  const announcerRef = useRef(null);
  const typingTimer = useRef(null);
  const recognition = useRef(null);

  /* Derived */
  const charCount = input.length;
  const overLimit = charCount > MAX_CHARS;
  const canSend = input.trim().length > 0 && !isLoading && !overLimit;

  /* Filter messages */
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter(m => m.content?.toLowerCase().includes(q));
  }, [messages, searchQuery]);

  /* Scroll to bottom */
  useEffect(() => {
    if (!searchQuery) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, searchQuery]);

  /* Fetch enrolled courses */
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/api/courses/enrolled`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setCourses(data.courses || []);
      } catch { /* silent */ }
    };
    fetchCourses();
  }, []);

  /* Persist threads */
  const persistThreads = useCallback((ts) => {
    const ok = saveThreads(ts);
    if (!ok) showToast("Storage full — old messages trimmed automatically", "warning");
  }, []);

  const debouncedPersist = useCallback(useDebounce(persistThreads, DEBOUNCE_MS), [persistThreads]);

  useEffect(() => {
    debouncedPersist(threads);
    localStorage.setItem(LS_ACTIVE_KEY, activeThreadId);
  }, [threads, activeThreadId, debouncedPersist]);

  /* Keyboard shortcuts */
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

  /* Cleanup */
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      clearTimeout(typingTimer.current);
      recognition.current?.stop();
    };
  }, []);

  /* Voice input */
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
    recognition.current.continuous = false;
    recognition.current.interimResults = false;
    recognition.current.lang = "en-US";
    recognition.current.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(prev => prev + (prev ? " " : "") + transcript);
      setIsListening(false);
    };
    recognition.current.onerror = () => setIsListening(false);
    recognition.current.onend = () => setIsListening(false);
    recognition.current.start();
    setIsListening(true);
  };

  /* Paste image */
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

  /* Toast helper */
  const showToast = (message, type = "info") => setToast({ message, type });

  /* Thread operations */
  const updateActiveThread = useCallback((updater) => {
    setThreads(prev => prev.map(t =>
      t.id === activeThreadId ? { ...updater(t), updatedAt: Date.now() } : t
    ));
  }, [activeThreadId]);

  const handleNewThread = () => {
    const t = blankThread();
    setThreads(prev => [t, ...prev]);
    setActiveThreadId(t.id);
    setInput("");
    setError("");
    setShowThreads(false);
  };

  const handleSelectThread = (id) => {
    setActiveThreadId(id);
    const t = threads.find(x => x.id === id);
    if (t) setContext(t.context || "all");
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

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setIsUserTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setIsUserTyping(false), 1000);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  /* Core send */
  const handleSend = useCallback(async (retryMsg = null) => {
    const text = retryMsg ? retryMsg.content : input.trim();
    if (!text && !pastedImage) return;
    if (isLoading && !retryMsg) return;

    const newUserMsg = retryMsg || {
      id: uid(),
      role: "user",
      content: text,
      image: pastedImage,
      timestamp: Date.now(),
      status: "sent",
    };

    if (!retryMsg) {
      setInput("");
      setPastedImage(null);
      setIsUserTyping(false);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      updateActiveThread(t => ({
        ...t,
        messages: [...t.messages, newUserMsg],
        name: t.messages.length === 0 ? text.slice(0, 40) + (text.length > 40 ? "…" : "") : t.name,
      }));
    } else {
      updateActiveThread(t => ({
        ...t,
        messages: t.messages.map(m => m.id === retryMsg.id ? { ...m, status: "sent" } : m),
      }));
    }

    setIsLoading(true);
    setError("");

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const token = localStorage.getItem("token");
      const history = (activeThread?.messages || [])
        .filter(m => m.status !== "failed" && m.id !== retryMsg?.id)
        .slice(-20)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API}/api/ai/student-chat`, {
        method: "POST",
        signal: abortRef.current.signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message: text,
          history,
          courseId: selectedCourse || null,
          context: context !== "all" ? context : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Server error ${res.status}`);

      const aiMsg = {
        id: uid(),
        role: "assistant",
        content: data.reply,
        timestamp: Date.now(),
        status: "sent",
      };

      updateActiveThread(t => ({ ...t, messages: [...t.messages, aiMsg] }));

      if (announcerRef.current) announcerRef.current.textContent = "AI responded: " + data.reply.slice(0, 80);

    } catch (err) {
      if (err.name === "AbortError") return;

      const errMsg = err.message?.includes("fetch") || err.message?.includes("network")
        ? "Network error — check your connection and try again."
        : err.message?.includes("401")
        ? "Session expired — please log in again."
        : err.message?.includes("429")
        ? "AI service is busy — please wait a moment and retry."
        : err.message || "Something went wrong. Please retry.";

      setError(errMsg);

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
  }, [input, isLoading, pastedImage, context, selectedCourse, activeThread, updateActiveThread]);

  const handleClearChat = () => {
    if (!window.confirm("Clear this conversation? This cannot be undone.")) return;
    updateActiveThread(t => ({ ...t, messages: [] }));
    showToast("Conversation cleared", "success");
  };

  const handleContextChange = (ctx) => {
    setContext(ctx);
    updateActiveThread(t => ({ ...t, context: ctx }));
  };

  /* Student suggestions */
  const SUGGESTIONS = {
    all: [
      "Explain recursion with a simple example",
      "What is the difference between stack and queue?",
      "How does binary search work?",
      "Explain object-oriented programming concepts",
      "What is time complexity and why does it matter?",
      "Help me understand linked lists",
    ],
    programming: [
      "How do I fix this Python error?",
      "Explain closures in JavaScript",
      "What's the difference between let, const, and var?",
      "Help me understand async/await",
      "How does React's useEffect work?",
      "What are Python decorators?",
    ],
    math: [
      "Explain limits in calculus",
      "What is the Pythagorean theorem?",
      "How to solve quadratic equations?",
      "Explain matrix multiplication",
      "What are derivatives used for?",
      "Help me understand probability",
    ],
    science: [
      "Explain Newton's laws of motion",
      "What is cellular respiration?",
      "How does photosynthesis work?",
      "Explain the periodic table trends",
      "What is the difference between speed and velocity?",
      "Explain DNA replication",
    ],
    writing: [
      "How to write a strong thesis statement?",
      "Help me outline my essay",
      "What are transition words for?",
      "How to avoid passive voice?",
      "Explain MLA vs APA format",
      "Help me improve my vocabulary",
    ],
  };

  const suggestions = SUGGESTIONS[context] || SUGGESTIONS.all;

  /* Tiny button style helper */
  const btnStyle = (bg, color) => ({
    background: bg, color, border: `1px solid ${color}33`,
    borderRadius: 10, padding: "7px 12px", cursor: "pointer",
    fontSize: 12, fontFamily: "'Lexend', sans-serif",
    fontWeight: 600, transition: "all 0.18s",
    minHeight: 36,
  });

  return (
    <div style={{ fontFamily: "'Lexend', sans-serif" }}>
      <div ref={announcerRef} aria-live="polite" aria-atomic="true"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero Section */}
      <div style={{
        position: "relative", borderRadius: 20, overflow: "hidden",
        padding: "28px 32px", marginBottom: 20,
        background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)",
        border: `1px solid ${C.border}`,
      }}>
        <div style={{ position: "absolute", top: 0, left: "25%", width: 200, height: 200, borderRadius: "50%", filter: "blur(80px)", opacity: 0.2, background: C.accent, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, right: "20%", width: 180, height: 180, borderRadius: "50%", filter: "blur(80px)", opacity: 0.15, background: C.accent2, pointerEvents: "none" }} />
        <div style={{ position: "relative", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent, boxShadow: `0 0 8px ${C.accent}`, animation: "pulse 2s infinite", display: "inline-block" }} />
              <p style={{ fontSize: 11, fontWeight: 700, color: C.indigoLight, textTransform: "uppercase", letterSpacing: 2, margin: 0 }}>SmartAcademia · AI Learning Assistant</p>
            </div>
            <h1 style={{ fontSize: "clamp(20px, 4vw, 30px)", fontWeight: 900, color: "white", margin: "0 0 4px", letterSpacing: -0.5 }}>
              AI Tutor
            </h1>
            <p style={{ fontSize: 13, color: C.textFaint, margin: 0 }}>
              {messages.length} messages in "{activeThread?.name || "Conversation"}"
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {/* Course selector */}
            {courses.length > 0 && (
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{ ...btnStyle(C.surface2, C.textDim), display: "flex", alignItems: "center", gap: 6 }}
              >
                <option value="">All Courses</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            )}
            {/* Search toggle */}
            <button onClick={() => { setShowSearch(s => !s); setTimeout(() => searchRef.current?.focus(), 50); }}
              aria-label="Toggle search (Ctrl+K)"
              style={{ ...btnStyle(C.border2, C.textDim), display: "flex", alignItems: "center", gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>search</span>
              <span style={{ fontSize: 11 }}>Ctrl+K</span>
            </button>
            {/* Threads */}
            <button onClick={() => setShowThreads(s => !s)}
              aria-label="Manage conversations"
              style={{ ...btnStyle(C.border2, C.textDim), display: "flex", alignItems: "center", gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chat_bubble</span>
              <span style={{ fontSize: 11 }}>Chats</span>
            </button>
            {/* Export */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowExport(s => !s)}
                aria-label="Export conversation"
                style={{ ...btnStyle(C.border2, C.textDim), display: "flex", alignItems: "center", gap: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                <span style={{ fontSize: 11 }}>Export</span>
              </button>
              {showExport && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 50,
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
                  padding: 8, minWidth: 160, boxShadow: "0 16px 48px #00000088",
                }}>
                  {[
                    { label: "Export as JSON", icon: "data_object", fn: () => exportJSON(activeThread) },
                    { label: "Export as Markdown", icon: "description", fn: () => exportMarkdown(activeThread) },
                    { label: "Export as Text", icon: "article", fn: () => exportText(activeThread) },
                  ].map(item => (
                    <button key={item.label}
                      onClick={() => { item.fn(); setShowExport(false); showToast("Exported!", "success"); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", background: "none", border: "none",
                        color: C.textDim, padding: "9px 12px", cursor: "pointer",
                        borderRadius: 8, fontSize: 12, fontFamily: "'Lexend', sans-serif",
                        textAlign: "left",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.surface2; e.currentTarget.style.color = "white"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.textDim; }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Clear */}
            <button onClick={handleClearChat}
              aria-label="Clear conversation (Ctrl+L)"
              style={{ ...btnStyle(`${C.red}22`, C.redLight), display: "flex", alignItems: "center", gap: 6, border: `1px solid ${C.red}44` }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete_sweep</span>
              <span style={{ fontSize: 11 }}>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Context Selector - Student Focused */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }} role="group" aria-label="Select learning topic">
        {COURSE_CONTEXTS.map(c => (
          <button key={c.id}
            onClick={() => handleContextChange(c.id)}
            aria-pressed={context === c.id}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s", fontFamily: "'Lexend', sans-serif",
              background: context === c.id ? `${c.color}22` : "transparent",
              color: context === c.id ? c.color : C.textFaint,
              border: `1px solid ${context === c.id ? `${c.color}55` : C.border}`,
              boxShadow: context === c.id ? `0 0 16px ${c.color}22` : "none",
              minHeight: 36,
            }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{c.icon}</span>
            {c.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div style={{ marginBottom: 12, position: "relative" }}>
          <span className="material-symbols-outlined" style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            color: C.textFaint, fontSize: 18, pointerEvents: "none",
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
              background: C.surface2, border: `1px solid ${C.border}`,
              borderRadius: 12, color: C.text, fontSize: 14,
              fontFamily: "'Lexend', sans-serif", boxSizing: "border-box",
              outline: "none",
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: C.textFaint, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>✕</button>
          )}
          {searchQuery && (
            <p style={{ fontSize: 11, color: C.textFaint, margin: "4px 0 0 4px" }}>
              {filteredMessages.length} result{filteredMessages.length !== 1 ? "s" : ""} for "{searchQuery}"
            </p>
          )}
        </div>
      )}

      {/* Main Chat Container */}
      <div style={{
        borderRadius: 20, overflow: "hidden",
        display: "flex", flexDirection: "column",
        background: C.surface, border: `1px solid ${C.border}`,
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
                background: `linear-gradient(135deg, ${C.accent}22, ${C.accent2}22)`,
                border: `1px solid ${C.accent}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: C.accent }}>smart_toy</span>
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "white", margin: "0 0 6px" }}>
                {searchQuery ? "No messages match your search" : "Ask your AI Tutor anything"}
              </p>
              {!searchQuery && (
                <>
                  <p style={{ fontSize: 13, color: C.textFaint, marginBottom: 24 }}>
                    Get help with {COURSE_CONTEXTS.find(c => c.id === context)?.label.toLowerCase()}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 420, margin: "0 auto" }}>
                    {suggestions.slice(0, 4).map(s => (
                      <button key={s} onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                        style={{
                          textAlign: "left", padding: "10px 14px", borderRadius: 12, cursor: "pointer",
                          background: C.surface2, border: `1px solid ${C.border}`, color: C.textDim,
                          fontSize: 12, fontFamily: "'Lexend', sans-serif", transition: "all 0.15s",
                          minHeight: 44,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.border; e.currentTarget.style.borderColor = C.accent; }}
                        onMouseLeave={e => { e.currentTarget.style.background = C.surface2; e.currentTarget.style.borderColor = C.border; }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle", marginRight: 8, color: C.accent }}>quiz</span>
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

          {isLoading && <TypingDots />}

          <div ref={messagesEndRef} />
        </div>

        {/* Error banner */}
        {error && (
          <div role="alert" style={{
            margin: "0 12px 8px", padding: "10px 14px", borderRadius: 12,
            background: "#1a0a0a", border: `1px solid ${C.red}33`,
            display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
          }}>
            <span className="material-symbols-outlined" style={{ color: C.redLight, fontSize: 18, flexShrink: 0 }}>error</span>
            <p style={{ flex: 1, margin: 0, fontSize: 12, color: C.redLight }}>{error}</p>
            <button onClick={() => setError("")}
              style={{ background: "none", border: "none", color: C.redLight, cursor: "pointer", lineHeight: 1 }}>✕</button>
          </div>
        )}

        {/* Image attachment preview */}
        {pastedImage && (
          <div style={{ padding: "0 12px 4px", flexShrink: 0 }}>
            <ImagePreview src={pastedImage} onRemove={() => setPastedImage(null)} />
          </div>
        )}

        {/* Input area */}
        <div style={{ padding: 12, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            {/* Voice button */}
            <button
              onClick={toggleVoice}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              aria-pressed={isListening}
              style={{
                flexShrink: 0, width: 40, height: 40, borderRadius: 12,
                border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                background: isListening ? `${C.red}22` : C.surface2,
                color: isListening ? C.redLight : C.textFaint,
                transition: "all 0.2s",
                animation: isListening ? "pulse 1s infinite" : "none",
                minWidth: 44, minHeight: 44,
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
                placeholder={`Ask about ${COURSE_CONTEXTS.find(c => c.id === context)?.label.toLowerCase()}… (Enter to send, Shift+Enter for new line)`}
                aria-label="Message input"
                aria-describedby="char-counter"
                rows={1}
                style={{
                  width: "100%", resize: "none", background: C.surface2,
                  border: `1px solid ${overLimit ? C.red : error ? `${C.red}66` : C.border}`,
                  borderRadius: 14, color: C.text,
                  fontSize: 16,
                  fontFamily: "'Lexend', sans-serif",
                  padding: "10px 14px 10px 14px",
                  lineHeight: 1.5, outline: "none", boxSizing: "border-box",
                  minHeight: 44, maxHeight: 120, overflowY: "auto",
                  transition: "border-color 0.2s",
                }}
              />
              <span id="char-counter" aria-live="polite"
                style={{
                  position: "absolute", bottom: 6, right: 10,
                  fontSize: 10, color: overLimit ? C.redLight : charCount > MAX_CHARS * 0.8 ? C.amberLight : C.textFaint,
                  pointerEvents: "none", fontVariantNumeric: "tabular-nums",
                }}>
                {charCount}/{MAX_CHARS}
              </span>
            </div>

            {/* Send button */}
            <button
              onClick={() => handleSend()}
              disabled={!canSend}
              aria-label="Send message (Ctrl+Enter)"
              style={{
                flexShrink: 0, width: 44, height: 44, borderRadius: 14,
                border: "none", cursor: canSend ? "pointer" : "not-allowed",
                background: canSend ? `linear-gradient(135deg, ${C.accent}, ${C.accent2})` : C.surface2,
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: canSend ? 1 : 0.4, transition: "all 0.2s",
                boxShadow: canSend ? `0 0 16px ${C.accent}44` : "none",
                minWidth: 44, minHeight: 44,
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
            <p style={{ fontSize: 10, color: C.textFaint, margin: 0 }}>
              Ctrl+K search · Ctrl+L clear · Paste image to attach
            </p>
            {isUserTyping && (
              <p style={{ fontSize: 10, color: C.textFaint, margin: 0, fontStyle: "italic" }}>typing…</p>
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