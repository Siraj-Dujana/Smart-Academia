import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const C = {
  card: "#0f1629", border: "#1e293b", accent: "#6366f1", accent2: "#a855f7",
  amber: "#f59e0b", green: "#22c55e", red: "#ef4444", muted: "#64748b",
  text: "#e2e8f0", textDim: "#94a3b8", input: "#0a0f1e",
  indigoLight: "#818cf8", greenLight: "#4ade80", amberLight: "#fbbf24", redLight: "#f87171",
};

const RingProgress = ({ value = 0, size = 80, stroke = 7, color = C.accent, trackColor = C.border }) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(value, 100) / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`} style={{ transition: "stroke-dasharray 1s ease", filter: `drop-shadow(0 0 6px ${color}88)` }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-black text-white">{value ?? "—"}%</span>
      </div>
    </div>
  );
};

// ── Quiz Card ── (FIXED VERSION)
const QuizCard = ({ quiz, onStart, onViewResults }) => {
  // Determine status color and label
  let statusColor = C.accent;
  let statusLabel = "New";
  
  if (quiz.passed) {
    statusColor = C.green;
    statusLabel = "Passed";
  } else if (!quiz.canAttempt && quiz.attemptCount >= quiz.maxAttempts) {
    statusColor = C.red;
    statusLabel = "Exhausted";
  } else if (quiz.attemptCount > 0) {
    statusColor = C.amber;
    statusLabel = `Attempt ${quiz.attemptCount}/${quiz.maxAttempts}`;
  }

  // Calculate progress percentage
  const progressPercent = quiz.maxAttempts > 0 
    ? (quiz.attemptCount / quiz.maxAttempts) * 100 
    : 0;

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300 border group" style={{ background: C.card, borderColor: statusColor + "33" }}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-lg" style={{ color: statusColor }}>quiz</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: statusColor + "18", color: statusColor, border: `1px solid ${statusColor}44` }}>
                {statusLabel}
              </span>
            </div>
            <h3 className="font-bold text-white text-base truncate">{quiz.title}</h3>
            {quiz.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{quiz.description}</p>
            )}
          </div>
          {quiz.bestScore != null && (
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-black" style={{ color: quiz.passed ? C.greenLight : C.amberLight }}>{quiz.bestScore}%</p>
              <p className="text-[10px] text-gray-500">Best</p>
            </div>
          )}
        </div>
        
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className="flex items-center gap-1.5" style={{ color: C.textDim }}>
            <span className="material-symbols-outlined text-sm">quiz</span>
            {quiz.totalQuestions || 0} Questions
          </div>
          <div className="flex items-center gap-1.5" style={{ color: C.textDim }}>
            <span className="material-symbols-outlined text-sm">schedule</span>
            {quiz.timeLimit || 0} min
          </div>
          <div className="flex items-center gap-1.5" style={{ color: C.textDim }}>
            <span className="material-symbols-outlined text-sm">replay</span>
            {quiz.attemptCount}/{quiz.maxAttempts} attempts
          </div>
          <div className="flex items-center gap-1.5" style={{ color: C.textDim }}>
            <span className="material-symbols-outlined text-sm">flag</span>
            Pass: {quiz.passingScore || 0}%
          </div>
        </div>

        {/* Progress bar for attempts */}
        {quiz.attemptCount > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>Attempts used</span>
              <span>{quiz.attemptCount}/{quiz.maxAttempts}</span>
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: C.border }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progressPercent}%`, background: statusColor }} />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
          {quiz.attemptCount > 0 && (
            <button 
              onClick={() => onViewResults(quiz)} 
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all hover:bg-white/5" 
              style={{ color: C.textDim, border: `1px solid ${C.border}` }}
            >
              <span className="material-symbols-outlined text-sm">bar_chart</span>
              Results
            </button>
          )}
          <button 
            onClick={() => onStart(quiz)} 
            disabled={!quiz.canAttempt || quiz.passed}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
            style={{ 
              background: quiz.canAttempt && !quiz.passed ? statusColor + "22" : "transparent", 
              color: quiz.canAttempt && !quiz.passed ? statusColor : C.muted, 
              border: `1px solid ${quiz.canAttempt && !quiz.passed ? statusColor + "44" : C.border}`
            }}
          >
            <span className="material-symbols-outlined text-sm">
              {quiz.attemptCount > 0 ? "replay" : "play_arrow"}
            </span>
            {quiz.passed ? "Completed" : quiz.attemptCount > 0 ? `Retry (${quiz.maxAttempts - quiz.attemptCount} left)` : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Quiz Player Modal ───────────────────────────────────────
const QuizPlayer = ({ quiz, attempt, questions, onSubmit, onCancel }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warning, setWarning] = useState("");
  const startTime = useRef(Date.now());

  const submit = useCallback(async (auto = false) => {
    if (isSubmitting) return;
    if (!auto && !confirm("Submit?")) return;
    setIsSubmitting(true);
    await onSubmit({ attemptId: attempt._id, answers, timeTaken: Math.round((Date.now()-startTime.current)/1000), tabSwitchCount });
  }, [isSubmitting, onSubmit, attempt._id, answers, tabSwitchCount]);

  useEffect(() => { if (timeLeft<=0) { submit(true); return; } const t=setInterval(()=>setTimeLeft(p=>p-1),1000); return ()=>clearInterval(t); }, [timeLeft, submit]);
  useEffect(() => { const h=()=>{ if(document.hidden){ setTabSwitchCount(p=>{ const n=p+1; setWarning(`Tab switch ${n}/3`); setTimeout(()=>setWarning(""),3000); if(n>=3) submit(true); return n; }); } }; document.addEventListener("visibilitychange",h); return ()=>document.removeEventListener("visibilitychange",h); }, [submit]);

  const q = questions[currentQ];
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#000000cc", backdropFilter: "blur(4px)" }}>
      <div className="rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" style={{ background: "#0c0e1e", border: `1px solid ${C.border}` }}>
        <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div><h2 className="text-lg font-bold text-white">{quiz.title}</h2><p className="text-xs text-gray-500">Attempt {attempt.attemptNumber}/{quiz.maxAttempts}</p></div>
            <div className="flex items-center gap-3">
              {tabSwitchCount>0 && <span className="text-xs font-medium" style={{color:C.amberLight}}>⚠ {tabSwitchCount}/3</span>}
              <div className="px-3 py-1.5 rounded-xl font-mono font-bold text-lg" style={{ background: timeLeft<300?`${C.red}22`:`${C.accent}22`, color: timeLeft<300?C.redLight:C.indigoLight }}>{fmt(timeLeft)}</div>
            </div>
          </div>
          {warning && <div className="text-xs font-medium mb-2" style={{color:C.redLight}}>{warning}</div>}
          <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Q {currentQ+1}/{questions.length}</span><span>{Object.keys(answers).length} answered</span></div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{background:C.border}}><div className="h-full rounded-full transition-all" style={{width:`${((currentQ+1)/questions.length)*100}%`,background:C.accent}}/></div>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <p className="text-base text-white font-medium mb-4">{q.text}</p>
          <div className="space-y-2">
            {q.options.map((o,i)=>{const sel=answers[q._id]===i;return(
              <label key={i} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all" style={{background:sel?`${C.accent}15`:"transparent",border:`1px solid ${sel?C.accent:C.border}`}}>
                <input type="radio" checked={sel} onChange={()=>setAnswers(p=>({...p,[q._id]:i}))} className="text-indigo-500"/>
                <span className="text-sm text-gray-300">{o.text}</span>
              </label>
            )})}
          </div>
        </div>
        <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="flex gap-1.5 mb-3 flex-wrap">{questions.map((_,i)=>(
            <button key={i} onClick={()=>setCurrentQ(i)} className="w-7 h-7 rounded-full text-[10px] font-bold transition-all" style={{background:i===currentQ?C.accent:answers[questions[i]._id]!==undefined?C.green:C.border,color:i===currentQ||answers[questions[i]._id]!==undefined?"white":C.muted}}>{i+1}</button>
          ))}</div>
          <div className="flex justify-between gap-2">
            <button onClick={()=>setCurrentQ(p=>Math.max(0,p-1))} disabled={currentQ===0} className="px-4 py-2 text-sm rounded-lg disabled:opacity-30 hover:bg-white/5" style={{color:C.textDim}}>Prev</button>
            <button onClick={()=>submit(false)} disabled={isSubmitting} className="px-5 py-2 text-sm font-semibold rounded-lg hover:scale-105 disabled:opacity-50" style={{background:`${C.green}22`,color:C.greenLight,border:`1px solid ${C.green}44`}}>{isSubmitting?"Submitting...":"Submit"}</button>
            <button onClick={()=>setCurrentQ(p=>Math.min(questions.length-1,p+1))} disabled={currentQ===questions.length-1} className="px-4 py-2 text-sm rounded-lg disabled:opacity-30 hover:bg-white/5" style={{color:C.textDim}}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Results Modal ── (FIXED SCROLLING)
