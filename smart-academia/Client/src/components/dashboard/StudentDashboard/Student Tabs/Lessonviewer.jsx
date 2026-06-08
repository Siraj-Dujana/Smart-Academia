import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Mini Bar ──────────────────────────────────────────────────
const MiniBar = ({ value = 0, color = "#6366f1", height = 4 }) => (
  <div
    className="w-full rounded-full overflow-hidden"
    style={{ height, background: "#1e293b" }}
  >
    <div
      className="h-full rounded-full"
      style={{
        width: `${Math.min(value, 100)}%`,
        background: `linear-gradient(90deg, ${color}cc, ${color})`,
        boxShadow: `0 0 8px ${color}66`,
        transition: "width 1s cubic-bezier(.4,0,.2,1)",
      }}
    />
  </div>
);

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ icon, title, color = "#6366f1" }) => (
  <div className="flex items-center gap-3 mb-4">
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center"
      style={{ background: `${color}22`, border: `1px solid ${color}44` }}
    >
      <span className="material-symbols-outlined text-sm" style={{ color }}>
        {icon}
      </span>
    </div>
    <h3 className="text-xs font-bold text-white tracking-wide uppercase">
      {title}
    </h3>
    <div
      className="flex-1 h-px"
      style={{ background: `linear-gradient(90deg, ${color}44, transparent)` }}
    />
  </div>
);

// ── Loading Spinner ───────────────────────────────────────────
const LoadingSpinner = ({ size = "md" }) => {
  const dimensions =
    size === "sm" ? "w-10 h-10" : size === "lg" ? "w-16 h-16" : "w-12 h-12";
  return (
    <div className={`relative ${dimensions} mx-auto`}>
      <div className="absolute inset-0 rounded-full border-4 border-indigo-900" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
      <div
        className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"
        style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
      />
    </div>
  );
};

// ── Status Badge ──────────────────────────────────────────────
const StatusBadge = ({ status, type = "quiz" }) => {
  const config = {
    quiz: {
      passed: {
        color: "#22c55e",
        bg: "#22c55e22",
        border: "#22c55e44",
        label: "✓ Passed",
        icon: "emoji_events",
      },
      failed: {
        color: "#ef4444",
        bg: "#ef444422",
        border: "#ef444444",
        label: "✗ Failed",
        icon: "cancel",
      },
      submitted: {
        color: "#6366f1",
        bg: "#6366f122",
        border: "#6366f144",
        label: "Submitted",
        icon: "pending",
      },
    },
    lab: {
      graded: {
        color: "#22c55e",
        bg: "#22c55e22",
        border: "#22c55e44",
        label: "✓ Graded",
        icon: "verified",
      },
      submitted: {
        color: "#f59e0b",
        bg: "#f59e0b22",
        border: "#f59e0b44",
        label: "Submitted",
        icon: "pending",
      },
    },
  };
  const c = config[type]?.[status] || {
    color: "#6b7280",
    bg: "#6b728022",
    border: "#6b728044",
    label: status,
    icon: "info",
  };
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
      }}
    >
      <span className="material-symbols-outlined text-xs">{c.icon}</span>
      {c.label}
    </span>
  );
};

