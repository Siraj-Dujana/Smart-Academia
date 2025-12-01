import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

const Dashboard = () => {
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);

  // Stats data
  const stats = [
    {
      icon: "import_contacts",
      title: "Courses Enrolled",
      value: "4",
      color:
        "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-500",
      trend: "+1 this semester",
      trendColor: "text-green-500",
    },
    {
      icon: "task_alt",
      title: "Completed Lessons",
      value: "42",
      color:
        "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-500",
      trend: "+5 this week",
      trendColor: "text-green-500",
    },
    {
      icon: "pending_actions",
      title: "Pending Quizzes",
      value: "3",
      color:
        "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500",
      trend: "2 due today",
      trendColor: "text-red-500",
    },
    {
      icon: "pending_actions",
      title: "Pending Labs",
      value: "3",
      color:
        "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500",
      trend: "2 due today",
      trendColor: "text-red-500",
    },
    {
      icon: "trending_up",
      title: "Overall Progress",
      value: "85%",
      color: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-500",
      trend: "+2% this week",
      trendColor: "text-green-500",
    },
  ];

  // Course data
  const courses = [
    {
      title: "Introduction to Python",
      code: "CS-101",
      instructor: "Dr. Eleanor Vance",
      progress: 95,
      nextLesson: "Chapter 5: Dictionaries",
      color:
        "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-500",
    },
    {
      title: "Data Structures & Algorithms",
      code: "CS-201",
      instructor: "Dr. Eleanor Vance",
      progress: 82,
      nextLesson: "Chapter 8: Graphs",
      color:
        "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-5000",
    },
    {
      title: "Machine Learning",
      code: "CS-305",
      instructor: "Dr. Eleanor Vance",
      progress: 75,
      nextLesson: "Chapter 4: Neural Networks",
      color:
        "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-500",
    },
  ];

  // Initialize charts
  useEffect(() => {
    // Bar Chart
    if (barChartRef.current) {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }

      const barCtx = barChartRef.current.getContext("2d");
      barChartInstance.current = new Chart(barCtx, {
        type: "bar",
        data: {
          labels: ["Python", "DSA", "ML", "Web Dev", "DBMS", "Networking"],
          datasets: [
            {
              label: "Progress %",
              data: [95, 82, 75, 68, 90, 60],
              backgroundColor: "#4f46e5",
              borderColor: "#4f46e5",
              borderWidth: 1,
              borderRadius: 8,
              hoverBackgroundColor: "#6366f1",
              hoverBorderColor: "#6366f1",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              grid: {
                color: "rgba(0, 0, 0, 0.1)",
              },
              ticks: {
                callback: function (value) {
                  return value + "%";
                },
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              titleColor: "white",
              bodyColor: "white",
              borderColor: "#4f46e5",
              borderWidth: 1,
              cornerRadius: 8,
              callbacks: {
                label: function (context) {
                  return `Progress: ${context.parsed.y}%`;
                },
              },
            },
          },
          interaction: {
            intersect: false,
            mode: "index",
          },
          animation: {
            duration: 1000,
            easing: "easeOutQuart",
          },
        },
      });
    }

    // Pie Chart
    if (pieChartRef.current) {
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }

      const pieCtx = pieChartRef.current.getContext("2d");
      pieChartInstance.current = new Chart(pieCtx, {
        type: "pie",
        data: {
          labels: ["Completed", "In Progress", "Not Started"],
          datasets: [
            {
              label: "Course Status",
              data: [65, 25, 10],
              backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
              borderWidth: 2,
              borderColor: "#ffffff",
              hoverOffset: 8,
              hoverBorderWidth: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 12,
                },
              },
            },
            tooltip: {
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              titleColor: "white",
              bodyColor: "white",
              borderColor: "#4f46e5",
              borderWidth: 1,
              cornerRadius: 8,
            },
          },
          animation: {
            duration: 1000,
            easing: "easeOutQuart",
            animateScale: true,
            animateRotate: true,
          },
          cutout: "0%",
        },
      });
    }

    return () => {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }
    };
  }, []);

  const handleGenerateReport = () => {
    console.log("Generate AI report");
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            Student Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base">
            Welcome back, Abdul Qadeer Odhano! Here's your learning overview.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group"
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex items-center justify-center size-12 rounded-lg ${stat.color} group-hover:scale-110 transition-transform duration-200`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {stat.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </p>
                <p className={`text-xs font-medium ${stat.trendColor}`}>
                  {stat.trend}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Courses Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          My Courses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <CourseCard key={index} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Compact Course Card Component with Blue Color Scheme
const CourseCard = ({ course }) => {
  // Calculate circular progress values
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (course.progress / 100) * circumference;

  // Determine progress color - all blue variations
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "stroke-blue-600 dark:stroke-blue-500";
    if (percentage >= 60) return "stroke-blue-500 dark:stroke-blue-400";
    if (percentage >= 40) return "stroke-blue-400 dark:stroke-blue-300";
    return "stroke-blue-300 dark:stroke-blue-200";
  };

  const progressColor = getProgressColor(course.progress);

  // Handle card click
  const handleCardClick = () => {
    console.log(`Navigating to course: ${course.title}`);
    // You can add navigation logic here
    // e.g., navigate(`/course/${course.id}`);
  };

  // Handle continue button click (prevents event bubbling)
  const handleContinueClick = (e) => {
    e.stopPropagation();
    console.log(`Continuing course: ${course.title}`);
    // Add continue course logic here
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group h-full flex flex-col cursor-pointer active:scale-95 hover:-translate-y-1 select-none"
    >
      <div className="p-4 flex-1">
        {/* Course Header with Compact Layout */}
        <div className="flex items-start gap-3 mb-4">
          {/* Icon with hover effect */}
          <div className={`flex items-center justify-center size-10 rounded-lg ${course.color} flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300`}>
            <span className="material-symbols-outlined text-base">menu_book</span>
          </div>
          
          {/* Title and Progress */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
              {course.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs truncate group-hover:text-gray-800 dark:group-hover:text-gray-300 transition-colors duration-200">
              {course.code} • {course.instructor}
            </p>
          </div>
          
          {/* Circular Progress - Small with hover effect */}
          <div className="relative size-10 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            <svg className="size-full" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-gray-200 dark:stroke-gray-700 group-hover:stroke-gray-300 dark:group-hover:stroke-gray-600 transition-colors duration-300"
                strokeWidth="2"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className={`${progressColor} group-hover:stroke-blue-500 transition-colors duration-300`}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={progressOffset}
                transform="rotate(-90 18 18)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                {course.progress}%
              </span>
            </div>
          </div>
        </div>

        {/* Compact Course Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Credits */}
          <div className="flex items-center gap-2 group/item">
            <div className="flex items-center justify-center size-6 rounded bg-blue-50 dark:bg-blue-900/20 flex-shrink-0 group-hover/item:bg-blue-100 dark:group-hover/item:bg-blue-900/40 transition-colors duration-200">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xs group-hover/item:text-blue-700 dark:group-hover/item:text-blue-300 transition-colors duration-200">school</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors duration-200">Credits</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                {course.credits || 3}
              </p>
            </div>
          </div>
          
          {/* Semester */}
          <div className="flex items-center gap-2 group/item">
            <div className="flex items-center justify-center size-6 rounded bg-blue-50 dark:bg-blue-900/20 flex-shrink-0 group-hover/item:bg-blue-100 dark:group-hover/item:bg-blue-900/40 transition-colors duration-200">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xs group-hover/item:text-blue-700 dark:group-hover/item:text-blue-300 transition-colors duration-200">calendar_today</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors duration-200">Semester</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                {course.semester || "Fall 2024"}
              </p>
            </div>
          </div>
        </div>

        {/* Next Lesson - Full Width with hover effect */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors duration-300">
          <div className="flex items-center justify-center size-6 rounded bg-blue-100 dark:bg-blue-900/30 flex-shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors duration-200">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xs group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">schedule</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">Next Lesson</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
              {course.nextLesson}
            </p>
          </div>
        </div>
      </div>
      
      {/* Compact Action Button with separate click handler */}
      <div 
        onClick={handleContinueClick}
        className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors duration-200"
      >
        <button className="w-full flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 group/btn active:scale-95">
          Continue 
          <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-0.5 transition-transform duration-200">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
