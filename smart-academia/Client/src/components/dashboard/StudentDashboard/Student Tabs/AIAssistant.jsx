import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Design System ───────────────────────────────────────────
const C = {
  bg: "#070d1a",
  surface: "#0f1629",
  border: "#1e293b",
  text: "#f1f5f9",
  muted: "#64748b",
  faint: "#334155",
};

// ── Mini Bar ──────────────────────────────────────────────────
const MiniBar = ({ value = 0, color = "#6366f1", height = 5 }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height, background: "#1e293b" }}>
    <div
      className="h-full rounded-full"
      style={{
        width: `${Math.min(Math.max(value, 0), 100)}%`,
        background: `linear-gradient(90deg, ${color}bb, ${color})`,
        boxShadow: `0 0 10px ${color}55`,
        transition: "width 1s cubic-bezier(.4,0,.2,1)",
      }}
    />
  </div>
);

// ── Glow Card ─────────────────────────────────────────────────
const GlowCard = ({ icon, label, value, color, sub }) => (
  <div
    className="relative rounded-2xl overflow-hidden p-5 flex flex-col gap-3 group cursor-default"
    style={{ background: C.surface, border: `1px solid ${color}33` }}
  >
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}18 0%, transparent 70%)` }}
    />
    <div className="flex items-start justify-between relative">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: `${color}22`, border: `1px solid ${color}44` }}
      >
        <span className="material-symbols-outlined text-xl" style={{ color }}>{icon}</span>
      </div>
      {sub && (
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#1e293b", color: C.muted }}>
          {sub}
        </span>
      )}
    </div>
    <div className="relative">
      <p className="text-3xl font-black text-white tracking-tight" style={{ textShadow: `0 0 20px ${color}55` }}>
        {value}
      </p>
      <p className="text-xs font-medium mt-0.5" style={{ color: C.muted }}>{label}</p>
    </div>
    <MiniBar value={typeof value === "string" && value.endsWith("%") ? parseFloat(value) : 60} color={color} />
  </div>
);

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ icon, title, color = "#6366f1" }) => (
  <div className="flex items-center gap-3 mb-4">
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}22`, border: `1px solid ${color}44` }}
    >
      <span className="material-symbols-outlined text-sm" style={{ color }}>{icon}</span>
    </div>
    <h3 className="text-xs font-bold tracking-widest uppercase" style={{ color: C.muted }}>{title}</h3>
    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}44, transparent)` }} />
  </div>
);

// ── Loading Spinner ───────────────────────────────────────────
const LoadingSpinner = ({ size = "md" }) => {
  const dim = size === "sm" ? "w-5 h-5" : size === "lg" ? "w-16 h-16" : "w-12 h-12";
  return (
    <div className={`relative ${dim} mx-auto`}>
      <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: "#1e293b" }} />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
      <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
    </div>
  );
};

// ── Empty State ───────────────────────────────────────────────
const EmptyState = ({ icon, title, subtitle }) => (
  <div className="rounded-2xl p-12 text-center" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
    <span className="material-symbols-outlined text-5xl mb-4 block" style={{ color: C.faint }}>{icon}</span>
    <p className="font-semibold" style={{ color: C.muted }}>{title}</p>
    <p className="text-sm mt-1" style={{ color: "#475569" }}>{subtitle}</p>
  </div>
);

// ── Pill Badge ────────────────────────────────────────────────
const Pill = ({ children, color = "#6366f1" }) => (
  <span
    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold"
    style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
  >
    {children}
  </span>
);

// ─── API helpers ─────────────────────────────────────────────
const apiFetch = (url, opts = {}) => {
  const token = localStorage.getItem("token");
  return fetch(`${API}${url}`, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
};
const apiFetchJSON = (url, opts = {}) =>
  apiFetch(url, { ...opts, headers: { "Content-Type": "application/json", ...(opts.headers || {}) } });

// ─── Markdown renderer ───────────────────────────────────────
const renderMarkdown = (text) => (
  <ReactMarkdown
    components={{
      p: ({ children }) => <p className="mb-2 text-sm leading-relaxed" style={{ color: "#cbd5e1" }}>{children}</p>,
      strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
      ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5" style={{ color: "#cbd5e1" }}>{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5" style={{ color: "#cbd5e1" }}>{children}</ol>,
      li: ({ children }) => <li className="text-sm" style={{ color: "#cbd5e1" }}>{children}</li>,
      h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-3 text-white">{children}</h1>,
      h2: ({ children }) => <h2 className="text-sm font-bold mb-1.5 mt-2 text-white">{children}</h2>,
      h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2 text-white">{children}</h3>,
      code: ({ children }) => (
        <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: "#1e293b", color: "#818cf8" }}>
          {children}
        </code>
      ),
      pre: ({ children }) => (
        <pre className="p-4 rounded-xl text-xs font-mono overflow-x-auto my-3" style={{ background: "#020817", color: "#e2e8f0" }}>
          {children}
        </pre>
      ),
    }}
  >
    {text}
  </ReactMarkdown>
);

// ─── Documents Panel ─────────────────────────────────────────
const DocumentsPanel = ({ onSelectDoc, selectedDocId }) => {
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef();

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/assistant/documents");
      const data = await res.json();
      if (res.ok) setDocs(data || []);
    } catch { setError("Cannot load documents"); }
    finally { setLoading(false); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { setError("Select a PDF first"); return; }
    setUploading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("pdf", file);
      fd.append("title", title || file.name.replace(".pdf", ""));
      const res = await apiFetch("/api/assistant/documents/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setFile(null); setTitle("");
      if (fileRef.current) fileRef.current.value = "";
      fetchDocs();
    } catch { setError("Upload failed"); }
    finally { setUploading(false); }
  };

  const handleDelete = async (docId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this document?")) return;
    try {
      await apiFetch(`/api/assistant/documents/${docId}`, { method: "DELETE" });
      fetchDocs();
      if (selectedDocId === docId) onSelectDoc(null);
    } catch { }
  };

  return (
    <div className="space-y-6">
      {/* Upload card */}
      <div className="rounded-2xl p-5" style={{ background: "#0a0f1e", border: "1px solid #6366f133" }}>
        <SectionHeader icon="upload_file" title="Upload PDF Document" color="#6366f1" />
        <form onSubmit={handleUpload} className="space-y-3">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Document title (optional)"
            className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
            style={{ background: "#1e293b", color: "white", border: "1px solid #334155" }}
            onFocus={e => e.target.style.borderColor = "#6366f1"}
            onBlur={e => e.target.style.borderColor = "#334155"}
          />
          <div
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
            style={{
              border: `2px dashed ${file ? "#6366f1" : "#334155"}`,
              background: file ? "#6366f111" : "transparent",
            }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#ef444422" }}>
              <span className="material-symbols-outlined text-sm text-red-500">picture_as_pdf</span>
            </div>
            <span className="text-sm flex-1 truncate" style={{ color: file ? "#a5b4fc" : C.muted }}>
              {file ? file.name : "Click to select PDF (max 10MB)"}
            </span>
            {file && (
              <button type="button" onClick={e => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="flex-shrink-0 transition-colors" style={{ color: C.muted }}>
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} className="hidden" />
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#ef444422", border: "1px solid #ef444433" }}>
              <span className="material-symbols-outlined text-red-400 text-sm">error</span>
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)", boxShadow: "0 0 24px #6366f133" }}
          >
            {uploading
              ? <><LoadingSpinner size="sm" /><span>Uploading...</span></>
              : <><span className="material-symbols-outlined text-base">upload</span>Upload Document</>
            }
          </button>
        </form>
      </div>

      {/* Doc list */}
      <div>
        <SectionHeader icon="folder_open" title={`Your Documents (${docs.length})`} color="#22c55e" />
        {loading ? (
          <div className="py-12"><LoadingSpinner /></div>
        ) : docs.length === 0 ? (
          <EmptyState icon="folder_open" title="No documents yet" subtitle="Upload a PDF to get started" />
        ) : (
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {docs.map(doc => (
              <div
                key={doc._id}
                onClick={() => onSelectDoc(doc)}
                className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all group"
                style={{
                  background: selectedDocId === doc._id ? "#6366f122" : "#0a0f1e",
                  border: `1px solid ${selectedDocId === doc._id ? "#6366f155" : C.border}`,
                }}
                onMouseEnter={e => { if (selectedDocId !== doc._id) e.currentTarget.style.borderColor = "#6366f144"; }}
                onMouseLeave={e => { if (selectedDocId !== doc._id) e.currentTarget.style.borderColor = C.border; }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#ef444422", border: "1px solid #ef444433" }}>
                  <span className="material-symbols-outlined text-red-400 text-lg">picture_as_pdf</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{doc.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                    {(doc.fileSize / 1024).toFixed(1)} KB · {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {selectedDocId === doc._id && (
                  <Pill color="#6366f1">Active</Pill>
                )}
                <button
                  onClick={e => handleDelete(doc._id, e)}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  style={{ color: C.muted }}
                  onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
                  onMouseLeave={e => e.currentTarget.style.color = C.muted}
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Chat Panel ──────────────────────────────────────────────
const ChatPanel = ({ doc }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef();

  useEffect(() => { if (doc) loadHistory(); }, [doc?._id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, sending]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/assistant/chat/${doc._id}/history`);
      const data = await res.json();
      if (res.ok) setMessages(data.messages || []);
    } catch { }
    finally { setLoading(false); }
  };

  const clearChat = async () => {
    if (!window.confirm("Clear chat history?")) return;
    await apiFetch(`/api/assistant/chat/${doc._id}/history`, { method: "DELETE" });
    setMessages([]);
  };

  const send = async (e) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || sending) return;
    setInput("");
    setMessages(p => [...p, { role: "user", content: msg, timestamp: new Date() }]);
    setSending(true);
    try {
      const res = await apiFetchJSON(`/api/assistant/chat/${doc._id}`, { method: "POST", body: JSON.stringify({ message: msg }) });
      const data = await res.json();
      if (res.ok) setMessages(data.chatHistory);
    } catch { }
    finally { setSending(false); }
  };

  if (!doc) return (
    <EmptyState icon="chat_bubble_outline" title="Select a document first" subtitle="Choose a document from the Documents tab to start chatting" />
  );

  return (
    <div className="flex flex-col" style={{ height: "520px" }}>
      {/* Doc header */}
      <div className="flex items-center justify-between pb-3 mb-3 flex-shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
            <span className="material-symbols-outlined text-indigo-400 text-sm">description</span>
          </div>
          <p className="text-sm font-semibold text-white truncate">{doc.title}</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all"
            style={{ color: C.muted }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "#ef444411"; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = "transparent"; }}
          >
            <span className="material-symbols-outlined text-sm">delete_sweep</span>Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
        {loading ? (
          <div className="py-16 flex items-center justify-center"><LoadingSpinner /></div>
        ) : messages.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#6366f122", border: "1px solid #6366f133" }}>
              <span className="material-symbols-outlined text-3xl" style={{ color: "#6366f1" }}>chat_bubble_outline</span>
            </div>
            <p className="text-sm font-medium text-white">Ask anything about</p>
            <p className="text-sm mt-0.5" style={{ color: "#818cf8" }}>{doc.title}</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
                  <span className="material-symbols-outlined text-white text-xs">smart_toy</span>
                </div>
              )}
              <div
                className="max-w-[80%] px-4 py-3 rounded-2xl text-sm"
                style={{
                  background: msg.role === "user" ? "linear-gradient(135deg, #6366f1, #818cf8)" : "#1e293b",
                  borderRadius: msg.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                  border: msg.role === "assistant" ? `1px solid ${C.border}` : "none",
                  boxShadow: msg.role === "user" ? "0 0 20px #6366f144" : "none",
                }}
              >
                {msg.role === "user"
                  ? <p className="text-sm leading-relaxed whitespace-pre-wrap text-white">{msg.content}</p>
                  : renderMarkdown(msg.content)
                }
              </div>
            </div>
          ))
        )}
        {sending && (
          <div className="flex justify-start gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
              <span className="material-symbols-outlined text-white text-xs">smart_toy</span>
            </div>
            <div className="px-4 py-3 rounded-2xl" style={{ background: "#1e293b", border: `1px solid ${C.border}`, borderRadius: "4px 18px 18px 18px" }}>
              <div className="flex gap-1.5 items-center h-5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#6366f1", animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className="flex gap-2 pt-3 flex-shrink-0" style={{ borderTop: `1px solid ${C.border}` }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask anything about this document..."
          className="flex-1 px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
          style={{ background: "#1e293b", color: "white", border: `1px solid ${C.border}` }}
          onFocus={e => e.target.style.borderColor = "#6366f1"}
          onBlur={e => e.target.style.borderColor = C.border}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="w-11 h-11 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-40 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)", boxShadow: "0 0 16px #6366f133" }}
        >
          <span className="material-symbols-outlined text-white text-base">send</span>
        </button>
      </form>
    </div>
  );
};

