import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Setup = () => {
  const navigate = useNavigate();
  const [setupRequired, setSetupRequired] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSetupKey, setShowSetupKey] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ length: false, uppercase: false, number: false });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    setupKey: "",
  });

  useEffect(() => {
    checkSetupStatus();
  }, []);

  // Check password strength
  useEffect(() => {
    setPasswordStrength({
      length: formData.password.length >= 8,
      uppercase: /[A-Z]/.test(formData.password),
      number: /\d/.test(formData.password),
    });
  }, [formData.password]);

  const checkSetupStatus = async () => {
    try {
      const res = await fetch(`${API}/api/setup/status`);
      const data = await res.json();
      setSetupRequired(data.setupRequired);
    } catch {
      setError("Cannot connect to server. Make sure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 8) {
      return setError("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(formData.password)) {
      return setError("Password must contain at least one uppercase letter");
    }
    if (!/\d/.test(formData.password)) {
      return setError("Password must contain at least one number");
    }
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }
    if (!formData.setupKey) {
      return setError("Setup key is required");
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/api/setup/create-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          setupKey: formData.setupKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message);

      setIsDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch {
      setError("Cannot connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Checking system status...</p>
        </div>
      </div>
    );
  }

  // Setup already done
  if (setupRequired === false) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto mb-4 sm:mb-6">
            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl sm:text-4xl">check_circle</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">System Already Configured</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
            An admin account already exists. This setup page is now disabled for security.
          </p>
          <button onClick={() => navigate("/login")}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Setup complete
  if (isDone) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto mb-4 sm:mb-6 animate-bounce">
            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl sm:text-4xl">celebration</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Setup Complete!</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">
            Admin account created successfully.
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6">
            Redirecting to login in 3 seconds...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            Redirecting...
          </div>
        </div>
      </div>
    );
  }

  // Setup form
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-white">
      <div className="min-h-screen flex flex-col lg:flex-row">

        {/* Left Panel - Desktop Only */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-gray-900 w-1/2 p-8 xl:p-12 text-center">
          <div className="max-w-md">
            <div className="flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-8">
              <span className="material-symbols-outlined text-white text-4xl">admin_panel_settings</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-bold text-white mb-4">SmartAcademia</h1>
            <p className="text-lg xl:text-xl text-gray-400 mb-8">System Setup</p>

            {/* Steps */}
            <div className="text-left space-y-4">
              {[
                { icon: "looks_one", text: "Fill in the admin details" },
                { icon: "looks_two", text: "Enter the setup key from .env" },
                { icon: "looks_3", text: "System is ready to use" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 text-blue-400">
                    <span className="material-symbols-outlined text-sm">{step.icon}</span>
                  </div>
                  <span className="text-gray-400 text-sm">{step.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 p-4 bg-amber-900/20 border border-amber-700/30 rounded-xl text-left">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">warning</span>
                <p className="text-amber-400 text-xs leading-relaxed">
                  This setup page works only once. After the admin account is created, this page will be permanently disabled for security.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md">

            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl mx-auto mb-3 sm:mb-4">
                <span className="material-symbols-outlined text-white text-2xl sm:text-3xl">admin_panel_settings</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold">SmartAcademia Setup</h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Create your admin account</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 sm:p-6 md:p-8">

              <div className="mb-5 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Create Admin Account</h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  This will be the master admin of SmartAcademia
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-600 text-base sm:text-lg">error</span>
                  <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex-1">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Full Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">person</span>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={formData.fullName}
                      onChange={handleChange} 
                      required 
                      placeholder="e.g. Siraj Ahmed"
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Admin Email
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">mail</span>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email}
                      onChange={handleChange} 
                      required 
                      placeholder="admin@smartacademia.com"
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">lock</span>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password"
                      value={formData.password} 
                      onChange={handleChange}
                      required 
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <span className="material-symbols-outlined text-base sm:text-lg">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  
                  {/* Password strength indicators */}
                  {formData.password && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                      {[
                        { test: passwordStrength.length, label: "8+ chars" },
                        { test: passwordStrength.uppercase, label: "Uppercase" },
                        { test: passwordStrength.number, label: "Number" },
                      ].map(rule => (
                        <span key={rule.label} className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full transition-colors ${
                          rule.test
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                        }`}>
                          {rule.test ? "✓" : "·"} {rule.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">lock</span>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      value={formData.confirmPassword} 
                      onChange={handleChange}
                      required 
                      placeholder="Confirm your password"
                      className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? "border-red-400"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    />
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-[10px] sm:text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                {/* Setup Key */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Setup Key
                    <span className="ml-1 text-[10px] sm:text-xs text-gray-400">(from Server/.env → SETUP_KEY)</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">key</span>
                    <input 
                      type={showSetupKey ? "text" : "password"} 
                      name="setupKey" 
                      value={formData.setupKey}
                      onChange={handleChange} 
                      required 
                      placeholder="Enter setup key"
                      className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowSetupKey(!showSetupKey)}
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <span className="material-symbols-outlined text-base sm:text-lg">
                        {showSetupKey ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Admin Account...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                      Complete Setup
                    </>
                  )}
                </button>
              </form>
            </div>

            <p className="text-center text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-4">
              Already have an account?{" "}
              <button onClick={() => navigate("/login")} className="text-blue-600 hover:text-blue-500 font-medium">
                Go to Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setup;