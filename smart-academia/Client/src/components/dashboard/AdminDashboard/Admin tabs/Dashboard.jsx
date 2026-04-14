import React, { useEffect, useRef, useState } from "react";
import { Chart } from 'chart.js/auto';

const Dashboard = () => {
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);

  const [teachers] = useState([
    {
      id: 1,
      name: "Sir Faiz Ahmed Lakhani",
      department: "Computer Science",
      courses: 3,
    },
    {
      id: 2,
      name: "Sir Iftikhar Ahmed",
      department: "Mathematics",
      courses: 4,
    },
    {
      id: 3,
      name: "Sir Iftikhar Ahmed",
      department: "Physics",
      courses: 2,
    }
  ]);

  // Stats data
  const stats = [
    {
      icon: "school",
      title: "Total Teachers",
      value: "54",
      color: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-500",
      trend: "+3 this month",
      trendColor: "text-green-500"
    },
    {
      icon: "groups",
      title: "Total Students",
      value: "1,234",
      color: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-500",
      trend: "+5% this semester",
      trendColor: "text-green-500"
    },
    {
      icon: "menu_book",
      title: "Total Courses",
      value: "78",
      color: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500",
      trend: "+5 new courses",
      trendColor: "text-green-500"
    },
    {
      icon: "trending_up",
      title: "Average Progress",
      value: "68%",
      color: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-500",
      trend: "-2% this week",
      trendColor: "text-red-500"
    },
    {
      icon: "quiz",
      title: "Active Quizzes",
      value: "22",
      color: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-500",
      trend: "Up from 18 last week",
      trendColor: "text-green-500"
    },
    {
      icon: "science",
      title: "Active Labs",
      value: "22",
      color: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-500",
      trend: "Up from 18 last week",
      trendColor: "text-green-500"
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
          labels: ['CS', 'Math', 'Physics', 'Biology', 'History', 'Arts'],
          datasets: [{
            label: 'Students Enrolled',
            data: [350, 220, 180, 280, 150, 190],
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
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
              },
              ticks: {
                font: { size: 11 }
              }
            },
            x: {
              grid: { display: false },
              ticks: {
                font: { size: 11 }
              }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: '#4f46e5',
              borderWidth: 1,
              cornerRadius: 8,
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
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
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
                padding: 15,
                font: { size: 11 }
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

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName = user.fullName || user.name || "Admin User";

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Welcome back, {displayName}! Here's the system overview.
          </p>
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group"
          >
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
              <div className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg ${stat.color} group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
                <span className="material-symbols-outlined text-xl sm:text-2xl">{stat.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">
                  {stat.title}
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1">
                  {stat.value}
                </p>
                <p className={`text-[10px] sm:text-xs font-medium ${stat.trendColor}`}>
                  {stat.trend}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reports Overview Section */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Reports Overview
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 mb-6 sm:mb-8">
          {/* Bar Chart Section */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5 md:p-6 hover:shadow-md transition-all duration-300">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Student Enrollment by Department
            </h3>
            <div className="h-56 sm:h-64 md:h-72 lg:h-80">
              <canvas ref={barChartRef} />
            </div>
          </div>
          
          {/* Pie Chart Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5 md:p-6 hover:shadow-md transition-all duration-300">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Course Completion Status
            </h3>
            <div className="h-56 sm:h-64 md:h-72 lg:h-80 flex items-center justify-center">
              <canvas ref={pieChartRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Generate Report Button */}
      <div className="flex justify-center">
        <button 
          onClick={handleGenerateReport}
          className="flex items-center justify-center gap-2 sm:gap-3 text-sm font-medium px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
        >
          <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform duration-200">
            auto_awesome
          </span> 
          Generate AI Report
        </button>
      </div>
    </div>
  );
};

export default Dashboard;