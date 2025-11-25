import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  // ========== STATE MANAGEMENT ==========
  
  /**
   * Manages form data for the password reset request
   */
  const [formData, setFormData] = useState({
    email: "",
  });

  const [errors, setErrors] = useState({}); // Stores validation errors
  const [isSubmitted, setIsSubmitted] = useState(false); // Tracks if form was submitted successfully
  const [loading, setLoading] = useState(false); // Manages loading state during API call
  const navigate = useNavigate(); // React Router navigation hook

  // ========== ANIMATION STATES ==========
  const [animateLock, setAnimateLock] = useState(false);
  const [animateTitle, setAnimateTitle] = useState(false);
  const [animateTagline, setAnimateTagline] = useState(false);

  // ========== NAVIGATION HANDLERS ==========

  /**
   * Navigates back to the login page
   */
  const handleBackToLogin = () => {
    navigate('/login');
  };

  // ========== FORM HANDLERS ==========

  /**
   * Handles input changes for the email field
   * @param {Object} e - Event object from input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * Validates the email form field
   * @returns {Object} - Object containing field errors
   */
  const validateForm = () => {
    const newErrors = {};

    // Email validation - required and format check
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    return newErrors;
  };

  /**
   * Handles form submission for password reset request
   * @param {Object} e - Event object from form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length === 0) {
      setLoading(true);
      
      // Simulate API call to backend service
      setTimeout(() => {
        console.log("Password reset requested for:", formData.email);
        setLoading(false);
        setIsSubmitted(true);
        
        // Reset form after successful submission
        setFormData({ email: "" });
      }, 1500);
    } else {
      setErrors(formErrors);
    }
  };

  // ========== ANIMATION EFFECTS ==========

  /**
   * Triggers brand animations on component mount with staggered timing
   */
  useEffect(() => {
    // Staggered animations for brand elements
    const timer1 = setTimeout(() => setAnimateLock(true), 300);
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
              animateLock 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-50'
            }`}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "2.5rem" }}
              >
                lock_reset
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
              Reset your password securely
            </p>
          </div>
        </div>

        {/* Desktop Brand Section */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 w-1/2 p-8 lg:p-12 text-center">
          <div className="flex flex-col items-center gap-6 max-w-md">
            {/* Brand Icon */}
            <div className={`mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 text-white transition-all duration-700 transform ${
              animateLock 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-50'
            }`}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "3rem" }}
              >
                lock_reset
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
              Reset your password securely
            </p>

            {/* Feature Highlights */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {["Secure Reset", "Instant Delivery", "24/7 Support", "Easy Process"].map((feature, index) => (
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

        {/* ========== RIGHT SIDE - FORGOT PASSWORD FORM ========== */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md space-y-6 sm:space-y-8">
            
            {/* Header Section */}
            <div className="text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Forgot Password?
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
                {isSubmitted 
                  ? "Check your email for reset instructions" 
                  : "Enter your email and we'll send you reset instructions"
                }
              </p>
            </div>

            {/* Conditional Rendering: Form vs Success State */}
            {!isSubmitted ? (
              
              /* ========== PASSWORD RESET REQUEST FORM ========== */
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                
                {/* Email Input Field */}
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      className={`w-full px-3 py-3 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.email
                          ? "border-red-500 bg-white dark:bg-gray-800"
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      }`}
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      type="email"
                    />
                  </div>
                  {/* Email Error Message */}
                  {errors.email && (
                    <p className="text-sm text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* ========== SUBMIT BUTTONS ========== */}
                <div className="space-y-3 sm:space-y-4">
                  
                  {/* Primary Submit Button with Loading State */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      "Send Reset Instructions"
                    )}
                  </button>
                  
                  {/* Secondary Back to Login Button */}
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
              
              /* ========== SUCCESS STATE ========== */
              <div className="text-center space-y-4 sm:space-y-6">
                
                {/* Success Icon */}
                <div className="flex justify-center">
                  <div className="flex items-center justify-center text-green-600 h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-green-100">
                    <span className="material-symbols-outlined text-2xl sm:text-3xl">
                      check_circle
                    </span>
                  </div>
                </div>
                
                {/* Success Messages */}
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    We've sent password reset instructions to your email address.
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                    Didn't receive the email? Check your spam folder or{" "}
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="text-blue-600 hover:text-blue-500"
                    >
                      try again
                    </button>
                  </p>
                </div>

                {/* Return to Login Button */}
                <button
                  onClick={handleBackToLogin}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Return to Login
                </button>
              </div>
            )}

           
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;