import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Mini Bar ──────────────────────────────────────────────────
const MiniBar = ({ value = 0, color = "#6366f1", height = 6 }) => (
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
const LoadingSpinner = ({ size = "sm" }) => {
  const dimensions = size === "sm" ? "w-10 h-10" : size === "lg" ? "w-16 h-16" : "w-12 h-12";
  return (
    <div className={`relative ${dimensions} mx-auto`}>
      <div className="absolute inset-0 rounded-full border-4 border-indigo-900" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
      <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
    </div>
  );
};

const apiFetch = (url, opts = {}) => {
  const token = localStorage.getItem("token");
  return fetch(`${API}${url}`, { ...opts, headers: { Authorization: `Bearer ${token}`, ...(opts.headers || {}) } });
};

const AssignmentView = ({ courseId }) => {
  const [assignments,  setAssignments]  = useState([]);
  const [active,       setActive]       = useState(null);
  const [submission,   setSubmission]   = useState(null);
  const [answerText,   setAnswerText]   = useState("");
  const [file,         setFile]         = useState(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState("");
  const fileRef = useRef();

  useEffect(() => { if (courseId) fetchAssignments(); }, [courseId]);
  useEffect(() => { if (active) fetchMySubmission(active._id); }, [active?._id]);

  const fetchAssignments = async () => {
    const res  = await apiFetch(`/api/assignments/student/course/${courseId}`);
    const data = await res.json();
    if (res.ok) { setAssignments(data.assignments || []); if (data.assignments?.length > 0) setActive(data.assignments[0]); }
  };

  const fetchMySubmission = async (id) => {
    const res  = await apiFetch(`/api/assignments/${id}/my-submission`);
    const data = await res.json();
    if (res.ok && data.submission) { setSubmission(data.submission); setAnswerText(data.submission.answerText || ""); }
    else { setSubmission(null); setAnswerText(""); }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    
    setError("");
    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (!answerText.trim() && !file) { 
      setError("Write an answer or attach a PDF file"); 
      return; 
    }
    
    setSubmitting(true); 
    setError(""); 
    setSuccess("");
    
    try {
      const formData = new FormData();
      if (answerText.trim()) formData.append("answerText", answerText.trim());
      if (file) formData.append("file", file);

      const res = await apiFetch(`/api/assignments/${active._id}/submit`, {
        method: "POST", 
        body: formData,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      const data = await res.json();
      if (!res.ok) { 
        setError(data.message); 
        return; 
      }
      
      setSubmission(data.submission);
      setSuccess("Assignment submitted successfully!");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setTimeout(() => setSuccess(""), 4000);
    } catch { 
      setError("Cannot connect to server"); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const statusConfig = {
    submitted: { color: "#6366f1", bg: "#6366f122", border: "#6366f144", label: "Submitted — Awaiting Review", icon: "pending" },
    reviewed:  { color: "#f59e0b", bg: "#f59e0b22", border: "#f59e0b44", label: "Reviewed", icon: "rate_review" },
    approved:  { color: "#22c55e", bg: "#22c55e22", border: "#22c55e44", label: "Approved ✓", icon: "verified" },
    rejected:  { color: "#ef4444", bg: "#ef444422", border: "#ef444444", label: "Rejected", icon: "cancel" },
  };

  if (assignments.length === 0) return (
    <div className="text-center py-16 rounded-2xl" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
      <span className="material-symbols-outlined text-5xl text-gray-700 mb-4 block">assignment</span>
      <p className="text-sm text-gray-500">No assignments for this course yet</p>
    </div>
  );

  return (
    <div className="space-y-5" style={{ fontFamily: "'Lexend', sans-serif" }}>
      
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden p-6" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", border: "1px solid #1e293b" }}>
        <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "#6366f1" }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: "#a855f7" }} />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#6366f1" }} />
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">SmartAcademia · Assignments</p>
          </div>
          <h2 className="text-2xl font-black text-white">Course Assignments</h2>
          <p className="text-sm text-gray-400 mt-1">Submit your work and track grades</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-5">
        
        {/* Assignment List - Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
              <span className="material-symbols-outlined text-xs" style={{ color: "#6366f1" }}>format_list_bulleted</span>
            </div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Assignments ({assignments.length})</h3>
          </div>
          
          <div className="space-y-2 max-h-[500px] lg:max-h-[600px] overflow-y-auto pr-1">
            {assignments.map(a => {
              const isActive = active?._id === a._id;
              const status = a.mySubmission?.status;
              const statusColor = status ? statusConfig[status]?.color : null;
              return (
                <button 
                  key={a._id} 
                  onClick={() => setActive(a)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isActive 
                      ? "border-indigo-500 bg-indigo-500/10" 
                      : "border-gray-700 bg-gray-800/30 hover:border-indigo-500/50"
                  }`}
                >
                  <p className={`font-semibold text-sm ${isActive ? "text-white" : "text-gray-300"}`}>{a.title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">{a.totalMarks} marks</span>
                    {a.dueDate && (
                      <span className="text-xs text-gray-500">
                        Due {new Date(a.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {status && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto`}
                        style={{ background: `${statusColor}22`, border: `1px solid ${statusColor}44`, color: statusColor }}>
                        {status}
                      </span>
                    )}
                  </div>
                  {isActive && <MiniBar value={75} color="#6366f1" height={2} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Assignment Content */}
        {active && (
          <div className="flex-1 rounded-2xl overflow-hidden" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
            {/* Header */}
            <div className="p-5 border-b" style={{ borderColor: "#1e293b" }}>
              <h3 className="text-lg font-bold text-white">{active.title}</h3>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">stars</span>
                  {active.totalMarks} marks
                </span>
                {active.dueDate && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    Due: {new Date(active.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 max-h-[550px]">
              {/* Instructions */}
              {active.instructions && (
                <div className="rounded-xl p-4" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
                  <p className="text-xs font-bold text-indigo-400 mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Instructions
                  </p>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{active.instructions}</p>
                </div>
              )}

              {/* Grade Result */}
              {submission && submission.marksAwarded !== null && (
                <div className={`rounded-xl p-4 border-2 ${
                  submission.status === "approved" 
                    ? "border-emerald-500 bg-emerald-500/10" 
                    : "border-amber-500 bg-amber-500/10"
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      submission.status === "approved" ? "bg-emerald-500/20" : "bg-amber-500/20"
                    }`}>
                      <span className={`material-symbols-outlined text-lg ${
                        submission.status === "approved" ? "text-emerald-400" : "text-amber-400"
                      }`}>
                        {submission.status === "approved" ? "verified" : "rate_review"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${
                        submission.status === "approved" ? "text-emerald-400" : "text-amber-400"
                      }`}>
                        {statusConfig[submission.status]?.label}
                      </p>
                      <p className="text-2xl font-black text-white mt-1">
                        {submission.marksAwarded} <span className="text-sm text-gray-500">/ {active.totalMarks} marks</span>
                      </p>
                      {submission.feedback && (
                        <p className="text-sm text-gray-400 italic mt-2 pl-3 border-l-2" style={{ borderColor: submission.status === "approved" ? "#22c55e" : "#f59e0b" }}>
                          "{submission.feedback}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submission Pending Status */}
              {submission && submission.marksAwarded === null && (
                <div className="rounded-xl p-4" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#6366f122" }}>
                      <span className="material-symbols-outlined text-lg text-indigo-400">pending</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-indigo-400">Submitted — Awaiting Teacher Review</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Submitted {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Alerts */}
              {error && (
                <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#ef444422", border: "1px solid #ef444444" }}>
                  <span className="material-symbols-outlined text-sm text-red-400">error</span>
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
              {success && (
                <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#22c55e22", border: "1px solid #22c55e44" }}>
                  <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
                  <p className="text-sm text-emerald-400">{success}</p>
                </div>
              )}

              {/* Answer Form */}
              <div className="space-y-4">
                <SectionHeader icon="edit_note" title="Your Answer" color="#6366f1" />
                
                <textarea 
                  value={answerText} 
                  onChange={e => setAnswerText(e.target.value)} 
                  rows={6}
                  placeholder="Write your answer here..."
                  className="w-full px-4 py-3 border rounded-xl bg-gray-800/50 text-white border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm outline-none transition-all"
                  style={{ borderColor: "#334155" }}
                />

                {/* PDF Only Upload Section */}
                <div className="rounded-xl p-4 border-2 border-dashed" style={{ borderColor: "#334155" }}>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input 
                      ref={fileRef} 
                      type="file" 
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange} 
                      className="hidden"
                    />
                    <button 
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                      style={{ background: "#6366f122", color: "#818cf8", border: "1px solid #6366f144" }}
                    >
                      <span className="material-symbols-outlined text-base">upload_file</span>
                      Upload PDF
                    </button>
                    {file && (
                      <div className="flex items-center gap-2 text-sm text-emerald-400">
                        <span className="material-symbols-outlined text-base">check_circle</span>
                        <span className="max-w-[200px] truncate">{file.name}</span>
                        <button 
                          onClick={() => {
                            setFile(null);
                            if (fileRef.current) fileRef.current.value = "";
                          }} 
                          className="text-red-400 hover:text-red-500"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Only PDF files are allowed (max 10MB)
                  </p>
                </div>
                
                {/* Previously Submitted PDF Link */}
                {submission?.fileUrl && !file && (
                  <a 
                    href={submission.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">description</span>
                    Previously submitted: {submission.fileName || "assignment.pdf"}
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                )}
              </div>

              {/* Submit Button */}
              <button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
              >
                {submitting ? (
                  <>
                    <div className="relative w-4 h-4">
                      <div className="absolute inset-0 rounded-full border-2 border-indigo-900" />
                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                    </div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">upload</span>
                    {submission ? "Resubmit Assignment" : "Submit Assignment"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="rounded-xl p-3 flex items-start gap-3" style={{ background: "#0f1629", border: "1px solid #6366f133" }}>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
          <span className="material-symbols-outlined text-xs" style={{ color: "#6366f1" }}>info</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          <strong className="text-indigo-400">Assignment tips:</strong> Write your answer in the text box or upload a PDF. You can resubmit before the deadline. Once graded, you'll see your marks and feedback here.
        </p>
      </div>
    </div>
  );
};

export default AssignmentView;