const QuizResults = ({ result, quiz, onClose, onRetry }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#000000cc", backdropFilter: "blur(4px)" }}>
    <div className="rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ background: "#0c0e1e", border: `1px solid ${C.border}`, maxHeight: "90vh" }}>
      
      {/* Header - fixed at top */}
      <div className="p-5 flex-shrink-0 flex items-center justify-between rounded-t-2xl" style={{ background: result.passed ? C.green : C.amber }}>
        <div>
          <h2 className="text-xl font-bold text-white">Results</h2>
          <p className="text-white/80 text-sm">{quiz.title}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-all">
          <span className="material-symbols-outlined text-white">close</span>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* Ring Progress */}
        <div className="flex justify-center mb-5">
          <RingProgress value={result.score} size={140} stroke={10} color={result.passed ? C.green : C.amber} trackColor={C.border} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { l: "Correct", v: `${result.correctCount || 0}/${result.totalQuestions || 0}` },
            { l: "Time", v: result.timeTaken ? `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s` : "—" },
            { l: "Pass mark", v: `${quiz.passingScore}%` }
          ].map(s => (
            <div key={s.l} className="rounded-xl p-3 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <p className="font-bold text-white text-sm">{s.v}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Question Results */}
        {result.results?.length > 0 && (
          <div className="mb-5 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Question Breakdown</p>
            {result.results.map((r, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background: r.isCorrect ? `${C.green}11` : `${C.red}11`, border: `1px solid ${r.isCorrect ? C.green : C.red}33` }}>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-sm mt-0.5 flex-shrink-0" style={{ color: r.isCorrect ? C.greenLight : C.redLight }}>
                    {r.isCorrect ? "check_circle" : "cancel"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white">Q{i + 1}. {r.questionText}</p>
                    {r.userAnswer && !r.isCorrect && (
                      <p className="text-[10px] mt-1" style={{ color: C.redLight }}>
                        Your answer: {r.userAnswer}
                      </p>
                    )}
                    {r.correctAnswer && (
                      <p className="text-[10px] mt-0.5" style={{ color: r.isCorrect ? C.greenLight : C.amberLight }}>
                        Correct: {r.correctAnswer}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-bold flex-shrink-0" style={{ color: r.isCorrect ? C.greenLight : C.muted }}>
                    {r.isCorrect ? `+${r.points || 1}` : "0"} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results message */}
        {(!result.results || result.results.length === 0) && (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-5xl text-gray-700 mb-2 block">inbox</span>
            <p className="text-sm text-gray-500">No question details available</p>
          </div>
        )}
      </div>

      {/* Footer - fixed at bottom */}
      <div className="p-5 flex-shrink-0 flex gap-2 border-t" style={{ borderColor: C.border }}>
        <button 
          onClick={onClose} 
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105" 
          style={{ color: C.textDim, border: `1px solid ${C.border}`, background: C.card }}
        >
          Back to Quizzes
        </button>
        {onRetry && (
          <button 
            onClick={onRetry} 
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105" 
            style={{ background: `${C.accent}22`, color: C.indigoLight, border: `1px solid ${C.accent}44` }}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  </div>
);
// ── Main Quizzes Page ───────────────────────────────────────
const Quizzes = () => {
  const token = localStorage.getItem("token");
  const [courses, setCourses] = useState([]); const [selectedCourse, setSelectedCourse] = useState("");
  const [quizzes, setQuizzes] = useState([]); const [isLoading, setIsLoading] = useState(false); const [error, setError] = useState("");
  const [activeQuiz, setActiveQuiz] = useState(null); const [activeAttempt, setActiveAttempt] = useState(null); const [activeQuestions, setActiveQuestions] = useState([]);
  const [result, setResult] = useState(null); const [resultQuiz, setResultQuiz] = useState(null);
  const [filter, setFilter] = useState("all"); const [search, setSearch] = useState("");

  const fetchCourses = useCallback(async () => { try { const r=await fetch(`${API}/api/courses/enrolled`,{headers:{Authorization:`Bearer ${token}`}}); const d=await r.json(); if(r.ok&&d.courses.length>0){setCourses(d.courses);setSelectedCourse(d.courses[0]._id);} } catch {} }, [token]);
  const fetchQuizzes = useCallback(async () => { if(!selectedCourse)return; setIsLoading(true); try { const r=await fetch(`${API}/api/quizzes/student/course/${selectedCourse}`,{headers:{Authorization:`Bearer ${token}`}}); const d=await r.json(); if(r.ok)setQuizzes(d.quizzes); else setError(d.message); } catch{setError("Cannot connect");} finally{setIsLoading(false);} }, [selectedCourse, token]);

  useEffect(()=>{fetchCourses();},[fetchCourses]);
  useEffect(()=>{if(selectedCourse)fetchQuizzes();},[selectedCourse,fetchQuizzes]);

  const handleStart = async (quiz) => { try { const r=await fetch(`${API}/api/quizzes/${quiz._id}/attempt`,{method:"POST",headers:{Authorization:`Bearer ${token}`}}); const d=await r.json(); if(!r.ok){alert(d.message);return;} setActiveQuiz(quiz);setActiveAttempt(d.attempt);setActiveQuestions(d.questions); } catch { alert("Cannot connect"); } };
  const handleSubmit = async (payload) => { try { const r=await fetch(`${API}/api/quizzes/submit`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify(payload)}); const d=await r.json(); if(!r.ok){alert(d.message);return;} setActiveQuiz(null);setActiveAttempt(null);setActiveQuestions([]);setResult(d);setResultQuiz(activeQuiz);fetchQuizzes(); } catch { alert("Cannot connect"); } };
  const handleView = async (quiz) => { try { const r=await fetch(`${API}/api/quizzes/${quiz._id}/my-results`,{headers:{Authorization:`Bearer ${token}`}}); const d=await r.json(); if(r.ok&&d.attempts?.length>0){ const b=d.attempts.reduce((a,b)=>a.score>b.score?a:b); setResult({score:b.score,passed:b.passed,correctCount:b.answers?.filter(a=>a.isCorrect).length||0,totalQuestions:b.answers?.length||0,timeTaken:b.timeTaken,results:b.answers||[]}); setResultQuiz(quiz); } } catch { alert("Cannot connect"); } };

  const filtered = quizzes.filter(q=>{if(filter==="pending"&&(q.attemptCount>=q.maxAttempts||q.passed))return false;if(filter==="completed"&&q.attemptCount===0)return false;if(filter==="passed"&&!q.passed)return false;if(search&&!q.title.toLowerCase().includes(search.toLowerCase()))return false;return true;});
  const stats = {total:quizzes.length,completed:quizzes.filter(q=>q.attemptCount>0).length,passed:quizzes.filter(q=>q.passed).length,pending:quizzes.filter(q=>q.attemptCount===0&&q.canAttempt).length};

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif" }}>
      <div>
        <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full animate-pulse" style={{background:C.accent}}/><p className="text-xs font-semibold uppercase tracking-widest" style={{color:C.indigoLight}}>Quizzes</p></div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Test Your Knowledge</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[{i:"quiz",l:"Total",v:stats.total,c:C.accent},{i:"pending",l:"Pending",v:stats.pending,c:C.amber},{i:"check_circle",l:"Attempted",v:stats.completed,c:C.accent2},{i:"emoji_events",l:"Passed",v:stats.passed,c:C.green}].map(s=>(
          <div key={s.l} className="rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden group" style={{background:C.card,border:`1px solid ${s.c}33`}}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(ellipse at 50% 0%, ${s.c}15 0%, transparent 70%)` }} />
            <div className="w-9 h-9 rounded-lg flex items-center justify-center relative z-10" style={{background:`${s.c}22`,border:`1px solid ${s.c}44`}}><span className="material-symbols-outlined text-sm" style={{color:s.c}}>{s.i}</span></div>
            <p className="text-2xl font-black text-white relative z-10" style={{textShadow:`0 0 20px ${s.c}66`}}>{s.v}</p><p className="text-xs text-gray-500 relative z-10">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-4 flex flex-col sm:flex-row gap-3" style={{background:C.card,border:`1px solid ${C.border}`}}>
        {courses.length>0&&<select value={selectedCourse} onChange={e=>setSelectedCourse(e.target.value)} className="sm:w-64 px-3 py-2 text-sm rounded-lg outline-none" style={{background:C.input,border:`1px solid ${C.border}`,color:C.text}}>{courses.map(c=><option key={c._id} value={c._id}>{c.title}</option>)}</select>}
        <div className="flex-1 relative"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{color:C.muted}}>search</span><input placeholder="Search quizzes..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm rounded-lg outline-none" style={{background:C.input,border:`1px solid ${C.border}`,color:C.text}}/></div>
        <div className="flex gap-1">{["all","pending","completed","passed"].map(f=><button key={f} onClick={()=>setFilter(f)} className="px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all" style={{background:filter===f?C.accent:"transparent",color:filter===f?"white":C.muted}}>{f}</button>)}</div>
      </div>

      {error && <div className="p-3 rounded-xl text-sm" style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,color:C.redLight}}>{error}</div>}
      {isLoading ? <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-gray-800 border-t-indigo-500 animate-spin"/></div>
      : filtered.length>0 ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{filtered.map(q=><QuizCard key={q._id} quiz={q} onStart={handleStart} onViewResults={handleView}/>)}</div>
      : <div className="rounded-xl p-12 text-center" style={{background:C.card,border:`1px solid ${C.border}`}}><span className="material-symbols-outlined text-5xl text-gray-700 mb-3 block">quiz</span><p className="text-gray-500">No quizzes found</p></div>}

      {activeQuiz && activeAttempt && <QuizPlayer quiz={activeQuiz} attempt={activeAttempt} questions={activeQuestions} onSubmit={handleSubmit} onCancel={()=>{if(confirm("Cancel?")){setActiveQuiz(null);setActiveAttempt(null);setActiveQuestions([]);}}}/>}
      {result && resultQuiz && <QuizResults result={result} quiz={resultQuiz} onClose={()=>{setResult(null);setResultQuiz(null);}} onRetry={resultQuiz.canAttempt?()=>{setResult(null);setResultQuiz(null);handleStart(resultQuiz);}:null}/>}
    </div>
  );
};

export default Quizzes;