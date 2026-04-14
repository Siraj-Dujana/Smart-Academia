import React, { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const apiFetch = (url, opts = {}) => {
  const token = localStorage.getItem("token");
  return fetch(`${API}${url}`, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
};

const LessonEditor = ({ courseId, editLesson = null, onClose, onSaved }) => {
  const isEdit = !!editLesson;
  const [tab, setTab] = useState("content");
  const [savedLessonId, setSavedLessonId] = useState(editLesson?._id || null);
  const [lesson, setLesson] = useState({
    title: editLesson?.title || "", description: editLesson?.description || "",
    format: editLesson?.format || "text", content: editLesson?.content || "",
    videoUrl: editLesson?.videoUrl || "", images: editLesson?.images || [],
    duration: editLesson?.duration || "30 min", points: editLesson?.points ?? 100,
    requiresQuiz: editLesson?.requiresQuiz !== false,
    requiresLab: editLesson?.requiresLab !== false,
    isPublished: editLesson?.isPublished !== false,
  });
  const [quiz, setQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({ timeLimit: 30, passingScore: 70, maxAttempts: 3, shuffleQuestions: true });
  const [questions, setQuestions] = useState([]);
  const [newQ, setNewQ] = useState({ questionText: "", questionType: "mcq", options: ["", "", "", ""], correctAnswer: "", points: 1 });
  const [aiTopic, setAiTopic] = useState("");
  const [aiDiff, setAiDiff] = useState("medium");
  const [aiCount, setAiCount] = useState(5);
  const [lab, setLab] = useState(null);
  const [labForm, setLabForm] = useState({ 
    title: "", 
    labType: "programming", 
    instructions: "", 
    starterCode: "", 
    language: "python", 
    testCases: [],
    description: "",
    outputExample: "",
    difficulty: "medium",
    totalMarks: 100,
    dueDate: ""
  });
  
  // AI Lab Generation State
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiLabTopic, setAiLabTopic] = useState("");
  const [aiLabDifficulty, setAiLabDifficulty] = useState("medium");
  const [aiLabType, setAiLabType] = useState("programming");
  const [isGeneratingLab, setIsGeneratingLab] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef();

  useEffect(() => {
    if (isEdit && editLesson?._id) fetchExisting(editLesson._id);
  }, []);

  const fetchExisting = async (lid) => {
    try {
      const res = await apiFetch(`/api/courses/${courseId}/lessons/${lid}/teacher`);
      const data = await res.json();
      if (!res.ok) return;
      if (data.quiz) {
        setQuiz(data.quiz);
        setQuizForm({
          timeLimit: data.quiz.timeLimit,
          passingScore: data.quiz.passingScore,
          maxAttempts: data.quiz.maxAttempts,
          shuffleQuestions: data.quiz.shuffleQuestions
        });
        const qRes = await apiFetch(`/api/quizzes/${data.quiz._id}/questions`);
        const qData = await qRes.json();
        if (qRes.ok) setQuestions(qData.questions || []);
      }
      if (data.lab) {
        setLab(data.lab);
        setLabForm({
          title: data.lab.title || "",
          labType: data.lab.labType || "programming",
          instructions: data.lab.instructions || "",
          starterCode: data.lab.starterCode || "",
          language: data.lab.language || "python",
          testCases: data.lab.testCases || [],
          description: data.lab.description || "",
          outputExample: data.lab.outputExample || "",
          difficulty: data.lab.difficulty || "medium",
          totalMarks: data.lab.totalMarks || 100,
          dueDate: data.lab.dueDate ? data.lab.dueDate.slice(0, 10) : ""
        });
      }
    } catch { /* ignore */ }
  };

  // ==================== AI LAB GENERATION ====================
  const handleAIGenerateLab = async () => {
    if (!savedLessonId) {
      setError("Please save the lesson first before generating lab");
      return;
    }
    if (!aiLabTopic.trim()) {
      setError("Please enter a topic for AI generation");
      return;
    }
    setIsGeneratingLab(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/courses/${courseId}/lessons/${savedLessonId}/lab/ai-generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          topic: aiLabTopic,
          difficulty: aiLabDifficulty,
          labType: aiLabType,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setLab(data.lab);
      setLabForm({
        title: data.lab.title || "",
        labType: data.lab.labType || "programming",
        instructions: data.lab.instructions || "",
        starterCode: data.lab.starterCode || "",
        language: data.lab.language || "python",
        testCases: data.lab.testCases || [],
        description: data.lab.description || "",
        outputExample: data.lab.outputExample || "",
        difficulty: data.lab.difficulty || aiLabDifficulty,
        totalMarks: data.lab.totalMarks || 100,
        dueDate: ""
      });
      setSuccess(`AI generated: "${data.lab.title}"`);
      setShowAIGenerator(false);
      setAiLabTopic("");
    } catch {
      setError("AI generation failed");
    } finally {
      setIsGeneratingLab(false);
    }
  };

  // ==================== LAB CRUD OPERATIONS ====================
  const saveLab = async () => {
    if (!savedLessonId) {
      setError("Save lesson first");
      return;
    }
    if (!labForm.title.trim()) {
      setError("Lab title required");
      return;
    }
    if (!labForm.instructions.trim()) {
      setError("Lab instructions required");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = lab
        ? await apiFetch(`/api/courses/${courseId}/lessons/${savedLessonId}/lab/${lab._id}`, { 
            method: "PUT", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(labForm) 
          })
        : await apiFetch(`/api/courses/${courseId}/lessons/${savedLessonId}/lab`, { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(labForm) 
          });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setLab(data.lab);
      setSuccess("Lab saved successfully!");
      // Refresh lesson data to update completion status
      onSaved && onSaved();
    } catch {
      setError("Cannot connect to server");
    } finally {
      setSaving(false);
    }
  };

  const deleteLab = async () => {
    if (!lab) return;
    if (!window.confirm(`Delete "${lab.title}"? This action cannot be undone.`)) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/courses/${courseId}/lessons/${savedLessonId}/lab/${lab._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLab(null);
        setLabForm({
          title: "",
          labType: "programming",
          instructions: "",
          starterCode: "",
          language: "python",
          testCases: [],
          description: "",
          outputExample: "",
          difficulty: "medium",
          totalMarks: 100,
          dueDate: ""
        });
        setSuccess("Lab deleted successfully!");
        onSaved && onSaved();
      } else {
        const data = await res.json();
        setError(data.message);
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setSaving(false);
    }
  };

  const addTestCase = () => setLabForm(p => ({ 
    ...p, 
    testCases: [...p.testCases, { input: "", expectedOutput: "", description: "", points: 10 }] 
  }));
  
  const updateTestCase = (i, field, val) => {
    const tc = [...labForm.testCases];
    tc[i] = { ...tc[i], [field]: val };
    setLabForm(p => ({ ...p, testCases: tc }));
  };
  
  const removeTestCase = (i) => setLabForm(p => ({ 
    ...p, 
    testCases: p.testCases.filter((_, idx) => idx !== i) 
  }));

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiFetch(`/api/courses/${courseId}/lessons/upload`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      if (data.resourceType === "video") {
        setLesson(p => ({ ...p, videoUrl: data.url, format: p.format === "text" ? "mixed" : p.format }));
        setSuccess("Video uploaded!");
      } else {
        setLesson(p => ({ ...p, images: [...p.images, { url: data.url, caption: "" }] }));
        setSuccess("Image uploaded!");
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (idx) => setLesson(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
  const updateImageCaption = (idx, caption) => {
    const imgs = [...lesson.images];
    imgs[idx] = { ...imgs[idx], caption };
    setLesson(p => ({ ...p, images: imgs }));
  };

  const saveLesson = async () => {
    if (!lesson.title.trim()) {
      setError("Lesson title is required");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const url = savedLessonId ? `/api/courses/${courseId}/lessons/${savedLessonId}` : `/api/courses/${courseId}/lessons`;
      const method = savedLessonId ? "PUT" : "POST";
      const res = await apiFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(lesson) });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setSavedLessonId(data.lesson._id);
      setSuccess("Lesson saved!");
      onSaved && onSaved(data.lesson);
    } catch {
      setError("Cannot connect to server");
    } finally {
      setSaving(false);
    }
  };

  const saveQuiz = async () => {
    if (!savedLessonId) {
      setError("Save lesson content first");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const body = { ...quizForm, lesson: savedLessonId, course: courseId, title: lesson.title + " — Quiz", isPublished: true };
      const res = quiz
        ? await apiFetch(`/api/quizzes/${quiz._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await apiFetch(`/api/quizzes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setQuiz(data.quiz || data);
      setSuccess("Quiz saved!");
    } catch {
      setError("Cannot connect to server");
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = async () => {
    if (!quiz) {
      setError("Save quiz first");
      return;
    }
    if (!newQ.questionText.trim()) {
      setError("Question text required");
      return;
    }
    if (!newQ.correctAnswer.trim()) {
      setError("Correct answer required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await apiFetch(`/api/quizzes/${quiz._id}/questions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newQ) });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setQuestions(p => [...p, data.question]);
      setNewQ({ questionText: "", questionType: "mcq", options: ["", "", "", ""], correctAnswer: "", points: 1 });
      setSuccess("Question added!");
    } catch {
      setError("Cannot connect to server");
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (qId) => {
    if (!window.confirm("Delete this question?")) return;
    await apiFetch(`/api/quizzes/${quiz._id}/questions/${qId}`, { method: "DELETE" });
    setQuestions(p => p.filter(q => q._id !== qId));
  };

  const aiGenerate = async () => {
    if (!quiz) {
      setError("Save quiz settings first");
      return;
    }
    if (!aiTopic.trim()) {
      setError("Enter a topic for AI generation");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await apiFetch(`/api/quizzes/${quiz._id}/ai-generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic, difficulty: aiDiff, count: aiCount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setQuestions(p => [...p, ...data.questions]);
      setSuccess(`AI generated ${data.questions.length} questions!`);
      setAiTopic("");
    } catch {
      setError("AI generation failed");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: "content", icon: "article", label: "Content" },
    { key: "quiz", icon: "quiz", label: "Quiz" },
    { key: "lab", icon: "science", label: "Lab" },
    { key: "settings", icon: "settings", label: "Settings" },
  ];

  const Spinner = () => (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
              {isEdit ? "Edit Lesson" : "Create Lesson"}
            </h2>
            {savedLessonId && !isEdit && (
              <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 mt-0.5">✓ Lesson saved — now add Quiz & Lab</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 self-end sm:self-auto">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => { setError(""); setSuccess(""); setTab(t.key); }}
              className={`flex items-center gap-1 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t.key ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="material-symbols-outlined text-base sm:text-lg">{t.icon}</span>
              <span className="hidden xs:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Alerts */}
        <div className="px-4 sm:px-6 pt-3 flex-shrink-0 space-y-2">
          {error && (
            <div className="p-2.5 sm:p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-xs sm:text-sm flex gap-2">
              <span className="material-symbols-outlined text-base flex-shrink-0">error</span>
              {error}
            </div>
          )}
          {success && (
            <div className="p-2.5 sm:p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 text-xs sm:text-sm flex gap-2">
              <span className="material-symbols-outlined text-base flex-shrink-0">check_circle</span>
              {success}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6">

          {/* CONTENT TAB */}
          {tab === "content" && (
            <div className="space-y-4 sm:space-y-5 pt-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  value={lesson.title}
                  onChange={e => setLesson(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Introduction to Python"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  value={lesson.description}
                  onChange={e => setLesson(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief overview of this lesson"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Format */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format</label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { v: "text", icon: "article", l: "Text" },
                    { v: "video", icon: "play_circle", l: "Video" },
                    { v: "mixed", icon: "auto_awesome", l: "Mixed" }
                  ].map(o => (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => setLesson(p => ({ ...p, format: o.v }))}
                      className={`flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl border-2 transition-all ${
                        lesson.format === o.v ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-600"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-lg sm:text-xl ${lesson.format === o.v ? "text-blue-600" : "text-gray-400"}`}>{o.icon}</span>
                      <span className={`text-[10px] sm:text-xs font-medium ${lesson.format === o.v ? "text-blue-600" : "text-gray-500"}`}>{o.l}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload section */}
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400">cloud_upload</span>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Upload Images or Video</p>
                      <p className="text-[10px] sm:text-xs text-gray-400">JPG, PNG, GIF, MP4, MOV — max 100MB</p>
                    </div>
                  </div>
                  <div className="sm:ml-auto">
                    <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors w-full sm:w-auto"
                    >
                      {uploading ? <><Spinner /> Uploading...</> : <><span className="material-symbols-outlined text-base">upload</span>Choose File</>}
                    </button>
                  </div>
                </div>

                {/* Video preview */}
                {lesson.videoUrl && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] sm:text-xs font-medium text-gray-500">Video</p>
                      <button onClick={() => setLesson(p => ({ ...p, videoUrl: "" }))} className="text-[10px] sm:text-xs text-red-500 hover:text-red-600">Remove</button>
                    </div>
                    <input
                      value={lesson.videoUrl}
                      onChange={e => setLesson(p => ({ ...p, videoUrl: e.target.value }))}
                      placeholder="Or paste YouTube/video URL here"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {!lesson.videoUrl && (
                  <input
                    value={lesson.videoUrl}
                    onChange={e => setLesson(p => ({ ...p, videoUrl: e.target.value }))}
                    placeholder="Or paste YouTube embed / video URL"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 mb-3"
                  />
                )}

                {/* Uploaded images */}
                {lesson.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {lesson.images.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img.url} alt="" className="w-full h-20 sm:h-24 object-cover rounded-lg" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <input
                          value={img.caption}
                          onChange={e => updateImageCaption(i, e.target.value)}
                          placeholder="Caption..."
                          className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Text content */}
              {(lesson.format === "text" || lesson.format === "mixed") && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lesson Content <span className="text-[10px] sm:text-xs text-gray-400 font-normal">(HTML supported)</span>
                  </label>
                  <textarea
                    value={lesson.content}
                    onChange={e => setLesson(p => ({ ...p, content: e.target.value }))}
                    rows={10}
                    placeholder="Write lesson content..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono resize-none"
                  />
                  {lesson.content && (
                    <details className="mt-2 cursor-pointer">
                      <summary className="text-xs text-blue-600">▶ Preview</summary>
                      <div
                        className="mt-2 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 border rounded-xl prose dark:prose-invert max-w-none text-xs sm:text-sm"
                        dangerouslySetInnerHTML={{ __html: lesson.content }}
                      />
                    </details>
                  )}
                </div>
              )}

              <button
                onClick={saveLesson}
                disabled={saving}
                className="w-full py-2.5 sm:py-3 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <><Spinner />Saving...</> : <><span className="material-symbols-outlined text-base">save</span>{savedLessonId ? "Update Lesson" : "Save Lesson"}</>}
              </button>
            </div>
          )}

          {/* QUIZ TAB */}
          {tab === "quiz" && (
            <div className="space-y-4 sm:space-y-5 pt-4">
              {!savedLessonId && (
                <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 text-amber-700 text-xs sm:text-sm">
                  Save lesson content first.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { label: "Time Limit (min)", key: "timeLimit", type: "number", min: 5 },
                  { label: "Passing Score (%)", key: "passingScore", type: "number", min: 0, max: 100 },
                  { label: "Max Attempts", key: "maxAttempts", type: "number", min: 1, max: 5 },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                    <input
                      type={f.type}
                      value={quizForm[f.key]}
                      min={f.min}
                      max={f.max}
                      onChange={e => setQuizForm(p => ({ ...p, [f.key]: Number(e.target.value) }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quizForm.shuffleQuestions}
                      onChange={e => setQuizForm(p => ({ ...p, shuffleQuestions: e.target.checked }))}
                      className="rounded text-blue-600"
                    />
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Shuffle questions</span>
                  </label>
                </div>
              </div>

              <button
                onClick={saveQuiz}
                disabled={saving || !savedLessonId}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <><Spinner />Saving...</> : <><span className="material-symbols-outlined text-base">save</span>{quiz ? "Update Quiz" : "Create Quiz"}</>}
              </button>

              {quiz && (
                <div className="border border-purple-200 dark:border-purple-700 rounded-xl p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/10 space-y-3">
                  <p className="text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">auto_awesome</span>AI Question Generator
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    <div className="sm:col-span-1">
                      <input
                        value={aiTopic}
                        onChange={e => setAiTopic(e.target.value)}
                        placeholder="Topic (e.g. Python loops)"
                        className="w-full px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <select
                        value={aiDiff}
                        onChange={e => setAiDiff(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={aiCount}
                        min={1}
                        max={15}
                        onChange={e => setAiCount(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        placeholder="Count"
                      />
                    </div>
                  </div>
                  <button
                    onClick={aiGenerate}
                    disabled={saving || !aiTopic.trim()}
                    className="w-full py-2.5 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? <><Spinner />Generating...</> : <><span className="material-symbols-outlined text-base">auto_awesome</span>Generate {aiCount} Questions</>}
                  </button>
                </div>
              )}

              {questions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{questions.length} Question{questions.length !== 1 ? "s" : ""}</p>
                  {questions.map((q, i) => (
                    <div key={q._id} className="p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 flex gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{i + 1}. {q.questionText}</p>
                        <p className="text-[10px] sm:text-xs text-green-600 mt-0.5">✓ {q.correctAnswer}</p>
                        {q.options?.length > 0 && <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{q.options.join(" · ")}</p>}
                      </div>
                      <button onClick={() => deleteQuestion(q._id)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {quiz && (
                <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-3 sm:p-4 space-y-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Add Question Manually</p>
                  <textarea
                    value={newQ.questionText}
                    onChange={e => setNewQ(p => ({ ...p, questionText: e.target.value }))}
                    placeholder="Question text..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] sm:text-xs text-gray-500 mb-1">Type</label>
                      <select
                        value={newQ.questionType}
                        onChange={e => setNewQ(p => ({ ...p, questionType: e.target.value, correctAnswer: "" }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="mcq">Multiple Choice</option>
                        <option value="true_false">True / False</option>
                        <option value="short_answer">Short Answer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs text-gray-500 mb-1">Points</label>
                      <input
                        type="number"
                        value={newQ.points}
                        min={1}
                        onChange={e => setNewQ(p => ({ ...p, points: Number(e.target.value) }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  {newQ.questionType === "mcq" && newQ.options.map((opt, i) => (
                    <input
                      key={i}
                      value={opt}
                      placeholder={`Option ${i + 1}`}
                      onChange={e => {
                        const o = [...newQ.options];
                        o[i] = e.target.value;
                        setNewQ(p => ({ ...p, options: o }));
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  ))}
                  {newQ.questionType === "true_false" ? (
                    <select
                      value={newQ.correctAnswer}
                      onChange={e => setNewQ(p => ({ ...p, correctAnswer: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Correct answer...</option>
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  ) : (
                    <input
                      value={newQ.correctAnswer}
                      placeholder={newQ.questionType === "mcq" ? "Must match an option exactly" : "Expected answer"}
                      onChange={e => setNewQ(p => ({ ...p, correctAnswer: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  <button
                    onClick={addQuestion}
                    disabled={saving}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">add</span>Add Question
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ==================== LAB TAB (FULLY FIXED) ==================== */}
          {tab === "lab" && (
            <div className="space-y-4 sm:space-y-5 pt-4">
              {!savedLessonId && (
                <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 text-amber-700 text-xs sm:text-sm">
                  Save lesson first.
                </div>
              )}

              {/* AI Generator Button */}
              {savedLessonId && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowAIGenerator(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white text-sm font-medium transition-all"
                  >
                    <span className="material-symbols-outlined text-base">auto_awesome</span>
                    AI Generate Lab
                  </button>
                </div>
              )}

              {/* Lab Form */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lab Title *</label>
                <input
                  value={labForm.title}
                  onChange={e => setLabForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Python Variables Lab"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={labForm.description}
                  onChange={e => setLabForm(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                  placeholder="Brief description of the lab"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lab Type</label>
                  <select
                    value={labForm.labType}
                    onChange={e => setLabForm(p => ({ ...p, labType: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="programming">Programming Lab</option>
                    <option value="theory">Theory Lab</option>
                    <option value="networking">Networking Lab</option>
                    <option value="dld">DLD Lab</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                  <select
                    value={labForm.difficulty}
                    onChange={e => setLabForm(p => ({ ...p, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructions *</label>
  <textarea
    value={labForm.instructions}
    onChange={e => setLabForm(p => ({ ...p, instructions: e.target.value }))}
    rows={6}
    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
    placeholder="1. First step\n2. Second step\n3. Third step"
  />
</div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Output Example</label>
                <textarea
                  value={labForm.outputExample}
                  onChange={e => setLabForm(p => ({ ...p, outputExample: e.target.value }))}
                  rows={2}
                  placeholder="Example output students should produce"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {labForm.labType === "programming" && (
                <>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                    <select
                      value={labForm.language}
                      onChange={e => setLabForm(p => ({ ...p, language: e.target.value }))}
                      className="w-32 sm:w-40 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      {["python", "javascript", "java", "cpp", "c", "csharp", "go", "ruby", "php"].map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Starter Code</label>
                    <textarea
                      value={labForm.starterCode}
                      onChange={e => setLabForm(p => ({ ...p, starterCode: e.target.value }))}
                      rows={5}
                      placeholder="def solve():\n    pass"
                      className="w-full px-3 py-2 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-900 text-gray-100 focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Test Cases</label>
                      <button onClick={addTestCase} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">add</span>Add Test Case
                      </button>
                    </div>
                    {labForm.testCases.map((tc, i) => (
                      <div key={i} className="flex flex-wrap gap-2 mb-2">
                        <input
                          value={tc.input}
                          onChange={e => updateTestCase(i, "input", e.target.value)}
                          placeholder="Input"
                          className="flex-1 min-w-[100px] px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 font-mono"
                        />
                        <input
                          value={tc.expectedOutput}
                          onChange={e => updateTestCase(i, "expectedOutput", e.target.value)}
                          placeholder="Expected Output"
                          className="flex-1 min-w-[100px] px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 font-mono"
                        />
                        <input
                          value={tc.description}
                          onChange={e => updateTestCase(i, "description", e.target.value)}
                          placeholder="Description"
                          className="w-32 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          value={tc.points}
                          onChange={e => updateTestCase(i, "points", Number(e.target.value))}
                          placeholder="Points"
                          className="w-20 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                        />
                        <button onClick={() => removeTestCase(i)} className="text-red-400 hover:text-red-500">
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ))}
                    {labForm.testCases.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-2">No test cases yet. Add some above.</p>
                    )}
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={labForm.totalMarks}
                    onChange={e => setLabForm(p => ({ ...p, totalMarks: Number(e.target.value) }))}
                    min={1}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={labForm.dueDate}
                    onChange={e => setLabForm(p => ({ ...p, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveLab}
                  disabled={saving || !savedLessonId}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <><Spinner />Saving...</> : <><span className="material-symbols-outlined text-base">save</span>{lab ? "Update Lab" : "Create Lab"}</>}
                </button>
                {lab && (
                  <button
                    onClick={deleteLab}
                    disabled={saving}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {tab === "settings" && (
            <div className="space-y-4 sm:space-y-5 pt-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                  <select
                    value={lesson.duration}
                    onChange={e => setLesson(p => ({ ...p, duration: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {["15 min", "20 min", "30 min", "45 min", "60 min", "90 min", "120 min"].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Points</label>
                  <input
                    type="number"
                    value={lesson.points}
                    min={0}
                    onChange={e => setLesson(p => ({ ...p, points: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { key: "requiresQuiz", icon: "quiz", color: "text-amber-500", label: "Requires Quiz", sub: "Student must pass quiz to unlock next lesson" },
                  { key: "requiresLab", icon: "science", color: "text-purple-500", label: "Requires Lab", sub: "Student must submit lab to unlock next lesson" },
                  { key: "isPublished", icon: "visibility", color: "text-green-500", label: "Published", sub: "Students can see this lesson" },
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <input
                      type="checkbox"
                      checked={lesson[item.key]}
                      onChange={e => setLesson(p => ({ ...p, [item.key]: e.target.checked }))}
                      className="rounded text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">{item.sub}</p>
                    </div>
                    <span className={`material-symbols-outlined ${item.color}`}>{item.icon}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={saveLesson}
                disabled={saving}
                className="w-full py-2.5 sm:py-3 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">save</span>Save Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Lab Generator Modal */}
      {showAIGenerator && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAIGenerator(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-5 text-white rounded-t-2xl">
              <h2 className="text-xl font-bold">AI Lab Generator</h2>
              <p className="text-purple-100 text-sm">Generate a lab with AI</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Topic *</label>
                <input
                  type="text"
                  value={aiLabTopic}
                  onChange={(e) => setAiLabTopic(e.target.value)}
                  placeholder="e.g., Python Lists and Dictionaries"
                  className="w-full px-4 py-2.5 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select
                    value={aiLabDifficulty}
                    onChange={(e) => setAiLabDifficulty(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-xl"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lab Type</label>
                  <select
                    value={aiLabType}
                    onChange={(e) => setAiLabType(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-xl"
                  >
                    <option value="programming">Programming Lab</option>
                    <option value="theory">Theory Lab</option>
                    <option value="networking">Networking Lab</option>
                    <option value="dld">DLD Lab</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAIGenerator(false)}
                  className="flex-1 py-2.5 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAIGenerateLab}
                  disabled={isGeneratingLab || !aiLabTopic.trim()}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  {isGeneratingLab ? "Generating..." : "Generate Lab"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonEditor;