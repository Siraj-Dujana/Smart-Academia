import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const Register = () => {
  // ========== STATE MANAGEMENT ==========
  
  /**
   * Manages form data for role selection and terms acceptance
   */
  const [formData, setFormData] = useState({
    role: "student", // Default role selection
    terms: false,    // Terms and conditions acceptance
  });

  const [errors, setErrors] = useState({}); // Stores validation errors
  const navigate = useNavigate(); // React Router navigation hook

  // ========== ANIMATION STATES ==========
  const [animateSchool, setAnimateSchool] = useState(false);
  const [animateTitle, setAnimateTitle] = useState(false);
  const [animateTagline, setAnimateTagline] = useState(false);

  // ========== NAVIGATION HANDLERS ==========

  /**
   * Navigates to student registration form
   */
  const handleStudentRegister = () => {
    if (formData.terms) {
      navigate('/register/student');
    } else {
      setErrors({ terms: "You must accept the terms and conditions" });
    }
  };

  /**
   * Navigates to teacher registration form
   */
  const handleTeacherRegister = () => {
    if (formData.terms) {
      navigate('/register/teacher');
    } else {
      setErrors({ terms: "You must accept the terms and conditions" });
    }
  };

  /**
   * Navigates back to login page
   */
  const handleBackToLogin = () => {
    navigate('/login');
  };

  // ========== FORM HANDLERS ==========

  /**
   * Handles role selection with validation
   * @param {string} role - Selected role ('student' or 'teacher')
   */
  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    // Clear terms error when role is selected
    if (errors.terms) {
      setErrors((prev) => ({ ...prev, terms: "" }));
    }
  };

  /**
   * Handles terms acceptance
   */
  const handleTermsAccept = () => {
    const newTermsValue = !formData.terms;
    setFormData((prev) => ({ ...prev, terms: newTermsValue }));
    if (errors.terms) {
      setErrors((prev) => ({ ...prev, terms: "" }));
    }
  };

  // ========== ANIMATION EFFECTS ==========

  /**
   * Triggers brand animations on component mount with staggered timing
   */
  useEffect(() => {
    // Staggered animations for brand elements
    const timer1 = setTimeout(() => setAnimateSchool(true), 300);
    const timer2 = setTimeout(() => setAnimateTitle(true), 600);
    const timer3 = setTimeout(() => setAnimateTagline(true), 900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-white">
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* ========== LEFT SIDE - BRAND SECTION ========== */}
        {/* Show on mobile but with different layout */}
        <div className="lg:hidden flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 p-6 sm:p-8 text-center">
          <div className="flex flex-col items-center gap-4 max-w-md w-full">
            {/* Brand Icon */}
            <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white transition-all duration-700 transform ${
              animateSchool 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-50'
            }`}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "2.5rem" }}
              >
                school
              </span>
            </div>
            
            {/* Brand Title */}
            <h1 className={`text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white transition-all duration-700 transform ${
              animateTitle 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-4'
            }`}>
              Smart Academia
            </h1>
            
            {/* Brand Tagline */}
            <p className={`text-lg text-gray-600 dark:text-gray-300 transition-all duration-700 delay-300 ${
              animateTagline 
                ? 'opacity-100' 
                : 'opacity-0'
            }`}>
              Your Academic Journey, Amplified by AI.
            </p>
          </div>
        </div>

        {/* Desktop Brand Section */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 w-1/2 p-8 lg:p-12 text-center">
          <div className="flex flex-col items-center gap-6 max-w-md">
            {/* Brand Icon */}
            <div className={`mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 text-white transition-all duration-700 transform ${
              animateSchool 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-50'
            }`}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "3rem" }}
              >
                school
              </span>
            </div>
            
            {/* Brand Title */}
            <h1 className={`text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white transition-all duration-700 transform ${
              animateTitle 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}>
              Smart Academia
            </h1>
            
            {/* Brand Tagline */}
            <p className={`text-xl text-gray-600 dark:text-gray-300 transition-all duration-700 delay-300 ${
              animateTagline 
                ? 'opacity-100' 
                : 'opacity-0'
            }`}>
              Your Academic Journey, Amplified by AI.
            </p>

            {/* Feature Highlights */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {["AI Powered", "Smart Learning", "24/7 Support", "Secure"].map((feature, index) => (
                <span 
                  key={feature}
                  className="px-3 py-2 bg-white dark:bg-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-sm transition-all duration-500"
                  style={{ 
                    animationDelay: `${1200 + index * 200}ms`,
                    opacity: animateTagline ? 1 : 0,
                    transform: animateTagline ? 'translateY(0)' : 'translateY(10px)'
                  }}
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ========== RIGHT SIDE - REGISTRATION FORM ========== */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md space-y-6 sm:space-y-8">
            
            {/* Header Section - Hidden on mobile since we show brand section */}
            <div className="text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Join Smart Academia
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
                Choose your role to get started
              </p>
            </div>

            {/* ========== ROLE SELECTION CARDS ========== */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              
              {/* Student Role Card */}
              <div 
                className={`p-4 sm:p-6 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 ${
                  formData.role === 'student' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500'
                }`}
                onClick={() => handleRoleSelect('student')}
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  {/* Student Icon */}
                  <div className="flex items-center justify-center text-blue-600 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 flex-shrink-0">
                    <span className="material-symbols-outlined text-xl sm:text-2xl">
                      school
                    </span>
                  </div>
                  {/* Student Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                      Student
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      Join as a student to access learning materials, assignments, and AI-powered study assistance.
                    </p>
                  </div>
                  {/* Selection Indicator */}
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    formData.role === 'student' 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300 dark:border-gray-500'
                  }`}>
                    {formData.role === 'student' && (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Teacher Role Card */}
              <div 
                className={`p-4 sm:p-6 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 ${
                  formData.role === 'teacher' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500'
                }`}
                onClick={() => handleRoleSelect('teacher')}
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  {/* Teacher Icon */}
                  <div className="flex items-center justify-center text-blue-600 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 flex-shrink-0">
                    <span className="material-symbols-outlined text-xl sm:text-2xl">
                      person
                    </span>
                  </div>
                  {/* Teacher Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                      Teacher
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      Join as an educator to create courses, manage classes, and provide AI-enhanced teaching.
                    </p>
                  </div>
                  {/* Selection Indicator */}
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    formData.role === 'teacher' 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300 dark:border-gray-500'
                  }`}>
                    {formData.role === 'teacher' && (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ========== TERMS AND CONDITIONS ========== */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start space-x-3">
                <input
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5 flex-shrink-0"
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={formData.terms}
                  onChange={handleTermsAccept}
                />
                <label
                  className="text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                  htmlFor="terms"
                >
                  I agree to the{" "}
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Terms & Privacy Policy
                  </a>
                </label>
              </div>
              {errors.terms && (
                <p className="text-xs sm:text-sm text-red-600">
                  {errors.terms}
                </p>
              )}
            </div>

            {/* ========== CONTINUE BUTTON ========== */}
            <button
              onClick={formData.role === 'student' ? handleStudentRegister : handleTeacherRegister}
              disabled={!formData.terms}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Continue as {formData.role === 'student' ? 'Student' : 'Teacher'}
            </button>

            {/* ========== BACK TO LOGIN BUTTON ========== */}
            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Back to Login
            </button>

            {/* ========== LOGIN LINK ========== */}
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <button 
                  onClick={handleBackToLogin}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;