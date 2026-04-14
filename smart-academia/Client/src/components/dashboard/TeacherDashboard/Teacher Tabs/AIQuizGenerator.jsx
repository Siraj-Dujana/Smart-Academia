import React, { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// This is a modal component — import and use inside QuizManagement.jsx
const AIQuizGenerator = ({ quiz, onQuestionsGenerated, onClose }) => {
  const token = localStorage.getItem("token");

  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [count, setCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addedCount, setAddedCount] = useState(0);

  const handleGenerate = async () => {
    if (!topic.trim()) return setError("Please enter a topic");
    setError("");
    setIsGenerating(true);
    setGeneratedQuestions([]);

    try {
      const res = await fetch(`${API}/api/ai/generate-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: topic.trim(),
          difficulty,
          count,
          courseTitle: quiz.course?.title || "",
          courseCode: quiz.course?.code || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.message);
      setGeneratedQuestions(data.questions);
    } catch {
      setError("Cannot connect to server");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddAllToQuiz = async () => {
    if (generatedQuestions.length === 0) return;
    setIsAdding(true);
    setAddedCount(0);

    let added = 0;
    for (const question of generatedQuestions) {
      try {
        const res = await fetch(`${API}/api/quizzes/${quiz._id}/questions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(question),
        });
        if (res.ok) { added++; setAddedCount(added); }
      } catch { /* continue */ }
    }

    setIsAdding(false);
    if (added > 0) {
      onQuestionsGenerated(added);
      setTimeout(() => onClose(), 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-lg sm:text-xl">auto_awesome</span>
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">AI Quiz Generator</h2>
                <p className="text-xs sm:text-sm text-gray-500">Generating for: {quiz.title}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">

          {/* Controls */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Topic / Concept *
              </label>
              <input type="text" value={topic}
                onChange={e => { setTopic(e.target.value); setError(""); }}
                placeholder="e.g. Python loops and functions, Binary search trees, SQL joins..."
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Difficulty
                </label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                  className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500">
                  <option value="easy">Easy (Beginner)</option>
                  <option value="medium">Medium (Intermediate)</option>
                  <option value="hard">Hard (Advanced)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of Questions
                </label>
                <select value={count} onChange={e => setCount(Number(e.target.value))}
                  className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500">
                  {[3, 5, 7, 10].map(n => <option key={n} value={n}>{n} questions</option>)}
                </select>
              </div>
            </div>

            {error && (
              <div className="p-2.5 sm:p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-xs sm:text-sm flex items-start gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                <span className="flex-1">{error}</span>
              </div>
            )}

            <button onClick={handleGenerate} disabled={isGenerating || !topic.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {isGenerating ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg> Generating with AI...</>
              ) : (
                <><span className="material-symbols-outlined text-base">auto_awesome</span>
                Generate Questions</>
              )}
            </button>
          </div>

          {/* Generated questions preview */}
          {generatedQuestions.length > 0 && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                  Generated {generatedQuestions.length} Questions — Preview
                </h3>
                <span className="text-[10px] sm:text-xs text-gray-500">Review before adding</span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {generatedQuestions.map((q, i) => (
                  <div key={i} className="p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-start gap-2 mb-2 sm:mb-3">
                      <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center justify-center text-[10px] sm:text-xs font-bold">
                        {i + 1}
                      </span>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{q.text}</p>
                    </div>
                    <div className="space-y-1 ml-5 sm:ml-8">
                      {q.options.map((opt, j) => (
                        <div key={j} className={`flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs px-2 py-1 rounded-lg ${
                          opt.isCorrect
                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                            : "text-gray-500 dark:text-gray-400"
                        }`}>
                          <span className="flex-shrink-0">{opt.isCorrect ? "✓" : String.fromCharCode(65 + j) + "."}</span>
                          <span className="break-words">{opt.text}</span>
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 ml-5 sm:ml-8 mt-2 italic">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Add to quiz button */}
              <button onClick={handleAddAllToQuiz}
                disabled={isAdding}
                className="w-full mt-3 sm:mt-4 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors">
                {isAdding ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg> Adding {addedCount}/{generatedQuestions.length}...</>
                ) : (
                  <><span className="material-symbols-outlined text-base">add_circle</span>
                  Add All {generatedQuestions.length} Questions to Quiz</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIQuizGenerator;