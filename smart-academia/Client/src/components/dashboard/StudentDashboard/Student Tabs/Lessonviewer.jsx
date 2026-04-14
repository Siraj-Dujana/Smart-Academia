import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const apiFetch = (url, opts = {}) => {
  const token = localStorage.getItem("token");
  return fetch(`${API}${url}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
};

// ─────────────────────────────────────────────
// QUIZ SECTION — tab detection + timer + auto-grade
// ─────────────────────────────────────────────
const QuizSection = ({ quiz, courseId, lessonId, onCompleted }) => {
  const [questions,  setQuestions]  = useState([]);
  const [answers,    setAnswers]    = useState({});
  const [timeLeft,   setTimeLeft]   = useState(null);
  const [started,    setStarted]    = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [result,     setResult]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [attempts,   setAttempts]   = useState(0);
  const [tabWarnings,setTabWarnings]= useState(0);
  const [warning,    setWarning]    = useState("");
  const timerRef   = useRef(null);
  const warningRef = useRef(0);

  useEffect(() => { fetchInit(); return () => clearInterval(timerRef.current); }, [quiz._id]);

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
        const passed = att.find(a => a.passed);
        if (passed) { setSubmitted(true); setResult({ score: passed.score, passed: true, alreadyDone: true }); onCompleted && onCompleted(); }
      }
    } catch { /* ignore */ }
  };

  const handleVisibility = useCallback(() => {
    if (!document.hidden || submitted) return;
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
  }, [submitted]);

  useEffect(() => {
    if (!started) return;
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [started, handleVisibility]);

  const startTimer = () => {
    setTimeLeft(quiz.timeLimit * 60);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(false); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStart = () => {
    setAnswers({}); setResult(null); setSubmitted(false);
    setError(""); setTabWarnings(0); warningRef.current = 0;
    setStarted(true);
    startTimer();
  };

  const handleAnswer = (qId, val) => setAnswers(p => ({ ...p, [qId]: val }));

  const handleSubmit = async (flagCheating = false) => {
    clearInterval(timerRef.current);
    setSubmitting(true); setError(""); setStarted(false);
    try {
      const payload = {
        answers: questions.map(q => ({ questionId: q._id, answer: answers[q._id] || "" })),
        timeTaken: quiz.timeLimit * 60 - (timeLeft || 0),
        flaggedForCheating: flagCheating || warningRef.current >= 2,
      };
      const res  = await apiFetch(`/api/quizzes/${quiz._id}/submit`, { method: "POST", body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setResult(data); setSubmitted(true); setAttempts(p => p + 1);
      if (data.passed) onCompleted && onCompleted();
    } catch { setError("Cannot connect to server"); }
    finally { setSubmitting(false); }
  };

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  if (attempts >= quiz.maxAttempts && !result?.passed) {
    return (
      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200">
        <p className="text-sm font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">block</span>
          Maximum {quiz.maxAttempts} attempts reached.
        </p>
      </div>
    );
  }

  if (!started && !submitted) {
    return (
      <div className="p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-600 space-y-3">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-amber-500 text-2xl">quiz</span>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{quiz.title || "Lesson Quiz"}</p>
            <p className="text-xs text-gray-500">{questions.length} questions · {quiz.timeLimit} min · Pass: {quiz.passingScore}%</p>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 text-xs text-amber-700 dark:text-amber-300">
          ⚠️ Tab switching is monitored. 1st switch = warning. 2nd switch = auto-submit.
        </div>
        {attempts > 0 && <p className="text-xs text-amber-600">Attempt {attempts+1} of {quiz.maxAttempts}</p>}
        <button onClick={handleStart}
          className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-base">play_arrow</span>
          {attempts > 0 ? "Retake Quiz" : "Start Quiz"}
        </button>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className={`p-4 sm:p-5 rounded-xl border ${result.passed ? "border-green-300 bg-green-50 dark:bg-green-900/20" : "border-red-300 bg-red-50 dark:bg-red-900/20"}`}>
        <div className="flex items-center gap-3 mb-3">
          <span className={`material-symbols-outlined text-2xl ${result.passed?"text-green-600":"text-red-500"}`}>
            {result.passed ? "check_circle" : "cancel"}
          </span>
          <div>
            <p className={`font-bold ${result.passed?"text-green-700 dark:text-green-300":"text-red-700 dark:text-red-300"} text-sm sm:text-base`}>
              {result.alreadyDone ? "Already Passed ✓" : result.passed ? `Passed! ${result.score}%` : `Failed — ${result.score}%`}
            </p>
            {!result.passed && <p className="text-xs text-gray-500">Need {quiz.passingScore}% to pass</p>}
            {result.flaggedForCheating && <p className="text-xs text-red-600 mt-1">⚠️ Flagged for tab switching</p>}
          </div>
        </div>
        {!result.passed && attempts < quiz.maxAttempts && (
          <button onClick={handleStart} className="w-full py-2 rounded-xl text-sm font-medium text-white bg-amber-600 hover:bg-amber-700">
            Try Again ({quiz.maxAttempts - attempts} left)
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="border border-amber-200 dark:border-amber-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700">
        <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-300">Quiz in progress</p>
        <span className={`font-mono font-bold text-sm ${timeLeft < 60 ? "text-red-600" : "text-amber-700 dark:text-amber-300"}`}>{fmt(timeLeft || 0)}</span>
      </div>

      {warning && (
        <div className="px-3 sm:px-4 py-2 bg-red-100 dark:bg-red-900/30 border-b border-red-300 text-sm text-red-700 dark:text-red-300 font-medium">
          {warning}
        </div>
      )}
      {tabWarnings > 0 && !warning && (
        <div className="px-3 sm:px-4 py-1 bg-amber-100 dark:bg-amber-900/20 border-b border-amber-300 text-xs text-amber-700">
          Tab switches: {tabWarnings}/2
        </div>
      )}

      <div className="p-3 sm:p-4 space-y-5 max-h-96 overflow-y-auto">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {questions.map((q, i) => (
          <div key={q._id}>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{i+1}. {q.questionText}</p>
            {q.questionType === "mcq" && q.options?.filter(Boolean).map((opt, j) => (
              <label key={j} className={`flex items-center gap-2 p-2 mb-1.5 rounded-lg border cursor-pointer transition-all ${answers[q._id]===opt?"border-blue-500 bg-blue-50 dark:bg-blue-900/20":"border-gray-200 dark:border-gray-600 hover:bg-gray-50"}`}>
                <input type="radio" name={q._id} value={opt} checked={answers[q._id]===opt} onChange={() => handleAnswer(q._id, opt)} className="text-blue-600"/>
                <span className="text-sm text-gray-800 dark:text-gray-200">{opt}</span>
              </label>
            ))}
            {q.questionType === "true_false" && ["true","false"].map(opt => (
              <label key={opt} className={`flex items-center gap-2 p-2 mb-1.5 rounded-lg border cursor-pointer transition-all ${answers[q._id]===opt?"border-blue-500 bg-blue-50 dark:bg-blue-900/20":"border-gray-200 dark:border-gray-600"}`}>
                <input type="radio" name={q._id} value={opt} checked={answers[q._id]===opt} onChange={() => handleAnswer(q._id, opt)} className="text-blue-600"/>
                <span className="text-sm capitalize text-gray-800 dark:text-gray-200">{opt}</span>
              </label>
            ))}
            {q.questionType === "short_answer" && (
              <input value={answers[q._id]||""} onChange={e => handleAnswer(q._id, e.target.value)}
                placeholder="Your answer..." className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"/>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={() => handleSubmit(false)} disabled={submitting}
          className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {submitting
            ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Grading...</>
            : <><span className="material-symbols-outlined text-base">check</span>Submit Quiz</>
          }
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// LAB SECTION — code editor + run + submit
// ─────────────────────────────────────────────
const LabSection = ({ lab, lessonId, courseId, onCompleted }) => {
  const [answer,     setAnswer]     = useState("");
  const [output,     setOutput]     = useState(null);
  const [running,    setRunning]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [error,      setError]      = useState("");

  useEffect(() => { fetchMySubmission(); }, [lab._id]);

  const fetchMySubmission = async () => {
    try {
      const res  = await apiFetch(`/api/courses/${courseId}/lessons/${lessonId}/lab/${lab._id}/my-submission`);
      const data = await res.json();
      if (res.ok && data.submission) {
        setAnswer(data.submission.answer);
        setSubmitted(true);
        onCompleted && onCompleted();
      } else if (lab.starterCode) {
        setAnswer(lab.starterCode);
      }
    } catch { if (lab.starterCode) setAnswer(lab.starterCode); }
  };

  const handleRun = async () => {
    if (!answer.trim()) { setError("Write some code first"); return; }
    setRunning(true); setError(""); setOutput(null);
    try {
      const res  = await apiFetch(`/api/courses/${courseId}/lessons/${lessonId}/lab/run-code`, {
        method: "POST",
        body:   JSON.stringify({ code: answer, language: lab.language }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setOutput(data);
    } catch { setError("Cannot connect to server"); }
    finally { setRunning(false); }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) { setError("Cannot submit empty answer"); return; }
    setSubmitting(true); setError("");
    try {
      const res  = await apiFetch(`/api/courses/${courseId}/lessons/${lessonId}/lab/${lab._id}/submit`, {
        method: "POST",
        body:   JSON.stringify({ answer, testResults: output ? [output] : [] }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setSubmitted(true);
      onCompleted && onCompleted();
    } catch { setError("Cannot connect to server"); }
    finally { setSubmitting(false); }
  };

  const labCfg = {
    programming: { icon: "terminal",    color: "text-green-600",  label: "Programming Lab" },
    dld:         { icon: "schema",      color: "text-blue-600",   label: "DLD Lab" },
    networking:  { icon: "hub",         color: "text-purple-600", label: "Networking Lab" },
    theory:      { icon: "description", color: "text-amber-600",  label: "Theory Lab" },
  };
  const cfg = labCfg[lab.labType] || labCfg.theory;

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
        <span className={`material-symbols-outlined ${cfg.color} text-lg sm:text-xl`}>{cfg.icon}</span>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">{cfg.label}</p>
          <p className="text-[10px] sm:text-xs text-gray-500">{lab.title}</p>
        </div>
        {submitted && (
          <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            ✓ Submitted
          </span>
        )}
      </div>

      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-[10px] sm:text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Instructions</p>
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{lab.instructions}</p>
        </div>

        {lab.labType === "programming" && lab.testCases?.length > 0 && (
          <div className="p-3 bg-gray-900 rounded-lg overflow-x-auto">
            <p className="text-xs text-gray-400 mb-2 font-medium">Test Cases</p>
            {lab.testCases.map((tc, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 text-xs font-mono mb-1">
                <span className="text-gray-400">Input:</span>
                <code className="bg-gray-800 px-2 py-0.5 rounded text-green-400 text-xs">{tc.input}</code>
                <span className="text-gray-400">→ Expected:</span>
                <code className="bg-gray-800 px-2 py-0.5 rounded text-blue-400 text-xs">{tc.expectedOutput}</code>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}

        <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={lab.labType === "programming" ? 12 : 8}
          placeholder={lab.labType==="programming" ? "Write your code here..." : "Write your answer here..."}
          className={`w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none ${lab.labType==="programming"?"font-mono":""}`}/>

        {output && (
          <div className="bg-gray-900 rounded-xl overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-gray-800">
              <span className="text-xs text-gray-400">Output</span>
              <span className={`text-xs font-medium ${output.status?.id===3?"text-green-400":"text-red-400"}`}>
                {output.status?.description || "Unknown"}
              </span>
            </div>
            <pre className="p-3 sm:p-4 text-xs sm:text-sm font-mono text-gray-100 overflow-x-auto whitespace-pre-wrap max-h-40">
              {output.stdout || output.stderr || "No output"}
            </pre>
            {output.time && <p className="px-3 sm:px-4 pb-2 text-xs text-gray-500">Time: {output.time}s</p>}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {lab.labType === "programming" && (
            <button onClick={handleRun} disabled={running}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center gap-2">
              {running
                ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Running...</>
                : <><span className="material-symbols-outlined text-base">play_arrow</span>Run Code</>
              }
            </button>
          )}
          <button onClick={handleSubmit} disabled={submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting
              ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Submitting...</>
              : <><span className="material-symbols-outlined text-base">upload</span>{submitted?"Resubmit":"Submit Lab"}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN LESSON VIEWER
// ─────────────────────────────────────────────
const LessonViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [lessons,       setLessons]       = useState([]);
  const [activeLesson,  setActiveLesson]  = useState(null);
  const [lessonData,    setLessonData]    = useState(null);
  const [loadingList,   setLoadingList]   = useState(true);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [course,        setCourse]        = useState(null);
  const [quizDone,      setQuizDone]      = useState(false);
  const [labDone,       setLabDone]       = useState(false);
  const [error,         setError]         = useState("");
  const [sidebarOpen,   setSidebarOpen]   = useState(false);

  useEffect(() => { fetchAll(); }, [courseId]);
  useEffect(() => { if (activeLesson?._id) openLesson(activeLesson._id); }, [activeLesson?._id]);

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
        const target = lData.lessons.find(l => !l.isLocked && !l.isCompleted) || lData.lessons.find(l => !l.isLocked);
        if (target) setActiveLesson(target);
      }
    } catch { setError("Cannot connect to server"); }
    finally { setLoadingList(false); }
  };

  const openLesson = async (lessonId) => {
    setLoadingLesson(true); setError("");
    try {
      const res  = await apiFetch(`/api/courses/${courseId}/lessons/${lessonId}/content`);
      const data = await res.json();
      if (!res.ok) { setError(data.message); setLessonData(null); return; }
      setLessonData(data);
      setQuizDone(data.progress?.quizCompleted || false);
      setLabDone(data.progress?.labCompleted   || false);
    } catch { setError("Cannot connect to server"); }
    finally { setLoadingLesson(false); }
  };

  const refreshAfterStep = async () => {
    const [lRes, ldRes] = await Promise.all([
      apiFetch(`/api/courses/${courseId}/lessons`),
      activeLesson ? apiFetch(`/api/courses/${courseId}/lessons/${activeLesson._id}/content`) : Promise.resolve(null),
    ]);
    const lData = await lRes.json();
    if (lRes.ok) setLessons(lData.lessons);
    if (ldRes) {
      const ldData = await ldRes.json();
      if (ldData) {
        setLessonData(ldData);
        setQuizDone(ldData.progress?.quizCompleted || false);
        setLabDone(ldData.progress?.labCompleted   || false);
      }
    }
  };

  const progress = lessons.length > 0
    ? Math.round(lessons.filter(l => l.isCompleted).length / lessons.length * 100)
    : 0;

  if (loadingList) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <svg className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-blue-600" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">

      {/* Top bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-2.5 sm:py-3 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4">
          <button onClick={() => navigate("/student/dashboard")}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 text-xl sm:text-2xl">arrow_back</span>
          </button>
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">menu</span>
          </button>
          
          <h1 className="flex-1 font-bold text-gray-900 dark:text-white truncate text-sm sm:text-base">{course?.title}</h1>
          
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <span className="text-[10px] sm:text-xs text-gray-500 hidden xs:inline">{lessons.filter(l=>l.isCompleted).length}/{lessons.length}</span>
            <div className="w-16 sm:w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${progress}%` }}/>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300">{progress}%</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row" style={{ height: "calc(100vh - 53px)" }}>

        {/* Sidebar - Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0 overflow-hidden transition-transform duration-300 transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Lessons</p>
                <p className="text-xs text-gray-500">{lessons.filter(l=>!l.isLocked).length} unlocked</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <span className="material-symbols-outlined text-gray-500 text-lg">close</span>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
            {lessons.map((lesson) => (
              <button key={lesson._id} disabled={lesson.isLocked}
                onClick={() => { setActiveLesson(lesson); setSidebarOpen(false); }}
                className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all ${
                  lesson.isLocked ? "border-gray-100 dark:border-gray-700/50 opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50"
                  : activeLesson?._id === lesson._id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                }`}>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full flex-shrink-0 text-xs font-bold ${
                    lesson.isCompleted ? "bg-green-100 dark:bg-green-900/30 text-green-700"
                    : lesson.isLocked  ? "bg-gray-100 dark:bg-gray-700 text-gray-400"
                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  }`}>
                    {lesson.isCompleted ? "✓" : lesson.isLocked ? "🔒" : lesson.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{lesson.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{lesson.duration}</p>
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
              <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6 sm:p-8">
                <span className="material-symbols-outlined text-4xl sm:text-5xl text-red-300 mb-3">error</span>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{error}</p>
              </div>
            </div>
          ) : lessonData ? (
            <div className="p-4 sm:p-5 md:p-6 max-w-3xl mx-auto space-y-4 sm:space-y-6">

              {/* Lesson header */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] sm:text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full">
                    Lesson {lessonData.lesson.order}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500">{lessonData.lesson.duration}</span>
                  {lessonData.progress?.isCompleted && (
                    <span className="text-[10px] sm:text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full">✓ Completed</span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{lessonData.lesson.title}</h2>
                {lessonData.lesson.description && <p className="text-sm text-gray-500 mt-1">{lessonData.lesson.description}</p>}
              </div>

              {/* Video */}
              {lessonData.lesson.videoUrl && (
                <div className="rounded-xl overflow-hidden bg-black aspect-video">
                  {lessonData.lesson.videoUrl.includes("youtube.com") || lessonData.lesson.videoUrl.includes("youtu.be") ? (
                    <iframe src={lessonData.lesson.videoUrl.replace("watch?v=","embed/")} className="w-full h-full" allowFullScreen title={lessonData.lesson.title}/>
                  ) : (
                    <video controls className="w-full h-full" src={lessonData.lesson.videoUrl}/>
                  )}
                </div>
              )}

              {/* Images */}
              {lessonData.lesson.images?.length > 0 && (
                <div className={`grid gap-3 sm:gap-4 ${lessonData.lesson.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                  {lessonData.lesson.images.map((img, i) => (
                    <figure key={i} className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img src={img.url} alt={img.caption || `Image ${i+1}`} className="w-full object-cover max-h-48 sm:max-h-64"/>
                      {img.caption && <figcaption className="px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-500 text-center bg-gray-50 dark:bg-gray-700/50">{img.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              )}

              {/* Text content */}
              {lessonData.lesson.content && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                  <div className="prose prose-sm sm:prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: lessonData.lesson.content }}/>
                </div>
              )}

              {/* Progress steps */}
              {!lessonData.progress?.isCompleted && (lessonData.lesson.requiresQuiz || lessonData.lesson.requiresLab) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Complete to unlock next lesson:</p>
                  <div className="flex flex-wrap gap-4 sm:gap-6">
                    {lessonData.lesson.requiresQuiz && (
                      <div className={`flex items-center gap-2 text-xs sm:text-sm ${quizDone?"text-green-600 dark:text-green-400":"text-gray-500"}`}>
                        <span className="material-symbols-outlined text-base">{quizDone?"check_circle":"radio_button_unchecked"}</span>
                        Pass Quiz
                      </div>
                    )}
                    {lessonData.lesson.requiresLab && (
                      <div className={`flex items-center gap-2 text-xs sm:text-sm ${labDone?"text-green-600 dark:text-green-400":"text-gray-500"}`}>
                        <span className="material-symbols-outlined text-base">{labDone?"check_circle":"radio_button_unchecked"}</span>
                        Submit Lab
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quiz */}
              {lessonData.quiz && lessonData.lesson.requiresQuiz && (
                <QuizSection quiz={lessonData.quiz} courseId={courseId} lessonId={lessonData.lesson._id}
                  onCompleted={() => { setQuizDone(true); refreshAfterStep(); }}/>
              )}

              {/* Lab */}
              {lessonData.lab && lessonData.lesson.requiresLab && (
                <LabSection lab={lessonData.lab} lessonId={lessonData.lesson._id} courseId={courseId}
                  onCompleted={() => { setLabDone(true); refreshAfterStep(); }}/>
              )}

              {/* Completion banner */}
              {lessonData.progress?.isCompleted && (
                <div className="p-3 sm:p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 flex items-center gap-2 sm:gap-3">
                  <span className="material-symbols-outlined text-green-600 text-xl sm:text-2xl">celebration</span>
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-300 text-sm sm:text-base">Lesson Complete!</p>
                    <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400">
                      {lessons.find(l => l.order === lessonData.lesson.order + 1)
                        ? "Next lesson is now unlocked 🎉"
                        : "You have completed all lessons in this course! 🎓"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6 sm:p-8">
                <span className="material-symbols-outlined text-5xl sm:text-6xl text-gray-300 dark:text-gray-600">menu_book</span>
                <p className="text-sm text-gray-500 mt-3">{lessons.length === 0 ? "No lessons added yet" : "Select a lesson to start"}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LessonViewer;