// ── Content Block Renderer for Student View (Handles HTML + Markdown) ──
const ContentBlockRenderer = ({ block }) => {
  if (!block) return null;

  switch (block.type) {
    case "text": {
      let content = block.content || "";

      content = content.replace(/\\n/g, "\n");
      content = content.replace(/\\\\n/g, "\n");

      const hasHtmlTags = /<[^>]+>/.test(content);

      if (hasHtmlTags) {
        return (
          <div className="html-content my-4">
            <div
              className="text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        );
      }

      return (
        <div className="markdown-content my-4">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {content}
          </ReactMarkdown>
        </div>
      );
    }

    case "image":
      return (
        <figure className="my-6">
          <img
            src={block.url}
            alt={block.caption || "Lesson image"}
            className="w-full rounded-xl max-h-[500px] object-contain bg-gray-900"
          />
          {block.caption && (
            <figcaption className="text-center text-xs text-gray-500 mt-2">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "video":
      return (
        <figure className="my-6">
          <div className="rounded-xl overflow-hidden bg-black">
            {block.url &&
            (block.url.includes("youtube.com") ||
              block.url.includes("youtu.be")) ? (
              <iframe
                src={block.url
                  .replace("watch?v=", "embed/")
                  .replace("youtu.be/", "www.youtube.com/embed/")}
                className="w-full aspect-video"
                allowFullScreen
                title="Lesson video"
              />
            ) : block.url &&
              (block.url.includes(".mp4") || block.url.includes(".webm")) ? (
              <video controls className="w-full">
                <source src={block.url} />
              </video>
            ) : (
              <div className="aspect-video flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-gray-500">
                  play_circle
                </span>
              </div>
            )}
          </div>
          {block.caption && (
            <figcaption className="text-center text-xs text-gray-500 mt-2">
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
// QUIZ SECTION (FULL IMPLEMENTATION - FIXED)
// ─────────────────────────────────────────────
const QuizSection = ({ quiz, courseId, lessonId, onCompleted, onPassed }) => {
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
      await apiFetch(`/api/quizzes/${quiz._id}/mark-exhausted`, {
        method: "POST",
      });
      onCompleted && onCompleted();
    } catch {
      /* silent */
    }
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
          setResult({
            score: best.score,
            passed: best.passed,
            alreadyDone: true,
          });
          onCompleted && onCompleted();
        }
      }
    } catch {
      /* ignore */
    }
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
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
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
      const res = await apiFetch(`/api/quizzes/${quiz._id}/attempt`, {
        method: "POST",
      });
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
        answers: Object.fromEntries(
          questions.map((q) => [q._id, answers[q._id] ?? null]),
        ),
        timeTaken: quiz.timeLimit * 60 - (timeLeft || 0),
        flaggedForCheating: flagCheating || warningRef.current >= 2,
      };
      const res = await apiFetch(`/api/quizzes/submit`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setResult(data);
      setSubmitted(true);
      setAttempts((p) => p + 1);
      onCompleted && onCompleted();
      onPassed && onPassed(data.passed === true);
    } catch {
      setError("Cannot connect to server");
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (attempts >= quiz.maxAttempts && !result?.passed) {
    return (
      <div
        className="rounded-xl p-4"
        style={{ background: "#ef444422", border: "1px solid #ef444444" }}
      >
        <p className="text-sm font-medium text-red-400 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">block</span>
          Maximum {quiz.maxAttempts} attempts reached.
        </p>
      </div>
    );
  }

  if (!started && !submitted) {
    return (
      <div
        className="rounded-xl p-5 space-y-4"
        style={{ background: "#0f1629", border: "1px solid #1e293b" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: "#f59e0b22", border: "1px solid #f59e0b44" }}
          >
            <span className="material-symbols-outlined text-xl text-amber-500">
              quiz
            </span>
          </div>
          <div>
            <p className="font-bold text-white text-sm">
              {quiz.title || "Lesson Quiz"}
            </p>
            <p className="text-xs text-gray-500">
              {quiz.questions?.length || "?"} questions · {quiz.timeLimit} min ·
              Pass: {quiz.passingScore}%
            </p>
          </div>
        </div>
        <div
          className="p-3 rounded-xl text-xs"
          style={{
            background: "#f59e0b22",
            border: "1px solid #f59e0b44",
            color: "#fbbf24",
          }}
        >
          ⚠️ Tab switching is monitored. 1st switch = warning. 2nd switch =
          auto-submit.
        </div>
        {attempts > 0 && (
          <p className="text-xs text-amber-500">
            Attempt {attempts + 1} of {quiz.maxAttempts}
          </p>
        )}
        <button
          onClick={handleStart}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
        >
          <span className="material-symbols-outlined text-base">
            play_arrow
          </span>
          {attempts > 0 ? "Retake Quiz" : "Start Quiz"}
        </button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  if (submitted && result) {
    const isPassed = result.passed;
    return (
      <div
        className="rounded-xl p-5"
        style={{
          background: isPassed ? "#22c55e22" : "#ef444422",
          border: `1px solid ${isPassed ? "#22c55e44" : "#ef444444"}`,
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center`}
            style={{ background: isPassed ? "#22c55e22" : "#ef444422" }}
          >
            <span
              className={`material-symbols-outlined text-xl ${isPassed ? "text-emerald-400" : "text-red-400"}`}
            >
              {isPassed ? "check_circle" : "task_alt"}
            </span>
          </div>
          <div>
            <p
              className={`font-bold text-sm ${isPassed ? "text-emerald-400" : "text-red-400"}`}
            >
              {result.alreadyDone
                ? result.passed
                  ? "Already Passed ✓"
                  : `Previously attempted — ${result.score}%`
                : result.passed
                  ? `Passed! ${result.score}%`
                  : `Submitted — ${result.score}% (need ${quiz.passingScore}% to pass)`}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Quiz submitted ✓ — this counts toward lesson completion
            </p>
            {result.flaggedForCheating && (
              <p className="text-xs text-red-400 mt-1">
                ⚠️ Flagged for tab switching
              </p>
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
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "#0f1629", border: "1px solid #f59e0b33" }}
    >
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ background: "#f59e0b22", borderBottom: "1px solid #f59e0b44" }}
      >
        <p className="text-xs font-bold text-amber-400">Quiz in progress</p>
        <span
          className={`font-mono font-bold text-sm ${timeLeft < 60 ? "text-red-400" : "text-amber-400"}`}
        >
          {fmt(timeLeft || 0)}
        </span>
      </div>

      {warning && (
        <div
          className="px-5 py-2 text-sm text-red-400 font-medium"
          style={{
            background: "#ef444422",
            borderBottom: "1px solid #ef444444",
          }}
        >
          {warning}
        </div>
      )}
      {tabWarnings > 0 && !warning && (
        <div
          className="px-5 py-2 text-xs"
          style={{
            background: "#f59e0b22",
            borderBottom: "1px solid #f59e0b44",
            color: "#fbbf24",
          }}
        >
          Tab switches: {tabWarnings}/2
        </div>
      )}

      <div className="p-5 space-y-5 max-h-96 overflow-y-auto">
        {error && <p className="text-sm text-red-400">{error}</p>}
        {questions.map((q, i) => (
          <div key={q._id}>
            <p className="text-sm font-semibold text-white mb-3">
              {i + 1}. {q.text || q.questionText}
            </p>
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
            <>
              <LoadingSpinner size="sm" />
              <span>Grading...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">check</span>
              Submit Quiz
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// LAB SECTION (FULL IMPLEMENTATION - WITH AUTO AI POLLING)
// ─────────────────────────────────────────────
const LabSection = ({ lab, lessonId, courseId, onCompleted, onPassed }) => {
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
  const [aiEvaluation, setAiEvaluation] = useState(null);
  const [showAiFeedback, setShowAiFeedback] = useState(false);
  const [isCheckingAI, setIsCheckingAI] = useState(false);
  const fileInputRef = useRef(null);
  const pollingInterval = useRef(null);

  const isGraded = submission?.status === "graded";

  useEffect(() => {
    fetchMySubmission();
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [lab._id]);

  
  
  
const fetchMySubmission = async () => {
  try {
    const res = await apiFetch(
      `/api/courses/${courseId}/lessons/${lessonId}/lab/${lab._id}/my-submission`,
    );
    const data = await res.json();
    console.log("📦 FETCH SUBMISSION RESPONSE:", data);
    
    if (res.ok && data.submission) {
      setSubmission(data.submission);
      setAnswer(data.submission.answer || "");
      setSubmitted(true);
      
      // ✅ Check for AI evaluation - FIXED
      const aiMarks = data.submission.aiSuggestedMarks;
      const aiFeedback = data.submission.aiSuggestedFeedback;
      
      console.log("🔍 AI Marks from response:", aiMarks);
      console.log("🔍 AI Feedback from response:", aiFeedback);
      
      if (aiMarks && aiMarks !== null && aiMarks !== undefined) {
        console.log("✅ AI Evaluation found! Setting state...");
        setAiEvaluation({
          marks: aiMarks,
          feedback: aiFeedback || "",
        });
        setShowAiFeedback(true);
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        setIsCheckingAI(false);
      }
      
      onCompleted && onCompleted();
      if (data.submission.status === "graded") {
        const totalMarks = lab.totalMarks || 100;
        const scorePercent = (data.submission.marks / totalMarks) * 100;
        const isPassed = scorePercent >= 70;
        onPassed && onPassed(isPassed);
        setActiveTab("result");
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        setIsCheckingAI(false);
      } else if (aiMarks) {
        setActiveTab("result");
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        setIsCheckingAI(false);
      }
    } else {
      if (lab.starterCode) setAnswer(lab.starterCode);
    }
  } catch (err) {
    console.error("Fetch submission error:", err);
    if (lab.starterCode) setAnswer(lab.starterCode);
  }
};

const pollForAIEvaluation = async () => {
  try {
    const res = await apiFetch(
      `/api/courses/${courseId}/lessons/${lessonId}/lab/${lab._id}/my-submission`,
    );
    const data = await res.json();
    
    console.log("🔄 POLLING RESPONSE:", data);
    
    if (res.ok && data.submission) {
      const aiMarks = data.submission.aiSuggestedMarks;
      const aiFeedback = data.submission.aiSuggestedFeedback;
      
      console.log("🔄 Poll - AI Marks:", aiMarks);
      
      if (aiMarks && aiMarks !== null && aiMarks !== undefined && !aiEvaluation) {
        console.log("🎉 AI Evaluation found via polling! Score:", aiMarks);
        setAiEvaluation({
          marks: aiMarks,
          feedback: aiFeedback || "",
        });
        setSubmission(data.submission);
        setAnswer(data.submission.answer || "");
        setShowAiFeedback(true);
        setSuccess(`AI Score: ${aiMarks}/${lab.totalMarks || 100} marks. Teacher will review.`);
        setTimeout(() => setSuccess(""), 5000);
        
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        setIsCheckingAI(false);
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error("Polling error:", err);
    return false;
  }
};



  const startPollingForAI = () => {
  if (pollingInterval.current) clearInterval(pollingInterval.current);
  setIsCheckingAI(true);
  
  let attempts = 0;
  const maxAttempts = 20; // 40 seconds max (2 second intervals)
  
  pollingInterval.current = setInterval(async () => {
    attempts++;
    console.log(`Polling for AI evaluation (${attempts}/${maxAttempts})...`);
    
    const found = await pollForAIEvaluation();
    if (found) {
      console.log("AI evaluation found, stopping polling");
      if (pollingInterval.current) clearInterval(pollingInterval.current);
      setIsCheckingAI(false);
    }
    
    if (attempts >= maxAttempts) {
      console.log("Max polling attempts reached, stopping");
      if (pollingInterval.current) clearInterval(pollingInterval.current);
      setIsCheckingAI(false);
      if (!aiEvaluation) {
        setSuccess("Lab submitted! AI evaluation will appear when ready.");
      }
    }
  }, 2000);
};

  const handleSubmit = async () => {
    if (isGraded) {
      setError("This lab has already been graded. You cannot resubmit.");
      return;
    }

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
      
      const res = await fetch(
        `${API}/api/courses/${courseId}/lessons/${lessonId}/lab/${lab._id}/submit`,
        {
          method: "POST",
          body: formData,
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || "Submission failed");
        return;
      }
      
      setSubmitted(true);
      setPdfFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onCompleted && onCompleted();
      
      setSuccess("Lab submitted! AI is evaluating your work...");
      setActiveTab("result");
      
      await fetchMySubmission();
      
      // Start polling for AI evaluation
      startPollingForAI();
      
      setTimeout(() => setSuccess(""), 8000);
      
    } catch (err) {
      console.error("Submission error:", err);
      setError("Cannot connect to server");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAiExplain = async () => {
    setLoadingExpl(true);
    setError("");
    try {
      const res = await apiFetch(
        `/api/courses/${courseId}/lessons/${lessonId}/lab/${lab._id}/explain`,
        { method: "POST" },
      );
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
    programming: {
      icon: "terminal",
      color: "#22c55e",
      bg: "#22c55e22",
      border: "#22c55e44",
      label: "Programming Lab",
    },
    dld: {
      icon: "schema",
      color: "#3b82f6",
      bg: "#3b82f622",
      border: "#3b82f644",
      label: "DLD Lab",
    },
    networking: {
      icon: "hub",
      color: "#a855f7",
      bg: "#a855f722",
      border: "#a855f744",
      label: "Networking Lab",
    },
    theory: {
      icon: "description",
      color: "#f59e0b",
      bg: "#f59e0b22",
      border: "#f59e0b44",
      label: "Theory Lab",
    },
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
    borderBottom:
      activeTab === key ? "2px solid #818cf8" : "2px solid transparent",
    ...(isGraded && key === "submit"
      ? { opacity: 0.5, cursor: "not-allowed" }
      : {}),
  });

  const isOverdue =
    lab.dueDate && new Date(lab.dueDate) < new Date() && !submitted;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "#0f1629", border: "1px solid #1e293b" }}
    >
      <div
        className="px-5 py-4"
        style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b" }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
              <span
                className={`material-symbols-outlined text-lg`}
                style={{ color: cfg.color }}
              >
                {cfg.icon}
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-white text-sm">{lab.title}</p>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold`}
                  style={{
                    background: diff.bg,
                    border: `1px solid ${diff.border}`,
                    color: diff.color,
                  }}
                >
                  {lab.difficulty}
                </span>
                {lab.totalMarks && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{
                      background: "#6366f122",
                      border: "1px solid #6366f144",
                      color: "#818cf8",
                    }}
                  >
                    {lab.totalMarks} pts
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{cfg.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {lab.dueDate && (
              <span
                className={`text-xs flex items-center gap-1 ${isOverdue ? "text-red-400" : "text-gray-500"}`}
              >
                <span className="material-symbols-outlined text-sm">
                  {isOverdue ? "warning" : "schedule"}
                </span>
                {isOverdue ? "Overdue" : "Due"}:{" "}
                {new Date(lab.dueDate).toLocaleDateString()}
              </span>
            )}
            {submitted && (
              <StatusBadge
                status={
                  submission?.status === "graded" ? "graded" : "submitted"
                }
                type="lab"
              />
            )}
          </div>
        </div>
      </div>

      <div
        className="flex gap-1 p-1.5"
        style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b" }}
      >
        <button
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all`}
          style={tabClass("instructions")}
          onClick={() => !isGraded && setActiveTab("instructions")}
        >
          <span className="material-symbols-outlined text-sm">info</span>
          Instructions
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${isGraded ? "opacity-50 cursor-not-allowed" : ""}`}
          style={tabClass("submit")}
          onClick={() => !isGraded && setActiveTab("submit")}
          disabled={isGraded}
        >
          <span className="material-symbols-outlined text-sm">upload</span>
          Submit
        </button>
        {submitted && (
          <button
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all`}
            style={tabClass("result")}
            onClick={() => setActiveTab("result")}
          >
            <span className="material-symbols-outlined text-sm">
              {submission?.status === "graded" ? "grade" : "pending"}
            </span>
            Result
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {activeTab === "instructions" && (
          <>
            {lab.description && (
              <p className="text-sm text-gray-300 leading-relaxed">
                {lab.description}
              </p>
            )}
            <div
              className="p-4 rounded-xl"
              style={{ background: "#3b82f622", border: "1px solid #3b82f644" }}
            >
              <p className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">list</span>
                Step-by-step instructions
              </p>
              <div className="space-y-1">
                {lab.instructions
                  .split("\n")
                  .filter(Boolean)
                  .map((step, i) => (
                    <p
                      key={i}
                      className="text-xs text-gray-300 leading-relaxed"
                    >
                      {step}
                    </p>
                  ))}
              </div>
            </div>
            {lab.outputExample && (
              <div
                className="p-4 rounded-xl"
                style={{ background: "#1e293b", border: "1px solid #334155" }}
              >
                <p className="text-xs text-gray-400 mb-2 font-medium">
                  Expected output
                </p>
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                  {lab.outputExample}
                </pre>
              </div>
            )}
            {lab.labType === "programming" && lab.testCases?.length > 0 && (
              <div
                className="p-4 rounded-xl"
                style={{ background: "#1e293b", border: "1px solid #334155" }}
              >
                <p className="text-xs text-gray-400 mb-3 font-medium">
                  Test cases
                </p>
                <div className="space-y-2">
                  {lab.testCases.map((tc, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-center gap-2 text-xs font-mono"
                    >
                      <span className="text-gray-500">Input:</span>
                      <code
                        className="px-2 py-0.5 rounded"
                        style={{ background: "#0f1629", color: "#4ade80" }}
                      >
                        {tc.input}
                      </code>
                      <span className="text-gray-500">→</span>
                      <code
                        className="px-2 py-0.5 rounded"
                        style={{ background: "#0f1629", color: "#60a5fa" }}
                      >
                        {tc.expectedOutput}
                      </code>
                      {tc.description && (
                        <span className="text-gray-500 italic">
                          {tc.description}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={handleAiExplain}
              disabled={loadingExpl}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-50 w-full"
              style={{
                background: "#a855f722",
                color: "#c084fc",
                border: "1px solid #a855f744",
              }}
            >
              {loadingExpl ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Getting AI explanation...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">
                    auto_awesome
                  </span>
                  AI Explain this lab
                </>
              )}
            </button>
            {showExplain && explanation && (
              <div
                className="rounded-xl overflow-hidden"
                style={{ background: "#0f1629", border: "1px solid #a855f744" }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{
                    background: "#a855f722",
                    borderBottom: "1px solid #a855f744",
                  }}
                >
                  <p className="text-sm font-bold text-purple-400">
                    AI Explanation
                  </p>
                  <button
                    onClick={() => setShowExplain(false)}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    <span className="material-symbols-outlined text-sm">
                      close
                    </span>
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  {explanation.steps?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-purple-400 text-base">
                          strategy
                        </span>
                        Approach
                      </p>
                      <ol className="space-y-2">
                        {explanation.steps.map((s, i) => (
                          <li
                            key={i}
                            className="flex gap-3 p-3 rounded-lg"
                            style={{
                              background: "#a855f710",
                              border: "1px solid #a855f730",
                            }}
                          >
                            <span
                              className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 text-xs font-bold"
                              style={{
                                background: "#a855f722",
                                color: "#c084fc",
                              }}
                            >
                              {i + 1}
                            </span>
                            <span className="text-sm text-gray-300 leading-relaxed">
                              {typeof s === "object"
                                ? s.instruction ||
                                  s.step ||
                                  s.text ||
                                  JSON.stringify(s)
                                : s}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {explanation.concepts?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-2">
                        Key concepts
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {explanation.concepts.map((c, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-1 rounded-full"
                            style={{
                              background: "#a855f722",
                              color: "#c084fc",
                            }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <button
              onClick={() => !isGraded && setActiveTab("submit")}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #6366f1, #818cf8)",
              }}
            >
              <span className="material-symbols-outlined text-sm">upload</span>
              Go to submission
            </button>
          </>
        )}

        {activeTab === "submit" && (
          <>
            {isGraded ? (
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{
                  background: "#ef444422",
                  border: "1px solid #ef444444",
                }}
              >
                <span className="material-symbols-outlined text-red-400 text-2xl">
                  lock
                </span>
                <div>
                  <p className="text-sm font-semibold text-red-400">
                    Lab Already Graded
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    This lab has been graded. You cannot submit again.
                  </p>
                  <button
                    onClick={() => setActiveTab("result")}
                    className="mt-3 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #818cf8)",
                    }}
                  >
                    View Results
                  </button>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div
                    className="rounded-xl p-3 flex items-center gap-2"
                    style={{
                      background: "#ef444422",
                      border: "1px solid #ef444444",
                    }}
                  >
                    <span className="material-symbols-outlined text-sm text-red-400">
                      error
                    </span>
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
                {success && (
                  <div
                    className="rounded-xl p-3 flex items-center gap-2"
                    style={{
                      background: "#22c55e22",
                      border: "1px solid #22c55e44",
                    }}
                  >
                    <span className="material-symbols-outlined text-sm text-emerald-400">
                      check_circle
                    </span>
                    <p className="text-sm text-emerald-400">{success}</p>
                  </div>
                )}
                {submitted && !isGraded && (
                  <div
                    className="rounded-xl p-3 flex items-center gap-2"
                    style={{
                      background: "#6366f122",
                      border: "1px solid #6366f144",
                    }}
                  >
                    <span className="material-symbols-outlined text-sm text-indigo-400">
                      info
                    </span>
                    <p className="text-sm text-indigo-400">
                      Already submitted — you can resubmit to update your
                      answer.
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {lab.labType === "programming"
                      ? "Your code"
                      : "Your answer"}
                  </label>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={lab.labType === "programming" ? 12 : 7}
                    placeholder={
                      lab.labType === "programming"
                        ? "Write your code solution here..."
                        : "Write your answer here..."
                    }
                    className={`w-full px-4 py-3 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none outline-none transition-all ${lab.labType === "programming" ? "font-mono" : ""}`}
                  />
                </div>
                <div
                  className="rounded-xl p-4 border-2 border-dashed"
                  style={{ borderColor: "#334155" }}
                >
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        const f = e.target.files[0];
                        if (!f) return;
                        if (f.type !== "application/pdf") {
                          setError("Only PDF files are accepted");
                          e.target.value = "";
                          return;
                        }
                        if (f.size > 20 * 1024 * 1024) {
                          setError("PDF must be under 20 MB");
                          e.target.value = "";
                          return;
                        }
                        setError("");
                        setPdfFile(f);
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                      style={{
                        background: "#6366f122",
                        color: "#818cf8",
                        border: "1px solid #6366f144",
                      }}
                    >
                      <span className="material-symbols-outlined text-base">
                        picture_as_pdf
                      </span>
                      Upload PDF
                    </button>
                    {pdfFile ? (
                      <div className="flex items-center gap-2 text-sm text-emerald-400">
                        <span className="material-symbols-outlined text-base">
                          check_circle
                        </span>
                        <span className="max-w-[180px] truncate">
                          {pdfFile.name}
                        </span>
                        <button
                          onClick={() => {
                            setPdfFile(null);
                            if (fileInputRef.current)
                              fileInputRef.current.value = "";
                          }}
                          className="text-red-400 hover:text-red-500"
                        >
                          <span className="material-symbols-outlined text-sm">
                            close
                          </span>
                        </button>
                      </div>
                    ) : submission?.pdfUrl ? (
                      <button
                        onClick={() => setShowPdf(true)}
                        className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
                      >
                        <span className="material-symbols-outlined text-base">
                          description
                        </span>
                        View previously submitted PDF
                      </button>
                    ) : null}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-3 text-center">
                    PDF only · max 20 MB
                  </p>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #818cf8)",
                  }}
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">
                        upload
                      </span>
                      {submitted ? "Resubmit" : "Submit Lab"}
                    </>
                  )}
                </button>
              </>
            )}
          </>
        )}

        {activeTab === "result" && submission && (
          <>

          {/* DEBUG: Remove after fixing */}
    <div className="rounded-xl p-2 mb-3 text-xs" style={{ background: "#1e293b" }}>
      <p>Debug: submission.aiSuggestedMarks = {submission?.aiSuggestedMarks}</p>
      <p>Debug: aiEvaluation state = {aiEvaluation ? JSON.stringify(aiEvaluation) : "null"}</p>
      <p>Debug: isCheckingAI = {String(isCheckingAI)}</p>
    </div>
            {isCheckingAI && !aiEvaluation && submission.status !== "graded" && (
              <div className="rounded-xl p-4 text-center" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
                <LoadingSpinner size="sm" />
                <p className="text-sm text-indigo-400 mt-2">AI is evaluating your submission...</p>
              </div>
            )}
            
            {aiEvaluation && submission.status !== "graded" && (
              <div className="rounded-xl p-4" style={{ background: "#a855f722", border: "1px solid #a855f744" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-purple-400">auto_awesome</span>
                  <p className="text-sm font-bold text-purple-400">AI Evaluation</p>
                  <span className="ml-auto text-sm font-bold text-purple-400">
                    Score: {aiEvaluation.marks} / {lab.totalMarks || 100}
                  </span>
                </div>
                {aiEvaluation.feedback && (
                  <div className="mt-2 p-3 rounded-lg" style={{ background: "#1e293b" }}>
                    <p className="text-xs text-gray-300 leading-relaxed">{aiEvaluation.feedback}</p>
                  </div>
                )}
                <p className="text-[10px] text-gray-500 mt-2 italic">
                  🤖 This is an AI-suggested score. Your teacher will review your submission and provide the final grade.
                </p>
              </div>
            )}
            
            {submission.status === "graded" ? (
              <>
                <div
                  className={`rounded-xl p-4`}
                  style={{
                    background: "#22c55e22",
                    border: "1px solid #22c55e44",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex items-center justify-center w-14 h-14 rounded-full text-2xl font-black"
                      style={{ background: "#22c55e22", color: "#4ade80" }}
                    >
                      {submission.marks}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {submission.marks} / {lab.totalMarks || 100} marks
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round(
                          (submission.marks / (lab.totalMarks || 100)) * 100,
                        )}
                        % score
                        {submission.gradedAt &&
                          ` · Graded ${new Date(submission.gradedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                </div>
                {submission.feedback && (
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: "#3b82f622",
                      border: "1px solid #3b82f644",
                    }}
                  >
                    <p className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        feedback
                      </span>
                      Instructor feedback
                    </p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {submission.feedback}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{
                  background: "#6366f122",
                  border: "1px solid #6366f144",
                }}
              >
                <span className="material-symbols-outlined text-indigo-400 text-2xl">
                  pending
                </span>
                <div>
                  <p className="text-sm font-semibold text-indigo-400">
                    Submitted — awaiting review
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Submitted{" "}
                    {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            {submission.answer && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Your submitted answer
                </p>
                <pre
                  className={`text-xs p-4 rounded-xl overflow-x-auto max-h-40 ${lab.labType === "programming" ? "font-mono" : "whitespace-pre-wrap font-sans"}`}
                  style={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#cbd5e1",
                  }}
                >
                  {submission.answer}
                </pre>
              </div>
            )}
            {submission.pdfUrl && (
              <button
                onClick={() => setShowPdf(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{
                  background: "#6366f122",
                  color: "#818cf8",
                  border: "1px solid #6366f144",
                }}
              >
                <span className="material-symbols-outlined text-base">
                  picture_as_pdf
                </span>
                View submitted PDF —{" "}
                {submission.pdfFileName || "submission.pdf"}
              </button>
            )}
            {!isGraded && (
              <button
                onClick={() => setActiveTab("submit")}
                className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{
                  background: "#6366f122",
                  color: "#818cf8",
                  border: "1px solid #6366f144",
                }}
              >
                {submission.status === "graded"
                  ? "Resubmit"
                  : "Update submission"}
              </button>
            )}
          </>
        )}
      </div>

      {showPdf && submission?.pdfUrl && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowPdf(false)}
        >
          <div
            className="rounded-2xl w-full flex flex-col overflow-hidden"
            style={{
              maxWidth: "95vw",
              height: "90vh",
              background: "#0f1629",
              border: "1px solid #1e293b",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-5 py-3 flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #6366f1, #818cf8)",
              }}
            >
              <div>
                <p className="text-sm font-bold text-white">Lab Submission</p>
                <p className="text-xs text-indigo-200">
                  {submission.pdfFileName || "submission.pdf"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={submission.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 bg-white hover:bg-indigo-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">
                    open_in_new
                  </span>
                  Open
                </a>
                <button
                  onClick={() => setShowPdf(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-1.5"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div
              className="flex-1"
              style={{ minHeight: 0, background: "#1a1a2e" }}
            >
              <iframe
                src={submission.pdfUrl}
                className="w-full h-full"
                style={{ border: "none" }}
                title="Lab PDF Submission"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN LESSON VIEWER (FIXED WITH resetLesson)
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
  const [quizPassed, setQuizPassed] = useState(false);
  const [labPassed, setLabPassed] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navigatingNext, setNavigatingNext] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [courseId]);
  
  useEffect(() => {
    if (activeLesson?._id) openLesson(activeLesson._id);
  }, [activeLesson?._id, loadTrigger]);

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
        const target =
          lData.lessons.find((l) => !l.isLocked && !l.isCompleted) ||
          lData.lessons.find((l) => !l.isLocked);
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
    setQuizPassed(false);
    setLabPassed(false);

    try {
      const res = await apiFetch(
        `/api/courses/${courseId}/lessons/${lessonId}/content`,
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        setLessonData(null);
        return;
      }

      setLessonData(data);
      setQuizDone(data.progress?.quizCompleted || false);
      setLabDone(data.progress?.labCompleted || false);

      if (data.quiz && data.quizAttempts && data.quizAttempts.length > 0) {
        const sortedAttempts = [...data.quizAttempts].sort(
          (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
        );
        const mostRecent = sortedAttempts[0];
        setQuizPassed(mostRecent.passed === true);
        console.log("Quiz - Most recent attempt passed:", mostRecent.passed);
      } else {
        setQuizPassed(false);
      }

      if (
        data.lab &&
        data.labSubmission &&
        data.labSubmission.status === "graded"
      ) {
        const totalMarks = data.lab.totalMarks || 100;
        const scorePercent = (data.labSubmission.marks / totalMarks) * 100;
        const isPassed = scorePercent >= 70;
        setLabPassed(isPassed);
        console.log("Lab - Score:", scorePercent + "%", "Passed:", isPassed);
      } else {
        setLabPassed(false);
      }
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
        const ldRes = await apiFetch(
          `/api/courses/${courseId}/lessons/${activeLesson._id}/content`,
        );
        const ldData = await ldRes.json();
        if (ldRes.ok) {
          setLessonData(ldData);
          
          const newQuizDone = ldData.progress?.quizCompleted || false;
          const newLabDone = ldData.progress?.labCompleted || false;
          
          setQuizDone(newQuizDone);
          setLabDone(newLabDone);

          if (
            ldData.quiz &&
            ldData.quizAttempts &&
            ldData.quizAttempts.length > 0
          ) {
            const sortedAttempts = [...ldData.quizAttempts].sort(
              (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
            );
            const mostRecent = sortedAttempts[0];
            const isPassed = mostRecent.passed === true;
            setQuizPassed(prev => prev !== isPassed ? isPassed : prev);
            console.log("Refresh - Quiz passed (from DB):", isPassed);
          }

          if (
            ldData.lab &&
            ldData.labSubmission &&
            ldData.labSubmission.status === "graded"
          ) {
            const totalMarks = ldData.lab.totalMarks || 100;
            const scorePercent =
              (ldData.labSubmission.marks / totalMarks) * 100;
            const isPassed = scorePercent >= 70;
            setLabPassed(prev => prev !== isPassed ? isPassed : prev);
            console.log("Refresh - Lab passed (from DB):", isPassed);
          }
        }
      }
    } catch {
      /* silent */
    }
  };

  const resetLesson = async () => {
    setLoadingLesson(true);
    setError("");
    setSuccess("");
    
    try {
      const res = await apiFetch(`/api/courses/${courseId}/lessons/${activeLesson._id}/reset`, {
        method: "POST",
      });
      
      if (res.ok) {
        setQuizDone(false);
        setLabDone(false);
        setQuizPassed(false);
        setLabPassed(false);
        
        await openLesson(activeLesson._id);
        await refreshAfterStep();
        setSuccess("Lesson reset successfully! You can now re-attempt the quiz and lab.");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to reset lesson");
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoadingLesson(false);
      setShowResetConfirm(false);
    }
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
        const nextLesson = lData.lessons.find(
          (l) => l.order === lessonData.lesson.order + 1 && !l.isLocked,
        );
        if (nextLesson) {
          setActiveLesson(nextLesson);
          setSidebarOpen(false);
        }
      }
    } catch {
      /* silent */
    } finally {
      setNavigatingNext(false);
    }
  };

  const computeCanGoNext = () => {
  if (!lessonData?.lesson || !lessons.length) return false;

  // Check if there is a next lesson
  const hasNextLesson = lessons.some(
    (l) => l.order === lessonData.lesson.order + 1,
  );
  if (!hasNextLesson) return false;

  // Must have viewed the lesson (for all lessons)
  const viewed = lessonData.progress?.lessonViewed || false;
  if (!viewed) return false;

  const quizRequired = lessonData.lesson.requiresQuiz && !!lessonData.quiz;
  const labRequired = lessonData.lesson.requiresLab && !!lessonData.lab;

  // Check quiz requirements
  if (quizRequired) {
    // Must have submitted AND passed the quiz
    if (!quizDone || !quizPassed) {
      console.log("❌ Cannot go next - Quiz requirements not met:", { 
        quizRequired, 
        quizDone, 
        quizPassed 
      });
      return false;
    }
  }

  // Check lab requirements
  if (labRequired) {
    // Must have submitted AND passed the lab
    if (!labDone || !labPassed) {
      console.log("❌ Cannot go next - Lab requirements not met:", { 
        labRequired, 
        labDone, 
        labPassed 
      });
      return false;
    }
  }

  console.log("✅ Can go next - All requirements met");
  return true;
};
  
  const canGoNext = computeCanGoNext();
  const quizRequired = lessonData?.lesson?.requiresQuiz && !!lessonData?.quiz;
  const labRequired = lessonData?.lesson?.requiresLab && !!lessonData?.lab;

  const getProgressItems = () => {
    if (!lessonData?.lesson) return [];
    const items = [];
    items.push({
      label: "Read lesson",
      done: lessonData.progress?.lessonViewed || false,
      icon: "menu_book",
    });
    if (lessonData.lesson.requiresQuiz && lessonData.quiz) {
      items.push({ label: "Submit quiz", done: quizDone, icon: "quiz" });
    }
    if (lessonData.lesson.requiresLab && lessonData.lab) {
      items.push({ label: "Submit lab", done: labDone, icon: "science" });
    }
    return items;
  };

  const progress =
    lessons.length > 0
      ? Math.round(
          (lessons.filter((l) => l.isCompleted).length / lessons.length) * 100,
        )
      : 0;

  if (loadingList)
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "#0f1629" }}
      >
        <LoadingSpinner size="lg" />
      </div>
    );

  const progressItems = getProgressItems();

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0f1629", fontFamily: "'Lexend', sans-serif" }}
    >
      {success && (
        <div className="fixed top-4 right-4 z-50 rounded-xl p-4 bg-emerald-500/20 border border-emerald-500/50 backdrop-blur-sm animate-in slide-in-from-top-2">
          <p className="text-sm text-emerald-400">{success}</p>
        </div>
      )}

      <style>{`
        .markdown-content {
          line-height: 1.7;
          color: #cbd5e1;
        }
        .markdown-content h1 {
          font-size: 2rem !important;
          font-weight: 800 !important;
          margin-top: 1.5rem !important;
          margin-bottom: 1rem !important;
          color: white !important;
          border-bottom: 2px solid #6366f1 !important;
          padding-bottom: 0.5rem !important;
        }
        .markdown-content h2 {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
          margin-top: 1.25rem !important;
          margin-bottom: 0.75rem !important;
          color: #e2e8f0 !important;
        }
        .markdown-content h3 {
          font-size: 1.25rem !important;
          font-weight: 600 !important;
          margin-top: 1rem !important;
          margin-bottom: 0.5rem !important;
          color: #cbd5e1 !important;
        }
        .markdown-content p {
          margin-bottom: 1rem !important;
          line-height: 1.6 !important;
        }
        .markdown-content ul {
          list-style-type: disc !important;
          margin-left: 2rem !important;
          margin-top: 0.5rem !important;
          margin-bottom: 1rem !important;
          padding-left: 0.5rem !important;
        }
        .markdown-content ul ul {
          list-style-type: circle !important;
          margin-left: 1.5rem !important;
        }
        .markdown-content ol {
          list-style-type: decimal !important;
          margin-left: 2rem !important;
          margin-top: 0.5rem !important;
          margin-bottom: 1rem !important;
          padding-left: 0.5rem !important;
        }
        .markdown-content ol ol {
          list-style-type: lower-alpha !important;
          margin-left: 1.5rem !important;
        }
        .markdown-content li {
          margin-bottom: 0.25rem !important;
          display: list-item !important;
        }
        .markdown-content strong, .markdown-content b {
          font-weight: 700 !important;
          color: white !important;
        }
        .markdown-content em, .markdown-content i {
          font-style: italic !important;
        }
        .markdown-content code {
          background: #1e293b !important;
          padding: 0.2rem 0.4rem !important;
          border-radius: 0.375rem !important;
          font-size: 0.875rem !important;
          color: #4ade80 !important;
          font-family: monospace !important;
        }
        .markdown-content pre {
          background: #1e293b !important;
          padding: 1rem !important;
          border-radius: 0.75rem !important;
          overflow-x: auto !important;
          margin: 1rem 0 !important;
        }
        .markdown-content pre code {
          background: transparent !important;
          padding: 0 !important;
        }
        .markdown-content blockquote {
          border-left: 4px solid #6366f1 !important;
          padding-left: 1rem !important;
          margin: 1rem 0 !important;
          color: #94a3b8 !important;
          font-style: italic !important;
        }
        .markdown-content a {
          color: #818cf8 !important;
          text-decoration: underline !important;
        }
        .markdown-content a:hover {
          color: #c084fc !important;
        }
        .markdown-content img {
          max-width: 100% !important;
          border-radius: 0.75rem !important;
          margin: 1rem 0 !important;
        }
        .markdown-content hr {
          margin: 1.5rem 0 !important;
          border-color: #334155 !important;
        }
        .markdown-content table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 1rem 0 !important;
        }
        .markdown-content th, .markdown-content td {
          border: 1px solid #334155 !important;
          padding: 0.5rem !important;
          text-align: left !important;
        }
        .markdown-content th {
          background: #1e293b !important;
          color: white !important;
        }
        .html-content {
          line-height: 1.7;
        }
        .html-content h1, .html-content h2, .html-content h3 {
          margin-top: 1.5rem !important;
          margin-bottom: 1rem !important;
          font-weight: bold !important;
        }
        .html-content h1 {
          font-size: 2rem !important;
          font-weight: 800 !important;
          color: white !important;
          border-bottom: 2px solid #6366f1 !important;
          padding-bottom: 0.5rem !important;
        }
        .html-content h2 {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
          color: #e2e8f0 !important;
        }
        .html-content h3 {
          font-size: 1.25rem !important;
          font-weight: 600 !important;
          color: #cbd5e1 !important;
        }
        .html-content p {
          margin-bottom: 1rem !important;
          line-height: 1.6 !important;
          color: #cbd5e1 !important;
        }
        .html-content ul {
          list-style-type: disc !important;
          margin-left: 2rem !important;
          margin-top: 0.5rem !important;
          margin-bottom: 1rem !important;
          padding-left: 0.5rem !important;
        }
        .html-content ol {
          list-style-type: decimal !important;
          margin-left: 2rem !important;
          margin-top: 0.5rem !important;
          margin-bottom: 1rem !important;
          padding-left: 0.5rem !important;
        }
        .html-content li {
          margin-bottom: 0.25rem !important;
          color: #cbd5e1 !important;
        }
        .html-content code {
          background: #1e293b !important;
          padding: 0.2rem 0.4rem !important;
          border-radius: 0.375rem !important;
          font-size: 0.875rem !important;
          color: #4ade80 !important;
        }
        .html-content pre {
          background: #1e293b !important;
          padding: 1rem !important;
          border-radius: 0.75rem !important;
          overflow-x: auto !important;
          margin: 1rem 0 !important;
        }
        .html-content blockquote {
          border-left: 4px solid #6366f1 !important;
          padding-left: 1rem !important;
          margin: 1rem 0 !important;
          color: #94a3b8 !important;
          font-style: italic !important;
        }
        .html-content hr {
          margin: 1.5rem 0 !important;
          border-color: #334155 !important;
        }
        .html-content a {
          color: #818cf8 !important;
          text-decoration: underline !important;
        }
        .html-content img {
          max-width: 100% !important;
          border-radius: 0.75rem !important;
          margin: 1rem 0 !important;
        }
        .html-content table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 1rem 0 !important;
        }
        .html-content th, .html-content td {
          border: 1px solid #334155 !important;
          padding: 0.5rem !important;
          text-align: left !important;
        }
        .html-content th {
          background: #1e293b !important;
          color: white !important;
        }
      `}</style>

      {/* Top bar */}
      <div
        className="sticky top-0 z-30"
        style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:scale-105"
            style={{
              background: "#6366f122",
              color: "#818cf8",
              border: "1px solid #6366f144",
            }}
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:scale-105"
            style={{
              background: "#6366f122",
              color: "#818cf8",
              border: "1px solid #6366f144",
            }}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="flex-1 font-bold text-white truncate text-sm">
            {course?.title}
          </h1>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-gray-500 hidden sm:inline">
              {lessons.filter((l) => l.isCompleted).length}/{lessons.length}
            </span>
            <div
              className="w-24 h-1.5 rounded-full overflow-hidden"
              style={{ background: "#1e293b" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #6366f1, #818cf8)",
                }}
              />
            </div>
            <span className="text-xs font-bold text-indigo-400">
              {progress}%
            </span>
          </div>
        </div>
      </div>

      <div
        className="max-w-7xl mx-auto flex flex-col lg:flex-row"
        style={{ height: "calc(100vh - 57px)" }}
      >
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/70 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col flex-shrink-0 overflow-hidden transition-transform duration-300 transform
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
          style={{ background: "#0a0f1e", borderRight: "1px solid #1e293b" }}
        >
          <div className="p-4" style={{ borderBottom: "1px solid #1e293b" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Lessons</p>
                <p className="text-xs text-gray-500">
                  {lessons.filter((l) => !l.isLocked).length} unlocked
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-lg hover:bg-gray-800"
              >
                <span className="material-symbols-outlined text-gray-500 text-lg">
                  close
                </span>
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
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 text-xs font-bold ${
                      lesson.isCompleted
                        ? "text-emerald-400"
                        : lesson.isLocked
                          ? "text-gray-500"
                          : "text-indigo-400"
                    }`}
                    style={{
                      background: lesson.isCompleted
                        ? "#22c55e22"
                        : lesson.isLocked
                          ? "#1e293b"
                          : "#6366f122",
                      border: `1px solid ${lesson.isCompleted ? "#22c55e44" : lesson.isLocked ? "#334155" : "#6366f144"}`,
                    }}
                  >
                    {lesson.isCompleted
                      ? "✓"
                      : lesson.isLocked
                        ? "🔒"
                        : lesson.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">
                      {lesson.title}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {lesson.duration}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          {loadingLesson ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <span className="material-symbols-outlined text-5xl text-gray-700 mb-4 block">
                  error
                </span>
                <p className="text-sm text-gray-500">{error}</p>
              </div>
            </div>
          ) : lessonData ? (
            <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6 pb-12">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "#6366f122",
                      color: "#818cf8",
                      border: "1px solid #6366f144",
                    }}
                  >
                    Lesson {lessonData.lesson.order}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {lessonData.lesson.duration}
                  </span>
                  {lessonData.progress?.isCompleted && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: "#22c55e22",
                        color: "#4ade80",
                        border: "1px solid #22c55e44",
                      }}
                    >
                      ✓ Completed
                    </span>
                  )}
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 transition-all hover:scale-105"
                    style={{ background: "#f59e0b22", color: "#fbbf24", border: "1px solid #f59e0b44" }}
                  >
                    <span className="material-symbols-outlined text-xs">refresh</span>
                    Reset Lesson
                  </button>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white">
                  {lessonData.lesson.title}
                </h2>
                {lessonData.lesson.description && (
                  <p className="text-sm text-gray-400 mt-2">
                    {lessonData.lesson.description}
                  </p>
                )}
              </div>

              {lessonData?.lesson?.contentBlocks && lessonData.lesson.contentBlocks.length > 0 ? (
                <div className="space-y-6">
                  {lessonData.lesson.contentBlocks.map((block, idx) => (
                    <ContentBlockRenderer key={block.id || idx} block={block} />
                  ))}
                </div>
              ) : (
                <>
                  {lessonData.lesson.videoUrl && (
                    <div className="rounded-xl overflow-hidden bg-black aspect-video">
                      {lessonData.lesson.videoUrl.includes("youtube.com") ||
                      lessonData.lesson.videoUrl.includes("youtu.be") ? (
                        <iframe
                          src={lessonData.lesson.videoUrl
                            .replace("watch?v=", "embed/")
                            .replace("youtu.be/", "www.youtube.com/embed/")}
                          className="w-full h-full"
                          allowFullScreen
                          title={lessonData.lesson.title}
                        />
                      ) : (
                        <video
                          controls
                          className="w-full h-full"
                          src={lessonData.lesson.videoUrl}
                        />
                      )}
                    </div>
                  )}

                  {lessonData.lesson.images?.length > 0 && (
                    <div
                      className={`grid gap-4 ${lessonData.lesson.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
                    >
                      {lessonData.lesson.images.map((img, i) => (
                        <figure
                          key={i}
                          className="rounded-xl overflow-hidden"
                          style={{
                            background: "#0f1629",
                            border: "1px solid #1e293b",
                          }}
                        >
                          <img
                            src={img.url}
                            alt={img.caption || `Image ${i + 1}`}
                            className="w-full object-cover max-h-64"
                          />
                          {img.caption && (
                            <figcaption
                              className="px-3 py-2 text-[10px] text-gray-500 text-center"
                              style={{
                                background: "#0a0f1e",
                                borderTop: "1px solid #1e293b",
                              }}
                            >
                              {img.caption}
                            </figcaption>
                          )}
                        </figure>
                      ))}
                    </div>
                  )}

                  {lessonData.lesson.content && (
                    <div
                      className="rounded-2xl p-6"
                      style={{
                        background: "#0a0f1e",
                        border: "1px solid #1e293b",
                      }}
                    >
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none text-gray-300"
                        dangerouslySetInnerHTML={{
                          __html: lessonData.lesson.content,
                        }}
                      />
                    </div>
                  )}
                </>
              )}

              {progressItems.length > 0 && (
                <div
                  className="rounded-xl p-4"
                  style={{ background: "#0a0f1e", border: "1px solid #1e293b" }}
                >
                  <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-indigo-400">
                      checklist
                    </span>
                    Lesson Progress
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {progressItems.map((item, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 text-xs font-medium ${item.done ? "text-emerald-400" : "text-gray-500"}`}
                      >
                        <span
                          className={`material-symbols-outlined text-base ${item.done ? "text-emerald-500" : "text-gray-600"}`}
                        >
                          {item.done
                            ? "check_circle"
                            : "radio_button_unchecked"}
                        </span>
                        <span className="material-symbols-outlined text-sm">
                          {item.icon}
                        </span>
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lessonData.lesson.requiresQuiz && lessonData.quiz ? (
                <QuizSection
                  quiz={lessonData.quiz}
                  courseId={courseId}
                  lessonId={lessonData.lesson._id}
                  onCompleted={() => {
                    setQuizDone(true);
                  }}
                  onPassed={(passed) => {
                    console.log("📝 Quiz onPassed called with:", passed);
                    setQuizPassed(passed);
                    setQuizDone(true);
                    setTimeout(() => refreshAfterStep(), 500);
                  }}
                />
              ) : lessonData.lesson.requiresQuiz && !lessonData.quiz ? (
                <div
                  className="rounded-xl p-4 flex items-center gap-2"
                  style={{
                    background: "#f59e0b22",
                    border: "1px solid #f59e0b44",
                  }}
                >
                  <span className="material-symbols-outlined text-amber-500 text-base">
                    info
                  </span>
                  <p className="text-sm text-amber-400">
                    Quiz required but not yet published by the instructor.
                  </p>
                </div>
              ) : null}

              {lessonData.lesson.requiresLab && lessonData.lab ? (
                <LabSection
                  lab={lessonData.lab}
                  lessonId={lessonData.lesson._id}
                  courseId={courseId}
                  onCompleted={() => {
                    setLabDone(true);
                  }}
                  onPassed={(passed) => {
                    console.log("🔬 Lab onPassed called with:", passed);
                    setLabPassed(passed);
                    setLabDone(true);
                    setTimeout(() => refreshAfterStep(), 500);
                  }}
                />
              ) : lessonData.lesson.requiresLab && !lessonData.lab ? (
                <div
                  className="rounded-xl p-4 flex items-center gap-2"
                  style={{
                    background: "#f59e0b22",
                    border: "1px solid #f59e0b44",
                  }}
                >
                  <span className="material-symbols-outlined text-amber-500 text-base">
                    info
                  </span>
                  <p className="text-sm text-amber-400">
                    Lab required but not yet published by the instructor.
                  </p>
                </div>
              ) : null}

              {canGoNext ? (
                <div className="mt-4 p-5 rounded-2xl" style={{ background: "linear-gradient(135deg, #22c55e22, #16a34a22)", border: "1px solid #22c55e44" }}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
                        Lesson complete! Ready for next lesson.
                      </p>
                    </div>
                    <button
                      onClick={handleNextLesson}
                      disabled={navigatingNext}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
                    >
                      {navigatingNext ? <LoadingSpinner size="sm" /> : <span className="material-symbols-outlined text-base">arrow_forward</span>}
                      Next Lesson
                    </button>
                  </div>
                </div>
              ) : (lessonData.lesson.order !== 1 && ((quizRequired && !quizPassed) || (labRequired && !labPassed))) ? (
                <div className="mt-4 p-5 rounded-2xl" style={{ background: "#ef444422", border: "1px solid #ef444444" }}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-bold text-red-400 text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-400 text-lg">priority_high</span>
                        {!quizPassed && quizRequired ? "❌ Quiz not passed! " : ""}
                        {!labPassed && labRequired ? "❌ Lab not passed! " : ""}
                        Please retake and pass to unlock next lesson.
                      </p>
                      <p className="text-xs text-red-300/80 mt-1">
                        {!quizPassed && quizRequired ? "• Review quiz material and try again" : ""}
                        {!labPassed && labRequired ? "• Review lab instructions and resubmit" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ) : lessonData.progress?.isCompleted && !lessons.some((l) => l.order === lessonData.lesson.order + 1) ? (
                <div className="mt-4 p-5 rounded-2xl text-center" style={{ background: "linear-gradient(135deg, #22c55e22, #16a34a22)", border: "1px solid #22c55e44" }}>
                  <p className="font-bold text-emerald-400 text-base">🎉 Course Complete!</p>
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
                <span className="material-symbols-outlined text-6xl text-gray-700 mb-4 block">
                  menu_book
                </span>
                <p className="text-sm text-gray-500">
                  {lessons.length === 0
                    ? "No lessons added yet"
                    : "Select a lesson to start"}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowResetConfirm(false)}>
          <div className="rounded-2xl w-full max-w-md overflow-hidden" style={{ background: "#0f1629", border: "1px solid #1e293b" }} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/20">
                  <span className="material-symbols-outlined text-white">refresh</span>
                </div>
                <h3 className="text-lg font-bold text-white">Reset Lesson</h3>
              </div>
            </div>
            <div className="p-5">
              <p className="text-gray-300 text-sm mb-2">
                Are you sure you want to reset <strong className="text-white">{lessonData?.lesson?.title}</strong>?
              </p>
              <p className="text-gray-500 text-xs mb-4">
                This will reset your quiz attempts and lab submissions for this lesson. You can retake the quiz and resubmit the lab.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={resetLesson}
                  disabled={loadingLesson}
                  className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
                >
                  {loadingLesson ? <LoadingSpinner size="sm" /> : "Yes, Reset Lesson"}
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                  style={{ background: "#1e293b", color: "#94a3b8" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonViewer;