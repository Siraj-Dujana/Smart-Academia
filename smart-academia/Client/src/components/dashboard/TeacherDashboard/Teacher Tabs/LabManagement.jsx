import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LabManagement = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [lab, setLab] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
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
      fetchLab();
    } else {
      setLab(null);
    }
  }, [selectedLesson]);

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

  const fetchLab = async () => {
    if (!selectedLesson) return;
    try {
      const res = await fetch(`${API}/api/courses/${selectedCourse}/lessons/${selectedLesson}/lab`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.lab) {
        setLab(data.lab);
        setFormData({
          title: data.lab.title,
          description: data.lab.description || "",
          instructions: data.lab.instructions || "",
          language: data.lab.language || "python",
          labType: data.lab.labType || "programming",
          dueDate: data.lab.dueDate ? data.lab.dueDate.slice(0, 10) : "",
          totalMarks: data.lab.totalMarks || 100,
          testCases: data.lab.testCases || [{ input: "", expectedOutput: "", description: "", points: 10 }],
          starterCode: data.lab.starterCode || "",
        });
      } else {
        setLab(null);
      }
    } catch {
      setError("Cannot connect to server");
    }
  };

  const handleUpdateLab = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    try {
      const res = await fetch(`${API}/api/courses/${selectedCourse}/lessons/${selectedLesson}/lab/${lab._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setSuccess("Lab updated successfully!");
      setShowEditModal(false);
      fetchLab();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Cannot connect to server");
    }
  };

  const labTypes = [
    { value: "programming", label: "Programming Lab", icon: "terminal" },
    { value: "theory", label: "Theory Lab", icon: "description" },
    { value: "networking", label: "Networking Lab", icon: "hub" },
    { value: "dld", label: "DLD Lab", icon: "schema" },
  ];

  const languages = ["python", "javascript", "java", "cpp", "c", "csharp", "go", "ruby", "php"];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Lab Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            View and manage labs created in your lessons
          </p>
        </div>
        <button
          onClick={() => navigate("/teacher/lessons")}
          className="flex items-center justify-center gap-2 text-sm font-medium px-4 sm:px-5 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-base">menu_book</span>
          Go to Lesson Management
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <span className="material-symbols-outlined text-base">error</span>
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}
      {success && (
        <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span className="flex-1">{success}</span>
        </div>
      )}

      {/* Course Selector */}
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

      {/* Lesson Selector */}
      {selectedCourse && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Lesson</label>
          <select
            value={selectedLesson}
            onChange={(e) => setSelectedLesson(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
      )}

      {/* Lab Display */}
      {!selectedLesson ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-gray-400">science</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a Lesson</h3>
          <p className="text-gray-500 dark:text-gray-400">Please select a course and lesson to view its lab</p>
        </div>
      ) : !lab ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-blue-500">science</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Lab for this Lesson</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Create a lab by editing this lesson in Lesson Management
          </p>
          <button
            onClick={() => navigate("/teacher/lessons")}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-all"
          >
            Go to Lesson Management
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* Lab Header */}
          <div className={`bg-gradient-to-r ${
            lab.labType === "programming" ? "from-green-600 to-emerald-600" :
            lab.labType === "theory" ? "from-blue-600 to-indigo-600" :
            lab.labType === "networking" ? "from-purple-600 to-pink-600" :
            "from-orange-600 to-red-600"
          } p-5 text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">
                    {labTypes.find(t => t.value === lab.labType)?.icon || "science"}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{lab.title}</h3>
                  <p className="text-white/80 text-sm">
                    {labTypes.find(t => t.value === lab.labType)?.label || "Lab"} · {lab.language || "N/A"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all"
              >
                Edit Lab
              </button>
            </div>
          </div>
          
          <div className="p-5 space-y-4">
            <p className="text-gray-600 dark:text-gray-400">{lab.description}</p>
            
            <div className="flex flex-wrap gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span className="material-symbols-outlined text-base">grade</span>
                {lab.totalMarks} marks
              </div>
              {lab.dueDate && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <span className="material-symbols-outlined text-base">schedule</span>
                  Due: {new Date(lab.dueDate).toLocaleDateString()}
                </div>
              )}
              {lab.testCases?.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <span className="material-symbols-outlined text-base">checklist</span>
                  {lab.testCases.length} test cases
                </div>
              )}
            </div>

            {lab.instructions && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Instructions</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{lab.instructions}</p>
              </div>
            )}

            {lab.labType === "programming" && lab.starterCode && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Starter Code</h4>
                <pre className="p-3 bg-gray-900 rounded-lg text-gray-100 text-sm font-mono overflow-x-auto">
                  {lab.starterCode}
                </pre>
              </div>
            )}

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-yellow-600">info</span>
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Lab Management Info</h4>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                    To create or edit labs, go to <strong>Lesson Management</strong> → Select a lesson → Click Edit → Go to the <strong>"Lab" tab</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lab Modal */}
      {showEditModal && lab && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Edit Lab</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <p className="text-blue-100 text-sm mt-1">Lesson: {lessons.find(l => l._id === selectedLesson)?.title}</p>
            </div>

            <form onSubmit={handleUpdateLab} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Lab Type</label>
                  <select
                    value={formData.labType}
                    onChange={(e) => setFormData({ ...formData, labType: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl"
                  >
                    {labTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl"
                  >
                    {languages.map(lang => <option key={lang} value={lang}>{lang.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border rounded-xl resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 border rounded-xl resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                    min={1}
                    className="w-full px-4 py-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 border rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium">Update Lab</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabManagement;