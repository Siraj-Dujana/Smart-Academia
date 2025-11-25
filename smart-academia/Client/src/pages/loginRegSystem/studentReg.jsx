import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const StudentRegistration = () => {
  const navigate = useNavigate();

  // ========== STATE MANAGEMENT ==========
  
  /**
   * Manages all form data for student registration
   */
  const [formData, setFormData] = useState({
    fullName: "",
    studentId: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "Computer Science",
    semester: "Fall 2024",
    terms: false,
  });

  const [errors, setErrors] = useState({}); // Stores validation errors
  const [success, setSuccess] = useState({}); // Stores success messages for real-time validation
  const [showPassword, setShowPassword] = useState(false); // Toggles password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggles confirm password visibility
  const [shake, setShake] = useState({}); // Controls shake animations for fields

  // ========== ANIMATION STATES ==========
  const [animateSchool, setAnimateSchool] = useState(false);
  const [animateTitle, setAnimateTitle] = useState(false);
  const [animateTagline, setAnimateTagline] = useState(false);

  // ========== FIELD CONFIGURATION ==========
  
  /**
   * Configuration object for all form fields with validation rules
   */
  const fieldConfig = {
    fullName: {
      label: "Full Name",
      icon: "person",
      type: "text",
      placeholder: "Enter your full name",
      validation: (value) => value.trim().length >= 2,
      successMsg: "Name looks good!",
      errorMsg: "Full name is required",
    },
    studentId: {
      label: "Student ID",
      icon: "badge",
      type: "text",
      placeholder: "e.g. 023-22-0327",
       validation: (value) => /^\d{3}-\d{2}-\d{4}$/.test(value),
      successMsg: "Valid Student ID!",
      errorMsg: "Student ID must be in format: XXX-XX-XXXX",
    },
    email: {
      label: "Email",
      icon: "mail",
      type: "email",
      placeholder: "Enter your email address",
      validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      successMsg: "Email format is correct!",
      errorMsg: "Valid email is required",
    },
    password: {
      label: "Password",
      icon: "lock",
      type: "password",
      placeholder: "Create a password",
      validation: (value) => {
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumbers = /\d/.test(value);
        return value.length >= 8 && hasUpperCase && hasLowerCase && hasNumbers;
      },
      successMsg: "Strong password!",
      errorMsg: "Password must be 8+ chars with uppercase, lowercase & numbers",
    },
    confirmPassword: {
      label: "Confirm Password",
      icon: "lock",
      type: "password",
      placeholder: "Confirm your password",
      validation: (value, allData) =>
        value === allData.password && value.length > 0,
      successMsg: "Passwords match!",
      errorMsg: "Passwords do not match",
    },
  };

  // ========== STATIC DATA ==========
  
  /**
   * Available departments for selection
   */
  const departments = [
    "Computer Science",
    "Business Administration",
    "Mechanical Engineering",
    "Fine Arts",
  ];

  /**
   * Available semesters for selection
   */
  const semesters = ["Fall 2024", "Spring 2025", "Summer 2025"];

  // ========== NAVIGATION HANDLERS ==========

  /**
   * Navigates back to the login page
   */
  const handleBackToLogin = () => {
    navigate('/login');
  };

  /**
   * Navigates back to the role selection page
   */
  const handleBackToRegister = () => {
    navigate('/register');
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

  // ========== EFFECT HOOKS ==========

  /**
   * Validates confirm password whenever the password field changes
   */
  useEffect(() => {
    if (formData.confirmPassword) {
      validateField("confirmPassword", formData.confirmPassword);
    }
  }, [formData.password]);

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

    // Clear error and shake when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
      setShake((prev) => ({ ...prev, [name]: false }));
    }

    // Validate field in real-time for immediate feedback
    validateField(name, newValue);
  };

  /**
   * Validates a single field and updates success/error states
   * @param {string} name - Field name to validate
   * @param {string} value - Field value to validate
   */
  const validateField = (name, value) => {
    if (name === "terms") {
      const isValid = value;
      setSuccess((prev) => ({
        ...prev,
        terms: isValid ? "Terms accepted!" : "",
      }));
      return;
    }

    if (fieldConfig[name]) {
      const { validation, successMsg } = fieldConfig[name];
      // Pass the entire formData for confirm password validation
      const isValid =
        name === "confirmPassword"
          ? validation(value, formData)
          : validation(value);

      setSuccess((prev) => ({
        ...prev,
        [name]: isValid ? successMsg : "",
      }));
    }
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
   * Validates the entire form before submission
   * @returns {Object} - Object containing all field errors
   */
  const validateForm = () => {
    const newErrors = {};

    // Validate all configured fields
    Object.keys(fieldConfig).forEach((field) => {
      const { validation, errorMsg } = fieldConfig[field];
      const isValid =
        field === "confirmPassword"
          ? validation(formData[field], formData)
          : validation(formData[field]);

      if (!formData[field].trim() || !isValid) {
        newErrors[field] = errorMsg;
      }
    });

    // Validate terms and conditions
    if (!formData.terms) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    return newErrors;
  };

  /**
   * Handles form submission with validation
   * @param {Object} e - Event object from form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length === 0) {
      console.log("Form submitted:", formData);
      alert("Registration successful!");
      
      // Reset form to initial state
      setFormData({
        fullName: "",
        studentId: "",
        email: "",
        password: "",
        confirmPassword: "",
        department: "Computer Science",
        semester: "Fall 2024",
        terms: false,
      });
      setSuccess({});
      
      // Navigate to login after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      setErrors(formErrors);
      // Trigger shake animations for fields with errors
      Object.keys(formErrors).forEach(field => {
        triggerShake(field);
      });
    }
  };

  /**
   * Toggles password visibility for better user experience
   * @param {string} field - Field name ('password' or 'confirmPassword')
   */
  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // ========== RENDER FUNCTIONS ==========

  /**
   * Dynamically renders input fields based on configuration
   * @param {string} fieldName - Name of the field to render
   * @returns {JSX.Element} - Rendered input field component
   */
  const renderInputField = (fieldName) => {
    const config = fieldConfig[fieldName];
    if (!config) return null;

    const isPasswordField =
      fieldName === "password" || fieldName === "confirmPassword";
    const showText =
      fieldName === "password" ? showPassword : showConfirmPassword;

    return (
      <label className="flex flex-col">
        <p className="pb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {config.label}
        </p>
        <div className={`relative ${shake[fieldName] ? 'animate-shake' : ''}`}>
          <div className="relative flex w-full items-center">
            {/* Field Icon */}
            <span className="material-symbols-outlined pointer-events-none absolute left-3 text-gray-400 text-lg">
              {config.icon}
            </span>
            
            {/* Input Field */}
            <input
              className={`w-full px-3 py-3 pl-10 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors[fieldName]
                  ? "border-red-500 bg-white dark:bg-gray-800"
                  : success[fieldName]
                  ? "border-green-500 bg-white dark:bg-gray-800"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              }`}
              placeholder={config.placeholder}
              type={
                isPasswordField ? (showText ? "text" : "password") : config.type
              }
              name={fieldName}
              value={formData[fieldName]}
              onChange={handleChange}
            />
            
            {/* Password Visibility Toggle */}
            {isPasswordField && (
              <button
                type="button"
                className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                onClick={() => togglePasswordVisibility(fieldName)}
              >
                <span className="material-symbols-outlined text-lg">
                  {showText ? "visibility_off" : "visibility"}
                </span>
              </button>
            )}
          </div>
        </div>
        
        {/* Error Message */}
        {errors[fieldName] && (
          <p className="mt-1 text-sm text-red-600">{errors[fieldName]}</p>
        )}
        
        {/* Success Message */}
        {success[fieldName] && !errors[fieldName] && (
          <p className="mt-1 text-sm text-green-600">{success[fieldName]}</p>
        )}
      </label>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-white">
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
              Student Registration
            </h1>
            
            {/* Brand Tagline */}
            <p className={`text-lg text-gray-600 dark:text-gray-300 transition-all duration-700 delay-300 ${
              animateTagline 
                ? 'opacity-100' 
                : 'opacity-0'
            }`}>
              Create your account for Smart Academia
            </p>

            {/* Feature Highlights */}
            <div className="flex flex-wrap justify-center gap-3 mt-4 ">
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

        {/* Desktop Brand Section */}
        <div className="hidden lg:flex flex-col items-center  bg-gray-50 dark:bg-gray-800 w-1/2 p-8 lg:p-12 text-center">
          <div className="flex flex-col items-center gap-6 max-w-md mt-25">
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
            <h1 className={`text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white transition-all duration-700 transform ${
              animateTitle 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}>
              Student Registration
            </h1>
            
            {/* Brand Tagline */}
            <p className={`text-xl text-gray-600 dark:text-gray-300 transition-all duration-700 delay-300 ${
              animateTagline 
                ? 'opacity-100' 
                : 'opacity-0'
            }`}>
              Create your account for Smart Academia
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
          <div className="w-full max-w-2xl">
            {/* Form Header - Hidden on desktop since we show brand section */}
            <div className="lg:hidden text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Create Account
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
                Join Smart Academia today
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                
                {/* Name and Student ID - Responsive Grid */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                  {renderInputField("fullName")}
                  {renderInputField("studentId")}
                </div>

                {/* Email Field */}
                {renderInputField("email")}

                {/* Password and Confirm Password - Responsive Grid */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                  {renderInputField("password")}
                  {renderInputField("confirmPassword")}
                </div>

                {/* Department and Semester - Responsive Grid */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                  
                  {/* Department Select Field */}
                  <label className="flex flex-col">
                    <p className="pb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Department
                    </p>
                    <div className="relative flex w-full items-center">
                      <span className="material-symbols-outlined pointer-events-none absolute left-3 text-gray-400 text-lg">
                        corporate_fare
                      </span>
                      <select
                        className="w-full px-3 py-3 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                      >
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-3 text-gray-400 text-lg">
                        expand_more
                      </span>
                    </div>
                  </label>

                  {/* Semester Select Field */}
                  <label className="flex flex-col">
                    <p className="pb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Semester
                    </p>
                    <div className="relative flex w-full items-center">
                      <span className="material-symbols-outlined pointer-events-none absolute left-3 text-gray-400 text-lg">
                        calendar_today
                      </span>
                      <select
                        className="w-full px-3 py-3 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        name="semester"
                        value={formData.semester}
                        onChange={handleChange}
                      >
                        {semesters.map((sem) => (
                          <option key={sem} value={sem}>
                            {sem}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-3 text-gray-400 text-lg">
                        expand_more
                      </span>
                    </div>
                  </label>
                </div>

              

                {/* ========== SUBMIT AND NAVIGATION BUTTONS ========== */}
                <div className="flex flex-col gap-3">
                  {/* Primary Registration Button */}
                  <button
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    type="submit"
                  >
                    Register as Student
                  </button>
                  
                  {/* Secondary Navigation Button */}
                  <button
                    type="button"
                    onClick={handleBackToRegister}
                    className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    Back to Role Selection
                  </button>
                </div>
              </form>

              {/* ========== LOGIN LINK ========== */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <button 
                    onClick={handleBackToLogin}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Login here
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistration;