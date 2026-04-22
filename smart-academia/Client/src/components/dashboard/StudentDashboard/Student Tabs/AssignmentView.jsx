import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const apiFetch = (url, opts = {}) => {
  const token = localStorage.getItem("token");
  return fetch(`${API}${url}`, { ...opts, headers: { Authorization: `Bearer ${token}`, ...(opts.headers||{}) } });
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
    
    // ✅ Only allow PDF files
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
    submitted: { color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300", label: "Submitted — Awaiting Review" },
    reviewed:  { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", label: "Reviewed" },
    approved:  { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", label: "Approved ✓" },
    rejected:  { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", label: "Rejected" },
  };

  if (assignments.length === 0) return (
    <div className="text-center py-8 sm:py-12">
      <span className="material-symbols-outlined text-4xl sm:text-5xl text-gray-300 dark:text-gray-600">assignment</span>
      <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-3">No assignments for this course yet</p>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 h-full">
      
      {/* Assignment List - Sidebar */}
      <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-2">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 px-1">Assignments</h3>
        <div className="space-y-2 max-h-[400px] lg:max-h-[600px] overflow-y-auto pr-1">
          {assignments.map(a => (
            <button key={a._id} onClick={() => setActive(a)}
              className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all ${
                active?._id === a._id 
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500/20" 
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600"
              }`}>
              <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{a.title}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">{a.totalMarks} marks</span>
                {a.dueDate && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Due {new Date(a.dueDate).toLocaleDateString()}
                  </span>
                )}
                {a.mySubmission && (
                  <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium ml-auto ${statusConfig[a.mySubmission.status]?.color}`}>
                    {a.mySubmission.status}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Assignment Content */}
      {active && (
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{active.title}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{active.totalMarks} marks</span>
              {active.dueDate && (
                <span>Due: {new Date(active.dueDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5">
            {/* Instructions */}
            {active.instructions && (
              <div className="p-3 sm:p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Instructions
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{active.instructions}</p>
              </div>
            )}

            {/* Grade Result */}
            {submission && submission.marksAwarded !== null && (
              <div className={`p-4 rounded-xl border ${
                submission.status === "approved" 
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                  : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
              }`}>
                <div className="flex items-start gap-3">
                  <span className={`material-symbols-outlined text-xl ${
                    submission.status === "approved" ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                  }`}>
                    {submission.status === "approved" ? "verified" : "rate_review"}
                  </span>
                  <div className="flex-1">
                    <p className={`font-bold ${
                      submission.status === "approved" ? "text-green-700 dark:text-green-300" : "text-amber-700 dark:text-amber-300"
                    }`}>
                      {statusConfig[submission.status]?.label}
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                      {submission.marksAwarded} / {active.totalMarks} marks
                    </p>
                    {submission.feedback && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-2">
                        "{submission.feedback}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submission Pending Status */}
            {submission && submission.marksAwarded === null && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">pending</span>
                  <div>
                    <p className="font-medium text-indigo-700 dark:text-indigo-300 text-sm">Submitted — Awaiting Teacher Review</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Submitted {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Alerts */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 text-sm">error</span>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
              </div>
            )}

            {/* Answer Form */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Answer
              </label>
              <textarea 
                value={answerText} 
                onChange={e => setAnswerText(e.target.value)} 
                rows={6}
                placeholder="Write your answer here..."
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
              />

              {/* ✅ PDF Only Upload Section */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4">
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
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">upload_file</span>
                    Upload PDF
                  </button>
                  {file && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      <span className="max-w-[150px] sm:max-w-[200px] truncate">{file.name}</span>
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
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Only PDF files are allowed (max 10MB)
                </p>
              </div>
              
              {/* Previously Submitted PDF Link */}
              {submission?.fileUrl && !file && (
                <a 
                  href={submission.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
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
              className="w-full py-3 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-indigo-200 dark:shadow-indigo-900/30"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
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
  );
};

export default AssignmentView;