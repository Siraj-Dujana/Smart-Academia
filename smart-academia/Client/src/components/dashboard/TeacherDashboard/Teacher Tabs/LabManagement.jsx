import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LabManagement = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [labs, setLabs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingLab, setEditingLab] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewSubmissions, setViewSubmissions] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradingId, setGradingId] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marks: "", feedback: "" });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    language: "python",
    labType: "programming",
    dueDate: "",
    totalMarks: 100,
    testCases: [{ input: "", expectedOutput: "", description: "", points: 10 }],
    starterCode: "",
  });

  const languages = ["python", "javascript", "java", "cpp", "c", "csharp", "go", "ruby", "php"];
  const labTypes = [
    { value: "programming", label: "Programming Lab", icon: "terminal" },
    { value: "theory", label: "Theory Lab", icon: "description" },
    { value: "networking", label: "Networking Lab", icon: "hub" },
    { value: "dld", label: "DLD Lab", icon: "schema" },
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchLabs();
    }
  }, [selectedCourse]);

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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLabs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/labs/course/${selectedCourse}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setLabs(data.labs || []);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async (labId) => {
    try {
      const res = await fetch(`${API}/api/labs/${labId}/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSubmissions(data.submissions || []);
        setViewSubmissions(labId);
      }
    } catch {
      setError("Cannot connect to server");
    }
  };

  const handleOpenModal = (lab = null) => {
    setError("");
    setSuccess("");
    if (lab) {
      setEditingLab(lab);
      setFormData({
        title: lab.title,
        description: lab.description || "",
        instructions: lab.instructions || "",
        language: lab.language || "python",
        labType: lab.labType || "programming",
        dueDate: lab.dueDate ? lab.dueDate.slice(0, 10) : "",
        totalMarks: lab.totalMarks || 100,
        testCases: lab.testCases || [{ input: "", expectedOutput: "", description: "", points: 10 }],
        starterCode: lab.starterCode || "",
      });
    } else {
      setEditingLab(null);
      setFormData({
        title: "",
        description: "",
        instructions: "",
        language: "python",
        labType: "programming",
        dueDate: "",
        totalMarks: 100,
        testCases: [{ input: "", expectedOutput: "", description: "", points: 10 }],
        starterCode: "",
      });
    }
    setShowModal(true);
  };

  const handleAddTestCase = () => {
    setFormData(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: "", expectedOutput: "", description: "", points: 10 }],
    }));
  };

  const handleRemoveTestCase = (index) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index),
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.map((tc, i) => 
        i === index ? { ...tc, [field]: value } : tc
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      const url = editingLab
        ? `${API}/api/labs/${editingLab._id}`
        : `${API}/api/labs`;
      const method = editingLab ? "PUT" : "POST";
      const body = editingLab
        ? formData
        : { ...formData, courseId: selectedCourse };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }

      setSuccess(editingLab ? "Lab updated successfully!" : "Lab created successfully!");
      setShowModal(false);
      fetchLabs();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Cannot connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (lab) => {
    if (!window.confirm(`Delete "${lab.title}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/api/labs/${lab._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchLabs();
        setSuccess("Lab deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch {
      alert("Cannot connect to server");
    }
  };

  const handleGrade = async (submissionId) => {
    if (!gradeForm.marks) {
      setError("Marks are required");
      return;
    }
    try {
      const res = await fetch(`${API}/api/labs/submissions/${submissionId}/grade`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(gradeForm),
      });
      if (res.ok) {
        setSuccess("Grade submitted successfully!");
        setGradingId(null);
        fetchSubmissions(viewSubmissions);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.message);
      }
    } catch {
      setError("Cannot connect to server");
    }
  };

  const getLabTypeIcon = (type) => {
    const lab = labTypes.find(l => l.value === type);
    return lab?.icon || "science";
  };

  const getLabTypeLabel = (type) => {
    const lab = labTypes.find(l => l.value === type);
    return lab?.label || type;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "graded": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "submitted": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300";
    }
  };

  if (isLoading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 sm:py-24">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Loading labs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Lab Management</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Manage laboratory sessions and practical work</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          disabled={!selectedCourse}
          className="flex items-center justify-center gap-2 text-sm font-medium px-4 sm:px-5 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 hover:scale-105 w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-base">add</span>
          New Lab
        </button>
      </div>

      {/* Error & Success Messages */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-600 text-sm">error</span>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      {/* Course Selector */}
      {courses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.title}</option>
            ))}
          </select>
        </div>
      )}

      {/* Labs List */}
      {labs.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="material-symbols-outlined text-5xl sm:text-6xl text-gray-300 dark:text-gray-600">science</span>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mt-3 sm:mt-4 mb-2">No labs yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Create your first lab for this course</p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Create Lab
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {labs.map((lab) => (
            <div key={lab._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <span className="material-symbols-outlined text-blue-600 text-xl">{getLabTypeIcon(lab.labType)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{lab.title}</h3>
                      <p className="text-xs text-gray-500">{getLabTypeLabel(lab.labType)} · {lab.language || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpenModal(lab)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button onClick={() => handleDelete(lab)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
                
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{lab.description}</p>
                
                <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">grade</span>
                    {lab.totalMarks} marks
                  </span>
                  {lab.dueDate && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      Due: {new Date(lab.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  {lab.testCases?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">checklist</span>
                      {lab.testCases.length} test cases
                    </span>
                  )}
                </div>

                <button
                  onClick={() => fetchSubmissions(lab._id)}
                  className="w-full flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">grading</span>
                  View Submissions
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submissions Panel */}
      {viewSubmissions && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
              Submissions ({submissions.length})
            </h3>
            <button onClick={() => setViewSubmissions(null)} className="text-gray-400 hover:text-gray-600">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No submissions yet</div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
              {submissions.map((sub) => (
                <div key={sub._id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{sub.student?.fullName}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                        {sub.marks !== undefined && (
                          <span className="text-xs font-bold text-blue-600">{sub.marks} marks</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        Submitted {new Date(sub.submittedAt).toLocaleString()}
                      </p>
                      {sub.answer && (
                        <pre className="text-xs text-gray-600 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-x-auto">
                          {sub.answer.substring(0, 200)}{sub.answer.length > 200 ? "..." : ""}
                        </pre>
                      )}
                      {sub.feedback && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                          Feedback: {sub.feedback}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => { setGradingId(sub._id); setGradeForm({ marks: sub.marks || "", feedback: sub.feedback || "" }); }}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 flex-shrink-0"
                    >
                      <span className="material-symbols-outlined text-sm">grade</span>
                      {sub.marks !== undefined ? "Re-grade" : "Grade"}
                    </button>
                  </div>

                  {/* Grade Form */}
                  {gradingId === sub._id && (
                    <div className="mt-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Marks</label>
                          <input
                            type="number"
                            value={gradeForm.marks}
                            onChange={e => setGradeForm(p => ({ ...p, marks: Number(e.target.value) }))}
                            max={100}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <textarea
                        value={gradeForm.feedback}
                        onChange={e => setGradeForm(p => ({ ...p, feedback: e.target.value }))}
                        rows={2}
                        placeholder="Feedback for student (optional)"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                      <div className="flex flex-col xs:flex-row gap-2">
                        <button
                          onClick={() => handleGrade(sub._id)}
                          className="flex-1 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Save Grade
                        </button>
                        <button
                          onClick={() => setGradingId(null)}
                          className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-5 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {editingLab ? "Edit Lab" : "Create New Lab"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Lab title"
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lab Type</label>
                  <select
                    value={formData.labType}
                    onChange={(e) => setFormData({ ...formData, labType: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {labTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Brief description of the lab"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows={4}
                  placeholder="Detailed instructions for students..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {formData.labType === "programming" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Starter Code (Optional)</label>
                  <textarea
                    value={formData.starterCode}
                    onChange={(e) => setFormData({ ...formData, starterCode: e.target.value })}
                    rows={6}
                    placeholder="# Write starter code here..."
                    className="w-full px-3 py-2 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-900 text-gray-100 focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              )}

              {/* Test Cases Section */}
              {formData.labType === "programming" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Test Cases</label>
                    <button
                      type="button"
                      onClick={handleAddTestCase}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Add Test Case
                    </button>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {formData.testCases.map((tc, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium">Test Case {idx + 1}</span>
                          {formData.testCases.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTestCase(idx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <input
                            type="text"
                            value={tc.input}
                            onChange={(e) => handleTestCaseChange(idx, "input", e.target.value)}
                            placeholder="Input"
                            className="px-2 py-1 text-xs border border-gray-300 rounded bg-white dark:bg-gray-700"
                          />
                          <input
                            type="text"
                            value={tc.expectedOutput}
                            onChange={(e) => handleTestCaseChange(idx, "expectedOutput", e.target.value)}
                            placeholder="Expected Output"
                            className="px-2 py-1 text-xs border border-gray-300 rounded bg-white dark:bg-gray-700"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={tc.description}
                            onChange={(e) => handleTestCaseChange(idx, "description", e.target.value)}
                            placeholder="Description (optional)"
                            className="px-2 py-1 text-xs border border-gray-300 rounded bg-white dark:bg-gray-700"
                          />
                          <input
                            type="number"
                            value={tc.points}
                            onChange={(e) => handleTestCaseChange(idx, "points", Number(e.target.value))}
                            placeholder="Points"
                            className="px-2 py-1 text-xs border border-gray-300 rounded bg-white dark:bg-gray-700"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                    min={1}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-col xs:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Saving...</>
                  ) : editingLab ? "Update Lab" : "Create Lab"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabManagement;