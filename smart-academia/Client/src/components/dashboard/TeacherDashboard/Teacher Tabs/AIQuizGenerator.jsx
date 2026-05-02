import React, { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Color palette (matches TeacherAnalytics) ─────────────────
const C = {
  bg: "#070d1a", surface: "#0f1629", surface2: "#0a0f1e",
  border: "#1e293b", border2: "#334155",
  accent: "#6366f1", accent2: "#a855f7", amber: "#f59e0b",
  green: "#22c55e", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textFaint: "#64748b",
  indigoLight: "#818cf8", greenLight: "#4ade80",
  amberLight: "#fbbf24", redLight: "#f87171", purpleLight: "#c084fc",
};

// ── Loading Spinner ───────────────────────────────────────────
const Spinner = ({ size = "sm" }) => {
  const dim = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-5 h-5";
  return (
    <div className={`relative ${dim}`}>
      <div className="absolute inset-0 rounded-full border-2 border-purple-300" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-600 animate-spin" />
    </div>
  );
};

const AIQuizGenerator = ({ quiz, onQuestionsGenerated, onClose }) => {
  const token = localStorage.getItem("token");

  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [count, setCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }
    
    setError("");
    setIsGenerating(true);
    setGeneratedQuestions([]);

    try {
      const res = await fetch(`${API}/api/quizzes/${quiz._id}/ai-generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: topic.trim(),
          difficulty,
          count,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || "Failed to generate questions");
        return;
      }

      setGeneratedQuestions(data.questions || []);
      
      if (data.questions?.length > 0 && onQuestionsGenerated) {
        onQuestionsGenerated(data.questions.length);
      }
    } catch (err) {
      console.error("Generate error:", err);
      setError("Cannot connect to server");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}>
      <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between flex-shrink-0" style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
              <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Quiz Generator</h2>
              <p className="text-xs text-indigo-200">Generating for: {quiz.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white hover:bg-white/20 transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Controls */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>
              Topic / Concept
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => { setTopic(e.target.value); setError(""); }}
              placeholder="Example: Python loops and functions, Binary search trees, SQL joins..."
              className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
              style={{ background: C.surface2, color: C.text, border: `1px solid ${error ? C.red : C.border}` }}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
              >
                <option value="easy">Easy (Beginner)</option>
                <option value="medium">Medium (Intermediate)</option>
                <option value="hard">Hard (Advanced)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>
                Number of Questions
              </label>
              <select
                value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
              >
                {[3, 5, 7, 10].map(n => <option key={n} value={n}>{n} questions</option>)}
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: `${C.red}22`, border: `1px solid ${C.red}44` }}>
              <span className="material-symbols-outlined text-sm" style={{ color: C.redLight }}>error</span>
              <span className="text-sm flex-1" style={{ color: C.redLight }}>{error}</span>
              <button onClick={() => setError("")} className="text-red-400 hover:text-red-300">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}

          {/* Generate Button - Centered properly */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ 
              background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
              boxShadow: `0 4px 14px 0 ${C.accent}40`,
            }}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner size="sm" />
                <span>Generating with AI...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">auto_awesome</span>
                Generate {count} Questions
              </div>
            )}
          </button>

          {/* Generated Questions Preview */}
          {generatedQuestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm" style={{ color: C.green }}>check_circle</span>
                  <h3 className="text-sm font-semibold" style={{ color: C.text }}>
                    {generatedQuestions.length} Questions Generated & Saved
                  </h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${C.green}22`, color: C.greenLight }}>
                  Saved to Quiz
                </span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {generatedQuestions.map((q, i) => (
                  <div key={q._id || i} className="p-4 rounded-xl" style={{ background: C.surface2, border: `1px solid ${C.border}` }}>
                    <div className="flex items-start gap-2 mb-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${C.accent}22`, color: C.accent, border: `1px solid ${C.accent}44` }}>
                        {i + 1}
                      </span>
                      <p className="text-sm font-medium" style={{ color: C.text }}>{q.questionText}</p>
                    </div>
                    
                    <div className="space-y-1 ml-8">
                      {q.options?.map((opt, j) => {
                        const isCorrect = opt === q.correctAnswer;
                        return (
                          <div
                            key={j}
                            className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg ${
                              isCorrect ? "bg-opacity-20" : ""
                            }`}
                            style={isCorrect ? { background: `${C.green}22`, color: C.greenLight } : { color: C.textFaint }}
                          >
                            <span className="flex-shrink-0 w-5">{isCorrect ? "✓" : `${String.fromCharCode(65 + j)}.`}</span>
                            <span className="break-words">{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {q.explanation && (
                      <p className="text-xs mt-2 ml-8 italic" style={{ color: C.textFaint }}>
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${C.green}, #16a34a)` }}
              >
                <span className="material-symbols-outlined text-base">done_all</span>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIQuizGenerator;