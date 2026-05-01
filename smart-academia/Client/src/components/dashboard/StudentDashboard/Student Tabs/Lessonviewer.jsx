import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Mini Bar ──────────────────────────────────────────────────
const MiniBar = ({ value = 0, color = "#6366f1", height = 4 }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height, background: "#1e293b" }}>
    <div
      className="h-full rounded-full"
      style={{
        width: `${Math.min(value, 100)}%`,
        background: `linear-gradient(90deg, ${color}cc, ${color})`,
        boxShadow: `0 0 8px ${color}66`,
        transition: "width 1s cubic-bezier(.4,0,.2,1)"
      }}
    />
  </div>
);

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ icon, title, color = "#6366f1" }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
      <span className="material-symbols-outlined text-sm" style={{ color }}>{icon}</span>
    </div>
    <h3 className="text-xs font-bold text-white tracking-wide uppercase">{title}</h3>
    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}44, transparent)` }} />
  </div>
);

// ── Loading Spinner ───────────────────────────────────────────
const LoadingSpinner = ({ size = "md" }) => {
  const dimensions = size === "sm" ? "w-10 h-10" : size === "lg" ? "w-16 h-16" : "w-12 h-12";
  return (
    <div className={`relative ${dimensions} mx-auto`}>
      <div className="absolute inset-0 rounded-full border-4 border-indigo-900" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
      <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
    </div>
  );
};

// ── Status Badge ──────────────────────────────────────────────
const StatusBadge = ({ status, type = "quiz" }) => {
  const config = {
    quiz: {
      passed: { color: "#22c55e", bg: "#22c55e22", border: "#22c55e44", label: "✓ Passed", icon: "emoji_events" },
      failed: { color: "#ef4444", bg: "#ef444422", border: "#ef444444", label: "✗ Failed", icon: "cancel" },
      submitted: { color: "#6366f1", bg: "#6366f122", border: "#6366f144", label: "Submitted", icon: "pending" },
    },
    lab: {
      graded: { color: "#22c55e", bg: "#22c55e22", border: "#22c55e44", label: "✓ Graded", icon: "verified" },
      submitted: { color: "#f59e0b", bg: "#f59e0b22", border: "#f59e0b44", label: "Submitted", icon: "pending" },
    },
  };
  const c = config[type]?.[status] || { color: "#6b7280", bg: "#6b728022", border: "#6b728044", label: status, icon: "info" };
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}>
      <span className="material-symbols-outlined text-xs">{c.icon}</span>
      {c.label}
    </span>
  );
};

// ── Content Block Renderer for Student View (Enhanced with Markdown + HTML) ──
const ContentBlockRenderer = ({ block }) => {
  if (!block) return null;

  switch (block.type) {
    case 'text':
      const content = block.content || '';
      
      // Check if content contains HTML tags
      const hasHtml = /<[^>]*>/.test(content);
      // Check if content contains Markdown syntax
      const hasMarkdown = /[#*`\[\]>\-]/.test(content);
      
      // If it has HTML tags, render as HTML directly
      if (hasHtml) {
        return (
          <div className="prose prose-sm dark:prose-invert max-w-none my-4">
            <div 
              className="text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }} 
            />
          </div>
        );
      }
      
      // If it has Markdown syntax, render with ReactMarkdown
      if (hasMarkdown && content.length > 0) {
        return (
          <div className="prose prose-sm dark:prose-invert max-w-none my-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold text-white mt-4 mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-bold text-white mt-3 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-bold text-white mt-2 mb-1">{children}</h3>,
                p: ({ children }) => <p className="my-2 leading-relaxed text-gray-300">{children}</p>,
                strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
                code: ({ children, inline }) => inline ? (
                  <code className="bg-gray-800 px-1 py-0.5 rounded text-indigo-400 text-xs font-mono">{children}</code>
                ) : (
                  <pre className="bg-gray-900 p-3 rounded-lg overflow-x-auto my-3">
                    <code className="text-sm text-green-400 font-mono">{children}</code>
                  </pre>
                ),
                ul: ({ children }) => <ul className="list-disc ml-6 my-2 text-gray-300">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal ml-6 my-2 text-gray-300">{children}</ol>,
                li: ({ children }) => <li className="my-1">{children}</li>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-indigo-500 pl-4 my-2 italic text-gray-400">{children}</blockquote>,
                a: ({ href, children }) => <a href={href} className="text-indigo-400 hover:text-indigo-300 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                img: ({ src, alt }) => <img src={src} alt={alt} className="max-w-full rounded-xl my-3" />,
                hr: () => <hr className="my-4 border-gray-700" />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        );
      }
      
      // Plain text fallback
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none my-4">
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>
      );
    
    case 'image':
      return (
        <figure className="my-6">
          <img 
            src={block.url} 
            alt={block.caption || "Lesson image"} 
            className="w-full rounded-xl max-h-[500px] object-contain bg-gray-900"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          {block.caption && (
            <figcaption className="text-center text-xs text-gray-500 mt-2 italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    
    case 'video':
      return (
        <figure className="my-6">
          <div className="rounded-xl overflow-hidden bg-black">
            {block.url && (block.url.includes('youtube.com') || block.url.includes('youtu.be')) ? (
              <iframe
                src={block.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                className="w-full aspect-video"
                allowFullScreen
                title="Lesson video"
              />
            ) : block.url && (block.url.includes('.mp4') || block.url.includes('.webm')) ? (
              <video controls className="w-full">
                <source src={block.url} />
              </video>
            ) : (
              <div className="aspect-video flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-gray-500">play_circle</span>
              </div>
            )}
          </div>
          {block.caption && (
            <figcaption className="text-center text-xs text-gray-500 mt-2 italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    
    default:
      return null;
  }
};

const apiFetch = (url, opts = {}) => {
  const token = localStorage.getItem("token");
  return fetch(`${API}${url}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
};

// ─────────────────────────────────────────────
// QUIZ SECTION (FULL IMPLEMENTATION)
// ─────────────────────────────────────────────
const QuizSection = ({ quiz, courseId, lessonId, onCompleted }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [warning, setWarning] = useState("");
  const timerRef = useRef(null);
  const warningRef = useRef(0);
  const attemptIdRef = useRef(null);

  useEffect(() => {
    fetchInit();
    return () => clearInterval(timerRef.current);
  }, [quiz._id]);

  useEffect(() => {
    if (attempts >= quiz.maxAttempts && !result?.passed) {
      markQuizExhausted();
    }
  }, [attempts, quiz.maxAttempts]);

  const markQuizExhausted = async () => {
    try {
      await apiFetch(`/api/quizzes/${quiz._id}/mark-exhausted`, { method: "POST" });
      onCompleted && onCompleted();
    } catch { /* silent */ }
  };

  const fetchInit = async () => {
    try {
      const [qRes, aRes] = await Promise.all([
        apiFetch(`/api/quizzes/${quiz._id}/questions`),
        apiFetch(`/api/quizzes/${quiz._id}/my-attempts`),
      ]);
      const qData = await qRes.json();
      const aData = await aRes.json();
      if (qRes.ok) setQuestions(qData.questions || []);
      if (aRes.ok) {
        const att = aData.attempts || [];
        setAttempts(att.length);
        if (att.length > 0) {
          const best = att.reduce((a, b) => (a.score > b.score ? a : b));
          setSubmitted(true);
          setResult({ score: best.score, passed: best.passed, alreadyDone: true });
          onCompleted && onCompleted();
        }
      }
    } catch { /* ignore */ }
  };

  const handleVisibility = useCallback(() => {
    if (!started || submitted) return;
    if (document.hidden) {
      const current = warningRef.current + 1;
      warningRef.current = current;
      setTabWarnings(current);
      if (current === 1) {
        setWarning("⚠️ Warning 1/2: Do not switch tabs during the quiz!");
        setTimeout(() => setWarning(""), 5000);
      } else if (current >= 2) {
        setWarning("🚨 Auto-submitting: You switched tabs twice!");
        setTimeout(() => handleSubmit(true), 1500);
      }
    }
  }, [started, submitted]);

  useEffect(() => {
    if (!started) return;
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [started, handleVisibility]);

  const startTimer = () => {
    setTimeLeft(quiz.timeLimit * 60);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStart = async () => {
    setAnswers({});
    setResult(null);
    setSubmitted(false);
    setError("");
    setTabWarnings(0);
    warningRef.current = 0;

    try {
      const res = await apiFetch(`/api/quizzes/${quiz._id}/attempt`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      attemptIdRef.current = data.attempt._id;
      setQuestions(data.questions || []);
    } catch {
      setError("Cannot connect to server");
      return;
    }

    setStarted(true);
    startTimer();
  };

  const handleAnswer = (qId, val) => setAnswers((p) => ({ ...p, [qId]: val }));

  const handleSubmit = async (flagCheating = false) => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    setError("");
    setStarted(false);
    try {
      const payload = {
        attemptId: attemptIdRef.current,
        answers: Object.fromEntries(questions.map((q) => [q._id, answers[q._id] ?? null])),
        timeTaken: quiz.timeLimit * 60 - (timeLeft || 0),
        flaggedForCheating: flagCheating || warningRef.current >= 2,
      };
      const res = await apiFetch(`/api/quizzes/submit`, { method: "POST", body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setResult(data);
      setSubmitted(true);
      setAttempts((p) => p + 1);
      onCompleted && onCompleted();
    } catch {
      setError("Cannot connect to server");
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (attempts >= quiz.maxAttempts && !result?.passed) {
    return (
      <div className="rounded-xl p-4" style={{ background: "#ef444422", border: "1px solid #ef444444" }}>
        <p className="text-sm font-medium text-red-400 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">block</span>
          Maximum {quiz.maxAttempts} attempts reached.
        </p>
      </div>
    );
  }

  if (!started && !submitted) {
    return (
      <div className="rounded-xl p-5 space-y-4" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#f59e0b22", border: "1px solid #f59e0b44" }}>
            <span className="material-symbols-outlined text-xl text-amber-500">quiz</span>
          </div>
          <div>
            <p className="font-bold text-white text-sm">{quiz.title || "Lesson Quiz"}</p>
            <p className="text-xs text-gray-500">
              {quiz.questions?.length || "?"} questions · {quiz.timeLimit} min · Pass: {quiz.passingScore}%
            </p>
          </div>
        </div>
        <div className="p-3 rounded-xl text-xs" style={{ background: "#f59e0b22", border: "1px solid #f59e0b44", color: "#fbbf24" }}>
          ⚠️ Tab switching is monitored. 1st switch = warning. 2nd switch = auto-submit.
        </div>
        {attempts > 0 && (
          <p className="text-xs text-amber-500">Attempt {attempts + 1} of {quiz.maxAttempts}</p>
        )}
        <button
          onClick={handleStart}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
        >
          <span className="material-symbols-outlined text-base">play_arrow</span>
          {attempts > 0 ? "Retake Quiz" : "Start Quiz"}
        </button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  if (submitted && result) {
    const isPassed = result.passed;
    return (
      <div className="rounded-xl p-5" style={{ background: isPassed ? "#22c55e22" : "#ef444422", border: `1px solid ${isPassed ? "#22c55e44" : "#ef444444"}` }}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center`} style={{ background: isPassed ? "#22c55e22" : "#ef444422" }}>
            <span className={`material-symbols-outlined text-xl ${isPassed ? "text-emerald-400" : "text-red-400"}`}>
              {isPassed ? "check_circle" : "task_alt"}
            </span>
          </div>
          <div>
            <p className={`font-bold text-sm ${isPassed ? "text-emerald-400" : "text-red-400"}`}>
              {result.alreadyDone
                ? result.passed ? "Already Passed ✓" : `Previously attempted — ${result.score}%`
                : result.passed ? `Passed! ${result.score}%` : `Submitted — ${result.score}% (need ${quiz.passingScore}% to pass)`}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Quiz submitted ✓ — this counts toward lesson completion</p>
            {result.flaggedForCheating && (
              <p className="text-xs text-red-400 mt-1">⚠️ Flagged for tab switching</p>
            )}
          </div>
        </div>
        {!result.passed && attempts < quiz.maxAttempts && (
          <button
            onClick={handleStart}
            className="w-full py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
          >
            Try Again ({quiz.maxAttempts - attempts} left)
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "#0f1629", border: "1px solid #f59e0b33" }}>
      <div className="flex items-center justify-between px-5 py-3" style={{ background: "#f59e0b22", borderBottom: "1px solid #f59e0b44" }}>
        <p className="text-xs font-bold text-amber-400">Quiz in progress</p>
        <span className={`font-mono font-bold text-sm ${timeLeft < 60 ? "text-red-400" : "text-amber-400"}`}>
          {fmt(timeLeft || 0)}
        </span>
      </div>

      {warning && (
        <div className="px-5 py-2 text-sm text-red-400 font-medium" style={{ background: "#ef444422", borderBottom: "1px solid #ef444444" }}>
          {warning}
        </div>
      )}
      {tabWarnings > 0 && !warning && (
        <div className="px-5 py-2 text-xs" style={{ background: "#f59e0b22", borderBottom: "1px solid #f59e0b44", color: "#fbbf24" }}>
          Tab switches: {tabWarnings}/2
        </div>
      )}

      <div className="p-5 space-y-5 max-h-96 overflow-y-auto">
        {error && <p className="text-sm text-red-400">{error}</p>}
        {questions.map((q, i) => (
          <div key={q._id}>
            <p className="text-sm font-semibold text-white mb-3">{i + 1}. {q.text || q.questionText}</p>
            <div className="space-y-2">
              {(q.options || []).map((opt, j) => {
                const optText = typeof opt === "object" ? opt.text : opt;
                const optIndex = typeof opt === "object" ? opt.index : j;
                return (
                  <label
                    key={j}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      answers[q._id] === optIndex
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-gray-700 hover:border-gray-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q._id}
                      value={optIndex}
                      checked={answers[q._id] === optIndex}
                      onChange={() => handleAnswer(q._id, optIndex)}
                      className="text-amber-600 w-4 h-4"
                    />
                    <span className="text-sm text-gray-300">{optText}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 border-t" style={{ borderColor: "#1e293b" }}>
        <button
          onClick={() => handleSubmit(false)}
          disabled={submitting}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
        >
          {submitting ? (
            <><LoadingSpinner size="sm" /><span>Grading...</span></>
          ) : (
            <><span className="material-symbols-outlined text-base">check</span>Submit Quiz</>
          )}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// LAB SECTION (FULL IMPLEMENTATION)
// ─────────────────────────────────────────────
const LabSection = ({ lab, lessonId, courseId, onCompleted }) => {
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [showPdf, setShowPdf] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [loadingExpl, setLoadingExpl] = useState(false);
  const [activeTab, setActiveTab] = useState("instructions");
  const fileInputRef = useRef(null);

  useEffect(() => { fetchMySubmission(); }, [lab._id]);

  const fetchMySubmission = async () => {
    try {
      const res = await apiFetch(`/api/courses/${courseId}/lessons/${lessonId}/lab/${lab._id}/my-submission`);
      const data = await res.json();
      if (res.ok && data.submission) {
        setSubmission(data.submission);
        setAnswer(data.submission.answer || "");
        setSubmitted(true);
        onCompleted && onCompleted();
        if (data.submission.status === "graded") setActiveTab("result");
        else setActiveTab("submit");
      } else {
        if (lab.starterCode) setAnswer(lab.starterCode);
      }
    } catch {
      if (lab.starterCode) setAnswer(lab.starterCode);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim() && !pdfFile) {
      setError("Please write an answer or upload a PDF file");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      if (answer.trim()) formData.append("answer", answer.trim());
      if (pdfFile) formData.append("pdf", pdfFile);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/courses/${courseId}/lessons/${lessonId}/lab/${lab._id}/submit`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Submission failed");
        return;
      }
      setSubmitted(true);
      setPdfFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onCompleted && onCompleted();
      setSuccess("Lab submitted successfully!");
      await fetchMySubmission();
      setActiveTab("result");
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      setError("Cannot connect to server");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAiExplain = async () => {
    setLoadingExpl(true);
    setError("");
    try {
      const res = await apiFetch(`/api/courses/${courseId}/lessons/${lessonId}/lab/${lab._id}/explain`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setExplanation(data.explanation);
        setShowExplain(true);
      } else setError(data.message || "AI explanation failed");
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoadingExpl(false);
    }
  };

  const labCfg = {
    programming: { icon: "terminal", color: "#22c55e", bg: "#22c55e22", border: "#22c55e44", label: "Programming Lab" },
    dld: { icon: "schema", color: "#3b82f6", bg: "#3b82f622", border: "#3b82f644", label: "DLD Lab" },
    networking: { icon: "hub", color: "#a855f7", bg: "#a855f722", border: "#a855f744", label: "Networking Lab" },
    theory: { icon: "description", color: "#f59e0b", bg: "#f59e0b22", border: "#f59e0b44", label: "Theory Lab" },
  };
  const cfg = labCfg[lab.labType] || labCfg.theory;

  const diffColor = {
    easy: { bg: "#22c55e22", border: "#22c55e44", color: "#4ade80" },
    medium: { bg: "#f59e0b22", border: "#f59e0b44", color: "#fbbf24" },
    hard: { bg: "#ef444422", border: "#ef444444", color: "#f87171" },
  };
  const diff = diffColor[lab.difficulty] || diffColor.medium;

  const tabClass = (key) => ({
    background: activeTab === key ? "#1e293b" : "transparent",
    color: activeTab === key ? "#818cf8" : "#4b5563",
    borderBottom: activeTab === key ? "2px solid #818cf8" : "2px solid transparent",
  });

  const isOverdue = lab.dueDate && new Date(lab.dueDate) < new Date() && !submitted;

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
      <div className="px-5 py-4" style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b" }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              <span className={`material-symbols-outlined text-lg`} style={{ color: cfg.color }}>{cfg.icon}</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-white text-sm">{lab.title}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold`} style={{ background: diff.bg, border: `1px solid ${diff.border}`, color: diff.color }}>
                  {lab.difficulty}
                </span>
                {lab.totalMarks && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "#6366f122", border: "1px solid #6366f144", color: "#818cf8" }}>
                    {lab.totalMarks} pts
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{cfg.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {lab.dueDate && (
              <span className={`text-xs flex items-center gap-1 ${isOverdue ? "text-red-400" : "text-gray-500"}`}>
                <span className="material-symbols-outlined text-sm">{isOverdue ? "warning" : "schedule"}</span>
                {isOverdue ? "Overdue" : "Due"}: {new Date(lab.dueDate).toLocaleDateString()}
              </span>
            )}
            {submitted && (
              <StatusBadge status={submission?.status === "graded" ? "graded" : "submitted"} type="lab" />
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-1 p-1.5" style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b" }}>
        <button className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all`} style={tabClass("instructions")} onClick={() => setActiveTab("instructions")}>
          <span className="material-symbols-outlined text-sm">info</span>
          Instructions
        </button>
        <button className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all`} style={tabClass("submit")} onClick={() => setActiveTab("submit")}>
          <span className="material-symbols-outlined text-sm">upload</span>
          Submit
        </button>
        {submitted && (
          <button className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all`} style={tabClass("result")} onClick={() => setActiveTab("result")}>
            <span className="material-symbols-outlined text-sm">{submission?.status === "graded" ? "grade" : "pending"}</span>
            Result
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {activeTab === "instructions" && (
          <>
            {lab.description && <p className="text-sm text-gray-300 leading-relaxed">{lab.description}</p>}
            <div className="p-4 rounded-xl" style={{ background: "#3b82f622", border: "1px solid #3b82f644" }}>
              <p className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-sm">list</span>Step-by-step instructions</p>
              <div className="space-y-1">{lab.instructions.split("\n").filter(Boolean).map((step, i) => <p key={i} className="text-xs text-gray-300 leading-relaxed">{step}</p>)}</div>
            </div>
            {lab.outputExample && (<div className="p-4 rounded-xl" style={{ background: "#1e293b", border: "1px solid #334155" }}><p className="text-xs text-gray-400 mb-2 font-medium">Expected output</p><pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{lab.outputExample}</pre></div>)}
            {lab.labType === "programming" && lab.testCases?.length > 0 && (<div className="p-4 rounded-xl" style={{ background: "#1e293b", border: "1px solid #334155" }}><p className="text-xs text-gray-400 mb-3 font-medium">Test cases</p><div className="space-y-2">{lab.testCases.map((tc, i) => (<div key={i} className="flex flex-wrap items-center gap-2 text-xs font-mono"><span className="text-gray-500">Input:</span><code className="px-2 py-0.5 rounded" style={{ background: "#0f1629", color: "#4ade80" }}>{tc.input}</code><span className="text-gray-500">→</span><code className="px-2 py-0.5 rounded" style={{ background: "#0f1629", color: "#60a5fa" }}>{tc.expectedOutput}</code>{tc.description && <span className="text-gray-500 italic">{tc.description}</span>}</div>))}</div></div>)}
            <button onClick={handleAiExplain} disabled={loadingExpl} className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-50 w-full" style={{ background: "#a855f722", color: "#c084fc", border: "1px solid #a855f744" }}>{loadingExpl ? <><LoadingSpinner size="sm" /><span>Getting AI explanation...</span></> : <><span className="material-symbols-outlined text-sm">auto_awesome</span>AI Explain this lab</>}</button>
            {showExplain && explanation && (<div className="rounded-xl overflow-hidden" style={{ background: "#0f1629", border: "1px solid #a855f744" }}><div className="flex items-center justify-between px-4 py-3" style={{ background: "#a855f722", borderBottom: "1px solid #a855f744" }}><p className="text-sm font-bold text-purple-400">AI Explanation</p><button onClick={() => setShowExplain(false)} className="text-purple-400 hover:text-purple-300"><span className="material-symbols-outlined text-sm">close</span></button></div><div className="p-4 space-y-3">{explanation.steps?.length > 0 && (<div><p className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5"><span className="material-symbols-outlined text-purple-400 text-base">strategy</span>Approach</p><ol className="space-y-2">{explanation.steps.map((s, i) => (<li key={i} className="flex gap-3 p-3 rounded-lg" style={{ background: "#a855f710", border: "1px solid #a855f730" }}><span className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 text-xs font-bold" style={{ background: "#a855f722", color: "#c084fc" }}>{i + 1}</span><span className="text-sm text-gray-300 leading-relaxed">{typeof s === "object" ? (s.instruction || s.step || s.text || JSON.stringify(s)) : s}</span></li>))}</ol></div>)}{explanation.concepts?.length > 0 && (<div><p className="text-xs font-semibold text-gray-400 mb-2">Key concepts</p><div className="flex flex-wrap gap-2">{explanation.concepts.map((c, i) => (<span key={i} className="text-[10px] px-2 py-1 rounded-full" style={{ background: "#a855f722", color: "#c084fc" }}>{c}</span>))}</div></div>)}</div></div>)}
            <button onClick={() => setActiveTab("submit")} className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}><span className="material-symbols-outlined text-sm">upload</span>Go to submission</button>
          </>
        )}

        {activeTab === "submit" && (
          <>
            {error && <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#ef444422", border: "1px solid #ef444444" }}><span className="material-symbols-outlined text-sm text-red-400">error</span><p className="text-sm text-red-400">{error}</p></div>}
            {success && <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#22c55e22", border: "1px solid #22c55e44" }}><span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span><p className="text-sm text-emerald-400">{success}</p></div>}
            {submitted && <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#6366f122", border: "1px solid #6366f144" }}><span className="material-symbols-outlined text-sm text-indigo-400">info</span><p className="text-sm text-indigo-400">Already submitted — you can resubmit to update your answer.</p></div>}
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{lab.labType === "programming" ? "Your code" : "Your answer"}</label><textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={lab.labType === "programming" ? 12 : 7} placeholder={lab.labType === "programming" ? "Write your code solution here..." : "Write your answer here..."} className={`w-full px-4 py-3 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none outline-none transition-all ${lab.labType === "programming" ? "font-mono" : ""}`} /></div>
            <div className="rounded-xl p-4 border-2 border-dashed" style={{ borderColor: "#334155" }}><div className="flex flex-col sm:flex-row items-center gap-3"><input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={(e) => { const f = e.target.files[0]; if (!f) return; if (f.type !== "application/pdf") { setError("Only PDF files are accepted"); e.target.value = ""; return; } if (f.size > 20 * 1024 * 1024) { setError("PDF must be under 20 MB"); e.target.value = ""; return; } setError(""); setPdfFile(f); }} className="hidden" /><button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105" style={{ background: "#6366f122", color: "#818cf8", border: "1px solid #6366f144" }}><span className="material-symbols-outlined text-base">picture_as_pdf</span>Upload PDF</button>{pdfFile ? (<div className="flex items-center gap-2 text-sm text-emerald-400"><span className="material-symbols-outlined text-base">check_circle</span><span className="max-w-[180px] truncate">{pdfFile.name}</span><button onClick={() => { setPdfFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-red-400 hover:text-red-500"><span className="material-symbols-outlined text-sm">close</span></button></div>) : submission?.pdfUrl ? (<button onClick={() => setShowPdf(true)} className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"><span className="material-symbols-outlined text-base">description</span>View previously submitted PDF</button>) : null}</div><p className="text-[10px] text-gray-500 mt-3 text-center">PDF only · max 20 MB</p></div>
            <button onClick={handleSubmit} disabled={submitting} className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>{submitting ? <><LoadingSpinner size="sm" /><span>Submitting...</span></> : <><span className="material-symbols-outlined text-base">upload</span>{submitted ? "Resubmit" : "Submit Lab"}</>}</button>
          </>
        )}

        {activeTab === "result" && submission && (
          <>
            {submission.status === "graded" ? (<><div className={`rounded-xl p-4`} style={{ background: "#22c55e22", border: "1px solid #22c55e44" }}><div className="flex items-center gap-4"><div className="flex items-center justify-center w-14 h-14 rounded-full text-2xl font-black" style={{ background: "#22c55e22", color: "#4ade80" }}>{submission.marks}</div><div><p className="text-sm font-bold text-white">{submission.marks} / {lab.totalMarks || 100} marks</p><p className="text-xs text-gray-500">{Math.round((submission.marks / (lab.totalMarks || 100)) * 100)}% score{submission.gradedAt && ` · Graded ${new Date(submission.gradedAt).toLocaleDateString()}`}</p></div></div></div>{submission.feedback && (<div className="p-4 rounded-xl" style={{ background: "#3b82f622", border: "1px solid #3b82f644" }}><p className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-sm">feedback</span>Instructor feedback</p><p className="text-sm text-gray-300 leading-relaxed">{submission.feedback}</p></div>)}</>) : (<div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "#6366f122", border: "1px solid #6366f144" }}><span className="material-symbols-outlined text-indigo-400 text-2xl">pending</span><div><p className="text-sm font-semibold text-indigo-400">Submitted — awaiting review</p><p className="text-xs text-gray-500 mt-0.5">Submitted {new Date(submission.submittedAt).toLocaleString()}</p></div></div>)}
            {submission.answer && (<div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your submitted answer</p><pre className={`text-xs p-4 rounded-xl overflow-x-auto max-h-40 ${lab.labType === "programming" ? "font-mono" : "whitespace-pre-wrap font-sans"}`} style={{ background: "#1e293b", border: "1px solid #334155", color: "#cbd5e1" }}>{submission.answer}</pre></div>)}
            {submission.pdfUrl && (<button onClick={() => setShowPdf(true)} className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105" style={{ background: "#6366f122", color: "#818cf8", border: "1px solid #6366f144" }}><span className="material-symbols-outlined text-base">picture_as_pdf</span>View submitted PDF — {submission.pdfFileName || "submission.pdf"}</button>)}
            <button onClick={() => setActiveTab("submit")} className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105" style={{ background: "#6366f122", color: "#818cf8", border: "1px solid #6366f144" }}>{submission.status === "graded" ? "Resubmit" : "Update submission"}</button>
          </>
        )}
      </div>

      {showPdf && submission?.pdfUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPdf(false)}>
          <div className="rounded-2xl w-full flex flex-col overflow-hidden" style={{ maxWidth: "95vw", height: "90vh", background: "#0f1629", border: "1px solid #1e293b" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}><div><p className="text-sm font-bold text-white">Lab Submission</p><p className="text-xs text-indigo-200">{submission.pdfFileName || "submission.pdf"}</p></div><div className="flex items-center gap-2"><a href={submission.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 bg-white hover:bg-indigo-50 transition-colors"><span className="material-symbols-outlined text-sm">open_in_new</span>Open</a><button onClick={() => setShowPdf(false)} className="text-white hover:bg-white/20 rounded-lg p-1.5"><span className="material-symbols-outlined">close</span></button></div></div>
            <div className="flex-1" style={{ minHeight: 0, background: "#1a1a2e" }}><iframe src={submission.pdfUrl} className="w-full h-full" style={{ border: "none" }} title="Lab PDF Submission" /></div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN LESSON VIEWER
// ─────────────────────────────────────────────
const LessonViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loadTrigger, setLoadTrigger] = useState(0);
  const [lessonData, setLessonData] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [course, setCourse] = useState(null);
  const [quizDone, setQuizDone] = useState(false);
  const [labDone, setLabDone] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navigatingNext, setNavigatingNext] = useState(false);

  useEffect(() => { fetchAll(); }, [courseId]);
  useEffect(() => { if (activeLesson?._id) openLesson(activeLesson._id); }, [activeLesson?._id, loadTrigger]);

  const fetchAll = async () => {
    setLoadingList(true);
    try {
      const [cRes, lRes] = await Promise.all([
        apiFetch(`/api/courses/${courseId}`),
        apiFetch(`/api/courses/${courseId}/lessons`),
      ]);
      const cData = await cRes.json();
      const lData = await lRes.json();
      if (cRes.ok) setCourse(cData.course);
      if (lRes.ok && lData.lessons?.length > 0) {
        setLessons(lData.lessons);
        const target = lData.lessons.find((l) => !l.isLocked && !l.isCompleted) || lData.lessons.find((l) => !l.isLocked);
        if (target) setActiveLesson(target);
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoadingList(false);
    }
  };

  const openLesson = async (lessonId) => {
    setLoadingLesson(true);
    setError("");
    setQuizDone(false);
    setLabDone(false);
    try {
      const res = await apiFetch(`/api/courses/${courseId}/lessons/${lessonId}/content`);
      const data = await res.json();
      console.log("=== DEBUG: Received lesson data ===");
      console.log("contentBlocks from API:", data.lesson?.contentBlocks);
      if (!res.ok) {
        setError(data.message);
        setLessonData(null);
        return;
      }
      setLessonData(data);
      setQuizDone(data.progress?.quizCompleted || false);
      setLabDone(data.progress?.labCompleted || false);
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoadingLesson(false);
    }
  };

  const refreshAfterStep = async () => {
    try {
      const lRes = await apiFetch(`/api/courses/${courseId}/lessons`);
      const lData = await lRes.json();
      if (lRes.ok) setLessons(lData.lessons);

      if (activeLesson?._id) {
        const ldRes = await apiFetch(`/api/courses/${courseId}/lessons/${activeLesson._id}/content`);
        const ldData = await ldRes.json();
        if (ldRes.ok) {
          setLessonData(ldData);
          setQuizDone(ldData.progress?.quizCompleted || false);
          setLabDone(ldData.progress?.labCompleted || false);
        }
      }
    } catch { /* silent */ }
  };

  const handleLessonClick = (lesson) => {
    setSidebarOpen(false);
    if (lesson._id === activeLesson?._id) {
      setLoadTrigger((t) => t + 1);
    } else {
      setActiveLesson(lesson);
    }
  };

  const handleNextLesson = async () => {
    if (!lessonData?.lesson || navigatingNext) return;
    setNavigatingNext(true);
    try {
      const lRes = await apiFetch(`/api/courses/${courseId}/lessons`);
      const lData = await lRes.json();
      if (lRes.ok) {
        setLessons(lData.lessons);
        const nextLesson = lData.lessons.find((l) => l.order === lessonData.lesson.order + 1 && !l.isLocked);
        if (nextLesson) {
          setActiveLesson(nextLesson);
          setSidebarOpen(false);
        }
      }
    } catch { /* silent */ } finally {
      setNavigatingNext(false);
    }
  };

  const computeCanGoNext = () => {
    if (!lessonData?.lesson || !lessons.length) return false;
    const nextExists = lessons.some((l) => l.order === lessonData.lesson.order + 1);
    if (!nextExists) return false;
    const viewed = lessonData.progress?.lessonViewed || false;
    if (!viewed) return false;
    const quizRequired = lessonData.lesson.requiresQuiz && !!lessonData.quiz;
    const labRequired = lessonData.lesson.requiresLab && !!lessonData.lab;
    if (quizRequired && !quizDone) return false;
    if (labRequired && !labDone) return false;
    return true;
  };

  const canGoNext = computeCanGoNext();

  const getProgressItems = () => {
    if (!lessonData?.lesson) return [];
    const items = [];
    items.push({ label: "Read lesson", done: lessonData.progress?.lessonViewed || false, icon: "menu_book" });
    if (lessonData.lesson.requiresQuiz && lessonData.quiz) {
      items.push({ label: "Submit quiz", done: quizDone, icon: "quiz" });
    }
    if (lessonData.lesson.requiresLab && lessonData.lab) {
      items.push({ label: "Submit lab", done: labDone, icon: "science" });
    }
    return items;
  };

  const progress = lessons.length > 0 ? Math.round((lessons.filter((l) => l.isCompleted).length / lessons.length) * 100) : 0;

  if (loadingList) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "#0f1629" }}>
      <LoadingSpinner size="lg" />
    </div>
  );

  const progressItems = getProgressItems();

  return (
    <div className="min-h-screen" style={{ background: "#0f1629", fontFamily: "'Lexend', sans-serif" }}>
      {/* Top bar */}
      <div className="sticky top-0 z-30" style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b" }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:scale-105"
            style={{ background: "#6366f122", color: "#818cf8", border: "1px solid #6366f144" }}
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:scale-105"
            style={{ background: "#6366f122", color: "#818cf8", border: "1px solid #6366f144" }}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="flex-1 font-bold text-white truncate text-sm">
            {course?.title}
          </h1>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-gray-500 hidden sm:inline">{lessons.filter((l) => l.isCompleted).length}/{lessons.length}</span>
            <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #6366f1, #818cf8)" }} />
            </div>
            <span className="text-xs font-bold text-indigo-400">{progress}%</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row" style={{ height: "calc(100vh - 57px)" }}>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col flex-shrink-0 overflow-hidden transition-transform duration-300 transform
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `} style={{ background: "#0a0f1e", borderRight: "1px solid #1e293b" }}>
          <div className="p-4" style={{ borderBottom: "1px solid #1e293b" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Lessons</p>
                <p className="text-xs text-gray-500">{lessons.filter((l) => !l.isLocked).length} unlocked</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-gray-800">
                <span className="material-symbols-outlined text-gray-500 text-lg">close</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {lessons.map((lesson) => (
              <button
                key={lesson._id}
                disabled={lesson.isLocked}
                onClick={() => handleLessonClick(lesson)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  lesson.isLocked
                    ? "border-gray-800 opacity-50 cursor-not-allowed"
                    : activeLesson?._id === lesson._id
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-gray-800 hover:border-indigo-500/50 bg-gray-800/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 text-xs font-bold ${
                    lesson.isCompleted
                      ? "text-emerald-400" 
                      : lesson.isLocked
                        ? "text-gray-500"
                        : "text-indigo-400"
                  }`} style={{ background: lesson.isCompleted ? "#22c55e22" : lesson.isLocked ? "#1e293b" : "#6366f122", border: `1px solid ${lesson.isCompleted ? "#22c55e44" : lesson.isLocked ? "#334155" : "#6366f144"}` }}>
                    {lesson.isCompleted ? "✓" : lesson.isLocked ? "🔒" : lesson.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{lesson.title}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{lesson.duration}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {loadingLesson ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <span className="material-symbols-outlined text-5xl text-gray-700 mb-4 block">error</span>
                <p className="text-sm text-gray-500">{error}</p>
              </div>
            </div>
          ) : lessonData ? (
            <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6 pb-12">
              {/* Lesson header */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#6366f122", color: "#818cf8", border: "1px solid #6366f144" }}>
                    Lesson {lessonData.lesson.order}
                  </span>
                  <span className="text-[10px] text-gray-500">{lessonData.lesson.duration}</span>
                  {lessonData.progress?.isCompleted && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#22c55e22", color: "#4ade80", border: "1px solid #22c55e44" }}>
                      ✓ Completed
                    </span>
                  )}
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white">{lessonData.lesson.title}</h2>
                {lessonData.lesson.description && (
                  <p className="text-sm text-gray-400 mt-2">{lessonData.lesson.description}</p>
                )}
              </div>

              {/* CONTENT BLOCKS - Enhanced with Markdown + HTML support */}
              {lessonData?.lesson?.contentBlocks && lessonData.lesson.contentBlocks.length > 0 ? (
                <div className="space-y-6">
                  {lessonData.lesson.contentBlocks.map((block, idx) => (
                    <ContentBlockRenderer key={block.id || idx} block={block} />
                  ))}
                </div>
              ) : (
                // Fallback to legacy content
                <>
                  {lessonData.lesson.videoUrl && (
                    <div className="rounded-xl overflow-hidden bg-black aspect-video">
                      {lessonData.lesson.videoUrl.includes("youtube.com") || lessonData.lesson.videoUrl.includes("youtu.be") ? (
                        <iframe
                          src={lessonData.lesson.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")}
                          className="w-full h-full"
                          allowFullScreen
                          title={lessonData.lesson.title}
                        />
                      ) : (
                        <video controls className="w-full h-full" src={lessonData.lesson.videoUrl} />
                      )}
                    </div>
                  )}

                  {lessonData.lesson.images?.length > 0 && (
                    <div className={`grid gap-4 ${lessonData.lesson.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                      {lessonData.lesson.images.map((img, i) => (
                        <figure key={i} className="rounded-xl overflow-hidden" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
                          <img src={img.url} alt={img.caption || `Image ${i + 1}`} className="w-full object-cover max-h-64" />
                          {img.caption && (
                            <figcaption className="px-3 py-2 text-[10px] text-gray-500 text-center" style={{ background: "#0a0f1e", borderTop: "1px solid #1e293b" }}>
                              {img.caption}
                            </figcaption>
                          )}
                        </figure>
                      ))}
                    </div>
                  )}

                  {lessonData.lesson.content && (
                    <div className="rounded-2xl p-6" style={{ background: "#0a0f1e", border: "1px solid #1e293b" }}>
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none text-gray-300"
                        dangerouslySetInnerHTML={{ __html: lessonData.lesson.content }}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Progress Checklist */}
              {progressItems.length > 0 && (
                <div className="rounded-xl p-4" style={{ background: "#0a0f1e", border: "1px solid #1e293b" }}>
                  <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-indigo-400">checklist</span>
                    Lesson Progress
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {progressItems.map((item, i) => (
                      <div key={i} className={`flex items-center gap-2 text-xs font-medium ${item.done ? "text-emerald-400" : "text-gray-500"}`}>
                        <span className={`material-symbols-outlined text-base ${item.done ? "text-emerald-500" : "text-gray-600"}`}>
                          {item.done ? "check_circle" : "radio_button_unchecked"}
                        </span>
                        <span className="material-symbols-outlined text-sm">{item.icon}</span>
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz */}
              {lessonData.lesson.requiresQuiz && lessonData.quiz ? (
                <QuizSection quiz={lessonData.quiz} courseId={courseId} lessonId={lessonData.lesson._id} onCompleted={() => { setQuizDone(true); refreshAfterStep(); }} />
              ) : lessonData.lesson.requiresQuiz && !lessonData.quiz ? (
                <div className="rounded-xl p-4 flex items-center gap-2" style={{ background: "#f59e0b22", border: "1px solid #f59e0b44" }}>
                  <span className="material-symbols-outlined text-amber-500 text-base">info</span>
                  <p className="text-sm text-amber-400">Quiz required but not yet published by the instructor.</p>
                </div>
              ) : null}

              {/* Lab */}
              {lessonData.lesson.requiresLab && lessonData.lab ? (
                <LabSection lab={lessonData.lab} lessonId={lessonData.lesson._id} courseId={courseId} onCompleted={() => { setLabDone(true); refreshAfterStep(); }} />
              ) : lessonData.lesson.requiresLab && !lessonData.lab ? (
                <div className="rounded-xl p-4 flex items-center gap-2" style={{ background: "#f59e0b22", border: "1px solid #f59e0b44" }}>
                  <span className="material-symbols-outlined text-amber-500 text-base">info</span>
                  <p className="text-sm text-amber-400">Lab required but not yet published by the instructor.</p>
                </div>
              ) : null}

              {/* Next Lesson Button */}
              {canGoNext ? (
                <div className="mt-4 p-5 rounded-2xl" style={{ background: "linear-gradient(135deg, #6366f122, #818cf822)", border: "1px solid #6366f144" }}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-bold text-indigo-400 text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-400 text-lg">celebration</span>
                        Lesson complete — ready for the next one!
                      </p>
                      <p className="text-xs text-indigo-400/70 mt-0.5">
                        {lessons.find((l) => l.order === lessonData.lesson.order + 1)?.title || "Next lesson"}
                      </p>
                    </div>
                    <button
                      onClick={handleNextLesson}
                      disabled={navigatingNext}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
                    >
                      {navigatingNext ? <LoadingSpinner size="sm" /> : <span className="material-symbols-outlined text-base">arrow_forward</span>}
                      Next Lesson
                    </button>
                  </div>
                </div>
              ) : lessonData.progress?.isCompleted && !lessons.some((l) => l.order === lessonData.lesson.order + 1) ? (
                <div className="mt-4 p-5 rounded-2xl text-center" style={{ background: "linear-gradient(135deg, #22c55e22, #16a34a22)", border: "1px solid #22c55e44" }}>
                  <p className="font-bold text-emerald-400 text-base">Course Complete!</p>
                  <p className="text-sm text-emerald-400/80 mt-1">You have finished all lessons in this course. Well done!</p>
                  <button onClick={() => navigate("/student/dashboard")} className="mt-4 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                    Back to Dashboard
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <span className="material-symbols-outlined text-6xl text-gray-700 mb-4 block">menu_book</span>
                <p className="text-sm text-gray-500">{lessons.length === 0 ? "No lessons added yet" : "Select a lesson to start"}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LessonViewer;