import React, { useEffect, useRef } from "react";
import { Chart } from 'chart.js/auto';

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
      color: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-500",
      trend: "+1 this semester",
      trendColor: "text-green-500"
    },
    {
      icon: "task_alt",
      title: "Completed Lessons",
      value: "42",
      color: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-500",
      trend: "+5 this week",
      trendColor: "text-green-500"
    },
    {
      icon: "pending_actions",
      title: "Pending Quizzes",
      value: "3",
      color: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500",
      trend: "2 due today",
      trendColor: "text-red-500"
    },
    {
      icon: "pending_actions",
      title: "Pending Labs",
      value: "3",
      color: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500",
      trend: "2 due today",
      trendColor: "text-red-500"
    },
    {
      icon: "trending_up",
      title: "Overall Progress",
      value: "85%",
      color: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-500",
      trend: "+2% this week",
      trendColor: "text-green-500"
    }
  ];

  // Course data
  const courses = [
    {
      title: "Introduction to Python",
      code: "CS-101",
      instructor: "Dr. Eleanor Vance",
      progress: 95,
      nextLesson: "Chapter 5: Dictionaries",
      color: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-500"
    },
    {
      title: "Data Structures & Algorithms",
      code: "CS-201",
      instructor: "Dr. Eleanor Vance",
      progress: 82,
      nextLesson: "Chapter 8: Graphs",
      color: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-500"
    },
    {
      title: "Machine Learning",
      code: "CS-305",
      instructor: "Dr. Eleanor Vance",
      progress: 75,
      nextLesson: "Chapter 4: Neural Networks",
      color: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500"
    }
  ];

  // Initialize charts
  useEffect(() => {
    // Bar Chart
    if (barChartRef.current) {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }

      const barCtx = barChartRef.current.getContext('2d');
      barChartInstance.current = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: ['Python', 'DSA', 'ML', 'Web Dev', 'DBMS', 'Networking'],
          datasets: [{
            label: 'Progress %',
            data: [95, 82, 75, 68, 90, 60],
            backgroundColor: '#4f46e5',
            borderColor: '#4f46e5',
            borderWidth: 1,
            borderRadius: 8,
            hoverBackgroundColor: '#6366f1',
            hoverBorderColor: '#6366f1',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
              },
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: '#4f46e5',
              borderWidth: 1,
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  return `Progress: ${context.parsed.y}%`;
                }
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'index',
          },
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          }
        }
      });
    }

    // Pie Chart
    if (pieChartRef.current) {
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }

      const pieCtx = pieChartRef.current.getContext('2d');
      pieChartInstance.current = new Chart(pieCtx, {
        type: 'pie',
        data: {
          labels: ['Completed', 'In Progress', 'Not Started'],
          datasets: [{
            label: 'Course Status',
            data: [65, 25, 10],
            backgroundColor: [
              '#10b981',
              '#f59e0b',
              '#ef4444'
            ],
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 8,
            hoverBorderWidth: 3,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: '#4f46e5',
              borderWidth: 1,
              cornerRadius: 8,
            }
          },
          animation: {
            duration: 1000,
            easing: 'easeOutQuart',
            animateScale: true,
            animateRotate: true
          },
          cutout: '0%',
        }
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
    console.log('Generate AI report');
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
            Welcome back, Olivia! Here's your learning overview.
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
              <div className={`flex items-center justify-center size-12 rounded-lg ${stat.color} group-hover:scale-110 transition-transform duration-200`}>
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
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

      {/* Generate Report Button */}
      <div className="flex justify-center">
        <button 
          onClick={handleGenerateReport}
          className="flex items-center justify-center gap-3 text-sm font-medium px-6 py-3.5 rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
        >
          <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform duration-200">
            auto_awesome
          </span> 
          Generate Learning Report
        </button>
      </div>
    </div>
  );
};

// Course Card Component
const CourseCard = ({ course }) => {
  const circumference = 2 * Math.PI * 16;
  const strokeDashoffset = circumference - (course.progress / 100) * circumference;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {course.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {course.code} • {course.instructor}
            </p>
          </div>
          <div className={`flex items-center justify-center size-12 rounded-lg ${course.color}`}>
            <span className="material-symbols-outlined text-xl">menu_book</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative size-16">
              <svg className="size-full" height="36" viewBox="0 0 36 36" width="36" xmlns="http://www.w3.org/2000/svg">
                <circle 
                  className="stroke-current text-gray-200 dark:text-gray-700" 
                  cx="18" cy="18" fill="none" r="16" strokeWidth="3"
                ></circle>
                <circle 
                  className="stroke-current text-indigo-600" 
                  cx="18" cy="18" fill="none" r="16" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeWidth="3" 
                  transform="rotate(-90 18 18)"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-indigo-600">
                {course.progress}%
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Progress</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{course.progress}% Complete</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Next Lesson:</span>
            <span className="text-gray-900 dark:text-white font-medium">{course.nextLesson}</span>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
        <button className="w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 group">
          Continue Learning 
          <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform duration-200">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;