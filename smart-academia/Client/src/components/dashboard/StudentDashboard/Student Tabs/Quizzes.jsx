import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Mock data for quizzes
const initialQuizzes = [
  {
    id: 1,
    title: "Python Basics Quiz",
    course: "Introduction to Python Programming",
    courseCode: "CS-101",
    status: "completed", // completed, ongoing, upcoming, locked
    score: 85,
    totalQuestions: 10,
    timeLimit: 30, // in minutes
    difficulty: "Beginner",
    dateCompleted: "2024-02-15",
    description: "Test your understanding of Python fundamentals",
    topics: ["Variables", "Data Types", "Basic Operators"],
    passingScore: 70,
    attempts: 1,
    maxAttempts: 3,
    hasCheatingLogs: false,
    aiGenerated: true
  },
  {
    id: 2,
    title: "Data Structures Quiz",
    course: "Data Structures & Algorithms",
    courseCode: "CS-201",
    status: "ongoing",
    score: null,
    totalQuestions: 15,
    timeLimit: 45,
    difficulty: "Intermediate",
    dateAvailable: "2024-02-20",
    dueDate: "2024-02-27",
    description: "Evaluate your knowledge of linked lists and arrays",
    topics: ["Arrays", "Linked Lists", "Stacks", "Queues"],
    passingScore: 75,
    attempts: 0,
    maxAttempts: 2,
    hasCheatingLogs: false,
    aiGenerated: true
  },
  {
    id: 3,
    title: "Machine Learning Fundamentals",
    course: "Machine Learning Basics",
    courseCode: "CS-401",
    status: "upcoming",
    score: null,
    totalQuestions: 20,
    timeLimit: 60,
    difficulty: "Intermediate",
    dateAvailable: "2024-03-01",
    description: "Quiz on basic ML concepts and algorithms",
    topics: ["Linear Regression", "Classification", "Clustering"],
    passingScore: 80,
    attempts: 0,
    maxAttempts: 2,
    hasCheatingLogs: false,
    aiGenerated: true
  },
  {
    id: 4,
    title: "HTML/CSS Quiz",
    course: "Web Development Fundamentals",
    courseCode: "CS-302",
    status: "locked",
    score: null,
    totalQuestions: 12,
    timeLimit: 25,
    difficulty: "Beginner",
    unlockCondition: "Complete Lab 3",
    description: "Test your web development basics",
    topics: ["HTML Tags", "CSS Selectors", "Box Model"],
    passingScore: 70,
    attempts: 0,
    maxAttempts: 3,
    hasCheatingLogs: false,
    aiGenerated: false
  }
];

