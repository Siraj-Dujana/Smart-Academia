import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const apiFetch = (url, opts = {}) => {
  const token = localStorage.getItem("token");
  return fetch(`${API}${url}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
};

const apiFetchJSON = (url, opts = {}) =>
  apiFetch(url, { ...opts, headers: { "Content-Type": "application/json", ...(opts.headers || {}) } });

// ─── Markdown renderer ──────────────────────────────────────────────────────
const renderMarkdown = (text) => (
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
        <code className="bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 px-1 py-0.5 rounded text-xs font-mono">
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
    {text}
  </ReactMarkdown>
);

// ─── Documents Panel ────────────────────────────────────────────────────────
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
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">upload_file</span>
          Upload PDF Document
        </p>
        <form onSubmit={handleUpload} className="space-y-2.5">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Document title (optional)"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <div
            onClick={() => fileRef.current?.click()}
            className={`flex items-center gap-2 px-3 py-2.5 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${file
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
              : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
              }`}
          >
            <span className="material-symbols-outlined text-blue-500 text-base">description</span>
            <span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
              {file ? file.name : "Click to select PDF (max 10MB)"}
            </span>
            {file && (
              <button type="button" onClick={e => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="text-red-400 hover:text-red-600 flex-shrink-0">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} className="hidden" />
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            {uploading
              ? <><svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Uploading...</>
              : <><span className="material-symbols-outlined text-sm">upload</span>Upload</>
            }
          </button>
        </form>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
          Your Documents ({docs.length})
        </p>
        {loading ? (
          <div className="text-center py-6">
            <svg className="animate-spin h-6 w-6 text-blue-600 mx-auto" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">folder_open</span>
            <p className="text-sm text-gray-500 mt-2">No documents yet. Upload a PDF to get started.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {docs.map(doc => (
              <div
                key={doc._id}
                onClick={() => onSelectDoc(doc)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedDocId === doc._id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-200 dark:ring-blue-800"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-gray-800"
                  }`}
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-red-600 text-sm">picture_as_pdf</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.title}</p>
                  <p className="text-xs text-gray-400">
                    {(doc.fileSize / 1024).toFixed(1)} KB · {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={e => handleDelete(doc._id, e)}
                  className="p-1 text-gray-300 hover:text-red-500 flex-shrink-0 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Chat Panel ─────────────────────────────────────────────────────────────
const ChatPanel = ({ doc }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef();

  useEffect(() => {
    if (doc) { loadHistory(); }
  }, [doc?._id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

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
      const res = await apiFetchJSON(`/api/assistant/chat/${doc._id}`, {
        method: "POST",
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (res.ok) setMessages(data.chatHistory);
    } catch { }
    finally { setSending(false); }
  };

  if (!doc) return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">chat</span>
      <p className="text-sm text-gray-500 mt-3">Select a document to start chatting</p>
    </div>
  );

  return (
    <div className="flex flex-col h-[400px] sm:h-[480px]">
      <div className="flex items-center justify-between px-1 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-blue-600 text-sm">description</span>
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.title}</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors flex-shrink-0">
            <span className="material-symbols-outlined text-sm">delete_sweep</span>Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
        {loading ? (
          <div className="text-center py-8">
            <svg className="animate-spin h-6 w-6 text-blue-600 mx-auto" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10">
            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">chat_bubble_outline</span>
            <p className="text-sm text-gray-500 mt-2">Ask anything about <strong>{doc.title}</strong></p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                  <span className="material-symbols-outlined text-white text-xs">smart_toy</span>
                </div>
              )}
              <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${msg.role === "user"
                ? "bg-blue-600 text-white rounded-tr-sm"
                : "bg-gray-100 dark:bg-gray-700/60 text-gray-900 dark:text-white rounded-tl-sm border border-gray-200 dark:border-gray-600"
                }`}>
                {msg.role === "user"
                  ? <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  : renderMarkdown(msg.content)
                }
              </div>
            </div>
          ))
        )}
        {sending && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-2 mt-0.5">
              <span className="material-symbols-outlined text-white text-xs">smart_toy</span>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 px-3.5 py-2.5 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask anything..."
          className="flex-1 px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all flex-shrink-0"
        >
          {sending
            ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
            : <span className="material-symbols-outlined text-base">send</span>
          }
        </button>
      </form>
    </div>
  );
};

// ─── Summary Panel ──────────────────────────────────────────────────────────
const SummaryPanel = ({ doc }) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (doc) fetchDoc();
  }, [doc?._id]);

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

  if (!doc) return (
    <div className="flex flex-col items-center justify-center h-48 text-center">
      <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">summarize</span>
      <p className="text-sm text-gray-500 mt-3">Select a document to generate a summary</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 text-sm">description</span>
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.title}</p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          {loading
            ? <><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Generating...</>
            : <><span className="material-symbols-outlined text-sm">auto_awesome</span>{summary ? "Regenerate" : "Generate"}</>
          }
        </button>
      </div>

      {fetching ? (
        <div className="text-center py-8"><svg className="animate-spin h-6 w-6 text-blue-600 mx-auto" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg></div>
      ) : summary ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 max-h-[400px] overflow-y-auto">
          {renderMarkdown(summary)}
        </div>
      ) : (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
          <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">summarize</span>
          <p className="text-sm text-gray-500 mt-2">No summary yet. Click Generate to create one.</p>
        </div>
      )}
    </div>
  );
};

// ─── Explain Panel ──────────────────────────────────────────────────────────
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
      const res = await apiFetchJSON(`/api/assistant/explain/${doc._id}`, {
        method: "POST",
        body: JSON.stringify({ concept: c }),
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(p => [{ concept: c, explanation: data.explanation }, ...p.slice(0, 4)]);
        setExplanation(data.explanation);
      }
    } catch { }
    finally { setLoading(false); }
  };

  if (!doc) return (
    <div className="flex flex-col items-center justify-center h-48 text-center">
      <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">lightbulb</span>
      <p className="text-sm text-gray-500 mt-3">Select a document to explain concepts</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-amber-500 text-sm">lightbulb</span>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Explain a concept from <span className="text-blue-600 dark:text-blue-400 font-semibold">{doc.title}</span>
        </p>
      </div>

      <form onSubmit={explain} className="flex flex-col sm:flex-row gap-2">
        <input
          value={concept}
          onChange={e => setConcept(e.target.value)}
          placeholder="e.g. recursion, binary search..."
          className="flex-1 px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-400 outline-none"
        />
        <button
          type="submit"
          disabled={!concept.trim() || loading}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 transition-all"
        >
          {loading
            ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
            : <span className="material-symbols-outlined text-base">auto_awesome</span>
          }
          Explain
        </button>
      </form>

      {history.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {history.map((h, i) => (
            <button
              key={i}
              onClick={() => setExplanation(h.explanation)}
              className="text-xs px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700"
            >
              {h.concept}
            </button>
          ))}
        </div>
      )}

      {explanation && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 max-h-[350px] overflow-y-auto">
          {renderMarkdown(explanation)}
        </div>
      )}
    </div>
  );
};

// ─── Flashcards Panel ───────────────────────────────────────────────────────
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
      const res = await apiFetchJSON(`/api/assistant/flashcards/${doc._id}`, {
        method: "POST",
        body: JSON.stringify({ count: genCount, title: genTitle }),
      });
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
    <div className="space-y-5">
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-3 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">auto_awesome</span>
          Generate Flashcards {doc ? `from "${doc.title}"` : "(select a document)"}
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-stretch sm:items-center">
          <input
            value={genTitle}
            onChange={e => setGenTitle(e.target.value)}
            placeholder="Set title (optional)"
            className="flex-1 min-w-[140px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          />
          <select
            value={genCount}
            onChange={e => setGenCount(Number(e.target.value))}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} cards</option>)}
          </select>
          <button
            onClick={generate}
            disabled={genLoading || !doc}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
          >
            {genLoading
              ? <><svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Generating...</>
              : <><span className="material-symbols-outlined text-sm">bolt</span>Generate</>
            }
          </button>
        </div>
      </div>

      {activeSet && activeSet.cards?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{activeSet.title}</p>
            <p className="text-xs text-gray-500">{cardIdx + 1} / {activeSet.cards.length}</p>
          </div>
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${((cardIdx + 1) / activeSet.cards.length) * 100}%` }} />
          </div>
          <div onClick={() => setFlipped(p => !p)} className="cursor-pointer h-44 relative" style={{ perspective: "1000px" }}>
            <div className="w-full h-full transition-transform duration-500 relative" style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "" }}>
              <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-5 bg-white dark:bg-gray-800 border-2 border-emerald-300 dark:border-emerald-700" style={{ backfaceVisibility: "hidden" }}>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase mb-3">Question</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white text-center">{activeSet.cards[cardIdx]?.question}</p>
                <p className="text-xs text-gray-400 absolute bottom-3">Tap to reveal</p>
              </div>
              <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-5" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "linear-gradient(135deg, #059669, #0284c7)" }}>
                <span className="text-xs font-semibold text-emerald-200 uppercase mb-3">Answer</span>
                <p className="text-sm font-medium text-white text-center">{activeSet.cards[cardIdx]?.answer}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button onClick={prev} disabled={cardIdx === 0} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40">
              <span className="material-symbols-outlined text-base">chevron_left</span>Prev
            </button>
            <button onClick={() => setFlipped(p => !p)} className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
              <span className="material-symbols-outlined text-base">flip</span>Flip
            </button>
            <button onClick={next} disabled={cardIdx === activeSet.cards.length - 1} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40">
              Next<span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">Saved Sets ({sets.length})</p>
        {loading ? (
          <div className="text-center py-4"><svg className="animate-spin h-5 w-5 text-emerald-500 mx-auto" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg></div>
        ) : sets.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No flashcard sets yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sets.map(set => (
              <div key={set._id} onClick={() => openSet(set)} className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer ${activeSet?._id === set._id ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"}`}>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600 text-sm">style</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{set.title}</p>
                  <p className="text-xs text-gray-400">{new Date(set.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={e => deleteSet(set._id, e)} className="text-gray-300 hover:text-red-500">
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Quiz Panel ─────────────────────────────────────────────────────────────
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
      const res = await apiFetchJSON(`/api/assistant/quiz/${doc._id}`, {
        method: "POST",
        body: JSON.stringify({ count: genCount, title: genTitle }),
      });
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
      const res = await apiFetchJSON(`/api/assistant/quizzes/${activeQuiz._id}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
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

  const scoreColor = result
    ? result.percentage >= 70 ? "text-emerald-600" : result.percentage >= 50 ? "text-amber-600" : "text-red-600"
    : "";

  return (
    <div className="space-y-5">
      <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-xl p-4">
        <p className="text-xs font-semibold text-sky-700 dark:text-sky-300 mb-3 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">quiz</span>
          Generate Quiz {doc ? `from "${doc.title}"` : "(select a document)"}
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-stretch sm:items-center">
          <input value={genTitle} onChange={e => setGenTitle(e.target.value)} placeholder="Quiz title (optional)" className="flex-1 min-w-[140px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" />
          <select value={genCount} onChange={e => setGenCount(Number(e.target.value))} className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
            {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} questions</option>)}
          </select>
          <button onClick={generate} disabled={genLoading || !doc} className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50">
            {genLoading ? <><svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Generating...</> : <><span className="material-symbols-outlined text-sm">bolt</span>Generate</>}
          </button>
        </div>
      </div>

      {activeQuiz && !submitted && activeQuiz.questions?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{activeQuiz.title}</p>
            <p className="text-xs text-gray-500">{currentQ + 1}/{activeQuiz.questions.length}</p>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${((currentQ + 1) / activeQuiz.questions.length) * 100}%` }} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">{currentQ + 1}. {activeQuiz.questions[currentQ]?.question}</p>
            <div className="space-y-2">
              {activeQuiz.questions[currentQ]?.options.map((opt, i) => (
                <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer ${answers[currentQ] === i ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20" : "border-gray-200 dark:border-gray-600"}`}>
                  <input type="radio" name={`q${currentQ}`} checked={answers[currentQ] === i} onChange={() => setAnswers(p => { const a = [...p]; a[currentQ] = i; return a; })} className="text-sky-600" />
                  <span className="text-sm text-gray-800 dark:text-gray-200">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <button onClick={() => setCurrentQ(p => Math.max(0, p - 1))} disabled={currentQ === 0} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40">
              <span className="material-symbols-outlined text-sm">chevron_left</span>Prev
            </button>
            {currentQ < activeQuiz.questions.length - 1 ? (
              <button onClick={() => setCurrentQ(p => p + 1)} disabled={answers[currentQ] === null} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 disabled:opacity-40">
                Next<span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            ) : (
              <button onClick={submitQuiz} disabled={submitting || answers.includes(null)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
                {submitting ? <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> : <span className="material-symbols-outlined text-sm">check</span>}Submit
              </button>
            )}
          </div>
        </div>
      )}

      {submitted && result && (
        <div className={`rounded-2xl border-2 p-5 text-center ${result.percentage >= 70 ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20" : result.percentage >= 50 ? "border-amber-300 bg-amber-50 dark:bg-amber-900/20" : "border-red-300 bg-red-50 dark:bg-red-900/20"}`}>
          <p className={`text-4xl font-black mb-1 ${scoreColor}`}>{result.percentage}%</p>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {result.percentage >= 70 ? "Excellent! 🎉" : result.percentage >= 50 ? "Good effort! 👍" : "Keep practicing! 💪"}
          </p>
          <p className="text-xs text-gray-500 mb-4">{result.score} out of {result.totalQuestions} correct</p>
          <button onClick={() => startQuiz(activeQuiz)} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-sky-600 hover:bg-sky-700">Try Again</button>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">Saved Quizzes ({quizzes.length})</p>
        {loading ? (
          <div className="text-center py-4"><svg className="animate-spin h-5 w-5 text-sky-500 mx-auto" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg></div>
        ) : quizzes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No quizzes yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quizzes.map(q => {
              const best = getBestScore(q);
              return (
                <div key={q._id} onClick={() => startQuiz(q)} className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
                    <span className="material-symbols-outlined text-sky-600 text-sm">quiz</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{q.title}</p>
                    <p className="text-xs text-gray-400">{q.questions?.length || 0} Qs{best !== null && <span className="ml-1 font-semibold">· Best: {best}%</span>}</p>
                  </div>
                  <button onClick={e => deleteQuiz(q._id, e)} className="text-gray-300 hover:text-red-500"><span className="material-symbols-outlined text-sm">delete</span></button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Analytics Panel ────────────────────────────────────────────────────────
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
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  const s = stats || { totalDocuments: 0, totalQuizzes: 0, totalFlashcardSets: 0, totalQuizAttempts: 0, avgQuizScore: 0, bestQuizScore: 0, totalStudyTime: 0, streak: 0, recentActivity: [] };

  const statCards = [
    { label: "Documents", value: s.totalDocuments, icon: "folder_open", color: "from-blue-500 to-blue-600" },
    { label: "Quizzes", value: s.totalQuizAttempts, icon: "quiz", color: "from-sky-500 to-sky-600" },
    { label: "Flashcards", value: s.totalFlashcardSets, icon: "style", color: "from-emerald-500 to-emerald-600" },
    { label: "Day Streak", value: s.streak, icon: "local_fire_department", color: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1">
          {["week", "month", "all"].map((range) => (
            <button key={range} onClick={() => setTimeRange(range)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeRange === range ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-400"}`}>{range.charAt(0).toUpperCase() + range.slice(1)}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <span className="material-symbols-outlined text-white text-sm">{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-base">trending_up</span>Quiz Performance
          </h3>
          <div className="flex items-end justify-between">
            <div><p className="text-4xl font-bold text-gray-900 dark:text-white">{s.avgQuizScore}%</p><p className="text-xs text-gray-500 mt-1">Average Score</p></div>
            <div className="text-right"><p className="text-2xl font-semibold text-emerald-600">{s.bestQuizScore}%</p><p className="text-xs text-gray-500">Best Score</p></div>
          </div>
          <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" style={{ width: `${s.avgQuizScore}%` }} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-600 text-base">schedule</span>Study Time
          </h3>
          <div><p className="text-4xl font-bold text-gray-900 dark:text-white">{Math.floor(s.totalStudyTime / 60)}h {s.totalStudyTime % 60}m</p><p className="text-xs text-gray-500 mt-1">Total time spent</p></div>
          <div className="mt-4 flex items-center gap-2"><span className="material-symbols-outlined text-amber-500 text-sm">emoji_events</span><p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-semibold">{s.streak} day streak!</span> Keep it up!</p></div>
        </div>
      </div>

      {s.recentActivity?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><span className="material-symbols-outlined text-blue-600 text-base">history</span>Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {s.recentActivity.slice(0, 5).map((activity, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-sm">{activity.type === "quiz" ? "quiz" : "style"}</span>
                </div>
                <div className="flex-1"><p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p><p className="text-xs text-gray-500">{activity.description}</p></div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
const AIAssistant = () => {
  const [activeFeature, setActiveFeature] = useState("documents");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    { id: "documents", icon: "folder_open", label: "Documents", color: "text-blue-600" },
    { id: "chat", icon: "chat", label: "Chat", color: "text-indigo-600" },
    { id: "summary", icon: "summarize", label: "Summary", color: "text-blue-600" },
    { id: "explain", icon: "lightbulb", label: "Explain", color: "text-amber-600" },
    { id: "flashcards", icon: "style", label: "Flashcards", color: "text-emerald-600" },
    { id: "quiz", icon: "quiz", label: "Quiz", color: "text-sky-600" },
    { id: "analytics", icon: "analytics", label: "Analytics", color: "text-purple-600" },
  ];

  const handleSelectDoc = (doc) => {
    setSelectedDoc(doc);
    if (doc && activeFeature === "documents") setActiveFeature("chat");
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-base sm:text-lg">auto_awesome</span>
            </div>
            AI Assistant
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Upload PDFs · Chat · Summarize · Explain · Flashcards · Quiz · Analytics</p>
        </div>
        {selectedDoc && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl max-w-full sm:max-w-xs">
            <span className="material-symbols-outlined text-blue-600 text-sm flex-shrink-0">description</span>
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300 truncate">{selectedDoc.title}</span>
            <button onClick={() => setSelectedDoc(null)} className="text-blue-400 hover:text-blue-600 flex-shrink-0"><span className="material-symbols-outlined text-sm">close</span></button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-5">
        <div className="lg:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <span className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-base ${features.find(f => f.id === activeFeature)?.color}`}>{features.find(f => f.id === activeFeature)?.icon}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{features.find(f => f.id === activeFeature)?.label}</span>
            </span>
            <span className="material-symbols-outlined text-gray-400">{mobileMenuOpen ? "expand_less" : "expand_more"}</span>
          </button>
          {mobileMenuOpen && (
            <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-2 grid grid-cols-4 gap-1">
              {features.map((f) => (
                <button key={f.id} onClick={() => { setActiveFeature(f.id); setMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${activeFeature === f.id ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                  <span className="material-symbols-outlined text-base">{f.icon}</span>
                  <span className="text-[10px] font-medium">{f.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hidden lg:block lg:w-44 flex-shrink-0">
          <nav className="flex lg:flex-col gap-1.5">
            {features.map((f) => (
              <button key={f.id} onClick={() => setActiveFeature(f.id)} className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeFeature === f.id ? "bg-blue-600 text-white shadow-md" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                <span className={`material-symbols-outlined text-base ${activeFeature === f.id ? "text-white" : f.color}`}>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-3 sm:p-5 min-h-[400px]">
          {activeFeature === "documents" && <DocumentsPanel onSelectDoc={handleSelectDoc} selectedDocId={selectedDoc?._id} />}
          {activeFeature === "chat" && <ChatPanel doc={selectedDoc} />}
          {activeFeature === "summary" && <SummaryPanel doc={selectedDoc} />}
          {activeFeature === "explain" && <ExplainPanel doc={selectedDoc} />}
          {activeFeature === "flashcards" && <FlashcardsPanel doc={selectedDoc} />}
          {activeFeature === "quiz" && <QuizPanel doc={selectedDoc} />}
          {activeFeature === "analytics" && <AnalyticsPanel />}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800/50 rounded-xl p-3 sm:p-3.5 flex items-start gap-3">
        <span className="material-symbols-outlined text-blue-500 text-base mt-0.5 flex-shrink-0">info</span>
        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
          <strong>How it works:</strong> Upload a PDF from Documents. Then select it to unlock all AI features — Chat, Summary, Explain, Flashcards, Quiz, and track your progress in Analytics.
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;