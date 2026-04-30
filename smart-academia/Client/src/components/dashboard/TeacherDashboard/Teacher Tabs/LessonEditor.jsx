import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Loading Spinner ───────────────────────────────────────────
const LoadingSpinner = () => (
  <div className="relative w-12 h-12 mx-auto">
    <div className="absolute inset-0 rounded-full border-4 border-indigo-900" />
    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
    <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
  </div>
);

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const apiFetch = (url, opts = {}) => {
  const token = localStorage.getItem("token");
  return fetch(`${API}${url}`, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
};

// ── Content Block Manager Component ───────────────────────────
const ContentBlockManager = ({ blocks, onChange, onImageUpload, onVideoUpload, uploading }) => {

  const addBlock = (type) => {
    const newBlock = {
      id: Date.now(),
      type: type,
      content: '',
      caption: '',
      url: '',
      order: blocks.length
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id, field, value) => {
    const updatedBlocks = blocks.map(block =>
      block.id === id ? { ...block, [field]: value } : block
    );
    onChange(updatedBlocks);
  };

  const removeBlock = (id) => {
    if (window.confirm('Remove this block?')) {
      onChange(blocks.filter(block => block.id !== id));
    }
  };

  const moveBlock = (id, direction) => {
    const index = blocks.findIndex(b => b.id === id);
    if (direction === 'up' && index > 0) {
      const newBlocks = [...blocks];
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
      onChange(newBlocks);
    } else if (direction === 'down' && index < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
      onChange(newBlocks);
    }
  };

  const handleFileUpload = (blockId, type, file) => {
    if (type === 'image') {
      onImageUpload(file, (url) => {
        updateBlock(blockId, 'url', url);
      });
    } else if (type === 'video') {
      onVideoUpload(file, (url) => {
        updateBlock(blockId, 'url', url);
      });
    }
  };

  const renderBlock = (block) => {
    switch (block.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
              placeholder="Write your text content here..."
              className="w-full px-4 py-3 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-y"
              rows={6}
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-3">
            {block.url ? (
              <div className="relative group">
                <img src={block.url} alt={block.caption} className="w-full rounded-xl max-h-[400px] object-contain bg-gray-900" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => updateBlock(block.id, 'url', '')}
                    className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-600 text-white transition-all"
                    title="Remove image"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-indigo-500 hover:bg-indigo-500/5" style={{ borderColor: "#334155" }}>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleFileUpload(block.id, 'image', file);
                    }}
                  />
                  <span className="material-symbols-outlined text-3xl text-gray-500 mb-2">cloud_upload</span>
                  <p className="text-sm text-gray-400">Click to upload image</p>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">link</span>
                  <input
                    type="text"
                    value={block.url}
                    onChange={(e) => updateBlock(block.id, 'url', e.target.value)}
                    placeholder="Or paste image URL here..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            )}
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => updateBlock(block.id, 'caption', e.target.value)}
              placeholder="Image caption / description..."
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        );

      case 'video':
        return (
          <div className="space-y-3">
            {block.url ? (
              <div className="relative group">
                {block.url.includes('youtube.com') || block.url.includes('youtu.be') ? (
                  <div className="aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe
                      src={block.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                      className="w-full h-full"
                      allowFullScreen
                      title="Video content"
                    />
                  </div>
                ) : block.url.includes('.mp4') || block.url.includes('.webm') ? (
                  <video controls className="w-full rounded-xl">
                    <source src={block.url} />
                  </video>
                ) : (
                  <div className="aspect-video rounded-xl bg-gray-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-gray-500">play_circle</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => updateBlock(block.id, 'url', '')}
                    className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-600 text-white transition-all"
                    title="Remove video"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-indigo-500 hover:bg-indigo-500/5" style={{ borderColor: "#334155" }}>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleFileUpload(block.id, 'video', file);
                    }}
                  />
                  <span className="material-symbols-outlined text-3xl text-gray-500 mb-2">cloud_upload</span>
                  <p className="text-sm text-gray-400">Click to upload video</p>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">link</span>
                  <input
                    type="text"
                    value={block.url}
                    onChange={(e) => updateBlock(block.id, 'url', e.target.value)}
                    placeholder="Or paste video URL (YouTube, or direct link)..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            )}
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => updateBlock(block.id, 'caption', e.target.value)}
              placeholder="Video caption / description..."
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Block Buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() => addBlock('text')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{ background: "#6366f122", color: "#818cf8", border: "1px solid #6366f144" }}
        >
          <span className="material-symbols-outlined text-base">article</span>
          Add Text
        </button>
        <button
          onClick={() => addBlock('image')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{ background: "#22c55e22", color: "#4ade80", border: "1px solid #22c55e44" }}
        >
          <span className="material-symbols-outlined text-base">image</span>
          Add Image
        </button>
        <button
          onClick={() => addBlock('video')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{ background: "#a855f722", color: "#c084fc", border: "1px solid #a855f744" }}
        >
          <span className="material-symbols-outlined text-base">smart_display</span>
          Add Video
        </button>
      </div>

      {/* Blocks List */}
      {blocks.length === 0 ? (
        <div className="text-center py-12 rounded-xl" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <span className="material-symbols-outlined text-4xl text-gray-500 mb-2 block">add_circle</span>
          <p className="text-sm text-gray-400">No content blocks yet</p>
          <p className="text-xs text-gray-500">Click the buttons above to add text, images, or videos</p>
        </div>
      ) : (
        blocks.map((block, index) => (
          <div
            key={block.id}
            className="rounded-xl p-4 transition-all hover:shadow-lg"
            style={{ background: "#1e293b", border: "1px solid #334155" }}
          >
            {/* Block Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: "#334155" }}>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  block.type === 'text' ? 'text-indigo-400 bg-indigo-500/20' :
                  block.type === 'image' ? 'text-emerald-400 bg-emerald-500/20' :
                  'text-purple-400 bg-purple-500/20'
                }`}>
                  {block.type === 'text' ? 'Text Block' : block.type === 'image' ? 'Image Block' : 'Video Block'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveBlock(block.id, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Move up"
                >
                  <span className="material-symbols-outlined text-sm">arrow_upward</span>
                </button>
                <button
                  onClick={() => moveBlock(block.id, 'down')}
                  disabled={index === blocks.length - 1}
                  className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Move down"
                >
                  <span className="material-symbols-outlined text-sm">arrow_downward</span>
                </button>
                <button
                  onClick={() => removeBlock(block.id)}
                  className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Delete block"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>

            {/* Block Content */}
            {renderBlock(block)}
          </div>
        ))
      )}

      {uploading && (
        <div className="fixed bottom-4 right-4 p-3 rounded-xl shadow-lg flex items-center gap-2 z-50" style={{ background: "#1e293b", border: "1px solid #6366f144" }}>
          <div className="relative w-4 h-4">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-900" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
          </div>
          <p className="text-xs text-gray-400">Uploading...</p>
        </div>
      )}
    </div>
  );
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
  
  // Content blocks state
  const [contentBlocks, setContentBlocks] = useState([]);
  
  const [quiz, setQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({ timeLimit: 30, passingScore: 70, maxAttempts: 3, shuffleQuestions: true });
  const [questions, setQuestions] = useState([]);
  const [newQ, setNewQ] = useState({ questionText: "", questionType: "mcq", options: ["", "", "", ""], correctAnswer: "", points: 1, explanation: "" });
  const [aiTopic, setAiTopic] = useState("");
  const [aiDiff, setAiDiff] = useState("medium");
  const [aiCount, setAiCount] = useState(5);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  
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
      
      // Load content blocks if saved as JSON
      if (data.lesson.contentBlocks && Array.isArray(data.lesson.contentBlocks)) {
        setContentBlocks(data.lesson.contentBlocks);
      }
      
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

  const handleImageUploadToCloud = async (file, callback) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiFetch(`/api/courses/${courseId}/lessons/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      if (callback) callback(data.url);
      setSuccess("Image uploaded successfully!");
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUploadToCloud = async (file, callback) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiFetch(`/api/courses/${courseId}/lessons/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      if (callback) callback(data.url);
      setSuccess("Video uploaded successfully!");
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const saveLesson = async () => {
    if (!lesson.title.trim()) { setError("Lesson title is required"); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      const lessonData = {
        ...lesson,
        contentBlocks: contentBlocks,
      };
      const url = savedLessonId ? `/api/courses/${courseId}/lessons/${savedLessonId}` : `/api/courses/${courseId}/lessons`;
      const method = savedLessonId ? "PUT" : "POST";
      const res = await apiFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(lessonData) });
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
    
    setIsGeneratingQuiz(true);
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
      setIsGeneratingQuiz(false);
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

  const colors = {
    bg: "#0a0b10",
    sidebar: "#0c0e1e",
    card: "#0f1629",
    border: "#1e293b",
    accent: "#6366f1",
    accent2: "#a855f7",
    text: "#e2e8f0",
    muted: "#64748b",
  };

  return (
    <div style={{ background: colors.bg, minHeight: "100vh", fontFamily: "'Lexend', sans-serif", color: colors.text }}>
      <div className="relative flex min-h-screen w-full">
        
        {sidebarOpen && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <aside className={`flex flex-col w-72 fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out h-screen overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`} style={{ background: colors.sidebar, borderRight: `1px solid ${colors.border}` }}>
          <div className="flex items-center gap-3 px-5 py-5 border-b shrink-0" style={{ borderColor: colors.border }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${colors.accent}22`, border: `1px solid ${colors.accent}44` }}>
              <span className="material-symbols-outlined text-xl" style={{ color: colors.accent }}>school</span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">Smart<span style={{ color: colors.accent }}>Academia</span></h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-gray-500 hover:text-white"><span className="material-symbols-outlined text-xl">close</span></button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <div className="flex flex-col gap-0.5 px-3">
              <button onClick={() => navigate("/teacher/dashboard?tab=lessons")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-white/5" style={{ color: colors.muted }}>
                <span className="material-symbols-outlined text-xl">arrow_back</span>
                <span className="text-sm font-medium">Back to Lessons</span>
              </button>
            </div>
          </div>
          
          <div className="p-4 shrink-0" style={{ borderTop: `1px solid ${colors.border}` }}>
            <div className="flex items-center gap-3 p-2.5 rounded-xl">
              {userAvatar ? <div className="w-10 h-10 rounded-full bg-center bg-no-repeat bg-cover" style={{ backgroundImage: `url("${userAvatar}")` }} />
                : <div className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold text-white" style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})` }}>{userInitial}</div>}
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-white truncate">{displayName}</p><p className="text-xs text-gray-500">Teacher</p></div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-0 min-w-0">
          <header className="flex items-center justify-between px-5 py-3 sticky top-0 z-30 backdrop-blur-md" style={{ background: `${colors.bg}ee`, borderBottom: `1px solid ${colors.border}` }}>
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-white/5" style={{ color: colors.muted }}><span className="material-symbols-outlined text-xl">menu</span></button>
              <div>
                <h1 className="text-lg font-bold text-white">{isEdit ? "Edit Lesson" : "Create New Lesson"}</h1>
                {savedLessonId && <p className="text-xs text-emerald-400">✓ Lesson saved — now add Quiz & Lab</p>}
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg transition-all hover:scale-105" style={{ color: colors.muted }}><span className="material-symbols-outlined text-xl">logout</span></button>
          </header>

          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            {error && <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: "#ef444422", border: "1px solid #ef444444" }}><span className="material-symbols-outlined text-sm text-red-400">error</span><span className="flex-1 text-sm text-red-400">{error}</span><button onClick={() => setError("")} className="text-red-400 hover:text-red-300">×</button></div>}
            {success && <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: "#22c55e22", border: "1px solid #22c55e44" }}><span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span><span className="flex-1 text-sm text-emerald-400">{success}</span></div>}

            <div className="rounded-2xl overflow-hidden" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
              {/* Tabs */}
              <div className="flex overflow-x-auto" style={{ borderBottom: `1px solid ${colors.border}`, background: "#0a0f1e" }}>
                {tabs.map(t => (
                  <button key={t.key} onClick={() => { setError(""); setSuccess(""); setTab(t.key); }}
                    className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${tab === t.key ? "border-indigo-500 text-indigo-400" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
                    <span className="material-symbols-outlined text-base">{t.icon}</span><span>{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* CONTENT TAB - WITH CONTENT BLOCK MANAGER */}
                {tab === "content" && (
                  <div className="space-y-5 max-w-4xl">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Lesson Title *</label>
                      <input 
                        value={lesson.title} 
                        onChange={e => setLesson(p => ({ ...p, title: e.target.value }))} 
                        placeholder="e.g., Introduction to Python" 
                        className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                      <textarea 
                        value={lesson.description} 
                        onChange={e => setLesson(p => ({ ...p, description: e.target.value }))} 
                        placeholder="Brief overview of this lesson" 
                        rows={3}
                        className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-y" 
                      />
                    </div>

                    {/* Content Block Manager */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Lesson Content</label>
                      <ContentBlockManager 
                        blocks={contentBlocks}
                        onChange={setContentBlocks}
                        onImageUpload={handleImageUploadToCloud}
                        onVideoUpload={handleVideoUploadToCloud}
                        uploading={uploading}
                      />
                      <p className="text-[10px] text-gray-500 mt-2">
                        💡 Tip: Add text, images, and videos as blocks. You can rearrange them using the arrow buttons.
                      </p>
                    </div>

                    <button 
                      onClick={saveLesson} 
                      disabled={saving} 
                      className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
                    >
                      {saving ? <><Spinner />Saving...</> : <><span className="material-symbols-outlined">save</span>{savedLessonId ? "Update Lesson" : "Save Lesson"}</>}
                    </button>
                  </div>
                )}

                {/* QUIZ TAB */}
                {tab === "quiz" && (
                  <div className="space-y-5 max-w-4xl">
                    {!lesson.requiresQuiz && (
                      <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#f59e0b22", border: "1px solid #f59e0b44" }}>
                        <span className="material-symbols-outlined text-sm text-amber-400">warning</span>
                        <p className="text-sm text-amber-400">Quiz requirement is <strong>disabled</strong> in Settings. Enable "Requires Quiz" in the Settings tab to make it visible and required.</p>
                      </div>
                    )}
                    {!savedLessonId && <div className="rounded-xl p-3" style={{ background: "#f59e0b22", border: "1px solid #f59e0b44" }}><p className="text-sm text-amber-400">Save lesson content first.</p></div>}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Time Limit (min)</label><input type="number" value={quizForm.timeLimit} min={5} onChange={e => setQuizForm(p => ({ ...p, timeLimit: Number(e.target.value) }))} className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500" /></div>
                      <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Passing Score (%)</label><input type="number" value={quizForm.passingScore} min={0} max={100} onChange={e => setQuizForm(p => ({ ...p, passingScore: Number(e.target.value) }))} className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700" /></div>
                      <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Max Attempts</label><input type="number" value={quizForm.maxAttempts} min={1} max={5} onChange={e => setQuizForm(p => ({ ...p, maxAttempts: Number(e.target.value) }))} className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700" /></div>
                      <div className="flex items-end pb-1"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={quizForm.shuffleQuestions} onChange={e => setQuizForm(p => ({ ...p, shuffleQuestions: e.target.checked }))} className="rounded text-indigo-600 focus:ring-indigo-500" /><span className="text-sm text-gray-300">Shuffle questions</span></label></div>
                    </div>
                    
                    <button onClick={saveQuiz} disabled={saving || !savedLessonId} className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>{quiz ? "Update Quiz" : "Create Quiz"}</button>

                    {quiz && (
                      <>
                        <div className="rounded-xl p-4 space-y-3" style={{ background: "#a855f722", border: "1px solid #a855f744" }}>
                          <p className="text-sm font-bold text-purple-400">🤖 AI Question Generator</p>
                          <div className="grid grid-cols-3 gap-2">
                            <input value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="Topic" className="px-3 py-2 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-purple-500" />
                            <select value={aiDiff} onChange={e => setAiDiff(e.target.value)} className="px-3 py-2 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-purple-500"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
                            <input type="number" value={aiCount} min={1} max={15} onChange={e => setAiCount(Number(e.target.value))} className="px-3 py-2 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-purple-500" />
                          </div>
                          <button onClick={aiGenerate} disabled={isGeneratingQuiz || !aiTopic.trim()} className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #a855f7, #d946ef)" }}>
                            {isGeneratingQuiz ? <><Spinner />Generating...</> : <>Generate {aiCount} Questions</>}
                          </button>
                        </div>

                        {questions.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-gray-400">{questions.length} Questions</p>
                            {questions.map((q, i) => (
                              <div key={q._id} className="p-3 rounded-xl flex justify-between items-start" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                                <div><p className="text-sm font-medium text-white">{i+1}. {q.questionText}</p><p className="text-xs text-emerald-400 mt-1">✓ {q.correctAnswer}</p></div>
                                <button onClick={() => deleteQuestion(q._id)} className="text-gray-500 hover:text-red-400"><span className="material-symbols-outlined text-sm">delete</span></button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="rounded-xl p-4 space-y-3" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                          <p className="text-sm font-semibold text-gray-300">Add Question Manually</p>
                          <textarea value={newQ.questionText} onChange={e => setNewQ(p => ({ ...p, questionText: e.target.value }))} placeholder="Question text..." rows={4} className="w-full px-4 py-3 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 resize-y" />
                          <div className="grid grid-cols-2 gap-3">
                            <select value={newQ.questionType} onChange={e => setNewQ(p => ({ ...p, questionType: e.target.value, correctAnswer: "" }))} className="w-full px-3 py-2 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700"><option value="mcq">Multiple Choice</option><option value="true_false">True/False</option><option value="short_answer">Short Answer</option></select>
                            <input type="number" value={newQ.points} min={1} onChange={e => setNewQ(p => ({ ...p, points: Number(e.target.value) }))} className="w-full px-3 py-2 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700" />
                          </div>
                          {newQ.questionType === "mcq" && newQ.options.map((opt, i) => <input key={i} value={opt} placeholder={`Option ${i+1}`} onChange={e => { const o = [...newQ.options]; o[i] = e.target.value; setNewQ(p => ({ ...p, options: o })); }} className="w-full px-3 py-2 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700" />)}
                          {newQ.questionType === "true_false" ? <select value={newQ.correctAnswer} onChange={e => setNewQ(p => ({ ...p, correctAnswer: e.target.value }))} className="w-full px-3 py-2 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700"><option value="">Correct answer...</option><option value="true">True</option><option value="false">False</option></select>
                            : <input value={newQ.correctAnswer} placeholder={newQ.questionType === "mcq" ? "Must match an option exactly" : "Expected answer"} onChange={e => setNewQ(p => ({ ...p, correctAnswer: e.target.value }))} className="w-full px-3 py-2 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700" />}
                          <button onClick={addQuestion} disabled={saving} className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>Add Question</button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* LAB TAB */}
                {tab === "lab" && (
                  <div className="space-y-5 max-w-4xl">
                    {!lesson.requiresLab && (
                      <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#f59e0b22", border: "1px solid #f59e0b44" }}>
                        <span className="material-symbols-outlined text-sm text-amber-400">warning</span>
                        <p className="text-sm text-amber-400">Lab requirement is <strong>disabled</strong> in Settings. Enable "Requires Lab" in the Settings tab to make it visible and required.</p>
                      </div>
                    )}
                    {!savedLessonId && <div className="rounded-xl p-3" style={{ background: "#f59e0b22", border: "1px solid #f59e0b44" }}><p className="text-sm text-amber-400">Save lesson first.</p></div>}
                    
                    {savedLessonId && (
                      <div className="flex justify-end"><button onClick={() => setShowAIGenerator(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #a855f7, #d946ef)" }}><span className="material-symbols-outlined">auto_awesome</span>AI Generate Lab</button></div>
                    )}
                    
                    <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Lab Title *</label><input value={labForm.title} onChange={e => setLabForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Python Variables Lab" className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500" /></div>
                    
                    <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label><textarea value={labForm.description} onChange={e => setLabForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of the lab" rows={3} className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 resize-y" /></div>

                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Lab Type</label><select value={labForm.labType} onChange={e => setLabForm(p => ({ ...p, labType: e.target.value }))} className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700"><option value="programming">Programming Lab</option><option value="theory">Theory Lab</option></select></div>
                      <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Difficulty</label><select value={labForm.difficulty} onChange={e => setLabForm(p => ({ ...p, difficulty: e.target.value }))} className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
                    </div>
                    
                    <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Instructions *</label><textarea value={labForm.instructions} onChange={e => setLabForm(p => ({ ...p, instructions: e.target.value }))} rows={10} placeholder="1. First step\n2. Second step\n3. Third step" className="w-full px-4 py-4 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 resize-y min-h-[200px]" /></div>

                    <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Expected Output Example</label><textarea value={labForm.outputExample} onChange={e => setLabForm(p => ({ ...p, outputExample: e.target.value }))} rows={3} placeholder="Example output students should produce" className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 resize-y" /></div>

                    {labForm.labType === "programming" && (
                      <>
                        <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Language</label><select value={labForm.language} onChange={e => setLabForm(p => ({ ...p, language: e.target.value }))} className="w-40 px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700"><option value="python">Python</option><option value="javascript">JavaScript</option><option value="java">Java</option><option value="cpp">C++</option></select></div>
                        <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Starter Code</label><textarea value={labForm.starterCode} onChange={e => setLabForm(p => ({ ...p, starterCode: e.target.value }))} rows={8} placeholder="def solve():\n    pass" className="w-full px-4 py-4 text-sm font-mono rounded-xl bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-indigo-500 resize-y min-h-[150px]" /></div>
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Total Marks</label><input type="number" value={labForm.totalMarks} min={1} onChange={e => setLabForm(p => ({ ...p, totalMarks: Number(e.target.value) }))} className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700" /></div>
                      <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Due Date</label><input type="date" value={labForm.dueDate} onChange={e => setLabForm(p => ({ ...p, dueDate: e.target.value }))} className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700" /></div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button onClick={saveLab} disabled={saving || !savedLessonId} className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>{lab ? "Update Lab" : "Create Lab"}</button>
                      {lab && <button onClick={deleteLab} disabled={saving} className="px-4 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>Delete</button>}
                    </div>
                  </div>
                )}

                {/* SETTINGS TAB */}
                {tab === "settings" && (
                  <div className="space-y-5 max-w-4xl">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Duration</label><select value={lesson.duration} onChange={e => setLesson(p => ({ ...p, duration: e.target.value }))} className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700"><option>15 min</option><option>30 min</option><option>45 min</option><option>60 min</option><option>90 min</option><option>120 min</option></select></div>
                      <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Points</label><input type="number" value={lesson.points} min={0} onChange={e => setLesson(p => ({ ...p, points: Number(e.target.value) }))} className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700" /></div>
                    </div>
                    <div className="space-y-3">
                      {[{ key: "requiresQuiz", label: "Requires Quiz", sub: "Student must pass quiz to unlock next lesson" }, { key: "requiresLab", label: "Requires Lab", sub: "Student must submit lab to unlock next lesson" }, { key: "isPublished", label: "Published", sub: "Students can see this lesson" }].map(item => (
                        <label key={item.key} className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all hover:bg-white/5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                          <input type="checkbox" checked={lesson[item.key]} onChange={e => setLesson(p => ({ ...p, [item.key]: e.target.checked }))} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                          <div className="flex-1"><p className="text-sm font-medium text-white">{item.label}</p><p className="text-xs text-gray-500">{item.sub}</p></div>
                        </label>
                      ))}
                    </div>
                    <button onClick={saveLesson} disabled={saving} className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>Save Settings</button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* AI Lab Generator Modal */}
      {showAIGenerator && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAIGenerator(false)}>
          <div className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" style={{ background: colors.card, border: `1px solid ${colors.border}` }} onClick={(e) => e.stopPropagation()}>
            <div className="p-5" style={{ background: "linear-gradient(135deg, #a855f7, #d946ef)" }}>
              <h2 className="text-xl font-bold text-white">🤖 AI Lab Generator</h2>
              <p className="text-purple-200 text-sm">Generate a complete lab with AI</p>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Topic *</label><input type="text" value={aiLabTopic} onChange={(e) => setAiLabTopic(e.target.value)} placeholder="e.g., Python Lists" className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-purple-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Difficulty</label><select value={aiLabDifficulty} onChange={(e) => setAiLabDifficulty(e.target.value)} className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Lab Type</label><select value={aiLabType} onChange={(e) => setAiLabType(e.target.value)} className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700"><option value="programming">Programming</option><option value="theory">Theory</option></select></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAIGenerator(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105" style={{ background: "#1e293b", color: "#94a3b8" }}>Cancel</button>
                <button onClick={handleAIGenerateLab} disabled={isGeneratingLab || !aiLabTopic.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #a855f7, #d946ef)" }}>
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