// Quiz Card Component
const QuizCard = ({ quiz, onStartQuiz, onViewResults }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'ongoing': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'upcoming': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'locked': return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
      default: return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'check_circle';
      case 'ongoing': return 'play_circle';
      case 'upcoming': return 'schedule';
      case 'locked': return 'lock';
      default: return 'help';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      <div className="p-5">
        {/* Quiz Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                quiz
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quiz.status)}`}>
                {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
              </span>
              {quiz.aiGenerated && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  AI-Generated
                </span>
              )}
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {quiz.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {quiz.courseCode} • {quiz.course}
            </p>
          </div>
          <div className="flex flex-col items-end">
            {quiz.score !== null ? (
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {quiz.score}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Score
                </div>
              </div>
            ) : (
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {quiz.totalQuestions} Qs
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {quiz.timeLimit} min
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quiz Info */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-400 text-sm">school</span>
              <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
              {quiz.difficulty}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-400 text-sm">question_answer</span>
              <span className="text-gray-600 dark:text-gray-400">Questions:</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">{quiz.totalQuestions}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-400 text-sm">schedule</span>
              <span className="text-gray-600 dark:text-gray-400">Time Limit:</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">{quiz.timeLimit} minutes</span>
          </div>

          {quiz.passingScore && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-sm">flag</span>
                <span className="text-gray-600 dark:text-gray-400">Passing Score:</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{quiz.passingScore}%</span>
            </div>
          )}

          {quiz.attempts > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-sm">repeat</span>
                <span className="text-gray-600 dark:text-gray-400">Attempts:</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {quiz.attempts}/{quiz.maxAttempts}
              </span>
            </div>
          )}
        </div>

        {/* Topics */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Topics Covered:</p>
          <div className="flex flex-wrap gap-1">
            {quiz.topics.map((topic, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
          {quiz.description}
        </p>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          {quiz.status === 'completed' ? (
            <div className="flex gap-2">
              <button
                onClick={() => onViewResults(quiz.id)}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">bar_chart</span>
                View Results
              </button>
              <button
                onClick={() => onStartQuiz(quiz.id)}
                className="flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={quiz.attempts >= quiz.maxAttempts}
                title={quiz.attempts >= quiz.maxAttempts ? "Max attempts reached" : "Retake quiz"}
              >
                <span className="material-symbols-outlined text-sm">replay</span>
              </button>
            </div>
          ) : quiz.status === 'ongoing' ? (
            <button
              onClick={() => onStartQuiz(quiz.id)}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">play_arrow</span>
              Continue Quiz
            </button>
          ) : quiz.status === 'upcoming' ? (
            <div className="space-y-2">
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Available from {quiz.dateAvailable}
              </div>
              <button
                className="w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed opacity-50"
                disabled
              >
                <span className="material-symbols-outlined text-sm">lock_clock</span>
                Not Available Yet
              </button>
            </div>
          ) : quiz.status === 'locked' ? (
            <div className="space-y-2">
              <div className="text-center text-sm text-red-600 dark:text-red-400">
                {quiz.unlockCondition}
              </div>
              <button
                className="w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed opacity-50"
                disabled
              >
                <span className="material-symbols-outlined text-sm">lock</span>
                Locked
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// Quiz Taking Component
const QuizTaking = ({ quiz, onComplete, onCancel }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60); // in seconds
  const [warnings, setWarnings] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock questions data
  const questions = [
    {
      id: 1,
      text: "What is the output of print(2 ** 3) in Python?",
      type: "multiple-choice",
      options: ["5", "6", "8", "9"],
      correctAnswer: "8",
      points: 10,
      explanation: "** is the exponentiation operator in Python."
    },
    {
      id: 2,
      text: "Which of the following are mutable data types in Python? (Select all that apply)",
      type: "multiple-select",
      options: ["List", "Tuple", "Dictionary", "String"],
      correctAnswers: ["List", "Dictionary"],
      points: 15,
      explanation: "Lists and dictionaries are mutable, while tuples and strings are immutable."
    },
    {
      id: 3,
      text: "Write a Python function to calculate the factorial of a number.",
      type: "code",
      language: "python",
      points: 25,
      testCases: [
        { input: "5", expected: "120" },
        { input: "0", expected: "1" }
      ]
    }
  ];

  // Tab switching detection (anti-cheating)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && warnings < 3) {
        setWarnings(prev => {
          const newWarnings = prev + 1;
          alert(`Warning ${newWarnings}/3: Do not switch tabs during quiz!`);
          if (newWarnings >= 3) {
            alert("Maximum warnings reached. Quiz will be submitted automatically.");
            handleSubmit();
          }
          return newWarnings;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [warnings]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate AI grading
    setTimeout(() => {
      const score = Math.floor(Math.random() * 30) + 70; // Mock score 70-100
      onComplete(score, warnings > 0);
    }, 2000);
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/50 dark:bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Quiz Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{quiz.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{quiz.courseCode}</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Time Display */}
              <div className={`px-3 py-1.5 rounded-lg font-mono font-bold ${
                timeLeft < 300 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              }`}>
                {formatTime(timeLeft)}
              </div>
              
              {/* Warnings */}
              {warnings > 0 && (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <span className="material-symbols-outlined">warning</span>
                  <span className="text-sm font-medium">Warnings: {warnings}/3</span>
                </div>
              )}
              
              <button
                onClick={onCancel}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">close</span>
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Question Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Question {currentQuestion + 1}
              </h3>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                {currentQ.points} points
              </span>
            </div>
            
            <p className="text-gray-800 dark:text-gray-200 mb-6 text-lg">{currentQ.text}</p>
            
            {/* Multiple Choice Question */}
            {currentQ.type === 'multiple-choice' && (
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      answers[currentQ.id] === option
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQ.id}`}
                      value={option}
                      checked={answers[currentQ.id] === option}
                      onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                      className="text-blue-600 dark:text-blue-400"
                    />
                    <span className="text-gray-800 dark:text-gray-200">{option}</span>
                  </label>
                ))}
              </div>
            )}
            
            {/* Multiple Select Question */}
            {currentQ.type === 'multiple-select' && (
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      answers[currentQ.id]?.includes(option)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={answers[currentQ.id]?.includes(option) || false}
                      onChange={(e) => {
                        const currentAnswers = answers[currentQ.id] || [];
                        const newAnswers = e.target.checked
                          ? [...currentAnswers, option]
                          : currentAnswers.filter(a => a !== option);
                        handleAnswerChange(currentQ.id, newAnswers);
                      }}
                      className="text-blue-600 dark:text-blue-400 rounded"
                    />
                    <span className="text-gray-800 dark:text-gray-200">{option}</span>
                  </label>
                ))}
              </div>
            )}
            
            {/* Code Question */}
            {currentQ.type === 'code' && (
              <div className="space-y-4">
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                    <span className="text-gray-300 text-sm font-mono">{currentQ.language}</span>
                    <button className="text-gray-400 hover:text-white text-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      Copy
                    </button>
                  </div>
                  <textarea
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    className="w-full h-64 bg-gray-900 text-gray-100 font-mono text-sm p-4 focus:outline-none resize-none"
                    placeholder={`Write your ${currentQ.language} code here...`}
                    spellCheck="false"
                  />
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Test Cases:</h4>
                  <div className="space-y-2">
                    {currentQ.testCases.map((testCase, index) => (
                      <div key={index} className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Input: </span>
                        <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">{testCase.input}</code>
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="text-gray-600 dark:text-gray-400">Expected: </span>
                        <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">{testCase.expected}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Question Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                currentQuestion === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="material-symbols-outlined">chevron_left</span>
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`size-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentQuestion === index
                      ? 'bg-blue-500 text-white'
                      : answers[questions[index].id]
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">check</span>
                    Submit Quiz
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Next
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Quiz Results Component
const QuizResults = ({ quiz, score, hasCheatingFlag, onClose, onRetake }) => {
  const passed = score >= quiz.passingScore;
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/50 dark:bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Quiz Results</h2>
              <p className="text-blue-100">{quiz.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <span className="material-symbols-outlined text-white">close</span>
            </button>
          </div>
        </div>
        
        {/* Results Content */}
        <div className="p-6">
          {/* Score Circle */}
          <div className="flex justify-center mb-6">
            <div className="relative size-48">
              <svg className="size-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={passed ? "#10b981" : "#ef4444"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - score / 100)}`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {score}%
                </span>
                <span className={`text-lg font-medium ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {passed ? 'PASSED' : 'FAILED'}
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  Passing: {quiz.passingScore}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.totalQuestions}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.attempts + 1}/{quiz.maxAttempts}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Attempts</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.timeLimit}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.difficulty}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Level</div>
            </div>
          </div>
          
          {/* Feedback */}
          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">lightbulb</span>
                AI Feedback
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
                {score >= 90
                  ? "Excellent work! You've mastered these concepts. Consider challenging yourself with more advanced topics."
                  : score >= 70
                  ? "Good job! You understand the main concepts. Review the topics where you lost points to improve."
                  : "Keep practicing! Focus on the fundamental concepts and try the recommended resources."}
              </p>
            </div>
            
            {hasCheatingFlag && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                <h4 className="font-medium text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500">warning</span>
                  Integrity Warning
                </h4>
                <p className="text-red-600 dark:text-red-400">
                  Multiple tab switches were detected during this attempt. Future violations may result in automatic quiz submission.
                </p>
              </div>
            )}
          </div>
          
          {/* Recommendations */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recommended Next Steps</h4>
            <div className="space-y-2">
              <button 
                onClick={() => navigate(`/courses/${quiz.courseCode.toLowerCase().replace('-', '')}`)}
                className="w-full text-left p-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 dark:text-gray-200">Review Course Material</span>
                  <span className="material-symbols-outlined text-gray-400">arrow_forward</span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 dark:text-gray-200">Practice Similar Questions</span>
                  <span className="material-symbols-outlined text-gray-400">arrow_forward</span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back to Quizzes
            </button>
            <button
              onClick={onRetake}
              disabled={quiz.attempts + 1 >= quiz.maxAttempts}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                quiz.attempts + 1 >= quiz.maxAttempts
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [showResults, setShowResults] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const navigate = useNavigate();

  // Filter quizzes based on selected filter and search
  const filteredQuizzes = quizzes.filter(quiz => {
    if (filter !== 'all' && quiz.status !== filter) return false;
    if (search && !quiz.title.toLowerCase().includes(search.toLowerCase()) && 
        !quiz.course.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleStartQuiz = (quizId) => {
    const quiz = quizzes.find(q => q.id === quizId);
    setActiveQuiz(quiz);
  };

  const handleViewResults = (quizId) => {
    const quiz = quizzes.find(q => q.id === quizId);
    setShowResults(quiz);
  };

  const handleCompleteQuiz = (quizId, score, hasCheatingFlag) => {
    setQuizzes(prev => prev.map(quiz => 
      quiz.id === quizId 
        ? { 
            ...quiz, 
            status: 'completed',
            score,
            attempts: quiz.attempts + 1,
            dateCompleted: new Date().toISOString().split('T')[0],
            hasCheatingLogs: hasCheatingFlag || quiz.hasCheatingLogs
          }
        : quiz
    ));
    setActiveQuiz(null);
    setResultsData({ score, hasCheatingFlag });
    setTimeout(() => {
      const updatedQuiz = quizzes.find(q => q.id === quizId);
      setShowResults({...updatedQuiz, score, attempts: updatedQuiz.attempts + 1});
    }, 100);
  };

  const handleGenerateQuiz = () => {
    // Simulate AI-generated quiz
    const newQuiz = {
      id: quizzes.length + 1,
      title: "AI-Generated Quiz: Python Functions",
      course: "Introduction to Python Programming",
      courseCode: "CS-101",
      status: "upcoming",
      score: null,
      totalQuestions: 8,
      timeLimit: 20,
      difficulty: "Beginner",
      dateAvailable: "2024-02-22",
      description: "AI-generated quiz focusing on Python functions and scope",
      topics: ["Functions", "Parameters", "Return Values", "Scope"],
      passingScore: 70,
      attempts: 0,
      maxAttempts: 2,
      hasCheatingLogs: false,
      aiGenerated: true
    };
    
    setQuizzes(prev => [...prev, newQuiz]);
    alert("AI has generated a new personalized quiz for you!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Quizzes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Take AI-generated quizzes and track your performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleGenerateQuiz}
            className="flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg text-white bg-purple-600 hover:bg-purple-700 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            AI Generate Quiz
          </button>
          <button className="flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <span className="material-symbols-outlined text-base">leaderboard</span>
            View Analytics
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-12 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <span className="material-symbols-outlined text-2xl text-blue-600 dark:text-blue-400">quiz</span>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Quizzes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {quizzes.filter(q => q.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-12 rounded-lg bg-green-100 dark:bg-green-900/30">
              <span className="material-symbols-outlined text-2xl text-green-600 dark:text-green-400">trending_up</span>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(
                  quizzes
                    .filter(q => q.score)
                    .reduce((sum, q) => sum + q.score, 0) / 
                  (quizzes.filter(q => q.score).length || 1)
                )}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <span className="material-symbols-outlined text-2xl text-yellow-600 dark:text-yellow-400">pending</span>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {quizzes.filter(q => q.status === 'ongoing' || q.status === 'upcoming').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-12 rounded-lg bg-red-100 dark:bg-red-900/30">
              <span className="material-symbols-outlined text-2xl text-red-600 dark:text-red-400">warning</span>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Integrity Issues</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {quizzes.filter(q => q.hasCheatingLogs).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                type="text"
                placeholder="Search quizzes by title or course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Quizzes
              </button>
              <button
                onClick={() => setFilter('ongoing')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'ongoing'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Ongoing
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'upcoming'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'completed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>

        {/* Quizzes Grid */}
        <div className="p-4">
          {filteredQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredQuizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onStartQuiz={handleStartQuiz}
                  onViewResults={handleViewResults}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
                quiz
              </span>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Quizzes Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {search ? 'Try a different search term' : 'No quizzes available for the selected filter'}
              </p>
              <button 
                onClick={() => { setFilter('all'); setSearch(''); }}
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Quiz Modal */}
      {activeQuiz && (
        <QuizTaking
          quiz={activeQuiz}
          onComplete={(score, hasCheatingFlag) => handleCompleteQuiz(activeQuiz.id, score, hasCheatingFlag)}
          onCancel={() => setActiveQuiz(null)}
        />
      )}

      {/* Results Modal */}
      {showResults && (
        <QuizResults
          quiz={showResults}
          score={resultsData?.score || showResults.score}
          hasCheatingFlag={resultsData?.hasCheatingFlag || showResults.hasCheatingLogs}
          onClose={() => setShowResults(null)}
          onRetake={() => {
            setShowResults(null);
            handleStartQuiz(showResults.id);
          }}
        />
      )}
    </div>
  );
};

export default Quizzes;