import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleRegister = () => {
    navigate("/register");
    setMobileMenuOpen(false);
  };

  const handleLogin = () => {
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const CourseCard = ({ title, level, levelColor, description }) => {
    return (
      <div className="relative group flex flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 flex-col shadow-sm cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
        <div className="flex flex-col gap-3 sm:gap-4 flex-grow">
          <div className="flex items-center justify-between flex-col sm:flex-row gap-2 sm:gap-0">
            <h3 className="text-base sm:text-lg font-bold leading-tight text-center sm:text-left group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
            <span className={`inline-flex items-center rounded-full ${levelColor} px-2.5 py-0.5 text-xs font-medium transform group-hover:scale-110 transition-transform duration-300`}>
              {level}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-normal leading-normal text-gray-600 dark:text-gray-400 flex-grow group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300 text-center sm:text-left">
            {description}
          </p>
        </div>
        <button 
          className="mt-4 sm:mt-6 w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 group-hover:shadow-lg"
          onClick={handleRegister}
        >
          <span className="truncate">Enroll Now</span>
        </button>
      </div>
    );
  };

  const FeatureCard = ({ icon, title, description }) => {
    return (
      <div className="flex flex-1 gap-3 sm:gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 flex-col shadow-sm cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 group">
        <div className="text-blue-600 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
          <span className="material-symbols-outlined text-3xl sm:text-4xl">{icon}</span>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-base sm:text-lg font-bold leading-tight group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
          <p className="text-xs sm:text-sm font-normal leading-normal text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
            {description}
          </p>
        </div>
      </div>
    );
  };

  const ChallengeCard = ({ icon, title, challenges, color }) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 group">
        <div className="flex items-center gap-3 mb-4">
          <span className={`material-symbols-outlined text-xl sm:text-2xl ${color} transform group-hover:scale-110 transition-transform duration-300`}>{icon}</span>
          <h3 className="text-lg sm:text-xl font-bold group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
        </div>
        <ul className="space-y-2 sm:space-y-3 text-gray-600 dark:text-gray-400">
          {challenges.map((challenge, index) => (
            <li key={index} className="flex items-start gap-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
              <span className="text-blue-500 text-sm sm:text-lg mt-0.5">•</span>
              <span className="text-xs sm:text-sm">{challenge}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const StepCard = ({ number, icon, title, description }) => {
    return (
      <div className="flex flex-col items-center text-center gap-3 sm:gap-4 group">
        <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-600/20 text-blue-600 mb-2 sm:mb-4 transition-all duration-500 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg">
          <span className="material-symbols-outlined text-xl sm:text-3xl">{icon}</span>
        </div>
        <h3 className="text-base sm:text-lg font-bold group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">{description}</p>
      </div>
    );
  };

  const BenefitCard = ({ icon, title, description }) => {
    return (
      <div className="flex flex-1 gap-3 sm:gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 flex-col shadow-sm cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 group">
        <div className="text-blue-600 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
          <span className="material-symbols-outlined text-3xl sm:text-4xl">{icon}</span>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-base sm:text-lg font-bold leading-tight group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
          <p className="text-xs sm:text-sm font-normal leading-normal text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
            {description}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-white">
      {/* Scroll to Top Button with Chatbot */}
{/* Chatbot Icon - Bottom Left */}
<div className="fixed bottom-6 left-6 z-50">
  <button
    onClick={() => navigate("/chat")}
    className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transform hover:scale-110 transition-all duration-300 group animate-bounce hover:animate-none"
  >
    <span className="material-symbols-outlined text-xl sm:text-2xl">smart_toy</span>
    
    {/* Pulsing Ring Effect */}
    <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    {/* Notification Dot */}
    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
    
    {/* Tooltip */}
    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg">
      AI Chat Assistant
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-800 rotate-45"></div>
    </div>
  </button>
</div>

{/* Scroll to Top Button - Bottom Right */}
{showScrollTop && (
  <button
    onClick={scrollToTop}
    className="fixed bottom-6 right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transform hover:scale-110 transition-all duration-300 animate-bounce hover:animate-none"
  >
    <span className="material-symbols-outlined text-xl sm:text-2xl">arrow_upward</span>
    
    {/* Tooltip */}
    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg">
      Scroll to Top
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-800 rotate-45"></div>
    </div>
  </button>
)}
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="material-symbols-outlined text-blue-600 text-2xl sm:text-3xl animate-pulse">school</span>
              <h2 className="text-lg sm:text-xl font-bold">SmartAcademia</h2>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-9">
              <a className="text-sm font-medium hover:text-blue-600 transition-colors duration-300 transform hover:-translate-y-1" href="#features">Features</a>
              <a className="text-sm font-medium hover:text-blue-600 transition-colors duration-300 transform hover:-translate-y-1" href="#how-it-works">How It Works</a>
              <a className="text-sm font-medium hover:text-blue-600 transition-colors duration-300 transform hover:-translate-y-1" href="#courses">Courses</a>
              <a className="text-sm font-medium hover:text-blue-600 transition-colors duration-300 transform hover:-translate-y-1" href="#solutions">Solutions</a>
            </nav>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              <button 
                onClick={handleLogin}
                className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-300 transform hover:-translate-y-1"
              >
                Login
              </button>
              <button 
                onClick={handleRegister}
                className="px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                Register
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors duration-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="material-symbols-outlined transform transition-transform duration-300">
                  {mobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-14 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg animate-slideDown">
              <div className="px-4 py-4 space-y-3">
                <a 
                  className="block text-sm font-medium hover:text-blue-600 transition-colors duration-300 py-2 transform hover:translate-x-2"
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  className="block text-sm font-medium hover:text-blue-600 transition-colors duration-300 py-2 transform hover:translate-x-2"
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </a>
                <a 
                  className="block text-sm font-medium hover:text-blue-600 transition-colors duration-300 py-2 transform hover:translate-x-2"
                  href="#courses"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Courses
                </a>
                <a 
                  className="block text-sm font-medium hover:text-blue-600 transition-colors duration-300 py-2 transform hover:translate-x-2"
                  href="#solutions"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Solutions
                </a>
                <div className="flex flex-col gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={handleLogin}
                    className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-300 text-left transform hover:translate-x-2"
                  >
                    Login
                  </button>
                  <button 
                    onClick={handleRegister}
                    className="w-full px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Register
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
              <div className="flex flex-col gap-4 sm:gap-6 text-center lg:text-left animate-fadeInUp">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight tracking-[-0.033em]">
                  Revolutionize Learning with AI
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-normal leading-normal text-gray-600 dark:text-gray-400">
                  SmartAcademia empowers students to master complex topics with personalized AI support, while giving teachers powerful tools to automate grading and track progress.
                </p>
                <div className="flex justify-center lg:justify-start mt-4">
                  <button 
                    onClick={handleRegister}
                    className="flex min-w-[160px] sm:min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 sm:h-12 px-6 sm:px-8 bg-blue-600 text-white text-sm sm:text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <span>Get Started Free</span>
                  </button>
                </div>
              </div>
              
          <div className="w-full aspect-[3/1] xs:aspect-[2/1] sm:aspect-[5/2] md:aspect-[3/1] lg:aspect-video rounded-lg sm:rounded-xl flex items-center justify-center order-first lg:order-last relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/20">
  {/* Icons Container */}
  <div className="relative w-full h-full flex items-center justify-center p-2 xs:p-3 sm:p-4">
    
    {/* AI Brain - Top Left */}
    <div className="absolute left-[5%] xs:left-[8%] sm:left-[10%] top-[15%] xs:top-[18%] sm:top-[20%] w-12 h-12 xs:w-15 xs:h-15 sm:w-20 sm:h-20 md:w-25 md:h-25 lg:w-20 lg:h-20 bg-blue-500 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-md sm:shadow-lg transform animate-float-1 z-10">
      <span className="material-symbols-outlined text-white text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl">psychology</span>
    </div>
    
    {/* Code Assistant - Top Right */}
    <div className="absolute right-[5%] xs:right-[8%] sm:right-[10%] top-[15%] xs:top-[18%] sm:top-[20%] w-12 h-12 xs:w-15 xs:h-15 sm:w-20 sm:h-20 md:w-25 md:h-25 lg:w-20 lg:h-20 bg-blue-500 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-md sm:shadow-lg transform animate-float-2 z-10">
      <span className="material-symbols-outlined text-white text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl">code</span>
    </div>
    
    {/* Progress Analytics - Bottom Center */}
    <div className="absolute left-1/2 bottom-[15%] xs:bottom-[18%] sm:bottom-[20%] w-12 h-12 xs:w-15 xs:h-15 sm:w-20 sm:h-20 md:w-25 md:h-25 lg:w-24 lg:h-24 bg-blue-500 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-md sm:shadow-lg transform animate-float-3 z-10 -translate-x-1/2">
      <span className="material-symbols-outlined text-white text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl">smart_toy</span>
    </div>
    
    
    
    {/* Floating AI Elements */}
    <div className="absolute w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-blue-400 rounded-full opacity-60 animate-float-1" style={{ left: '10%', xs: '12%', sm: '15%', top: '10%', xs: '12%', sm: '15%' }}></div>
    <div className="absolute w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-blue-400 rounded-full opacity-60 animate-float-2" style={{ right: '10%', xs: '12%', sm: '15%', top: '10%', xs: '12%', sm: '15%' }}></div>
    <div className="absolute w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-blue-400 rounded-full opacity-60 animate-float-3" style={{ left: '5%', xs: '8%', sm: '10%', top: '45%', xs: '48%', sm: '50%' }}></div>
    <div className="absolute w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-blue-400 rounded-full opacity-60 animate-float-1" style={{ right: '5%', xs: '8%', sm: '10%', top: '45%', xs: '48%', sm: '50%' }}></div>
    <div className="absolute w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-blue-400 rounded-full opacity-60 animate-float-2" style={{ left: '18%', xs: '20%', sm: '25%', bottom: '10%', xs: '12%', sm: '15%' }}></div>
    <div className="absolute w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-blue-400 rounded-full opacity-60 animate-float-3" style={{ right: '18%', xs: '20%', sm: '25%', bottom: '10%', xs: '12%', sm: '15%' }}></div>
    
    {/* Data Flow Lines */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute left-[15%] xs:left-[20%] sm:left-[25%] top-[20%] xs:top-[25%] sm:top-[30%] right-[15%] xs:right-[20%] sm:right-[25%] h-0.5 bg-gradient-to-r from-blue-400/30 to-green-400/30 animate-pulse"></div>
      <div className="absolute left-1/2 top-[30%] xs:top-[35%] sm:top-[40%] bottom-[20%] xs:bottom-[25%] sm:bottom-[30%] w-0.5 bg-gradient-to-b from-blue-400/30 to-purple-400/30 animate-pulse"></div>
    </div>
  </div>
</div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section id="solutions" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto flex flex-col gap-8 sm:gap-10">
            <div className="flex flex-col gap-3 sm:gap-4 text-center max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em]">
                The Challenges in Modern Education
              </h2>
              <p className="text-sm sm:text-base font-normal leading-normal text-gray-600 dark:text-gray-400">
                Addressing the core issues that hinder effective learning and teaching
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <ChallengeCard
                icon="school"
                title="Students Struggle With"
                challenges={[
                  "No timely feedback on coding labs and assignments",
                  "Lack of structured, progressive learning paths",
                  "Difficulty tracking academic performance",
                  "Limited access to personalized learning resources"
                ]}
                color="text-red-500"
              />
              <ChallengeCard
                icon="groups"
                title="Teachers Face"
                challenges={[
                  "Excessive time spent on manual grading",
                  "Difficulty monitoring student progress",
                  "Limited tools for interactive content",
                  "Challenges in maintaining academic integrity"
                ]}
                color="text-orange-500"
              />
            </div>
          </div>
        </section>

        {/* Course Highlights */}
        <section id="courses" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto flex flex-col gap-8 sm:gap-10">
            <div className="flex flex-col gap-3 sm:gap-4 text-center max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em]">Course Highlights</h2>
              <p className="text-sm sm:text-base font-normal leading-normal text-gray-600 dark:text-gray-400">
                Explore our curated selection of courses designed to elevate your skills.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <CourseCard
                title="Introduction to Python"
                level="Beginner"
                levelColor="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                description="Learn the fundamentals of Python programming, from variables to object-oriented principles."
              />
              <CourseCard
                title="Machine Learning"
                level="Intermediate"
                levelColor="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                description="Dive into machine learning concepts, algorithms, and practical applications with real-world datasets."
              />
              <CourseCard
                title="Advanced AI Systems"
                level="Expert"
                levelColor="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
                description="Master advanced AI topics including neural networks, deep learning, and reinforcement learning."
              />
            </div>
          </div>
        </section>

        {/* Dual Module Features */}
        <section id="features" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto flex flex-col gap-8 sm:gap-10">
            <div className="flex flex-col gap-3 sm:gap-4 text-center max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em]">
                One Platform, Two Powerful Experiences
              </h2>
            </div>

            {/* Student Features */}
            <div className="mb-8 sm:mb-12">
              <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 justify-center">
                <span className="material-symbols-outlined text-blue-600 text-2xl sm:text-3xl">school</span>
                <h3 className="text-xl sm:text-2xl font-bold text-center">For Students: Your Learning Companion</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <FeatureCard
                  icon="auto_stories"
                  title="Interactive Lessons"
                  description="Engaging multimedia content in structured learning paths"
                />
                <FeatureCard
                  icon="quiz"
                  title="AI-Powered Quizzes"
                  description="Intelligent assessments with instant feedback"
                />
                <FeatureCard
                  icon="terminal"
                  title="Auto-Graded Coding Labs"
                  description="Real-time code evaluation and feedback"
                />
                <FeatureCard
                  icon="analytics"
                  title="Progress Analyzer"
                  description="Visual insights into your learning journey"
                />
                <FeatureCard
                  icon="smart_toy"
                  title="AI Tutor Chatbot"
                  description="24/7 personalized learning assistance"
                />
                <FeatureCard
                  icon="security"
                  title="Anti-Cheating System"
                  description="Ensuring academic integrity in assessments"
                />
              </div>
            </div>

            {/* Teacher Features */}
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 justify-center">
                <span className="material-symbols-outlined text-blue-600 text-2xl sm:text-3xl">groups</span>
                <h3 className="text-xl sm:text-2xl font-bold text-center">For Teachers: Your Command Center</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <FeatureCard
                  icon="library_books"
                  title="Course Management"
                  description="Create and organize engaging course content"
                />
                <FeatureCard
                  icon="assignment"
                  title="Lab Management"
                  description="Define and manage coding assignments"
                />
                <FeatureCard
                  icon="grade"
                  title="Automated Grading"
                  description="Save time with AI-powered assessment"
                />
                <FeatureCard
                  icon="monitoring"
                  title="Student Monitoring"
                  description="Track progress and identify needs"
                />
                <FeatureCard
                  icon="notifications"
                  title="Announcements"
                  description="Communicate effectively with students"
                />
                <FeatureCard
                  icon="admin_panel_settings"
                  title="Academic Integrity"
                  description="Maintain fair assessment practices"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Competitive Advantage */}
        <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-3 sm:gap-4 text-center max-w-3xl mx-auto mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em]">
                Why Choose SmartAcademia?
              </h2>
              <p className="text-sm sm:text-base font-normal leading-normal text-gray-600 dark:text-gray-400">
                We fill the gaps that other platforms miss
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <BenefitCard
                icon="auto_awesome"
                title="AI-Powered"
                description="Personalized learning beyond static content"
              />
              <BenefitCard
                icon="code"
                title="Auto-Graded Labs"
                description="Instant feedback on coding assignments"
              />
              <BenefitCard
                icon="group"
                title="Dual Platform"
                description="Complete ecosystem for students & teachers"
              />
              <BenefitCard
                icon="security"
                title="Anti-Cheating"
                description="Built-in integrity measures for fair assessment"
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto flex flex-col gap-8 sm:gap-12 items-center">
            <div className="flex flex-col gap-3 sm:gap-4 text-center max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em]">How It Works</h2>
              <p className="text-sm sm:text-base font-normal leading-normal text-gray-600 dark:text-gray-400">
                Get started in just a few simple steps and unlock your full learning potential.
              </p>
            </div>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <StepCard
                number="1"
                icon="person_add"
                title="Register"
                description="Create your account as a student or a teacher."
              />
              <StepCard
                number="2"
                icon="search"
                title="Select Course"
                description="Browse our extensive library and enroll in a course."
              />
              <StepCard
                number="3"
                icon="laptop_mac"
                title="Learn & Practice"
                description="Engage with lessons, complete labs, and take quizzes."
              />
              <StepCard
                number="4"
                icon="monitoring"
                title="Track Progress"
                description="See your performance and get insights from the dashboard."
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-blue-600">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex flex-col gap-4 sm:gap-6 items-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em]">
                Ready to Transform Education?
              </h2>
              <p className="max-w-2xl text-blue-100 text-sm sm:text-lg">
                Join the future of learning with AI-powered education platform
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 justify-center">
                <button 
                  onClick={handleRegister}
                  className="flex min-w-[140px] sm:min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 sm:h-12 px-4 sm:px-5 bg-white text-blue-600 text-sm sm:text-base font-bold leading-normal tracking-[0.015em] hover:bg-gray-200 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span className="truncate">Get Started Free</span>
                </button>
                <button 
                  onClick={handleLogin}
                  className="flex min-w-[140px] sm:min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 sm:h-12 px-4 sm:px-5 bg-transparent text-white text-sm sm:text-base font-bold leading-normal tracking-[0.015em] border border-white/50 hover:bg-white/10 transform hover:scale-105 transition-all duration-300"
                >
                  <span className="truncate">Login to Account</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="material-symbols-outlined text-blue-600 text-xl sm:text-2xl">school</span>
                <h2 className="text-base sm:text-lg font-bold">SmartAcademia</h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">AI-powered learning for the future.</p>
            </div>
            <div>
              <h3 className="font-bold mb-2 sm:mb-4 text-sm sm:text-base">Platform</h3>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <li><a className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors duration-300" href="#features">Features</a></li>
                <li><a className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors duration-300" href="#courses">Courses</a></li>
                <li><a className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors duration-300" href="#solutions">Solutions</a></li>
                <li><a className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors duration-300" href="#how-it-works">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2 sm:mb-4 text-sm sm:text-base">Company</h3>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <li><a className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors duration-300" href="#">About Us</a></li>
                <li><a className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors duration-300" href="#">Careers</a></li>
                <li><a className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors duration-300" href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2 sm:mb-4 text-sm sm:text-base">Legal</h3>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <li><a className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors duration-300" href="#">Terms of Service</a></li>
                <li><a className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors duration-300" href="#">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 sm:mt-12 border-t border-gray-200 dark:border-gray-700 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">© 2025 SmartAcademia. All rights reserved.</p>
            <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-0">
              <a className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors duration-300 transform hover:scale-110" href="#">
                <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors duration-300 transform hover:scale-110" href="#">
                <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors duration-300 transform hover:scale-110" href="#">
                <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect height="12" width="4" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;