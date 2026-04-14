import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LabSubmissions = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [gradingLab, setGradingLab] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marks: "", feedback: "" });
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showPDFModal, setShowPDFModal] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons();
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedLesson) {
      fetchLabs();
    }
  }, [selectedLesson]);

  useEffect(() => {
    if (selectedLab) {
      fetchSubmissions();
    }
  }, [selectedLab]);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API}/api/courses/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.courses?.length > 0) {
        setCourses(data.courses);
        setSelectedCourse(data.courses[0]._id);
      }
    } catch {
      setError("Cannot connect to server");
    }
  };

  const fetchLessons = async () => {
    if (!selectedCourse) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/courses/${selectedCourse}/lessons/teacher`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setLessons(data.lessons || []);
        if (data.lessons?.length > 0) {
          setSelectedLesson(data.lessons[0]._id);
        }
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLabs = async () => {
    if (!selectedLesson) return;
    try {
      const res = await fetch(`${API}/api/courses/${selectedCourse}/lessons/${selectedLesson}/lab`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.lab) {
        setLabs([data.lab]);
        setSelectedLab(data.lab);
      } else {
        setLabs([]);
        setSelectedLab(null);
      }
    } catch {
      setError("Cannot connect to server");
    }
  };

  const fetchSubmissions = async () => {
    if (!selectedLab) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/courses/${selectedCourse}/lessons/${selectedLesson}/lab/${selectedLab._id}/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSubmissions(data.submissions || []);
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrade = async (submissionId) => {
    if (!gradeForm.marks) {
      setError("Please enter marks");
      return;
    }
    try {
      const res = await fetch(`${API}/api/courses/${selectedCourse}/lessons/${selectedLesson}/lab/${selectedLab._id}/submissions/${submissionId}/grade`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(gradeForm),
      });
      if (res.ok) {
        setSuccess("Grade submitted successfully!");
        setGradingLab(null);
        fetchSubmissions();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.message);
      }
    } catch {
      setError("Cannot connect to server");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "graded":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "submitted":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold">Grade Lab Submissions</h1>
        <p className="text-blue-100 mt-1">View and grade student lab submissions with PDF preview</p>
      </div>

      {/* Error & Success Messages */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500">error</span>
          <p className="text-red-600 dark:text-red-400 flex-1">{error}</p>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 flex items-center gap-3">
          <span className="material-symbols-outlined text-green-500">check_circle</span>
          <p className="text-green-600 dark:text-green-400 flex-1">{success}</p>
        </div>
      )}

      {/* Course, Lesson, Lab Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.title}</option>
            ))}
          </select>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Lesson</label>
          <select
            value={selectedLesson}
            onChange={(e) => setSelectedLesson(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={lessons.length === 0}
          >
            {lessons.length === 0 ? (
              <option value="">No lessons available</option>
            ) : (
              lessons.map(lesson => (
                <option key={lesson._id} value={lesson._id}>{lesson.title}</option>
              ))
            )}
          </select>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Lab</label>
          <select
            value={selectedLab?._id || ""}
            onChange={(e) => {
              const lab = labs.find(l => l._id === e.target.value);
              setSelectedLab(lab);
            }}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={labs.length === 0}
          >
            {labs.length === 0 ? (
              <option value="">No lab available</option>
            ) : (
              labs.map(lab => (
                <option key={lab._id} value={lab._id}>{lab.title}</option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Submissions List */}
      {selectedLab && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Submissions for: {selectedLab.title}
            </h3>
            <p className="text-sm text-gray-500">Total: {submissions.length} submissions</p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-gray-300">inbox</span>
              <p className="text-gray-500 mt-2">No submissions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {submissions.map((sub) => (
                <div key={sub._id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Student Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {sub.student?.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{sub.student?.fullName}</h4>
                          <p className="text-xs text-gray-500">ID: {sub.student?.studentId}</p>
                          <p className="text-xs text-gray-400">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                        </div>
                        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                          {sub.status || "submitted"}
                        </span>
                      </div>

                      {/* Student Answer */}
                      {sub.answer && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 mb-1">Student's Answer:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{sub.answer}</p>
                        </div>
                      )}

                      {/* PDF Preview Button */}
                      {sub.pdfUrl && (
                        <div className="mt-3">
                          <button
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setShowPDFModal(true);
                            }}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-lg"
                          >
                            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                            View Submitted PDF
                          </button>
                        </div>
                      )}

                      {/* Existing Feedback */}
                      {sub.feedback && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-xs font-medium text-blue-600 mb-1">Previous Feedback:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{sub.feedback}</p>
                          {sub.marks && (
                            <p className="text-sm font-medium text-green-600 mt-2">Marks: {sub.marks}/{selectedLab.totalMarks}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Grade Button */}
                    <button
                      onClick={() => {
                        setGradingLab(sub._id);
                        setGradeForm({ marks: sub.marks || "", feedback: sub.feedback || "" });
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all hover:scale-105 self-start"
                    >
                      {sub.marks !== undefined && sub.marks !== null ? "Re-grade" : "Grade"}
                    </button>
                  </div>

                  {/* Grade Form */}
                  {gradingLab === sub._id && (
                    <div className="mt-4 p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Grade Submission</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Marks (Max: {selectedLab.totalMarks})
                          </label>
                          <input
                            type="number"
                            value={gradeForm.marks}
                            onChange={e => setGradeForm(p => ({ ...p, marks: Number(e.target.value) }))}
                            max={selectedLab.totalMarks}
                            min={0}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Feedback</label>
                        <textarea
                          value={gradeForm.feedback}
                          onChange={e => setGradeForm(p => ({ ...p, feedback: e.target.value }))}
                          rows={3}
                          placeholder="Provide feedback to the student..."
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleGrade(sub._id)}
                          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all"
                        >
                          Save Grade
                        </button>
                        <button
                          onClick={() => setGradingLab(null)}
                          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PDF Viewer Modal */}
      {showPDFModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPDFModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div>
                <h3 className="text-lg font-bold text-white">Student Submission</h3>
                <p className="text-indigo-100 text-sm">{selectedSubmission.student?.fullName} - {selectedSubmission.student?.studentId}</p>
              </div>
              <button onClick={() => setShowPDFModal(false)} className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 p-4">
              {selectedSubmission.pdfUrl?.endsWith('.pdf') ? (
                <iframe
                  src={`${selectedSubmission.pdfUrl}#toolbar=1&navpanes=1`}
                  className="w-full h-[70vh] rounded-lg"
                  title="PDF Viewer"
                />
              ) : (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-gray-400">description</span>
                  <p className="text-gray-500 mt-2">Unable to preview file</p>
                  <a
                    href={selectedSubmission.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    Download PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabSubmissions;