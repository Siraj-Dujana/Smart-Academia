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
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfPTeEMhMiED4qhmQAOotpYXPxbkz0JE7o_K1HptVxnuBK0HyuUSfhIm98TfaNun5NY90nyLCnQkvq2J2vUgeP450wvExuY5o9hjOaM-Pg7e-Oc-ozwfkYAAzNCK2iwrhZ3fyRKLXx8ixuezruT0auBF5fx6XQbKOWmqTHVkMQVi3JsPGBo8cUXOkn6XksgBKMLMyRBUx6pzCeuUAxWjyqQHxqStSoaYm4Fwc1LZ19b0rwJcldaBrC2XHz2OOTAya6ZP-9Ci2TtJ01"
    },
    {
      id: 2,
      name: "Sir Iftikhar Ahmed",
      department: "Mathematics",
      courses: 4,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDR3UIICWRxpLXy2-ZT5DRGJgUPDD9B_OgP94OtA62iwt9wInk1CWtjneGF3WfNAlxi7PZP_fgkcnpjnqIhk-hKA7L1Hr89vPkL34QRw90UyiVJURBPO04Hgt4kpfcmfAIMTV5R0hASJLoXYNOtcqStVs6U-sbPCSMSy75h1Zv8ofrVUvANF53PXeiyHpsinX_6ApMlb1XRqUZn-0Kuqvp5vdNNDwi2d4ueRRhITL_rNZ0vG9H1AuDEF0JncW8r6KZnw3m8XRIyNq84"
    },
    {
      id: 3,
      name: "Sir Iftikhar Ahmed",
      department: "Physics",
      courses: 2,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCA7cmsTtpmxprpoNL3hk2D9zfyG7nrHk8B8jhENZ2PMysq09baQmTguIB7YD7drdghlaf1QUmQNN_i3lc7T2mjXKuHsAvSKeR9QTit5wIekTh6OEunaCETlBI_O1gVlhpX_e5KjbUZh34JOzL5mZwf3cw86gQus9cn5VCmd62FSr6N5L6cwGg-1z_H7ANOuSLIB3gALrUy__CgsRdM1eQJMICwXEYYAkV2eDWc39OymB4LGvhGyMHXpVdNc3I26cUG3tXICiG2IIKu"
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
      icon: "quiz",
      title: "Active Labs",
      value: "22",
      color: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-500",
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

  const handleAddNew = () => {
    console.log('Add new teacher');
  };

  const handleEditTeacher = (teacher) => {
    console.log('Edit teacher:', teacher);
  };

  const handleDeleteTeacher = (teacher) => {
    console.log('Delete teacher:', teacher);
  };

  const handleGenerateReport = () => {
    console.log('Generate AI report');
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base">
            Welcome back, Siraj Dujana! Here's the system overview.
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

    

      {/* Reports Overview Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Reports Overview
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Bar Chart Section */}
          <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 hover:shadow-md transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Student Enrollment by Department
            </h3>
            <div className="h-64 sm:h-80">
              <canvas ref={barChartRef} />
            </div>
          </div>
          
          {/* Pie Chart Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 hover:shadow-md transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Course Completion Status
            </h3>
            <div className="h-64 sm:h-80 flex items-center justify-center">
              <canvas ref={pieChartRef} />
            </div>
          </div>
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
          Generate Report
        </button>
      </div>
    </div>
  );
};

export default Dashboard;