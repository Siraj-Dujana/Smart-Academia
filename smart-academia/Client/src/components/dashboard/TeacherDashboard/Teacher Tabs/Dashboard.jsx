import React from "react";

const Dashboard = () => {
  // Mock data for courses
  const courses = [
    {
      id: 1,
      title: "Introduction to Python",
      code: "CS-101",
      students: 32,
      description: "A foundational course on Python programming, covering syntax, data structures, and basic algorithms."
    },
    {
      id: 2,
      title: "Data Structures & Algorithms",
      code: "CS-201",
      students: 28,
      description: "An in-depth look at fundamental data structures, algorithms, and complexity analysis."
    },
    {
      id: 3,
      title: "Machine Learning",
      code: "CS-305",
      students: 26,
      description: "Exploring core concepts of machine learning, including supervised and unsupervised learning models."
    }
  ];

  // Mock data for student progress
  const studentProgress = [
    {
      id: 1,
      name: "Mubeen Channa",
      course: "Introduction to Python",
      progress: 95,
      // avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCA7cmsTtpmxprpoNL3hk2D9zfyG7nrHk8B8jhENZ2PMysq09baQmTguIB7YD7drdghlaf1QUmQNN_i3lc7T2mjXKuHsAvSKeR9QTit5wIekTh6OEunaCETlBI_O1gVlhpX_e5KjbUZh34JOzL5mZwf3cw86gQus9cn5VCmd62FSr6N5L6cwGg-1z_H7ANOuSLIB3gALrUy__CgsRdM1eQJMICwXEYYAkV2eDWc39OymB4LGvhGyMHXpVdNc3I26cUG3tXICiG2IIKu"
    },
    {
      id: 2,
      name: "Manthar Ali",
      course: "Data Structures & Algorithms",
      progress: 82,
      // avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDR3UIICWRxpLXy2-ZT5DRGJgUPDD9B_OgP94OtA62iwt9wInk1CWtjneGF3WfNAlxi7PZP_fgkcnpjnqIhk-hKA7L1Hr89vPkL34QRw90UyiVJURBPO04Hgt4kpfcmfAIMTV5R0hASJLoXYNOtcqStVs6U-sbPCSMSy75h1Zv8ofrVUvANF53PXeiyHpsinX_6ApMlb1XRqUZn-0Kuqvp5vdNNDwi2d4ueRRhITL_rNZ0vG9H1AuDEF0JncW8r6KZnw3m8XRIyNq84"
    },
    {
      id: 3,
      name: "Abdul Qadeer",
      course: "Machine Learning",
      progress: 75,
      // avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtnYbxeWCt8KBRSHWtWmtUbg56WSyYWYG2jdygTpmmIz-zsXb2yPR6sURUIPz7QIcDf7at6_zCrclzK6w3pYQckCr3KrGjScsivo0IDHR6TcB7-OkrDmypmCP1L0YK8kUUlAr2hWTgRILLbdyoh2NfW__EHIU48xnBGSSVAF4-uJqatQ2fSh9taxoWk6xkAwMBOtOUE10zANYB5CleGq64KrvWFjWtPN9UbA--qTIUe0rHdnavE85Rl6Edf43KFJDx_8jcpiOFS2Z2"
    },
    {
      id: 4,
      name: "Saifullah",
      course: "Introduction to Python",
      progress: 45,
      // avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAp85dXa58ls5nHbIXfSTaM_xH02YhIVdAjnnoY6IB9GooLVSJbia04iRnJmOo5OPOXwIIfJOgg5PJwoJFeUMHKs9J4rjASKd7-DgCV6FYvQRBOS7kEj6WbfDjw5yGz81Jhpwj7ydFnWlRlbQKH63qAdJ46NlXvVuBUE7DwqvqphU24_H8KwZQVcGrEWMb_h95o9pfG3lwfd5ZM_q72kLK5HNxXGulu78dZY4TDsQvsew2GaduceAfDri0tDa37dXxGBup4YDJTTTgH"
    }
  ];

  // Stats data
  const stats = [
    {
      icon: "school",
      title: "Courses",
      value: "4",
      color: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-500",
      trend: "+1 this semester",
      trendColor: "text-green-500"
    },
    {
      icon: "quiz",
      title: "Quizzes Created",
      value: "12",
      color: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500",
      trend: "+3 this month",
      trendColor: "text-green-500"
    },
    {
      icon: "groups",
      title: "Students",
      value: "86",
      color: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-500",
      trend: "+5 this semester",
      trendColor: "text-green-500"
    },
    {
      icon: "trending_up",
      title: "Average Progress",
      value: "78%",
      color: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-500",
      trend: "+2% this week",
      trendColor: "text-green-500"
    }
  ];

  // Event handlers
  const handleViewLessons = (courseId) => {
    console.log(`View lessons for course ${courseId}`);
  };

  const handleManageQuizzes = (courseId) => {
    console.log(`Manage quizzes for course ${courseId}`);
  };

  const handleSendAnnouncement = (courseId) => {
    console.log(`Send announcement for course ${courseId}`);
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base">
            Welcome back, Dr. Vance! Here's your overview.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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

      {/* My Courses Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          My Courses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 overflow-hidden group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {course.code} • {course.students} Students
                    </p>
                  </div>
                  <div className="flex items-center justify-center size-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-500">
                    <span className="material-symbols-outlined text-xl">menu_book</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  {course.description}
                </p>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
                <button 
                  onClick={() => handleViewLessons(course.id)}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 group"
                >
                  <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform duration-200">
                    play_lesson
                  </span> 
                  View Lessons
                </button>
                <div className="flex items-center gap-2 mt-2">
                  <button 
                    onClick={() => handleManageQuizzes(course.id)}
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <span className="material-symbols-outlined text-base">quiz</span> 
                    Quizzes
                  </button>
                  <button 
                    onClick={() => handleSendAnnouncement(course.id)}
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <span className="material-symbols-outlined text-base">campaign</span> 
                    Announce
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Student Progress Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Recent Student Progress
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider" scope="col">
                    Student Name
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider" scope="col">
                    Course
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider" scope="col">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {studentProgress.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150 group">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img 
                          className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-indigo-200 dark:group-hover:ring-indigo-400 transition-all duration-200"
                          src={student.avatar} 
                          alt={`Profile of ${student.name}`}
                        />
                        {student.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {student.course}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              student.progress >= 70 ? 'bg-indigo-600' : 'bg-amber-500'
                            }`} 
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {student.progress}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;