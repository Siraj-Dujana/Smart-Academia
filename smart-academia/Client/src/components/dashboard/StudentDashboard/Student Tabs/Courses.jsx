import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Course Card Component
const CourseCard = ({ course, isEnrolled = true, onEnroll, onUnenroll }) => {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (course.progress / 100) * circumference;
  const navigate = useNavigate();

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "stroke-blue-600 dark:stroke-blue-500";
    if (percentage >= 60) return "stroke-blue-500 dark:stroke-blue-400";
    if (percentage >= 40) return "stroke-blue-400 dark:stroke-blue-300";
    return "stroke-blue-300 dark:stroke-blue-200";
  };

  const progressColor = getProgressColor(course.progress);

  const handleCardClick = () => {
    if (isEnrolled) {
      navigate(`/lessons/${course.id}`);
    } else {
      console.log(`Viewing course details: ${course.title}`);
    }
  };

  const handleContinueClick = (e) => {
    e.stopPropagation();
    if (isEnrolled) {
      navigate(`/lessons/${course.id}`);
    }
  };

  const handleEnrollClick = (e) => {
    e.stopPropagation();
    if (onEnroll) onEnroll(course.id);
  };

  const handleUnenrollClick = (e) => {
    e.stopPropagation();
    if (onUnenroll) onUnenroll(course.id);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group h-full flex flex-col cursor-pointer active:scale-95 hover:-translate-y-1 select-none"
    >
      <div className="p-4 flex-1">
        {/* Course Header */}
        <div className="flex items-start gap-3 mb-4">
          {/* Icon */}
          <div className={`flex items-center justify-center size-10 rounded-lg flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300 ${course.color}`}>
            <span className="material-symbols-outlined text-base text-blue-600 dark:text-blue-400">menu_book</span>
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
          
          {/* Circular Progress - Only for enrolled courses */}
          {isEnrolled && (
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
          )}
        </div>

        {/* Course Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Credits */}
          <div className="flex items-center gap-2 group/item">
            <div className="flex items-center justify-center size-6 rounded bg-blue-50 dark:bg-blue-900/20 flex-shrink-0 group-hover/item:bg-blue-100 dark:group-hover/item:bg-blue-900/40 transition-colors duration-200">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xs group-hover/item:text-blue-700 dark:group-hover/item:text-blue-300 transition-colors duration-200">school</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors duration-200">Credits</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                {course.credits}
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
                {course.semester}
              </p>
            </div>
          </div>
        </div>

        {/* Next Lesson or Description */}
        {isEnrolled && course.nextLesson ? (
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
        ) : (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors duration-300">
            <div className="flex items-center justify-center size-6 rounded bg-blue-100 dark:bg-blue-900/30 flex-shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors duration-200">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xs group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">info</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">Course Description</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                {course.description || "Learn fundamental concepts and skills"}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Action Button */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        {isEnrolled ? (
          <div className="flex gap-2">
            <button 
              onClick={handleContinueClick}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 group/btn active:scale-95"
            >
              Continue 
              <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-0.5 transition-transform duration-200">
                arrow_forward
              </span>
            </button>
            <button 
              onClick={handleUnenrollClick}
              className="px-3 py-2 rounded-lg text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-red-200 dark:border-red-700 transition-colors duration-200"
              title="Unenroll from course"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        ) : (
          <button 
            onClick={handleEnrollClick}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 group/btn active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Enroll Now
          </button>
        )}
      </div>
    </div>
  );
};

const Courses = () => {
  // All available courses - ONLY 3 ENROLLED + 2 UNENROLLED
  const [allCourses, setAllCourses] = useState([
    {
      id: 1,
      title: "Introduction to Python Programming",
      code: "CS-101",
      instructor: "Dr. Noor Nabi",
      progress: 85,
      nextLesson: "Functions and Modules",
      credits: 3,
      semester: "Fall 2024",
      description: "Learn Python programming from basics to advanced concepts",
      color: "bg-blue-100 dark:bg-blue-900/30",
      enrolled: true
    },
    {
      id: 2,
      title: "Data Structures & Algorithms",
      code: "CS-201",
      instructor: "Dr. Faiz Ahmed Lakhani",
      progress: 72,
      nextLesson: "Linked Lists Implementation",
      credits: 4,
      semester: "Fall 2024",
      description: "Master fundamental data structures and algorithms",
      color: "bg-indigo-100 dark:bg-indigo-900/30",
      enrolled: true
    },
    {
      id: 3,
      title: "Machine Learning Basics",
      code: "CS-401",
      instructor: "Dr. Noor Nabi",
      progress: 60,
      nextLesson: "Linear Regression Models",
      credits: 4,
      semester: "Fall 2024",
      description: "Introduction to machine learning algorithms",
      color: "bg-fuchsia-100 dark:bg-fuchsia-900/30",
      enrolled: true
    },
    {
      id: 4,
      title: "Web Development Fundamentals",
      code: "CS-302",
      instructor: "Sir Iftikhar Ahmed",
      progress: 0,
      credits: 4,
      semester: "Fall 2024",
      description: "Build modern websites with HTML, CSS, and JavaScript",
      color: "bg-cyan-100 dark:bg-cyan-900/30",
      enrolled: false
    },
    {
      id: 5,
      title: "Database Management Systems",
      code: "CS-303",
      instructor: "Sir Ali Akber Shah",
      progress: 0,
      credits: 3,
      semester: "Fall 2024",
      description: "Learn database design and SQL programming",
      color: "bg-violet-100 dark:bg-violet-900/30",
      enrolled: false
    }
  ]);

  // Filter courses
  const enrolledCourses = allCourses.filter(course => course.enrolled);
  const availableCourses = allCourses.filter(course => !course.enrolled);

  // Calculate statistics
  const totalCourses = enrolledCourses.length;
  const avgProgress = enrolledCourses.length > 0 
    ? Math.round(enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / enrolledCourses.length)
    : 0;
  const totalCredits = enrolledCourses.reduce((sum, course) => sum + course.credits, 0);

  // Handle enroll action
  const handleEnroll = (courseId) => {
    setAllCourses(prev => prev.map(course => 
      course.id === courseId ? { ...course, enrolled: true, progress: 0 } : course
    ));
    console.log(`Enrolled in course ID: ${courseId}`);
  };

  // Handle unenroll action
  const handleUnenroll = (courseId) => {
    if (window.confirm("Are you sure you want to unenroll from this course?")) {
      setAllCourses(prev => prev.map(course => 
        course.id === courseId ? { ...course, enrolled: false, progress: 0 } : course
      ));
      console.log(`Unenrolled from course ID: ${courseId}`);
    }
  };

  // State for active tab
  const [activeTab, setActiveTab] = useState("enrolled");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            My Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your course enrollments and track progress
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Enrolled Courses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-12 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <span className="material-symbols-outlined text-2xl text-blue-600 dark:text-blue-400">import_contacts</span>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Enrolled Courses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCourses}</p>
            </div>
          </div>
        </div>

        {/* Average Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-12 rounded-lg bg-green-100 dark:bg-green-900/30">
              <span className="material-symbols-outlined text-2xl text-green-600 dark:text-green-400">trending_up</span>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Avg Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgProgress}%</p>
            </div>
          </div>
        </div>

        {/* Total Credits */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-12 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <span className="material-symbols-outlined text-2xl text-purple-600 dark:text-purple-400">school</span>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Credits</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCredits}</p>
            </div>
          </div>
        </div>

        {/* Available Courses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-12 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <span className="material-symbols-outlined text-2xl text-amber-600 dark:text-amber-400">library_books</span>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Available Courses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{availableCourses.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("enrolled")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
              activeTab === "enrolled"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>
              Enrolled Courses ({enrolledCourses.length})
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab("available")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
              activeTab === "available"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base">library_books</span>
              Available Courses ({availableCourses.length})
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {/* Filters */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder={`Search ${activeTab === "enrolled" ? "enrolled" : "available"} courses...`}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Sort */}
              <select className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Sort by: {activeTab === "enrolled" ? "Progress" : "Title A-Z"}</option>
                <option>Sort by: Credits</option>
                <option>Sort by: Semester</option>
                <option>Sort by: Instructor</option>
              </select>

              {/* Category Filter */}
              <select className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>All Categories</option>
                <option>Programming</option>
                <option>Mathematics</option>
                <option>Science</option>
                <option>Business</option>
              </select>
            </div>
          </div>

          {/* Courses Grid */}
          <div>
            {activeTab === "enrolled" ? (
              enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enrolledCourses.map((course) => (
                    <CourseCard 
                      key={course.id} 
                      course={course} 
                      isEnrolled={true}
                      onUnenroll={handleUnenroll}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
                    import_contacts
                  </span>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Enrolled Courses
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    You haven't enrolled in any courses yet. Browse available courses to get started!
                  </p>
                  <button 
                    onClick={() => setActiveTab("available")}
                    className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  >
                    <span className="material-symbols-outlined text-base">library_books</span>
                    Browse Available Courses
                  </button>
                </div>
              )
            ) : (
              availableCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {availableCourses.map((course) => (
                    <CourseCard 
                      key={course.id} 
                      course={course} 
                      isEnrolled={false}
                      onEnroll={handleEnroll}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
                    library_books
                  </span>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Available Courses
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    All courses are enrolled or no new courses available at the moment.
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;