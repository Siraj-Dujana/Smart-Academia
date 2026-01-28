import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  // State management for form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({}); // Stores validation errors
  const [shake, setShake] = useState({}); // Controls shake animations for fields
  const [isLoading, setIsLoading] = useState(false); // Loading state for login
  const navigate = useNavigate(); // React Router navigation hook

  // ========== ANIMATION STATES ==========
  const [animateSchool, setAnimateSchool] = useState(false);
  const [animateTitle, setAnimateTitle] = useState(false);
  const [animateTagline, setAnimateTagline] = useState(false);

  // ========== NAVIGATION HANDLERS ==========
  
  /**
   * Navigates to the registration page
   */
  const handleRegister = () => {
    navigate("/register");
  };

  /**
   * Navigates to the forgot password page
   */
  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  // ========== FORM HANDLERS ==========

  /**
   * Handles input changes for all form fields
   * @param {Object} e - Event object from input change
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox differently from text inputs
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error and shake when user starts typing in a field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
      setShake((prev) => ({ ...prev, [name]: false }));
    }
  };

  /**
   * Validates the form and returns error objects
   * @returns {Object} - Object containing field errors
   */
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  /**
   * Triggers shake animation for specific field
   * @param {string} fieldName - Field to shake
   */
  const triggerShake = (fieldName) => {
    setShake((prev) => ({ ...prev, [fieldName]: true }));
    setTimeout(() => {
      setShake((prev) => ({ ...prev, [fieldName]: false }));
    }, 500);
  };

  /**
   * Handles form submission
   * @param {Object} e - Event object from form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length === 0) {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Login submitted:", formData);
      setIsLoading(false);
      
      alert("Login successful!");
      // navigate('/dashboard');
    } else {
      setErrors(formErrors);
      // Trigger shake animations for fields with errors
      Object.keys(formErrors).forEach(field => {
        triggerShake(field);
      });
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

        {/* ========== RIGHT SIDE - LOGIN FORM ========== */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md space-y-6 sm:space-y-8">
            
            {/* Header Section - Hidden on mobile since we show brand section */}
            <div className="text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
                Sign in to your account
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor="email"
                >
                  Email address
                </label>
                <div className={`relative ${shake.email ? 'animate-shake' : ''}`}>
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
                {errors.email && (
                  <p className="text-sm text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className={`relative ${shake.password ? 'animate-shake' : ''}`}>
                  <input
                    className={`w-full px-3 py-3 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.password
                        ? "border-red-500 bg-white dark:bg-gray-800"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    }`}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 "
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>

            </form>

            {/* Registration Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <button
                  onClick={handleRegister}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;