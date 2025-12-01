import React, { useState } from "react";

const Lessons = () => {
  // Categories for filtering
  const categories = ["All", "Programming", "Mathematics", "Science", "Business", "Languages"];
  
  // Status filters
  const statuses = ["All", "Completed", "In Progress", "Not Started"];
  
  // Level filters
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  // Lesson data
  const lessons = [
    {
      id: 1,
      title: "Introduction to Python Syntax",
      course: "CS-101: Python Programming",
      category: "Programming",
      duration: "45 min",
      status: "completed",
      level: "Beginner",
      dateCompleted: "2024-01-15",
      thumbnail: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec6?w=400&h-250&fit=crop&crop=center",
      progress: 100
    },
    {
      id: 2,
      title: "Variables and Data Types",
      course: "CS-101: Python Programming",
      category: "Programming",
      duration: "60 min",
      status: "completed",
      level: "Beginner",
      dateCompleted: "2024-01-18",
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop&crop=center",
      progress: 100
    },
    {
      id: 3,
      title: "Control Structures: Loops",
      course: "CS-101: Python Programming",
      category: "Programming",
      duration: "55 min",
      status: "in-progress",
      level: "Beginner",
      dateStarted: "2024-01-20",
      thumbnail: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=250&fit=crop&crop=center",
      progress: 65
    },
    {
      id: 4,
      title: "Functions and Modules",
      course: "CS-101: Python Programming",
      category: "Programming",
      duration: "70 min",
      status: "not-started",
      level: "Beginner",
      thumbnail: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=250&fit=crop&crop=center",
      progress: 0
    },
    {
      id: 5,
      title: "Linked Lists Implementation",
      course: "CS-201: Data Structures",
      category: "Programming",
      duration: "80 min",
      status: "in-progress",
      level: "Intermediate",
      dateStarted: "2024-01-22",
      thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=250&fit=crop&crop=center",
      progress: 40
    },
    {
      id: 6,
      title: "Calculus: Derivatives",
      course: "MATH-201: Calculus I",
      category: "Mathematics",
      duration: "90 min",
      status: "completed",
      level: "Beginner",
      dateCompleted: "2024-01-19",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop&crop=center",
      progress: 100
    },
    {
      id: 7,
      title: "HTML & CSS Basics",
      course: "CS-302: Web Development",
      category: "Programming",
      duration: "50 min",
      status: "completed",
      level: "Beginner",
      dateCompleted: "2024-01-17",
      thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&crop=center",
      progress: 100
    },
    {
      id: 8,
      title: "React Components",
      course: "CS-302: Web Development",
      category: "Programming",
      duration: "75 min",
      status: "in-progress",
      level: "Intermediate",
      dateStarted: "2024-01-21",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop&crop=center",
      progress: 30
    }
  ];

  // State for filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter lessons
  const filteredLessons = lessons.filter(lesson => {
    const matchesCategory = selectedCategory === "All" || lesson.category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || 
      (selectedStatus === "Completed" && lesson.status === "completed") ||
      (selectedStatus === "In Progress" && lesson.status === "in-progress") ||
      (selectedStatus === "Not Started" && lesson.status === "not-started");
    const matchesLevel = selectedLevel === "All" || lesson.level === selectedLevel;
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.course.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesStatus && matchesLevel && matchesSearch;
  });

  // Calculate stats
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(l => l.status === "completed").length;
  const inProgressLessons = lessons.filter(l => l.status === "in-progress").length;
  const totalDuration = lessons.reduce((total, lesson) => {
    const duration = parseInt(lesson.duration) || 0;
    return total + duration;
  }, 0);

  // Handle lesson click
  const handleLessonClick = (lesson) => {
    console.log(`Opening lesson: ${lesson.title}`);
    // You can add navigation logic here
  };

  // Handle continue button click
  const handleContinueLesson = (lessonId, e) => {
    e.stopPropagation();
    console.log(`Continuing lesson ID: ${lessonId}`);
    // Add continue lesson logic here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Lessons
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Access and manage your learning materials
          </p>
        </div>
        
        <button className="flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200">
          <span className="material-symbols-outlined text-base">add</span>
          New Lesson Plan
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Lessons */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-12 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <span className="material-symbols-outlined text-2xl text-blue-600 dark:text-blue-400">play_lesson</span>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Lessons</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLessons}</p>
            </div>
          </div>
        </div>

        {/* Completed Lessons */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-12 rounded-lg bg-green-100 dark:bg-green-900/30">
              <span className="material-symbols-outlined text-2xl text-green-600 dark:text-green-400">check_circle</span>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedLessons}</p>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-12 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <span className="material-symbols-outlined text-2xl text-amber-600 dark:text-amber-400">pending</span>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{inProgressLessons}</p>
            </div>
          </div>
        </div>

        {/* Total Duration */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-12 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <span className="material-symbols-outlined text-2xl text-purple-600 dark:text-purple-400">schedule</span>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Duration</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDuration} min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lessons Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            All Lessons ({filteredLessons.length})
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedCategory !== "All" && `${selectedCategory} • `}
            {selectedStatus !== "All" && `${selectedStatus} • `}
            {selectedLevel !== "All" && `${selectedLevel}`}
          </div>
        </div>

        {filteredLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredLessons.map((lesson) => (
              <div 
                key={lesson.id}
                onClick={() => handleLessonClick(lesson)}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer active:scale-95 hover:-translate-y-1"
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={lesson.thumbnail} 
                    alt={lesson.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                    lesson.status === "completed" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : lesson.status === "in-progress"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}>
                    {lesson.status === "completed" ? "Completed" : 
                     lesson.status === "in-progress" ? "In Progress" : "Not Started"}
                  </div>
                  {/* Duration */}
                  <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/70 text-white text-xs font-medium">
                    {lesson.duration}
                  </div>
                  {/* Progress Bar for In Progress */}
                  {lesson.status === "in-progress" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${lesson.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {lesson.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-xs truncate">
                        {lesson.course}
                      </p>
                    </div>
                    <div className={`flex items-center justify-center size-8 rounded-lg ml-2 flex-shrink-0 ${
                      lesson.category === "Programming" ? "bg-blue-100 dark:bg-blue-900/30" :
                      lesson.category === "Mathematics" ? "bg-green-100 dark:bg-green-900/30" :
                      lesson.category === "Science" ? "bg-purple-100 dark:bg-purple-900/30" :
                      "bg-amber-100 dark:bg-amber-900/30"
                    }`}>
                      <span className="material-symbols-outlined text-sm">
                        {lesson.category === "Programming" ? "code" :
                         lesson.category === "Mathematics" ? "calculate" :
                         lesson.category === "Science" ? "science" :
                         "menu_book"}
                      </span>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-gray-400 text-xs">category</span>
                        <span className="text-gray-600 dark:text-gray-400">{lesson.category}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-gray-400 text-xs">signal_cellular_alt</span>
                        <span className="text-gray-600 dark:text-gray-400">{lesson.level}</span>
                      </div>
                    </div>
                    {lesson.dateCompleted && (
                      <div className="text-gray-500 dark:text-gray-400">
                        {new Date(lesson.dateCompleted).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => handleContinueLesson(lesson.id, e)}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                        lesson.status === "completed"
                          ? "text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                          : lesson.status === "in-progress"
                          ? "text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                          : "text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {lesson.status === "completed" ? (
                        <>
                          <span className="material-symbols-outlined text-sm">replay</span>
                          Review
                        </>
                      ) : lesson.status === "in-progress" ? (
                        <>
                          <span className="material-symbols-outlined text-sm">play_arrow</span>
                          Continue ({lesson.progress}%)
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">play_circle</span>
                          Start Lesson
                        </>
                      )}
                    </button>
                    <button className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200">
                      <span className="material-symbols-outlined text-sm">more_vert</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
              search_off
            </span>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Lessons Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Try adjusting your filters or search term
            </p>
            <button 
              onClick={() => {
                setSelectedCategory("All");
                setSelectedStatus("All");
                setSelectedLevel("All");
                setSearchTerm("");
              }}
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Lesson Activity
          </h3>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
            View All →
          </button>
        </div>
        
        <div className="space-y-3">
          {lessons
            .filter(l => l.status === "completed" || l.status === "in-progress")
            .slice(0, 3)
            .map(lesson => (
              <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                <div className={`flex items-center justify-center size-10 rounded-lg ${
                  lesson.status === "completed" 
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                }`}>
                  <span className="material-symbols-outlined text-base">
                    {lesson.status === "completed" ? "check_circle" : "play_arrow"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {lesson.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {lesson.course} • {lesson.duration} • {lesson.dateCompleted ? "Completed" : "In Progress"}
                  </p>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {lesson.dateCompleted 
                    ? new Date(lesson.dateCompleted).toLocaleDateString()
                    : "Active now"
                  }
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Lessons;