import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const apiFetch = (url, opts = {}) => {
  const token = localStorage.getItem("token");
  return fetch(`${API}${url}`, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
};

const LessonEditor = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!lessonId;
  
  const [user, setUser] = useState({ fullName: "", avatar: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState("content");
  const [savedLessonId, setSavedLessonId] = useState(lessonId || null);
  
  const [lesson, setLesson] = useState({
    title: "", description: "", format: "text", content: "",
    videoUrl: "", images: [], duration: "30 min", points: 100,
    requiresQuiz: true, requiresLab: true, isPublished: false,
  });
  
  const [quiz, setQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({ timeLimit: 30, passingScore: 70, maxAttempts: 3, shuffleQuestions: true });
  const [questions, setQuestions] = useState([]);
  const [newQ, setNewQ] = useState({ questionText: "", questionType: "mcq", options: ["", "", "", ""], correctAnswer: "", points: 1, explanation: "" });
  const [aiTopic, setAiTopic] = useState("");
  const [aiDiff, setAiDiff] = useState("medium");
  const [aiCount, setAiCount] = useState(5);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false); // ✅ Added
  
  const [lab, setLab] = useState(null);
  const [labForm, setLabForm] = useState({ 
    title: "", labType: "programming", instructions: "", starterCode: "", 
    language: "python", testCases: [], description: "", outputExample: "",
    difficulty: "medium", totalMarks: 100, dueDate: ""
  });
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
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
  }, []);

  useEffect(() => {
    if (isEdit && lessonId) fetchExisting(lessonId);
  }, [lessonId]);

  const fetchExisting = async (lid) => {
    try {
      const res = await apiFetch(`/api/courses/${courseId}/lessons/${lid}/teacher`);
      const data = await res.json();
      if (!res.ok) return;
      
      setLesson({
        title: data.lesson.title || "",
        description: data.lesson.description || "",
        format: data.lesson.format || "text",
        content: data.lesson.content || "",
        videoUrl: data.lesson.videoUrl || "",
        images: data.lesson.images || [],
        duration: data.lesson.duration || "30 min",
        points: data.lesson.points ?? 100,
        requiresQuiz: data.lesson.requiresQuiz !== false,
        requiresLab: data.lesson.requiresLab !== false,
        isPublished: data.lesson.isPublished !== false,
      });
      
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

  const saveLesson = async () => {
    if (!lesson.title.trim()) { setError("Lesson title is required"); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      const url = savedLessonId ? `/api/courses/${courseId}/lessons/${savedLessonId}` : `/api/courses/${courseId}/lessons`;
      const method = savedLessonId ? "PUT" : "POST";
      const res = await apiFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(lesson) });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setSavedLessonId(data.lesson._id);
      setSuccess("Lesson saved!");
    } catch { setError("Cannot connect to server"); }
    finally { setSaving(false); }
  };

  const saveQuiz = async () => {
    if (!savedLessonId) { setError("Save lesson content first"); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      const body = { ...quizForm, lesson: savedLessonId, course: courseId, title: lesson.title + " — Quiz", isPublished: true };
      const res = quiz
        ? await apiFetch(`/api/quizzes/${quiz._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await apiFetch(`/api/quizzes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setQuiz(data.quiz || data);
      setSuccess("Quiz saved!");
    } catch { setError("Cannot connect to server"); }
    finally { setSaving(false); }
  };

  const addQuestion = async () => {
    if (!quiz) { setError("Save quiz first"); return; }
    if (!newQ.questionText.trim()) { setError("Question text required"); return; }
    if (!newQ.correctAnswer.trim()) { setError("Correct answer required"); return; }
    setSaving(true); setError("");
    try {
      const res = await apiFetch(`/api/quizzes/${quiz._id}/questions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newQ) });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setQuestions(p => [...p, data.question]);
      setNewQ({ questionText: "", questionType: "mcq", options: ["", "", "", ""], correctAnswer: "", points: 1, explanation: "" });
      setSuccess("Question added!");
    } catch { setError("Cannot connect to server"); }
    finally { setSaving(false); }
  };

  const deleteQuestion = async (qId) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await apiFetch(`/api/quizzes/${quiz._id}/questions/${qId}`, { method: "DELETE" });
      setQuestions(p => p.filter(q => q._id !== qId));
      setSuccess("Question deleted");
    } catch { setError("Cannot delete question"); }
  };

  const aiGenerate = async () => {
    if (!quiz) { setError("Save quiz settings first"); return; }
    if (!aiTopic.trim()) { setError("Enter a topic for AI generation"); return; }
    
    setIsGeneratingQuiz(true); // ✅ Start loading
    setError(""); 
    setSuccess("");
    
    try {
      const res = await apiFetch(`/api/quizzes/${quiz._id}/ai-generate`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic, difficulty: aiDiff, count: aiCount }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setQuestions(p => [...p, ...data.questions]);
      setSuccess(`AI generated ${data.questions.length} questions!`);
      setAiTopic("");
    } catch {
      setError("AI generation failed");
    } finally {
      setIsGeneratingQuiz(false); // ✅ Stop loading
    }
  };

  const saveLab = async () => {
    if (!savedLessonId) { setError("Save lesson first"); return; }
    if (!labForm.title.trim()) { setError("Lab title required"); return; }
    if (!labForm.instructions.trim()) { setError("Lab instructions required"); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = lab
        ? await apiFetch(`/api/courses/${courseId}/lessons/${savedLessonId}/lab/${lab._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(labForm) })
        : await apiFetch(`/api/courses/${courseId}/lessons/${savedLessonId}/lab`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(labForm) });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setLab(data.lab);
      setSuccess("Lab saved successfully!");
    } catch { setError("Cannot connect to server"); }
    finally { setSaving(false); }
  };

  const deleteLab = async () => {
    if (!lab) return;
    if (!window.confirm(`Delete "${lab.title}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/courses/${courseId}/lessons/${savedLessonId}/lab/${lab._id}`, { method: "DELETE" });
      if (res.ok) {
        setLab(null);
        setLabForm({ title: "", labType: "programming", instructions: "", starterCode: "", language: "python", testCases: [], description: "", outputExample: "", difficulty: "medium", totalMarks: 100, dueDate: "" });
        setSuccess("Lab deleted successfully!");
      } else { const data = await res.json(); setError(data.message); }
    } catch { setError("Cannot connect to server"); }
    finally { setSaving(false); }
  };

  const handleAIGenerateLab = async () => {
    if (!savedLessonId) { setError("Please save the lesson first before generating lab"); return; }
    if (!aiLabTopic.trim()) { setError("Please enter a topic for AI generation"); return; }
    setIsGeneratingLab(true); 
    setError("");
    try {
      const res = await fetch(`${API}/api/courses/${courseId}/lessons/${savedLessonId}/lab/ai-generate`, {
        method: "POST", 
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ topic: aiLabTopic, difficulty: aiLabDifficulty, labType: aiLabType }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
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
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } 
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
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

  const addTestCase = () => setLabForm(p => ({ ...p, testCases: [...p.testCases, { input: "", expectedOutput: "", description: "", points: 10 }] }));
  const updateTestCase = (i, field, val) => { 
    const tc = [...labForm.testCases]; 
    tc[i] = { ...tc[i], [field]: val }; 
    setLabForm(p => ({ ...p, testCases: tc })); 
  };
  const removeTestCase = (i) => setLabForm(p => ({ ...p, testCases: p.testCases.filter((_, idx) => idx !== i) }));

  const handleLogout = () => { 
    localStorage.removeItem("token"); 
    localStorage.removeItem("user"); 
    navigate("/login"); 
  };

  const tabs = [
    { key: "content", icon: "article", label: "Content" },
    { key: "quiz", icon: "quiz", label: "Quiz" },
    { key: "lab", icon: "science", label: "Lab" },
    { key: "settings", icon: "settings", label: "Settings" },
  ];

  const displayName = user.fullName || "Teacher";
  const userInitial = displayName.charAt(0).toUpperCase();
  const userAvatar = user.avatar || null;

  const Spinner = () => (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-white transition-colors duration-300">
      <div className="relative flex min-h-screen w-full">
        {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <aside className={`flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out h-screen overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <span className="material-symbols-outlined text-indigo-600 text-2xl sm:text-3xl animate-pulse">school</span>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">SmartAcademia</h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-gray-500"><span className="material-symbols-outlined text-xl">close</span></button>
          </div>
          <div className="flex-1 overflow-y-auto py-3 sm:py-4">
            <div className="flex flex-col gap-0.5 px-2 sm:px-3">
              <button onClick={() => navigate("/teacher/dashboard")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <span className="material-symbols-outlined text-xl">arrow_back</span><span className="text-sm font-medium">Back to Dashboard</span>
              </button>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 shrink-0">
            <div className="flex items-center gap-3 p-2 rounded-lg">
              {userAvatar ? <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 ring-2 ring-gray-200" style={{ backgroundImage: `url("${userAvatar}")` }} />
                : <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 font-bold text-sm">{userInitial}</div>}
              <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{displayName}</p><p className="text-xs text-gray-500">Teacher</p></div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-0 min-w-0">
          <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-3 sm:gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"><span className="material-symbols-outlined text-xl">menu</span></button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{isEdit ? "Edit Lesson" : "Create New Lesson"}</h1>
                {savedLessonId && <p className="text-xs text-green-600 dark:text-green-400">✓ Lesson saved — now add Quiz & Lab</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={handleLogout} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"><span className="material-symbols-outlined text-xl">logout</span></button>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 overflow-y-auto">
            {error && <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm flex gap-2"><span className="material-symbols-outlined">error</span><span className="flex-1">{error}</span><button onClick={() => setError("")}>×</button></div>}
            {success && <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 text-green-600 text-sm flex gap-2"><span className="material-symbols-outlined">check_circle</span><span className="flex-1">{success}</span></div>}

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
                {tabs.map(t => (
                  <button key={t.key} onClick={() => { setError(""); setSuccess(""); setTab(t.key); }}
                    className={`flex items-center gap-1.5 px-4 sm:px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.key ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
                    <span className="material-symbols-outlined text-base">{t.icon}</span><span>{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-4 sm:p-6">
                {/* CONTENT TAB */}
                {tab === "content" && (
                  <div className="space-y-5 max-w-4xl">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                      <input value={lesson.title} onChange={e => setLesson(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Introduction to Python" 
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                      <textarea value={lesson.description} onChange={e => setLesson(p => ({ ...p, description: e.target.value }))} placeholder="Brief overview of this lesson" rows={3}
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format</label>
                      <div className="flex gap-3">
                        {[{ v: "text", icon: "article", l: "Text" }, { v: "video", icon: "play_circle", l: "Video" }, { v: "mixed", icon: "auto_awesome", l: "Mixed" }].map(o => (
                          <button key={o.v} onClick={() => setLesson(p => ({ ...p, format: o.v }))} className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${lesson.format === o.v ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-gray-200 dark:border-gray-600"}`}>
                            <span className={`material-symbols-outlined text-xl ${lesson.format === o.v ? "text-indigo-600" : "text-gray-400"}`}>{o.icon}</span>
                            <span className={`text-xs font-medium ${lesson.format === o.v ? "text-indigo-600" : "text-gray-500"}`}>{o.l}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                        <div className="flex items-center gap-2"><span className="material-symbols-outlined text-gray-400">cloud_upload</span><div><p className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Images or Video</p><p className="text-xs text-gray-400">JPG, PNG, GIF, MP4, MOV — max 100MB</p></div></div>
                        <div className="sm:ml-auto"><input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" /><button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">{uploading ? <><Spinner />Uploading...</> : <><span className="material-symbols-outlined">upload</span>Choose File</>}</button></div>
                      </div>
                      <input value={lesson.videoUrl} onChange={e => setLesson(p => ({ ...p, videoUrl: e.target.value }))} placeholder="Or paste YouTube/video URL here" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                      {lesson.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          {lesson.images.map((img, i) => (
                            <div key={i} className="relative group"><img src={img.url} alt="" className="w-full h-20 object-cover rounded-lg" /><button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100">×</button></div>
                          ))}
                        </div>
                      )}
                    </div>

                    {(lesson.format === "text" || lesson.format === "mixed") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lesson Content</label>
                        <textarea value={lesson.content} onChange={e => setLesson(p => ({ ...p, content: e.target.value }))} rows={20} placeholder="Write lesson content... (HTML supported)"
                          className="w-full px-4 py-4 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono resize-y min-h-[400px]" />
                      </div>
                    )}

                    <button onClick={saveLesson} disabled={saving} className="w-full py-3 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md">{saving ? <><Spinner />Saving...</> : <><span className="material-symbols-outlined">save</span>{savedLessonId ? "Update Lesson" : "Save Lesson"}</>}</button>
                  </div>
                )}

                {/* QUIZ TAB */}
                {tab === "quiz" && (
                  <div className="space-y-5 max-w-4xl">

                    {/* NEW: warn if requiresQuiz is off */}
    {!lesson.requiresQuiz && (
      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 flex items-center gap-2">
        <span className="material-symbols-outlined text-amber-500 text-sm">warning</span>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Quiz requirement is <strong>disabled</strong> in Settings. Students won't see this quiz.
          Enable "Requires Quiz" in the Settings tab to make it visible and required.
        </p>
      </div>
    )}
                    {!savedLessonId && <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 text-amber-700 text-sm">Save lesson content first.</div>}
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Time Limit (min)</label><input type="number" value={quizForm.timeLimit} min={5} onChange={e => setQuizForm(p => ({ ...p, timeLimit: Number(e.target.value) }))} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" /></div>
                      <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Passing Score (%)</label><input type="number" value={quizForm.passingScore} min={0} max={100} onChange={e => setQuizForm(p => ({ ...p, passingScore: Number(e.target.value) }))} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" /></div>
                      <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Max Attempts</label><input type="number" value={quizForm.maxAttempts} min={1} max={5} onChange={e => setQuizForm(p => ({ ...p, maxAttempts: Number(e.target.value) }))} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" /></div>
                      <div className="flex items-end pb-1"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={quizForm.shuffleQuestions} onChange={e => setQuizForm(p => ({ ...p, shuffleQuestions: e.target.checked }))} className="rounded text-indigo-600 focus:ring-indigo-500" /><span className="text-sm text-gray-700 dark:text-gray-300">Shuffle questions</span></label></div>
                    </div>
                    <button onClick={saveQuiz} disabled={saving || !savedLessonId} className="w-full py-3 rounded-xl text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 shadow-md">{quiz ? "Update Quiz" : "Create Quiz"}</button>

                    {quiz && (
                      <>
                        <div className="border border-purple-200 dark:border-purple-700 rounded-xl p-4 bg-purple-50 dark:bg-purple-900/10 space-y-3">
                          <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">🤖 AI Question Generator</p>
                          <div className="grid grid-cols-3 gap-2">
                            <input value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="Topic" className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500" />
                            <select value={aiDiff} onChange={e => setAiDiff(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
                            <input type="number" value={aiCount} min={1} max={15} onChange={e => setAiCount(Number(e.target.value))} className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500" />
                          </div>
                          <button onClick={aiGenerate} disabled={isGeneratingQuiz || !aiTopic.trim()} className="w-full py-2.5 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 shadow-sm flex items-center justify-center gap-2">
                            {isGeneratingQuiz ? <><Spinner />Generating...</> : <>Generate {aiCount} Questions</>}
                          </button>
                        </div>

                        {questions.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{questions.length} Questions</p>
                            {questions.map((q, i) => (
                              <div key={q._id} className="p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 flex justify-between">
                                <div><p className="text-sm font-medium text-gray-900 dark:text-white">{i+1}. {q.questionText}</p><p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ {q.correctAnswer}</p></div>
                                <button onClick={() => deleteQuestion(q._id)} className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-sm">delete</span></button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 space-y-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Question Manually</p>
                          <textarea value={newQ.questionText} onChange={e => setNewQ(p => ({ ...p, questionText: e.target.value }))} placeholder="Question text..." rows={4} className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-y" />
                          <div className="grid grid-cols-2 gap-3">
                            <select value={newQ.questionType} onChange={e => setNewQ(p => ({ ...p, questionType: e.target.value, correctAnswer: "" }))} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"><option value="mcq">Multiple Choice</option><option value="true_false">True/False</option><option value="short_answer">Short Answer</option></select>
                            <input type="number" value={newQ.points} min={1} onChange={e => setNewQ(p => ({ ...p, points: Number(e.target.value) }))} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                          </div>
                          {newQ.questionType === "mcq" && newQ.options.map((opt, i) => <input key={i} value={opt} placeholder={`Option ${i+1}`} onChange={e => { const o = [...newQ.options]; o[i] = e.target.value; setNewQ(p => ({ ...p, options: o })); }} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />)}
                          {newQ.questionType === "true_false" ? <select value={newQ.correctAnswer} onChange={e => setNewQ(p => ({ ...p, correctAnswer: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"><option value="">Correct answer...</option><option value="true">True</option><option value="false">False</option></select>
                            : <input value={newQ.correctAnswer} placeholder={newQ.questionType === "mcq" ? "Must match an option exactly" : "Expected answer"} onChange={e => setNewQ(p => ({ ...p, correctAnswer: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />}
                          <button onClick={addQuestion} disabled={saving} className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm">Add Question</button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* LAB TAB */}
                {tab === "lab" && (
                  <div className="space-y-5 max-w-4xl">
                    {/* NEW: warn if requiresLab is off */}
    {!lesson.requiresLab && (
      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 flex items-center gap-2">
        <span className="material-symbols-outlined text-amber-500 text-sm">warning</span>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Lab requirement is <strong>disabled</strong> in Settings. Students won't see this lab.
          Enable "Requires Lab" in the Settings tab to make it visible and required.
        </p>
      </div>
    )}
                    {!savedLessonId && <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 text-amber-700 text-sm">Save lesson first.</div>}
                    {savedLessonId && (
                      <div className="flex justify-end"><button onClick={() => setShowAIGenerator(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium shadow-md"><span className="material-symbols-outlined">auto_awesome</span>AI Generate Lab</button></div>
                    )}
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lab Title *</label><input value={labForm.title} onChange={e => setLabForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Python Variables Lab" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" /></div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                      <textarea value={labForm.description} onChange={e => setLabForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of the lab" rows={3}
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-y" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lab Type</label><select value={labForm.labType} onChange={e => setLabForm(p => ({ ...p, labType: e.target.value }))} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"><option value="programming">Programming Lab</option><option value="theory">Theory Lab</option></select></div>
                      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label><select value={labForm.difficulty} onChange={e => setLabForm(p => ({ ...p, difficulty: e.target.value }))} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructions *</label>
                      <textarea value={labForm.instructions} onChange={e => setLabForm(p => ({ ...p, instructions: e.target.value }))} rows={10} placeholder="1. First step\n2. Second step\n3. Third step"
                        className="w-full px-4 py-4 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-y min-h-[200px]" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Output Example</label>
                      <textarea value={labForm.outputExample} onChange={e => setLabForm(p => ({ ...p, outputExample: e.target.value }))} rows={3} placeholder="Example output students should produce"
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-y" />
                    </div>

                    {labForm.labType === "programming" && (
                      <>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label><select value={labForm.language} onChange={e => setLabForm(p => ({ ...p, language: e.target.value }))} className="w-40 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"><option value="python">Python</option><option value="javascript">JavaScript</option><option value="java">Java</option><option value="cpp">C++</option></select></div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Starter Code</label>
                          <textarea value={labForm.starterCode} onChange={e => setLabForm(p => ({ ...p, starterCode: e.target.value }))} rows={8} placeholder="def solve():\n    pass"
                            className="w-full px-4 py-4 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-900 text-gray-100 focus:ring-2 focus:ring-indigo-500 resize-y min-h-[150px]" />
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Marks</label><input type="number" value={labForm.totalMarks} min={1} onChange={e => setLabForm(p => ({ ...p, totalMarks: Number(e.target.value) }))} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label><input type="date" value={labForm.dueDate} onChange={e => setLabForm(p => ({ ...p, dueDate: e.target.value }))} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" /></div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button onClick={saveLab} disabled={saving || !savedLessonId} className="flex-1 py-3 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md">{lab ? "Update Lab" : "Create Lab"}</button>
                      {lab && <button onClick={deleteLab} disabled={saving} className="px-4 py-3 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-md">Delete</button>}
                    </div>
                  </div>
                )}

                {/* SETTINGS TAB */}
                {tab === "settings" && (
                  <div className="space-y-5 max-w-4xl">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label><select value={lesson.duration} onChange={e => setLesson(p => ({ ...p, duration: e.target.value }))} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"><option>15 min</option><option>30 min</option><option>45 min</option><option>60 min</option><option>90 min</option><option>120 min</option></select></div>
                      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Points</label><input type="number" value={lesson.points} min={0} onChange={e => setLesson(p => ({ ...p, points: Number(e.target.value) }))} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" /></div>
                    </div>
                    <div className="space-y-3">
                      {[{ key: "requiresQuiz", label: "Requires Quiz", sub: "Student must pass quiz to unlock next lesson" }, { key: "requiresLab", label: "Requires Lab", sub: "Student must submit lab to unlock next lesson" }, { key: "isPublished", label: "Published", sub: "Students can see this lesson" }].map(item => (
                        <label key={item.key} className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 bg-white dark:bg-gray-800">
                          <input type="checkbox" checked={lesson[item.key]} onChange={e => setLesson(p => ({ ...p, [item.key]: e.target.checked }))} className="rounded text-indigo-600 focus:ring-indigo-500" />
                          <div className="flex-1"><p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p><p className="text-xs text-gray-500 dark:text-gray-400">{item.sub}</p></div>
                        </label>
                      ))}
                    </div>
                    <button onClick={saveLesson} disabled={saving} className="w-full py-3 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md">Save Settings</button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* AI Lab Generator Modal */}
      {showAIGenerator && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAIGenerator(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-5 text-white rounded-t-2xl"><h2 className="text-xl font-bold">🤖 AI Lab Generator</h2><p className="text-purple-100 text-sm">Generate a complete lab with AI</p></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic *</label><input type="text" value={aiLabTopic} onChange={(e) => setAiLabTopic(e.target.value)} placeholder="e.g., Python Lists" className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label><select value={aiLabDifficulty} onChange={(e) => setAiLabDifficulty(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lab Type</label><select value={aiLabType} onChange={(e) => setAiLabType(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"><option value="programming">Programming</option><option value="theory">Theory</option></select></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAIGenerator(false)} className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button onClick={handleAIGenerateLab} disabled={isGeneratingLab || !aiLabTopic.trim()} className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium disabled:opacity-50 shadow-md flex items-center justify-center gap-2">
                  {isGeneratingLab ? <><Spinner />Generating...</> : "Generate Lab"}
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