// Lessons.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Lessons = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  // Mock course data
  const coursesData = {
    1: {
      id: 1,
      title: "Introduction to Python Programming",
      code: "CS-101",
      instructor: "Dr. Noor Nabi",
      progress: 85,
      credits: 3,
      semester: "Fall 2024",
      description: "Learn Python programming from basics to advanced concepts",
      enrolled: true
    },
    2: {
      id: 2,
      title: "Data Structures & Algorithms",
      code: "CS-201",
      instructor: "Dr. Faiz Ahmed Lakhani",
      progress: 72,
      credits: 4,
      semester: "Fall 2024",
      description: "Master fundamental data structures and algorithms",
      enrolled: true
    },
    3: {
      id: 3,
      title: "Machine Learning Basics",
      code: "CS-401",
      instructor: "Dr. Noor Nabi",
      progress: 60,
      credits: 4,
      semester: "Fall 2024",
      description: "Introduction to machine learning algorithms",
      enrolled: true
    }
  };

  // Mock lessons data with THREE FORMATS: text, video, flowchart
  const lessonsData = [
    // Lesson 1: TEXT Format
    {
      id: 1,
      courseId: 1,
      order: 1,
      title: "Introduction to Python",
      description: "Learn the basics of Python programming language",
      format: "text", // text, video, flowchart
      duration: "45 min",
      difficulty: "easy",
      points: 100,
      progress: 100,
      completed: true,
      prerequisites: [],
      locked: false,
      
      // TEXT Format Content
      textContent: {
        sections: [
          {
            title: "What is Python?",
            content: `Python is a high-level, interpreted programming language known for its simplicity and readability. Created by Guido van Rossum and first released in 1991, Python has become one of the most popular programming languages worldwide.

            <h3 class="font-bold text-lg mt-4 mb-2">Key Features:</h3>
            <ul class="list-disc pl-5 space-y-1">
              <li><strong>Easy to Learn:</strong> Clean syntax and readability</li>
              <li><strong>Interpreted Language:</strong> No compilation needed</li>
              <li><strong>Object-Oriented:</strong> Supports OOP concepts</li>
              <li><strong>Extensive Libraries:</strong> Rich ecosystem of modules</li>
              <li><strong>Cross-Platform:</strong> Runs on Windows, Mac, Linux</li>
            </ul>`
          },
          {
            title: "Python Applications",
            content: `Python is versatile and used in various domains:

            <div class="grid grid-cols-2 gap-4 mt-3">
              <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div class="font-bold text-blue-700 dark:text-blue-300">Web Development</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Django, Flask, FastAPI</div>
              </div>
              <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div class="font-bold text-green-700 dark:text-green-300">Data Science</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Pandas, NumPy, SciPy</div>
              </div>
              <div class="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <div class="font-bold text-purple-700 dark:text-purple-300">Machine Learning</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">TensorFlow, PyTorch, Scikit-learn</div>
              </div>
              <div class="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                <div class="font-bold text-amber-700 dark:text-amber-300">Automation</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Scripting, Testing, DevOps</div>
              </div>
            </div>`
          },
          {
            title: "Setting Up Python",
            content: `Follow these steps to get started with Python:

            <h4 class="font-bold mt-3 mb-2">Step 1: Download Python</h4>
            <p>Visit <a href="https://python.org" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank">python.org</a> and download the latest version.</p>

            <h4 class="font-bold mt-3 mb-2">Step 2: Installation</h4>
            <pre class="bg-gray-800 text-gray-100 p-4 rounded-lg mt-2 overflow-x-auto">
$ python --version
Python 3.11.0</pre>

            <h4 class="font-bold mt-3 mb-2">Step 3: Your First Program</h4>
            <p>Create a file called <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">hello.py</code>:</p>
            <pre class="bg-gray-800 text-gray-100 p-4 rounded-lg mt-2 overflow-x-auto">
print("Hello, World!")
print("Welcome to Python Programming!")</pre>`
          }
        ],
        readingMaterials: [
          "Python Basics.pdf",
          "Getting Started Guide.pdf",
          "Python Cheat Sheet.pdf"
        ]
      }
    },
    
    // Lesson 2: VIDEO Format
    {
      id: 2,
      courseId: 1,
      order: 2,
      title: "Variables and Data Types",
      description: "Understanding variables, data types, and basic operations",
      format: "video", // text, video, flowchart
      duration: "30 min",
      difficulty: "easy",
      points: 80,
      progress: 100,
      completed: true,
      prerequisites: ["Lesson 1"],
      locked: false,
      
      // VIDEO Format Content
      videoContent: {
        videoUrl: "https://example.com/variables-data-types",
        videoId: "variables-101",
        duration: "28:45",
        transcript: `In this video, we'll cover:
        1. What are variables in Python?
        2. Different data types: integers, floats, strings, booleans
        3. Type conversion and checking
        4. Basic operations with variables`,
        chapters: [
          { time: "00:00", title: "Introduction to Variables" },
          { time: "05:30", title: "Numeric Data Types" },
          { time: "12:15", title: "String Operations" },
          { time: "20:00", title: "Type Conversion" },
          { time: "25:30", title: "Summary & Practice" }
        ],
        resources: [
          "Variables and Data Types.pdf",
          "Code Examples.zip",
          "Practice Exercises.pdf"
        ]
      }
    },
    
    // Lesson 3: FLOWCHART Format
    {
      id: 3,
      courseId: 1,
      order: 3,
      title: "Control Flow in Python",
      description: "Understanding if-else statements and loops through flowcharts",
      format: "flowchart", // text, video, flowchart
      duration: "60 min",
      difficulty: "medium",
      points: 120,
      progress: 85,
      completed: false,
      prerequisites: ["Lesson 1", "Lesson 2"],
      locked: false,
      
      // FLOWCHART Format Content
      flowchartContent: {
        title: "Decision Making Process in Python",
        description: "Visual representation of control flow structures",
        flowchartData: {
          nodes: [
            { id: "start", label: "Start", type: "start" },
            { id: "condition", label: "Check Condition", type: "decision" },
            { id: "true", label: "Execute True Block", type: "process" },
            { id: "false", label: "Execute False Block", type: "process" },
            { id: "continue", label: "Continue Program", type: "process" },
            { id: "end", label: "End", type: "end" }
          ],
          edges: [
            { from: "start", to: "condition", label: "" },
            { from: "condition", to: "true", label: "True" },
            { from: "condition", to: "false", label: "False" },
            { from: "true", to: "continue", label: "" },
            { from: "false", to: "continue", label: "" },
            { from: "continue", to: "end", label: "" }
          ]
        },
        explanation: `This flowchart represents the decision-making process in Python:

        <h3 class="font-bold mt-4 mb-2">Key Components:</h3>
        <ol class="list-decimal pl-5 space-y-2">
          <li><strong>Start Node:</strong> Beginning of the program</li>
          <li><strong>Decision Node:</strong> If-else condition check</li>
          <li><strong>Process Nodes:</strong> Code blocks to execute</li>
          <li><strong>End Node:</strong> Program completion</li>
        </ol>`,
        examples: [
          {
            title: "If-Else Example",
            code: `age = 18
if age >= 18:
    print("You are eligible to vote")
else:
    print("You are not eligible to vote")`
          },
          {
            title: "For Loop Flowchart",
            description: "Visual representation of iteration process"
          }
        ]
      }
    },
    
    // Lesson 4: TEXT Format (Locked Example)
    {
      id: 4,
      courseId: 1,
      order: 4,
      title: "Functions in Python",
      description: "Learn how to create and use functions",
      format: "text", // text, video, flowchart
      duration: "90 min",
      difficulty: "medium",
      points: 150,
      progress: 0,
      completed: false,
      prerequisites: ["Lesson 1", "Lesson 2", "Lesson 3"],
      locked: true, // Locked because previous lesson not 100% complete
      
      // TEXT Format Content
      textContent: {
        sections: [
          {
            title: "Introduction to Functions",
            content: "Functions are reusable blocks of code..."
          }
        ],
        readingMaterials: ["Functions.pdf"]
      }
    },
    
    // Lesson 5: VIDEO Format (Locked Example)
    {
      id: 5,
      courseId: 1,
      order: 5,
      title: "Object-Oriented Programming",
      description: "Classes, objects, and OOP concepts",
      format: "video", // text, video, flowchart
      duration: "120 min",
      difficulty: "hard",
      points: 200,
      progress: 0,
      completed: false,
      prerequisites: ["Lesson 1-4"],
      locked: true, // Locked because previous lessons not completed
      
      // VIDEO Format Content
      videoContent: {
        videoUrl: "https://example.com/oop-python",
        videoId: "oop-101",
        duration: "45:20",
        transcript: "Introduction to Object-Oriented Programming in Python..."
      }
    }
  ];

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);

  useEffect(() => {
    // Load course data
    if (courseId && coursesData[courseId]) {
      setCourse(coursesData[courseId]);
      
      // Load lessons for this course
      const courseLessons = lessonsData.filter(lesson => lesson.courseId === parseInt(courseId));
      setLessons(courseLessons);
      
      // Set first unlocked lesson as active
      const firstUnlocked = courseLessons.find(lesson => !lesson.locked);
      if (firstUnlocked) {
        setActiveLesson(firstUnlocked);
      }
    } else {
      // Redirect if course not found
      navigate("/courses");
    }
  }, [courseId, navigate]);

  const handleStartLesson = (lessonId) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson && !lesson.locked) {
      setActiveLesson(lesson);
      console.log(`Starting lesson: ${lesson.title}`);
    }
  };

  const handleCompleteLesson = (lessonId) => {
    setLessons(prev => prev.map(lesson => {
      if (lesson.id === lessonId) {
        const updated = { ...lesson, progress: 100, completed: true };
        
        // Unlock next lesson if this one is completed
        if (lesson.order < lessons.length) {
          const nextLesson = lessons.find(l => l.order === lesson.order + 1);
          if (nextLesson) {
            const nextIndex = lessons.findIndex(l => l.id === nextLesson.id);
            const updatedLessons = [...prev];
            updatedLessons[nextIndex] = { ...nextLesson, locked: false };
            setLessons(updatedLessons);
          }
        }
        
        return updated;
      }
      return lesson;
    }));
    
    // Update active lesson progress
    if (activeLesson && activeLesson.id === lessonId) {
      setActiveLesson(prev => ({ ...prev, progress: 100, completed: true }));
    }
  };

  const calculateCourseProgress = () => {
    if (lessons.length === 0) return 0;
    const totalProgress = lessons.reduce((sum, lesson) => sum + lesson.progress, 0);
    return Math.round(totalProgress / lessons.length);
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case 'text': return 'article';
      case 'video': return 'play_circle';
      case 'flowchart': return 'account_tree';
      default: return 'school';
    }
  };

  const getFormatColor = (format) => {
    switch (format) {
      case 'text': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'video': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'flowchart': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      default: return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const formatToTitle = (format) => {
    switch (format) {
      case 'text': return 'Text Lesson';
      case 'video': return 'Video Tutorial';
      case 'flowchart': return 'Flowchart Diagram';
      default: return 'Lesson';
    }
  };

  // Render TEXT format content
  const renderTextContent = (content) => {
    return (
      <div className="space-y-8">
        {content.sections.map((section, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{section.title}</h3>
            <div 
              className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </div>
        ))}
        
        {content.readingMaterials && content.readingMaterials.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
            <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">download</span>
              Downloadable Resources
            </h4>
            <div className="space-y-3">
              {content.readingMaterials.map((material, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">description</span>
                    <span className="text-gray-900 dark:text-white">{material}</span>
                  </div>
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <span className="material-symbols-outlined">download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render VIDEO format content
  const renderVideoContent = (content) => {
    return (
      <div className="space-y-6">
        {/* Video Player */}
        <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg">
          <div className="relative aspect-video">
            {/* Video Player Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
              <div className="text-center">
                <button className="size-20 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                  <span className="material-symbols-outlined text-white text-3xl">play_arrow</span>
                </button>
                <p className="text-gray-400">Video: {content.videoUrl}</p>
                <p className="text-sm text-gray-500 mt-2">Duration: {content.duration}</p>
              </div>
            </div>
            
            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="text-white hover:text-gray-300">
                    <span className="material-symbols-outlined">play_arrow</span>
                  </button>
                  <button className="text-white hover:text-gray-300">
                    <span className="material-symbols-outlined">volume_up</span>
                  </button>
                  <span className="text-white text-sm">00:00 / {content.duration}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-white hover:text-gray-300">
                    <span className="material-symbols-outlined">fullscreen</span>
                  </button>
                  <button className="text-white hover:text-gray-300">
                    <span className="material-symbols-outlined">settings</span>
                  </button>
                </div>
              </div>
              <div className="h-1 bg-gray-700 mt-2 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 w-1/3"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Chapters */}
        {content.chapters && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">list</span>
              Video Chapters
            </h4>
            <div className="space-y-2">
              {content.chapters.map((chapter, index) => (
                <div key={index} className="flex items-center gap-3 p-3 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                  <div className="size-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg">
                    <span className="text-sm font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{chapter.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{chapter.time}</div>
                  </div>
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    <span className="material-symbols-outlined">play_circle</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Transcript */}
        {content.transcript && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">transcript</span>
              Video Transcript
            </h4>
            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 font-sans">
                {content.transcript}
              </pre>
            </div>
          </div>
        )}

        {/* Resources */}
        {content.resources && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5">
            <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">folder</span>
              Lesson Resources
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {content.resources.map((resource, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                      {resource.endsWith('.zip') ? 'folder_zip' : 'description'}
                    </span>
                    <span className="text-gray-900 dark:text-white">{resource}</span>
                  </div>
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <span className="material-symbols-outlined">download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render FLOWCHART format content
  const renderFlowchartContent = (content) => {
    const { nodes, edges } = content.flowchartData;
    
    return (
      <div className="space-y-6">
        {/* Flowchart Visualization */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
          <h4 className="text-xl font-bold text-white mb-6 text-center">{content.title}</h4>
          
          {/* Flowchart Diagram */}
          <div className="relative h-96 bg-gray-800/50 rounded-lg overflow-hidden">
            {/* Flowchart Nodes and Connections */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Start Node */}
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
                <div className="size-20 rounded-full bg-green-500 flex items-center justify-center border-4 border-green-300 shadow-lg">
                  <span className="text-white font-bold">Start</span>
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                  <div className="h-10 w-1 bg-gray-400"></div>
                  <div className="text-xs text-gray-400 mt-1 text-center">↓</div>
                </div>
              </div>
              
              {/* Decision Node */}
              <div className="absolute top-40 left-1/2 transform -translate-x-1/2">
                <div className="size-24 bg-yellow-500 rotate-45 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold -rotate-45 text-center px-2">Check Condition</span>
                </div>
                
                {/* True Branch */}
                <div className="absolute top-1/2 right-0 transform translate-x-full -translate-y-1/2">
                  <div className="flex items-center">
                    <div className="w-20 h-1 bg-gray-400"></div>
                    <div className="text-xs text-gray-400 ml-1">True</div>
                  </div>
                  <div className="absolute right-0 top-1/2 transform translate-y-1/2">
                    <div className="size-16 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg ml-4">
                      <span className="text-white text-sm text-center">True Block</span>
                    </div>
                  </div>
                </div>
                
                {/* False Branch */}
                <div className="absolute top-1/2 left-0 transform -translate-x-full -translate-y-1/2">
                  <div className="flex items-center flex-row-reverse">
                    <div className="w-20 h-1 bg-gray-400"></div>
                    <div className="text-xs text-gray-400 mr-1">False</div>
                  </div>
                  <div className="absolute left-0 top-1/2 transform translate-y-1/2">
                    <div className="size-16 bg-red-500 rounded-lg flex items-center justify-center shadow-lg mr-4">
                      <span className="text-white text-sm text-center">False Block</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Continue Node */}
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
                <div className="size-20 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-center">Continue</span>
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                  <div className="h-10 w-1 bg-gray-400"></div>
                  <div className="text-xs text-gray-400 mt-1 text-center">↓</div>
                </div>
              </div>
              
              {/* End Node */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                <div className="size-16 rounded-full bg-gray-600 flex items-center justify-center border-4 border-gray-400 shadow-lg">
                  <span className="text-white font-bold">End</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Flowchart Legend */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="size-4 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-300">Start/End Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-4 bg-yellow-500 rotate-45"></div>
              <span className="text-sm text-gray-300">Decision Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-300">Process Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-gray-400"></div>
              <span className="text-sm text-gray-300">Flow Direction</span>
            </div>
          </div>
        </div>

        {/* Flowchart Explanation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">info</span>
            Flowchart Explanation
          </h4>
          <div 
            className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: content.explanation }}
          />
        </div>

        {/* Code Examples */}
        {content.examples && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">code</span>
              Code Examples
            </h4>
            <div className="space-y-4">
              {content.examples.map((example, index) => (
                <div key={index} className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                    <span className="text-gray-300 text-sm font-mono">{example.title}</span>
                    <button className="text-gray-400 hover:text-white text-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      Copy
                    </button>
                  </div>
                  <pre className="p-4 text-gray-100 font-mono text-sm overflow-x-auto">
                    {example.code || `# ${example.description}\n# Code example for ${example.title}`}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render lesson content based on format
  const renderLessonContent = (lesson) => {
    switch (lesson.format) {
      case 'text':
        return renderTextContent(lesson.textContent);
      case 'video':
        return renderVideoContent(lesson.videoContent);
      case 'flowchart':
        return renderFlowchartContent(lesson.flowchartContent);
      default:
        return (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
              error
            </span>
            <p className="text-gray-600 dark:text-gray-400">Content format not supported</p>
          </div>
        );
    }
  };

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 animate-spin">
            progress_activity
          </span>
          <p className="text-gray-600 dark:text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <button
                onClick={() => navigate("/courses")}
                className="flex items-center justify-center size-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mt-1"
              >
                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">arrow_back</span>
              </button>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                    {course.code}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{course.semester}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {course.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Instructor: <span className="font-medium">{course.instructor}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {calculateCourseProgress()}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Course Progress
                </div>
              </div>
            </div>
          </div>

          {/* Course Progress */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Level-Based Learning System
                  </span>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {lessons.filter(l => !l.locked).length}/{lessons.length} Lessons Unlocked
                  </span>
                </div>
                <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${calculateCourseProgress()}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {lessons.filter(l => l.progress === 100).length}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {lessons.filter(l => !l.locked && l.progress < 100).length}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {lessons.filter(l => l.locked).length}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Locked</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lessons Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm sticky top-6">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">Lessons</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Complete lessons in order to unlock next levels
              </p>
            </div>
            
            <div className="p-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => handleStartLesson(lesson.id)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    activeLesson?.id === lesson.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : lesson.locked
                      ? 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-70'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center size-10 rounded-lg ${getFormatColor(lesson.format)}`}>
                      <span className="material-symbols-outlined">{getFormatIcon(lesson.format)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Lesson {lesson.order}
                        </span>
                        <div className="flex items-center gap-1">
                          {lesson.locked ? (
                            <span className="material-symbols-outlined text-xs text-gray-400">lock</span>
                          ) : lesson.progress === 100 ? (
                            <span className="material-symbols-outlined text-xs text-green-500">check_circle</span>
                          ) : null}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getFormatColor(lesson.format)}`}>
                            {lesson.format.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {lesson.title}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {lesson.duration} • {lesson.points} pts
                        </span>
                        {lesson.progress > 0 && !lesson.locked && (
                          <div className="flex items-center gap-1">
                            <div className="h-1.5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500"
                                style={{ width: `${lesson.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">{lesson.progress}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="lg:col-span-2">
          {activeLesson ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              {/* Lesson Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getFormatColor(activeLesson.format)}`}>
                        {formatToTitle(activeLesson.format)}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Lesson {activeLesson.order} • {activeLesson.duration}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {activeLesson.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {activeLesson.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="text-right mb-2">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeLesson.points}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Points</div>
                    </div>
                    {activeLesson.locked && (
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-full">
                        Locked
                      </span>
                    )}
                  </div>
                </div>

                {/* Prerequisites Warning */}
                {activeLesson.locked && activeLesson.prerequisites && activeLesson.prerequisites.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">lock</span>
                      <div>
                        <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">Lesson Locked</h4>
                        <p className="text-amber-700 dark:text-amber-400 text-sm">
                          Complete these prerequisites to unlock:
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {activeLesson.prerequisites.map((prereq, index) => (
                            <span key={index} className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm rounded-full">
                              {prereq}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Lesson Content */}
              <div className="p-6">
                {activeLesson.locked ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
                      lock
                    </span>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      This Lesson is Locked
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Complete the previous lessons to unlock this content. Each lesson builds upon the knowledge from previous ones.
                    </p>
                    <button
                      onClick={() => {
                        // Find and navigate to first incomplete prerequisite
                        const incomplete = lessons.find(l => !l.completed && !l.locked);
                        if (incomplete) {
                          handleStartLesson(incomplete.id);
                        }
                      }}
                      className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <span className="material-symbols-outlined">arrow_back</span>
                      Go to Previous Lesson
                    </button>
                  </div>
                ) : (
                  <>
                    {renderLessonContent(activeLesson)}

                    {/* Action Buttons */}
                    {activeLesson.progress < 100 && (
                      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Progress:</span>
                            <div className="h-2 w-48 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                              <div 
                                className="h-full bg-green-500 transition-all duration-500"
                                style={{ width: `${activeLesson.progress}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                // Navigate to previous lesson
                                const prevLesson = lessons.find(l => l.order === activeLesson.order - 1);
                                if (prevLesson) {
                                  handleStartLesson(prevLesson.id);
                                }
                              }}
                              disabled={activeLesson.order === 1}
                              className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                                activeLesson.order === 1
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              <span className="material-symbols-outlined align-middle mr-2">chevron_left</span>
                              Previous
                            </button> 
                            <button
                              onClick={() => handleCompleteLesson(activeLesson.id)}
                              className="px-6 py-2.5 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                            >
                              Mark as Complete
                              <span className="material-symbols-outlined align-middle ml-2">check</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                // Navigate to next lesson
                                const nextLesson = lessons.find(l => l.order === activeLesson.order + 1);
                                if (nextLesson && !nextLesson.locked) {
                                  handleStartLesson(nextLesson.id);
                                }
                              }}
                              disabled={!lessons.find(l => l.order === activeLesson.order + 1) || 
                                       lessons.find(l => l.order === activeLesson.order + 1)?.locked}
                              className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                                !lessons.find(l => l.order === activeLesson.order + 1) || 
                                lessons.find(l => l.order === activeLesson.order + 1)?.locked
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              Next
                              <span className="material-symbols-outlined align-middle ml-2">chevron_right</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
                menu_book
              </span>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a Lesson
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a lesson from the sidebar to start learning
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lessons;