import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const StudentRegistration = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    studentId: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "Computer Science",
    semester: "1st",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [shake, setShake] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [animateSchool, setAnimateSchool] = useState(false);
  const [animateTitle, setAnimateTitle] = useState(false);
  const [animateTagline, setAnimateTagline] = useState(false);

  const fieldConfig = {
    fullName: {
      label: "Full Name", icon: "person", type: "text",
      placeholder: "Enter your full name",
      validation: (value) => value.trim().length >= 2,
      successMsg: "Name looks good!", errorMsg: "Full name is required",
    },
    studentId: {
      label: "Student ID", icon: "badge", type: "text",
      placeholder: "e.g. 023-22-0327",
      validation: (value) => /^\d{3}-\d{2}-\d{4}$/.test(value),
      successMsg: "Valid Student ID!", errorMsg: "Student ID must be in format: XXX-XX-XXXX",
    },
    email: {
      label: "Email", icon: "mail", type: "email",
      placeholder: "Enter your email address",
      validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      successMsg: "Email format is correct!", errorMsg: "Valid email is required",
    },
    password: {
      label: "Password", icon: "lock", type: "password",
      placeholder: "Create a password",
      validation: (value) =>
        value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value),
      successMsg: "Strong password!",
      errorMsg: "Password must be 8+ chars with uppercase, lowercase & numbers",
    },
    confirmPassword: {
      label: "Confirm Password", icon: "lock", type: "password",
      placeholder: "Confirm your password",
      validation: (value, allData) => value === allData.password && value.length > 0,
      successMsg: "Passwords match!", errorMsg: "Passwords do not match",
    },
  };

  const departments = ["Computer Science", "Business Administration", "Mechanical Engineering", "Fine Arts", "Mathematics"];
  const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

  useEffect(() => {
    const t1 = setTimeout(() => setAnimateSchool(true), 300);
    const t2 = setTimeout(() => setAnimateTitle(true), 600);
    const t3 = setTimeout(() => setAnimateTagline(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    if (formData.confirmPassword) validateField("confirmPassword", formData.confirmPassword);
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setApiError("");
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
      setShake((prev) => ({ ...prev, [name]: false }));
    }
    validateField(name, value);
  };

  const validateField = (name, value) => {
    if (fieldConfig[name]) {
      const { validation, successMsg } = fieldConfig[name];
      const isValid = name === "confirmPassword" ? validation(value, formData) : validation(value);
      setSuccess((prev) => ({ ...prev, [name]: isValid ? successMsg : "" }));
    }
  };

  const triggerShake = (fieldName) => {
    setShake((prev) => ({ ...prev, [fieldName]: true }));
    setTimeout(() => setShake((prev) => ({ ...prev, [fieldName]: false })), 500);
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(fieldConfig).forEach((field) => {
      const { validation, errorMsg } = fieldConfig[field];
      const isValid = field === "confirmPassword"
        ? validation(formData[field], formData)
        : validation(formData[field]);
      if (!formData[field] || !formData[field].trim() || !isValid) {
        newErrors[field] = errorMsg;
      }
    });
    return newErrors;
  };

  // ========== SUBMIT WITH API CALL ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setApiSuccess("");

    // Step 1: Frontend validation
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      Object.keys(formErrors).forEach((field) => triggerShake(field));
      return;
    }

    setIsLoading(true);

    try {
      // Step 2: Call backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register/student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          studentId: formData.studentId,
          email: formData.email,
          password: formData.password,
          department: formData.department,
          semester: formData.semester,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Step 3a: Server returned error (duplicate email etc.)
        setApiError(data.message || "Registration failed. Please try again.");
        return;
      }

      // Step 3b: Success - save token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setApiSuccess("Registration successful! Redirecting to login...");

      setTimeout(() => navigate('/login'), 1500);

    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      // Network error - backend not running
      setApiError("Cannot connect to server. Make sure backend is running on port 5000.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === "password") setShowPassword(!showPassword);
    else setShowConfirmPassword(!showConfirmPassword);
  };

  const renderInputField = (fieldName) => {
    const config = fieldConfig[fieldName];
    if (!config) return null;
    const isPasswordField = fieldName === "password" || fieldName === "confirmPassword";
    const showText = fieldName === "password" ? showPassword : showConfirmPassword;

    return (
      <label className="flex flex-col">
        <p className="pb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{config.label}</p>
        <div className={`relative ${shake[fieldName] ? 'animate-shake' : ''}`}>
          <div className="relative flex w-full items-center">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 text-gray-400 text-lg">{config.icon}</span>
            <input
              className={`w-full px-3 py-3 pl-10 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors[fieldName] ? "border-red-500 bg-white dark:bg-gray-800"
                : success[fieldName] ? "border-green-500 bg-white dark:bg-gray-800"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              }`}
              placeholder={config.placeholder}
              type={isPasswordField ? (showText ? "text" : "password") : config.type}
              name={fieldName}
              value={formData[fieldName]}
              onChange={handleChange}
              disabled={isLoading}
            />
            {isPasswordField && (
              <button type="button" className="absolute right-3 text-gray-400 hover:text-gray-600"
                onClick={() => togglePasswordVisibility(fieldName)}>
                <span className="material-symbols-outlined text-lg">{showText ? "visibility_off" : "visibility"}</span>
              </button>
            )}
          </div>
        </div>
        {errors[fieldName] && <p className="mt-1 text-sm text-red-600">{errors[fieldName]}</p>}
        {success[fieldName] && !errors[fieldName] && <p className="mt-1 text-sm text-green-600">{success[fieldName]}</p>}
      </label>
    );
  };

  const features = ["AI Powered", "Smart Learning", "24/7 Support", "Secure"];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-white">
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>

      <div className="min-h-screen flex flex-col lg:flex-row">

        {/* ===== MOBILE BRAND ===== */}
        <div className="lg:hidden flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 p-6 sm:p-8 text-center">
          <div className="flex flex-col items-center gap-4 max-w-md w-full">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white transition-all duration-700 transform ${animateSchool ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
              <span className="material-symbols-outlined" style={{ fontSize: "2.5rem" }}>school</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-bold transition-all duration-700 transform ${animateTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>Student Registration</h1>
            <p className={`text-lg text-gray-600 dark:text-gray-300 transition-all duration-700 ${animateTagline ? 'opacity-100' : 'opacity-0'}`}>Create your account for Smart Academia</p>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {features.map((f) => (
                <span key={f} className="px-3 py-2 bg-white dark:bg-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-sm"
                  style={{ opacity: animateTagline ? 1 : 0, transform: animateTagline ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.5s' }}>{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ===== DESKTOP BRAND ===== */}
        <div className="hidden lg:flex flex-col items-center bg-gray-50 dark:bg-gray-800 w-1/2 p-8 lg:p-12 text-center">
          <div className="flex flex-col items-center gap-6 max-w-md mt-25">
            <div className={`mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 text-white transition-all duration-700 transform ${animateSchool ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
              <span className="material-symbols-outlined" style={{ fontSize: "3rem" }}>school</span>
            </div>
            <h1 className={`text-3xl lg:text-4xl font-bold transition-all duration-700 transform ${animateTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>Student Registration</h1>
            <p className={`text-xl text-gray-600 dark:text-gray-300 transition-all duration-700 ${animateTagline ? 'opacity-100' : 'opacity-0'}`}>Create your account for Smart Academia</p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {features.map((f) => (
                <span key={f} className="px-3 py-2 bg-white dark:bg-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-sm"
                  style={{ opacity: animateTagline ? 1 : 0, transform: animateTagline ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.5s' }}>{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ===== FORM ===== */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-2xl">

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 shadow-sm">

              {/* ===== API ERROR BANNER ===== */}
              {apiError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-600 text-lg">error</span>
                  <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
                </div>
              )}

              {/* ===== API SUCCESS BANNER ===== */}
              {apiSuccess && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                  <p className="text-sm text-green-600 dark:text-green-400">{apiSuccess}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                  {renderInputField("fullName")}
                  {renderInputField("studentId")}
                </div>

                {renderInputField("email")}

                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                  {renderInputField("password")}
                  {renderInputField("confirmPassword")}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                  {/* Department */}
                  <label className="flex flex-col">
                    <p className="pb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Department</p>
                    <div className="relative flex w-full items-center">
                      <span className="material-symbols-outlined pointer-events-none absolute left-3 text-gray-400 text-lg">corporate_fare</span>
                      <select className="w-full px-3 py-3 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        name="department" value={formData.department} onChange={handleChange} disabled={isLoading}>
                        {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-3 text-gray-400 text-lg">expand_more</span>
                    </div>
                  </label>

                  {/* Semester */}
                  <label className="flex flex-col">
                    <p className="pb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Semester</p>
                    <div className="relative flex w-full items-center">
                      <span className="material-symbols-outlined pointer-events-none absolute left-3 text-gray-400 text-lg">calendar_today</span>
                      <select className="w-full px-3 py-3 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        name="semester" value={formData.semester} onChange={handleChange} disabled={isLoading}>
                        {semesters.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-3 text-gray-400 text-lg">expand_more</span>
                    </div>
                  </label>
                </div>

                <div className="flex flex-col gap-3">
                  {/* ===== REGISTER BUTTON ===== */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                        Registering...
                      </>
                    ) : "Register as Student"}
                  </button>

                  <button type="button" onClick={() => navigate('/register')} disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors duration-200">
                    Back to Role Selection
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <button onClick={() => navigate('/login')} className="font-medium text-blue-600 hover:text-blue-500">Login here</button>
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