// ─── Summary Panel ───────────────────────────────────────────
const SummaryPanel = ({ doc }) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (doc) fetchDoc(); }, [doc?._id]);

  const fetchDoc = async () => {
    setFetching(true);
    try {
      const res = await apiFetch(`/api/assistant/documents/${doc._id}`);
      const data = await res.json();
      if (res.ok && data.summary) setSummary(data.summary);
      else setSummary("");
    } catch { }
    finally { setFetching(false); }
  };

  const generate = async () => {
    setLoading(true);
    try {
      const res = await apiFetchJSON(`/api/assistant/summary/${doc._id}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setSummary(data.summary);
    } catch { }
    finally { setLoading(false); }
  };

  if (!doc) return <EmptyState icon="summarize" title="Select a document" subtitle="Choose a document from the Documents tab to generate a summary" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
            <span className="material-symbols-outlined text-indigo-400 text-base">description</span>
          </div>
          <p className="text-sm font-semibold text-white truncate">{doc.title}</p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-40 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)", boxShadow: "0 0 20px #6366f133" }}
        >
          {loading
            ? <><LoadingSpinner size="sm" /><span>Generating...</span></>
            : <><span className="material-symbols-outlined text-base">auto_awesome</span>{summary ? "Regenerate" : "Generate Summary"}</>
          }
        </button>
      </div>

      {fetching ? (
        <div className="py-20 flex items-center justify-center"><LoadingSpinner /></div>
      ) : summary ? (
        <div className="rounded-2xl p-5 max-h-[440px] overflow-y-auto" style={{ background: "#0a0f1e", border: `1px solid ${C.border}` }}>
          {renderMarkdown(summary)}
        </div>
      ) : (
        <div className="text-center py-20 rounded-2xl" style={{ background: "#0a0f1e", border: `2px dashed ${C.border}` }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#6366f122", border: "1px solid #6366f133" }}>
            <span className="material-symbols-outlined text-3xl" style={{ color: "#6366f1" }}>summarize</span>
          </div>
          <p className="text-sm font-medium" style={{ color: C.muted }}>No summary yet.</p>
          <p className="text-xs mt-1" style={{ color: "#475569" }}>Click Generate to create one.</p>
        </div>
      )}
    </div>
  );
};

// ─── Explain Panel ───────────────────────────────────────────
const ExplainPanel = ({ doc }) => {
  const [concept, setConcept] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const explain = async (e) => {
    e.preventDefault();
    if (!concept.trim() || !doc) return;
    setLoading(true);
    const c = concept.trim();
    setConcept("");
    try {
      const res = await apiFetchJSON(`/api/assistant/explain/${doc._id}`, { method: "POST", body: JSON.stringify({ concept: c }) });
      const data = await res.json();
      if (res.ok) {
        setHistory(p => [{ concept: c, explanation: data.explanation }, ...p.slice(0, 4)]);
        setExplanation(data.explanation);
      }
    } catch { }
    finally { setLoading(false); }
  };

  if (!doc) return <EmptyState icon="lightbulb" title="Select a document" subtitle="Choose a document to explain concepts from it" />;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#f59e0b22", border: "1px solid #f59e0b44" }}>
          <span className="material-symbols-outlined text-amber-400 text-base">lightbulb</span>
        </div>
        <p className="text-sm text-white">
          Explain a concept from{" "}
          <span className="font-semibold" style={{ color: "#fbbf24" }}>{doc.title}</span>
        </p>
      </div>

      <form onSubmit={explain} className="flex flex-col sm:flex-row gap-3">
        <input
          value={concept}
          onChange={e => setConcept(e.target.value)}
          placeholder="e.g. recursion, binary search, neural networks..."
          className="flex-1 px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
          style={{ background: "#1e293b", color: "white", border: `1px solid ${C.border}` }}
          onFocus={e => e.target.style.borderColor = "#f59e0b"}
          onBlur={e => e.target.style.borderColor = C.border}
        />
        <button
          type="submit"
          disabled={!concept.trim() || loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 0 20px #f59e0b33" }}
        >
          {loading ? <LoadingSpinner size="sm" /> : <span className="material-symbols-outlined text-base">auto_awesome</span>}
          Explain
        </button>
      </form>

      {history.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {history.map((h, i) => (
            <button
              key={i}
              onClick={() => setExplanation(h.explanation)}
              className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all hover:scale-105"
              style={{ background: "#f59e0b22", color: "#fbbf24", border: "1px solid #f59e0b44" }}
            >
              {h.concept}
            </button>
          ))}
        </div>
      )}

      {explanation && (
        <div className="rounded-2xl p-5 max-h-[380px] overflow-y-auto" style={{ background: "#0a0f1e", border: "1px solid #f59e0b33" }}>
          {renderMarkdown(explanation)}
        </div>
      )}
    </div>
  );
};

// ─── Flashcards Panel ────────────────────────────────────────
const FlashcardsPanel = ({ doc }) => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genCount, setGenCount] = useState(10);
  const [genTitle, setGenTitle] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [activeSet, setActiveSet] = useState(null);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => { fetchSets(); }, []);

  const fetchSets = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/assistant/flashcards");
      const data = await res.json();
      if (res.ok) setSets(data || []);
    } catch { }
    finally { setLoading(false); }
  };

  const generate = async () => {
    if (!doc) { alert("Select a document first"); return; }
    setGenLoading(true);
    try {
      const res = await apiFetchJSON(`/api/assistant/flashcards/${doc._id}`, { method: "POST", body: JSON.stringify({ count: genCount, title: genTitle }) });
      const data = await res.json();
      if (res.ok) { fetchSets(); setActiveSet(data.flashcard); setCardIdx(0); setFlipped(false); }
    } catch { }
    finally { setGenLoading(false); }
  };

  const deleteSet = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this set?")) return;
    await apiFetch(`/api/assistant/flashcards/${id}`, { method: "DELETE" });
    fetchSets();
    if (activeSet?._id === id) setActiveSet(null);
  };

  const openSet = async (set) => {
    const res = await apiFetch(`/api/assistant/flashcards/${set._id}`);
    const data = await res.json();
    if (res.ok) { setActiveSet(data); setCardIdx(0); setFlipped(false); }
  };

  const prev = () => { setFlipped(false); setTimeout(() => setCardIdx(p => Math.max(0, p - 1)), 120); };
  const next = () => { setFlipped(false); setTimeout(() => setCardIdx(p => Math.min(activeSet.cards.length - 1, p + 1)), 120); };

  return (
    <div className="space-y-6">
      {/* Generate */}
      <div className="rounded-2xl p-5" style={{ background: "#0a0f1e", border: "1px solid #10b98133" }}>
        <SectionHeader icon="auto_awesome" title={`Generate Flashcards${doc ? ` · ${doc.title}` : " (select a doc)"}`} color="#10b981" />
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={genTitle}
            onChange={e => setGenTitle(e.target.value)}
            placeholder="Set title (optional)"
            className="flex-1 px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
            style={{ background: "#1e293b", color: "white", border: `1px solid ${C.border}` }}
            onFocus={e => e.target.style.borderColor = "#10b981"}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          <select
            value={genCount}
            onChange={e => setGenCount(Number(e.target.value))}
            className="px-4 py-2.5 text-sm rounded-xl outline-none cursor-pointer"
            style={{ background: "#1e293b", color: "white", border: `1px solid ${C.border}` }}
          >
            {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} cards</option>)}
          </select>
          <button
            onClick={generate}
            disabled={genLoading || !doc}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 0 20px #10b98133" }}
          >
            {genLoading ? <><LoadingSpinner size="sm" /><span>Generating...</span></> : <><span className="material-symbols-outlined text-base">bolt</span>Generate</>}
          </button>
        </div>
      </div>

      {/* Active card */}
      {activeSet && activeSet.cards?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white">{activeSet.title}</p>
            <Pill color="#10b981">{cardIdx + 1} / {activeSet.cards.length}</Pill>
          </div>
          <MiniBar value={((cardIdx + 1) / activeSet.cards.length) * 100} color="#10b981" height={4} />

          <div onClick={() => setFlipped(p => !p)} className="cursor-pointer h-52 relative" style={{ perspective: "1000px" }}>
            <div
              className="w-full h-full transition-transform duration-500 relative"
              style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "" }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6"
                style={{ backfaceVisibility: "hidden", background: "#0a0f1e", border: "2px solid #10b981", boxShadow: "0 0 30px #10b98122" }}
              >
                <Pill color="#10b981">Question</Pill>
                <p className="text-sm font-medium text-white text-center mt-4 leading-relaxed">{activeSet.cards[cardIdx]?.question}</p>
                <p className="text-xs absolute bottom-4" style={{ color: C.muted }}>Tap to reveal answer</p>
              </div>
              {/* Back */}
              <div
                className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "linear-gradient(135deg, #059669, #0284c7)", boxShadow: "0 0 30px #10b98133" }}
              >
                <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider mb-4">Answer</span>
                <p className="text-sm font-medium text-white text-center leading-relaxed">{activeSet.cards[cardIdx]?.answer}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={prev} disabled={cardIdx === 0} className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-30" style={{ color: C.muted, background: "#1e293b" }}
              onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = C.muted}>
              <span className="material-symbols-outlined text-base">chevron_left</span>Prev
            </button>
            <button onClick={() => setFlipped(p => !p)} className="px-4 py-2 rounded-xl text-sm flex items-center gap-1 transition-all" style={{ color: C.muted, background: "#1e293b" }}
              onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = C.muted}>
              <span className="material-symbols-outlined text-base">flip</span>Flip
            </button>
            <button onClick={next} disabled={cardIdx === activeSet.cards.length - 1} className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-30" style={{ color: C.muted, background: "#1e293b" }}
              onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = C.muted}>
              Next<span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* Saved sets */}
      <div>
        <SectionHeader icon="style" title={`Saved Sets (${sets.length})`} color="#10b981" />
        {loading ? (
          <div className="py-8 flex items-center justify-center"><LoadingSpinner size="sm" /></div>
        ) : sets.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: C.muted }}>No flashcard sets yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sets.map(set => (
              <div
                key={set._id}
                onClick={() => openSet(set)}
                className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all group"
                style={{ background: activeSet?._id === set._id ? "#10b98122" : "#0a0f1e", border: `1px solid ${activeSet?._id === set._id ? "#10b98155" : C.border}` }}
                onMouseEnter={e => { if (activeSet?._id !== set._id) e.currentTarget.style.borderColor = "#10b98144"; }}
                onMouseLeave={e => { if (activeSet?._id !== set._id) e.currentTarget.style.borderColor = C.border; }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#10b98122", border: "1px solid #10b98133" }}>
                  <span className="material-symbols-outlined text-emerald-400 text-lg">style</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{set.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: C.muted }}>{new Date(set.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={e => deleteSet(set._id, e)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all" style={{ color: C.muted }}
                  onMouseEnter={e => e.currentTarget.style.color = "#f87171"} onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Quiz Panel ──────────────────────────────────────────────
const QuizPanel = ({ doc }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genCount, setGenCount] = useState(10);
  const [genTitle, setGenTitle] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  useEffect(() => { fetchQuizzes(); }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/assistant/quizzes");
      const data = await res.json();
      if (res.ok) setQuizzes(data || []);
    } catch { }
    finally { setLoading(false); }
  };

  const generate = async () => {
    if (!doc) { alert("Select a document first"); return; }
    setGenLoading(true);
    try {
      const res = await apiFetchJSON(`/api/assistant/quiz/${doc._id}`, { method: "POST", body: JSON.stringify({ count: genCount, title: genTitle }) });
      const data = await res.json();
      if (res.ok) { fetchQuizzes(); startQuiz(data.quiz); }
    } catch { }
    finally { setGenLoading(false); }
  };

  const startQuiz = async (quizOrId) => {
    let quiz = quizOrId;
    if (typeof quizOrId === "string" || quizOrId._id) {
      const id = quizOrId._id || quizOrId;
      const res = await apiFetch(`/api/assistant/quizzes/${id}`);
      const data = await res.json();
      if (res.ok) quiz = data;
    }
    setActiveQuiz(quiz);
    setAnswers(new Array(quiz.questions?.length).fill(null));
    setSubmitted(false);
    setResult(null);
    setCurrentQ(0);
  };

  const submitQuiz = async () => {
    if (answers.includes(null)) { alert("Answer all questions first!"); return; }
    setSubmitting(true);
    try {
      const res = await apiFetchJSON(`/api/assistant/quizzes/${activeQuiz._id}/submit`, { method: "POST", body: JSON.stringify({ answers }) });
      const data = await res.json();
      if (res.ok) { setResult(data); setSubmitted(true); fetchQuizzes(); }
    } catch { }
    finally { setSubmitting(false); }
  };

  const deleteQuiz = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this quiz?")) return;
    await apiFetch(`/api/assistant/quizzes/${id}`, { method: "DELETE" });
    fetchQuizzes();
    if (activeQuiz?._id === id) { setActiveQuiz(null); setResult(null); }
  };

  const getBestScore = (quiz) => {
    if (!quiz.results?.length) return null;
    return Math.max(...quiz.results.map(r => Math.round((r.score / r.totalQuestions) * 100)));
  };

  const resultColor = result ? (result.percentage >= 70 ? "#22c55e" : result.percentage >= 50 ? "#f59e0b" : "#ef4444") : "#6366f1";

  return (
    <div className="space-y-6">
      {/* Generate */}
      <div className="rounded-2xl p-5" style={{ background: "#0a0f1e", border: "1px solid #0ea5e933" }}>
        <SectionHeader icon="quiz" title={`Generate Quiz${doc ? ` · ${doc.title}` : " (select a doc)"}`} color="#0ea5e9" />
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={genTitle}
            onChange={e => setGenTitle(e.target.value)}
            placeholder="Quiz title (optional)"
            className="flex-1 px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
            style={{ background: "#1e293b", color: "white", border: `1px solid ${C.border}` }}
            onFocus={e => e.target.style.borderColor = "#0ea5e9"}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          <select
            value={genCount}
            onChange={e => setGenCount(Number(e.target.value))}
            className="px-4 py-2.5 text-sm rounded-xl outline-none cursor-pointer"
            style={{ background: "#1e293b", color: "white", border: `1px solid ${C.border}` }}
          >
            {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} questions</option>)}
          </select>
          <button
            onClick={generate}
            disabled={genLoading || !doc}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)", boxShadow: "0 0 20px #0ea5e933" }}
          >
            {genLoading ? <><LoadingSpinner size="sm" /><span>Generating...</span></> : <><span className="material-symbols-outlined text-base">bolt</span>Generate</>}
          </button>
        </div>
      </div>

      {/* Active quiz */}
      {activeQuiz && !submitted && activeQuiz.questions?.length > 0 && (
        <div className="rounded-2xl p-5 space-y-5" style={{ background: "#0a0f1e", border: "1px solid #0ea5e933" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white truncate">{activeQuiz.title}</p>
            <Pill color="#0ea5e9">{currentQ + 1} / {activeQuiz.questions.length}</Pill>
          </div>
          <MiniBar value={((currentQ + 1) / activeQuiz.questions.length) * 100} color="#0ea5e9" height={4} />
          <div>
            <p className="text-sm font-semibold text-white mb-4 leading-relaxed">
              <span className="font-black mr-2" style={{ color: "#38bdf8" }}>{currentQ + 1}.</span>
              {activeQuiz.questions[currentQ]?.question}
            </p>
            <div className="space-y-2.5">
              {activeQuiz.questions[currentQ]?.options.map((opt, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all"
                  style={{
                    borderColor: answers[currentQ] === i ? "#0ea5e9" : C.border,
                    background: answers[currentQ] === i ? "#0ea5e911" : "transparent",
                    boxShadow: answers[currentQ] === i ? "0 0 16px #0ea5e922" : "none",
                  }}
                >
                  <input
                    type="radio" name={`q${currentQ}`}
                    checked={answers[currentQ] === i}
                    onChange={() => setAnswers(p => { const a = [...p]; a[currentQ] = i; return a; })}
                    className="w-4 h-4 accent-sky-500"
                  />
                  <span className="text-sm" style={{ color: answers[currentQ] === i ? "white" : "#cbd5e1" }}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button onClick={() => setCurrentQ(p => Math.max(0, p - 1))} disabled={currentQ === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-30"
              style={{ color: C.muted, background: "#1e293b" }}>
              <span className="material-symbols-outlined text-base">chevron_left</span>Prev
            </button>
            {currentQ < activeQuiz.questions.length - 1 ? (
              <button onClick={() => setCurrentQ(p => p + 1)} disabled={answers[currentQ] === null}
                className="flex items-center gap-1 px-5 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
                style={{ color: "#38bdf8", background: "#0ea5e922" }}>
                Next<span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            ) : (
              <button onClick={submitQuiz} disabled={submitting || answers.includes(null)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 0 16px #10b98133" }}>
                {submitting ? <LoadingSpinner size="sm" /> : <span className="material-symbols-outlined text-base">check</span>}Submit
              </button>
            )}
          </div>
        </div>
      )}

      {/* Result */}
      {submitted && result && (
        <div className="rounded-2xl p-8 text-center" style={{ background: "#0a0f1e", border: `2px solid ${resultColor}55`, boxShadow: `0 0 40px ${resultColor}22` }}>
          <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${resultColor}22`, border: `3px solid ${resultColor}` }}>
            <p className="text-2xl font-black" style={{ color: resultColor }}>{result.percentage}%</p>
          </div>
          <p className="text-lg font-black text-white mb-1">
            {result.percentage >= 70 ? "Excellent! 🎉" : result.percentage >= 50 ? "Good effort! 👍" : "Keep practicing! 💪"}
          </p>
          <p className="text-sm mb-5" style={{ color: C.muted }}>{result.score} out of {result.totalQuestions} correct</p>
          <button onClick={() => startQuiz(activeQuiz)}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
            Try Again
          </button>
        </div>
      )}

      {/* Saved quizzes */}
      <div>
        <SectionHeader icon="quiz" title={`Saved Quizzes (${quizzes.length})`} color="#0ea5e9" />
        {loading ? (
          <div className="py-8 flex items-center justify-center"><LoadingSpinner size="sm" /></div>
        ) : quizzes.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: C.muted }}>No quizzes yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quizzes.map(q => {
              const best = getBestScore(q);
              return (
                <div key={q._id} onClick={() => startQuiz(q)}
                  className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all group"
                  style={{ background: "#0a0f1e", border: `1px solid ${C.border}` }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#0ea5e944"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#0ea5e922", border: "1px solid #0ea5e933" }}>
                    <span className="material-symbols-outlined text-sky-400 text-lg">quiz</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{q.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                      {q.questions?.length || 0} questions
                      {best !== null && <span className="ml-2 font-bold" style={{ color: "#38bdf8" }}>Best: {best}%</span>}
                    </p>
                  </div>
                  <button onClick={e => deleteQuiz(q._id, e)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all" style={{ color: C.muted }}
                    onMouseEnter={e => e.currentTarget.style.color = "#f87171"} onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Analytics Panel ─────────────────────────────────────────
const AnalyticsPanel = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");

  useEffect(() => { fetchAnalytics(); }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/assistant/analytics?range=${timeRange}`);
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="py-24 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  const s = stats || { totalDocuments: 0, totalQuizzes: 0, totalFlashcardSets: 0, totalQuizAttempts: 0, avgQuizScore: 0, bestQuizScore: 0, totalStudyTime: 0, streak: 0, recentActivity: [] };

  return (
    <div className="space-y-5">
      {/* Range toggle */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-xl p-1" style={{ background: "#0a0f1e", border: `1px solid ${C.border}` }}>
          {["week", "month", "all"].map((range) => (
            <button key={range} onClick={() => setTimeRange(range)}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all"
              style={timeRange === range ? { background: "#6366f1", color: "white" } : { color: C.muted }}>
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <GlowCard icon="folder_open" label="Documents" value={s.totalDocuments} color="#6366f1" />
        <GlowCard icon="quiz" label="Quiz Attempts" value={s.totalQuizAttempts} color="#0ea5e9" />
        <GlowCard icon="style" label="Flashcard Sets" value={s.totalFlashcardSets} color="#10b981" />
        <GlowCard icon="local_fire_department" label="Day Streak" value={s.streak} color="#f59e0b" />
      </div>

      {/* Performance cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: "#0a0f1e", border: "1px solid #0ea5e933" }}>
          <SectionHeader icon="trending_up" title="Quiz Performance" color="#0ea5e9" />
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-4xl font-black text-white">{s.avgQuizScore}%</p>
              <p className="text-xs mt-1" style={{ color: C.muted }}>Average Score</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: "#4ade80" }}>{s.bestQuizScore}%</p>
              <p className="text-xs" style={{ color: C.muted }}>Best Score</p>
            </div>
          </div>
          <MiniBar value={s.avgQuizScore} color="#0ea5e9" height={8} />
        </div>

        <div className="rounded-2xl p-5" style={{ background: "#0a0f1e", border: "1px solid #a855f733" }}>
          <SectionHeader icon="schedule" title="Study Activity" color="#a855f7" />
          <p className="text-4xl font-black text-white mb-1">
            {Math.floor(s.totalStudyTime / 60)}h {s.totalStudyTime % 60}m
          </p>
          <p className="text-xs mb-4" style={{ color: C.muted }}>Total time spent</p>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#f59e0b11", border: "1px solid #f59e0b33" }}>
            <span className="material-symbols-outlined text-amber-400 text-lg">local_fire_department</span>
            <p className="text-sm" style={{ color: "#fbbf24" }}>
              <span className="font-black text-white">{s.streak} day streak!</span> Keep it up!
            </p>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      {s.recentActivity?.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#0a0f1e", border: `1px solid ${C.border}` }}>
          <div className="px-5 pt-5">
            <SectionHeader icon="history" title="Recent Activity" color="#6366f1" />
          </div>
          <div className="divide-y" style={{ borderColor: C.border }}>
            {s.recentActivity.slice(0, 5).map((activity, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center gap-3 transition-all" style={{ cursor: "default" }}
                onMouseEnter={e => e.currentTarget.style.background = "#ffffff08"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: activity.type === "quiz" ? "#0ea5e922" : "#10b98122", border: `1px solid ${activity.type === "quiz" ? "#0ea5e933" : "#10b98133"}` }}>
                  <span className="material-symbols-outlined text-sm" style={{ color: activity.type === "quiz" ? "#38bdf8" : "#34d399" }}>
                    {activity.type === "quiz" ? "quiz" : "style"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{activity.title}</p>
                  <p className="text-xs" style={{ color: C.muted }}>{activity.description}</p>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: C.muted }}>{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────
const AIAssistant = () => {
  const [activeFeature, setActiveFeature] = useState("documents");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    { id: "documents", icon: "folder_open",  label: "Documents",  color: "#6366f1" },
    { id: "chat",      icon: "chat",          label: "Chat",       color: "#818cf8" },
    { id: "summary",   icon: "summarize",     label: "Summary",    color: "#6366f1" },
    { id: "explain",   icon: "lightbulb",     label: "Explain",    color: "#f59e0b" },
    { id: "flashcards",icon: "style",         label: "Flashcards", color: "#10b981" },
    { id: "quiz",      icon: "quiz",          label: "Quiz",       color: "#0ea5e9" },
    { id: "analytics", icon: "analytics",     label: "Analytics",  color: "#a855f7" },
  ];

  const handleSelectDoc = (doc) => {
    setSelectedDoc(doc);
    if (doc && activeFeature === "documents") setActiveFeature("chat");
  };

  const active = features.find(f => f.id === activeFeature);

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif" }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8"
        style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", border: `1px solid ${C.border}` }}>
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/4 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "#6366f1" }} />
        <div className="absolute bottom-0 right-1/4 w-56 h-56 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: "#a855f7" }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ background: "#6366f1", boxShadow: "0 0 8px #6366f1" }} />
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#818cf8" }}>
                SmartAcademia · AI Assistant
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              AI-Powered{" "}
              <span style={{ background: "linear-gradient(90deg, #818cf8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Study Tools
              </span>
            </h1>
            <p className="text-xs mt-2" style={{ color: C.muted }}>
              Upload PDFs · Chat · Summarize · Explain · Flashcards · Quiz · Analytics
            </p>
          </div>

          {selectedDoc ? (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl flex-shrink-0"
              style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#ef444422" }}>
                <span className="material-symbols-outlined text-red-400 text-sm">picture_as_pdf</span>
              </div>
              <span className="text-xs font-semibold text-white truncate max-w-[160px]">{selectedDoc.title}</span>
              <button onClick={() => setSelectedDoc(null)} className="flex-shrink-0 transition-colors" style={{ color: "#818cf8" }}
                onMouseEnter={e => e.currentTarget.style.color = "#f87171"} onMouseLeave={e => e.currentTarget.style.color = "#818cf8"}>
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "#f59e0b11", border: "1px solid #f59e0b33" }}>
              <span className="material-symbols-outlined text-amber-400 text-base">info</span>
              <p className="text-xs" style={{ color: "#fbbf24" }}>Upload a PDF to unlock all features</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Stat strip ───────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {features.slice(0, 4).map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFeature(f.id)}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all hover:scale-105"
            style={{
              background: activeFeature === f.id ? `${f.color}22` : "#0f1629",
              border: `1px solid ${activeFeature === f.id ? `${f.color}55` : C.border}`,
              boxShadow: activeFeature === f.id ? `0 0 20px ${f.color}22` : "none",
            }}
          >
            <span className="material-symbols-outlined text-xl" style={{ color: f.color }}>{f.icon}</span>
            <span className="text-[10px] font-semibold" style={{ color: activeFeature === f.id ? "white" : C.muted }}>{f.label}</span>
          </button>
        ))}
      </div>

      {/* ── Layout ───────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* Sidebar */}
        <div className="lg:w-52 flex-shrink-0">
          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-full flex items-center justify-between px-4 py-3 rounded-xl mb-2"
            style={{ background: C.surface, border: `1px solid ${active?.color}44` }}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base" style={{ color: active?.color }}>{active?.icon}</span>
              <span className="text-sm font-semibold text-white">{active?.label}</span>
            </span>
            <span className="material-symbols-outlined" style={{ color: C.muted }}>{mobileMenuOpen ? "expand_less" : "expand_more"}</span>
          </button>

          {/* Mobile grid */}
          {mobileMenuOpen && (
            <div className="lg:hidden grid grid-cols-4 gap-1.5 p-2 rounded-xl mb-3" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              {features.map(f => (
                <button key={f.id} onClick={() => { setActiveFeature(f.id); setMobileMenuOpen(false); }}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all"
                  style={{ background: activeFeature === f.id ? "#6366f1" : "transparent" }}>
                  <span className="material-symbols-outlined text-base" style={{ color: activeFeature === f.id ? "white" : f.color }}>{f.icon}</span>
                  <span className="text-[10px] font-medium" style={{ color: activeFeature === f.id ? "white" : C.muted }}>{f.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Desktop nav */}
          <nav className="hidden lg:flex flex-col gap-1">
            {features.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFeature(f.id)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                style={activeFeature === f.id
                  ? { background: `${f.color}22`, color: "white", border: `1px solid ${f.color}44`, boxShadow: `0 0 16px ${f.color}22` }
                  : { color: C.muted, border: "1px solid transparent" }}
                onMouseEnter={e => { if (activeFeature !== f.id) { e.currentTarget.style.background = "#0f1629"; e.currentTarget.style.color = "white"; } }}
                onMouseLeave={e => { if (activeFeature !== f.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.muted; } }}
              >
                <span className="material-symbols-outlined text-base" style={{ color: activeFeature === f.id ? "white" : f.color }}>{f.icon}</span>
                {f.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main panel */}
        <div className="flex-1 rounded-2xl p-5 min-h-[560px]" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          {activeFeature === "documents"  && <DocumentsPanel onSelectDoc={handleSelectDoc} selectedDocId={selectedDoc?._id} />}
          {activeFeature === "chat"       && <ChatPanel doc={selectedDoc} />}
          {activeFeature === "summary"    && <SummaryPanel doc={selectedDoc} />}
          {activeFeature === "explain"    && <ExplainPanel doc={selectedDoc} />}
          {activeFeature === "flashcards" && <FlashcardsPanel doc={selectedDoc} />}
          {activeFeature === "quiz"       && <QuizPanel doc={selectedDoc} />}
          {activeFeature === "analytics"  && <AnalyticsPanel />}
        </div>
      </div>

      {/* ── Info strip ───────────────────────────────────── */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: "#0a0f1e", border: "1px solid #6366f133" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
          <span className="material-symbols-outlined text-sm" style={{ color: "#6366f1" }}>info</span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
          <strong className="text-indigo-400">How it works:</strong> Upload a PDF from Documents, then select it to unlock Chat, Summary, Explain, Flashcards, and Quiz. Track your study habits in Analytics.
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;