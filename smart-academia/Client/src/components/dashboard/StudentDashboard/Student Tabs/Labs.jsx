import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Labs = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [labs, setLabs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLab, setSelectedLab] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      const res = await fetch(`${API}/api/labs/student`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setLabs(data.labs || []);
      } else {
        setError(data.message || "Failed to fetch labs");
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "locked":
        return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "check_circle";
      case "in_progress":
        return "pending";
      case "locked":
        return "lock";
      default:
        return "play_circle";
    }
  };

  if (isLoading) {
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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Programming Labs
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Access laboratory sessions and practical coding assignments
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-600 text-sm">error</span>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: "science", label: "Total Labs", value: labs.length, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
          { icon: "check_circle", label: "Completed", value: labs.filter(l => l.status === "completed").length, color: "bg-green-100 dark:bg-green-900/30 text-green-600" },
          { icon: "pending", label: "In Progress", value: labs.filter(l => l.status === "in_progress").length, color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600" },
          { icon: "trending_up", label: "Completion Rate", value: labs.length > 0 ? `${Math.round((labs.filter(l => l.status === "completed").length / labs.length) * 100)}%` : "0%", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${stat.color} group-hover:scale-110 transition-transform duration-200`}>
                <span className="material-symbols-outlined text-xl sm:text-2xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Labs Grid */}
      {labs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {labs.map((lab, idx) => (
            <div
              key={lab._id || idx}
              onClick={() => lab.status !== "locked" && navigate(`/labs/${lab._id}`)}
              className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group ${
                lab.status !== "locked" ? "cursor-pointer hover:-translate-y-1" : "cursor-not-allowed opacity-75"
              }`}
            >
              {/* Lab Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                      <span className="material-symbols-outlined text-xl">science</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        {lab.title || `Lab ${idx + 1}`}
                      </h3>
                      <p className="text-xs text-gray-500">Due: {lab.dueDate ? new Date(lab.dueDate).toLocaleDateString() : "No deadline"}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lab.status)}`}>
                    <span className="material-symbols-outlined text-sm">{getStatusIcon(lab.status)}</span>
                    <span className="hidden xs:inline">{lab.status?.replace("_", " ") || "pending"}</span>
                  </span>
                </div>
              </div>

              {/* Lab Content */}
              <div className="p-4 sm:p-5">
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm line-clamp-2 mb-3">
                  {lab.description || "Complete the programming tasks and submit your code for evaluation."}
                </p>
                
                {/* Progress Bar for in-progress labs */}
                {lab.status === "in_progress" && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{lab.progress || 0}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${lab.progress || 0}%` }} />
                    </div>
                  </div>
                )}

                {/* Lab Metadata */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span>{lab.duration || "2 hours"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">code</span>
                    <span>{lab.language || "Python"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">grade</span>
                    <span>{lab.points || 100} pts</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="border-t border-gray-100 dark:border-gray-700 px-4 sm:px-5 py-3">
                {lab.status === "locked" ? (
                  <button className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm font-medium px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    Locked
                  </button>
                ) : lab.status === "completed" ? (
                  <button className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm font-medium px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    View Results
                  </button>
                ) : (
                  <button className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm font-medium px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all hover:scale-105">
                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                    Start Lab
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="material-symbols-outlined text-5xl sm:text-6xl text-gray-300 dark:text-gray-600 mb-4">
            science
          </span>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Labs Available
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Check back later for laboratory assignments
          </p>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-blue-600 text-lg">info</span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">About Programming Labs</h4>
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400">
              Labs are practical coding assignments that help you apply concepts learned in lectures. 
              Submit your code for auto-evaluation and receive instant feedback. Complete all labs to 
              master programming skills.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Labs;