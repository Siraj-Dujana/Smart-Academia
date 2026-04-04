import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import ManageTeachers from "../components/dashboard/AdminDashboard/Admin tabs/ManageTeachers";
import ManageStudents from "../components/dashboard/AdminDashboard/Admin tabs/ManageStudents";
import ManageCourses from "../components/dashboard/AdminDashboard/Admin tabs/ManageCourses";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('teachers');

  // Menu items
  const menuItems = [
    { icon: "supervisor_account", label: "Manage Teachers", key: 'teachers' },
    { icon: "groups", label: "Manage Students", key: 'students' },
    { icon: "menu_book", label: "Manage Courses", key: 'courses' },
  ];

  // User data
  // 3. REPLACE hardcoded user name
const user = JSON.parse(localStorage.getItem("user") || "{}");
// Then use {user.fullName} everywhere instead of "Dr. Vance" or "Abdul Qadeer"

  const handleMenuClick = (menuKey) => {
    setActiveMenu(menuKey);
    setSidebarOpen(false);
  };

  // 2. REPLACE handleLogout
const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/login");
};


  const handleNotifications = () => {
    console.log('Notifications');
  };


  // Render active tab content
  const renderActiveTab = () => {
    switch (activeMenu) {
      case 'teachers':
        return <ManageTeachers />;
      case 'students':
        return <ManageStudents />;
      case 'courses':
        return <ManageCourses />;
      default:
        return <ManageTeachers />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-white transition-colors duration-300">
      <div className="relative flex min-h-screen w-full">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out h-screen ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <span className="material-symbols-outlined text-blue-600 text-2xl sm:text-3xl animate-pulse">school</span>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">SmartAcademia</h1>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="flex flex-col gap-1 px-3">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleMenuClick(item.key)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    activeMenu === item.key
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  } group`}
                >
                  <span className={`material-symbols-outlined transition-transform duration-200 ${
                    activeMenu === item.key ? "fill scale-110" : "group-hover:scale-110"
                  }`}>
                    {item.icon}
                  </span>
                  <p className="text-sm font-medium">{item.label}</p>
                  {activeMenu === item.key && (
                    <div className="ml-auto w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>

        
          </div>

          {/* User Profile */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 shrink-0">
            <div className="flex items-center gap-3 group cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-indigo-200 dark:group-hover:ring-indigo-400 transition-all duration-200"
                style={{ backgroundImage: `url("${user.avatar}")` }}
              ></div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.role}
                </p>
              </div>
              <span className="material-symbols-outlined text-gray-400 text-sm group-hover:text-indigo-500 transition-colors duration-200">
                expand_more
              </span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-0 min-w-0">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <div className="flex items-center gap-2 lg:hidden">
                <span className="material-symbols-outlined text-indigo-600 text-xl">school</span>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">SmartAcademia</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={handleNotifications}
                className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
              >
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
              
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 sm:size-10 ring-2 ring-gray-200 dark:ring-gray-600 hover:ring-indigo-300 dark:hover:ring-indigo-400 transition-all duration-200 cursor-pointer hover:scale-105"
                style={{ backgroundImage: `url("${user.avatar}")` }}
              ></div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            {renderActiveTab()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;