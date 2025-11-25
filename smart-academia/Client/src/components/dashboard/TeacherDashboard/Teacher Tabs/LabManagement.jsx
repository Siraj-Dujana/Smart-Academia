import React from "react";

const LabManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Lab Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage laboratory sessions and practical work
          </p>
        </div>
      </div>
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
          science
        </span>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Lab Management Content
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          This section is under development
        </p>
      </div>
    </div>
  );
};

export default LabManagement;