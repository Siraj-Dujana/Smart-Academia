import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Animation states
  const [animateSchool, setAnimateSchool] = useState(false);
  const [animateTitle, setAnimateTitle] = useState(false);
  const [animateTagline, setAnimateTagline] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setAnimateSchool(true), 300);
    const t2 = setTimeout(() => setAnimateTitle(true), 600);
    const t3 = setTimeout(() => setAnimateTagline(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setApiError("");
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
      setShake((prev) => ({ ...prev, [name]: false }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    return newErrors;
  };

  const triggerShake = (fieldName) => {
    setShake((prev) => ({ ...prev, [fieldName]: true }));
    setTimeout(() => setShake((prev) => ({ ...prev, [fieldName]: false })), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      Object.keys(formErrors).forEach((field) => triggerShake(field));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setApiError(data.message || "Login failed. Please try again.");
        triggerShake("email");
        triggerShake("password");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "student") {
        navigate("/student/dashboard");
      } else if (data.user.role === "teacher") {
        navigate("/teacher/dashboard");
      } else if (data.user.role === "admin") {
        navigate("/AdminDashboard");
      }
    } catch (error) {
      setApiError("Cannot connect to server. Make sure backend is running on port 5000.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = ["AI Powered", "Smart Learning", "24/7 Support", "Secure"];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-white">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>

      <div className="min-h-screen flex flex-col lg:flex-row">

        {/* Mobile Brand Section */}
        <div className="lg:hidden flex flex-col items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8 px-6 text-center">
          <div className="flex flex-col items-center gap-3 max-w-md w-full">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white transition-all duration-700 transform ${animateSchool ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
              <span className="material-symbols-outlined text-3xl">school</span>
            </div>
            <h1 className={`text-2xl font-bold transition-all duration-700 transform ${animateTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>Smart Academia</h1>
            <p className={`text-sm text-blue-100 transition-all duration-700 ${animateTagline ? 'opacity-100' : 'opacity-0'}`}>
              Your Academic Journey, Amplified by AI.
            </p>
          </div>
        </div>

        {/* Desktop Brand Section */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 w-1/2 p-8 lg:p-12 text-center">
          <div className="flex flex-col items-center gap-6 max-w-md">
            <div className={`mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 text-white transition-all duration-700 transform ${animateSchool ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
              <span className="material-symbols-outlined text-4xl">school</span>
            </div>
            <h1 className={`text-4xl lg:text-5xl font-bold transition-all duration-700 transform ${animateTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>Smart Academia</h1>
            <p className={`text-xl text-gray-600 dark:text-gray-300 transition-all duration-700 ${animateTagline ? 'opacity-100' : 'opacity-0'}`}>
              Your Academic Journey, Amplified by AI.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {features.map((f) => (
                <span key={f} className="px-3 py-2 bg-white dark:bg-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-sm"
                  style={{ opacity: animateTagline ? 1 : 0, transform: animateTagline ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.5s' }}>{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-5 sm:p-6 lg:p-8">
          <div className="w-full max-w-md space-y-5 sm:space-y-6 md:space-y-8">

            {/* Form Header */}
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">Sign in to your account</p>
            </div>

            {/* API Error Banner */}
            {apiError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 text-base sm:text-lg">error</span>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex-1">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">

              {/* Email Field */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">
                  Email address
                </label>
                <div className={`relative ${shake.email ? 'animate-shake' : ''}`}>
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">mail</span>
                  <input
                    className={`w-full px-3 py-2.5 sm:py-3 pl-9 sm:pl-10 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                      errors.email ? "border-red-500 bg-white dark:bg-gray-800" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    }`}
                    id="email" name="email" placeholder="Enter your email"
                    value={formData.email} onChange={handleChange}
                    type="email" disabled={isLoading}
                  />
                </div>
                {errors.email && <p className="text-xs sm:text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
                  Password
                </label>
                <div className={`relative ${shake.password ? 'animate-shake' : ''}`}>
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">lock</span>
                  <input
                    className={`w-full px-3 py-2.5 sm:py-3 pl-9 sm:pl-10 pr-9 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                      errors.password ? "border-red-500 bg-white dark:bg-gray-800" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    }`}
                    id="password" name="password" placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password} onChange={handleChange} disabled={isLoading}
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}>
                    <span className="material-symbols-outlined text-base sm:text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
                {errors.password && <p className="text-xs sm:text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button type="button" onClick={() => navigate("/forgot-password")}
                  className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-2.5 sm:py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : "Sign in"}
              </button>

            </form>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <button onClick={() => navigate("/register")} className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </button>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;