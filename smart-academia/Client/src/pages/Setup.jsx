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

  const [animateSchool, setAnimateSchool] = useState(false);
  const [animateTitle, setAnimateTitle] = useState(false);
  const [animateTagline, setAnimateTagline] = useState(false);

  useEffect(() => {
    checkSetupStatus();
    const t1 = setTimeout(() => setAnimateSchool(true), 300);
    const t2 = setTimeout(() => setAnimateTitle(true), 600);
    const t3 = setTimeout(() => setAnimateTagline(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
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
      <div className="h-screen w-full flex items-center justify-center" style={{ background: "#0c0e1e", fontFamily: "'Lexend', sans-serif" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-900 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Checking system status...</p>
        </div>
      </div>
    );
  }

  // Setup already done
  if (setupRequired === false) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: "#0c0e1e", fontFamily: "'Lexend', sans-serif" }}>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 max-w-md w-full p-8 text-center">
          <div className="flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mx-auto mb-6">
            <span className="material-symbols-outlined text-green-400 text-4xl">check_circle</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">System Already Configured</h1>
          <p className="text-gray-500 mb-6">
            An admin account already exists. This setup page is now disabled for security.
          </p>
          <button onClick={() => navigate("/login")}
            className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Setup complete
  if (isDone) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: "#0c0e1e", fontFamily: "'Lexend', sans-serif" }}>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 max-w-md w-full p-8 text-center">
          <div className="flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mx-auto mb-6 animate-bounce">
            <span className="material-symbols-outlined text-green-400 text-4xl">celebration</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Setup Complete!</h1>
          <p className="text-gray-500 mb-2">Admin account created successfully.</p>
          <p className="text-sm text-gray-500 mb-6">Redirecting to login in 3 seconds...</p>
          <div className="flex items-center justify-center gap-2 text-sm text-indigo-400">
            <div className="w-4 h-4 border-2 border-indigo-900 border-t-indigo-500 rounded-full animate-spin"></div>
            Redirecting...
          </div>
        </div>
      </div>
    );
  }

  // Setup form
  return (
    <div className="h-screen w-full overflow-hidden" style={{ fontFamily: "'Lexend', sans-serif", background: "#0c0e1e" }}>
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #6366f1;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #818cf8;
        }
      `}</style>

      <div className="flex flex-col lg:flex-row h-full w-full">

        {/* Mobile Brand Section */}
        <div className="lg:hidden relative overflow-hidden flex-shrink-0" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", borderBottom: "1px solid #1e293b" }}>
          <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "#6366f1" }} />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: "#a855f7" }} />
          
          <div className="relative flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className={`flex h-20 w-20 items-center justify-center rounded-full transition-all duration-700 transform ${animateSchool ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l9-5-9 5-9-5m9 5v5m0-5v5m0 0l-9-5m9 5l9-5" />
              </svg>
            </div>
            <h1 className={`text-2xl font-black text-white mt-4 transition-all duration-700 transform ${animateTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              System Setup
            </h1>
            <p className={`text-sm text-gray-400 mt-2 transition-all duration-700 ${animateTagline ? 'opacity-100' : 'opacity-0'}`}>
              Create your admin account
            </p>
          </div>
        </div>

        {/* Desktop Left Panel */}
        <div className="hidden lg:flex flex-col items-center justify-center w-1/2 h-full relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)" }}>
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: "#6366f1" }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ background: "#a855f7" }} />
          
          <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full px-8">
            <div className={`flex h-24 w-24 items-center justify-center rounded-full transition-all duration-700 transform ${animateSchool ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l9-5-9 5-9-5m9 5v5m0-5v5m0 0l-9-5m9 5l9-5" />
              </svg>
            </div>
            <h1 className={`text-3xl font-black text-white mt-6 transition-all duration-700 transform ${animateTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Smart Academia
            </h1>
            <p className={`text-gray-400 mt-2 transition-all duration-700 ${animateTagline ? 'opacity-100' : 'opacity-0'}`}>
              System Setup
            </p>

            {/* Steps */}
            <div className="w-full mt-10 space-y-3 text-left">
              {[
                { step: "01", text: "Fill in the admin details" },
                { step: "02", text: "Enter the setup key" },
                { step: "03", text: "Complete setup & login" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600/20">
                    <span className="text-xs font-bold text-indigo-400">{item.step}</span>
                  </div>
                  <span className="text-sm text-gray-400">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-xl" style={{ background: "#f59e0b22", border: "1px solid #f59e0b44" }}>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">warning</span>
                <p className="text-amber-400 text-xs leading-relaxed">
                  This setup page works only once. After the admin account is created, this page will be permanently disabled for security.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 flex flex-col items-center justify-start p-6 lg:p-8 overflow-y-auto custom-scroll" style={{ background: "#0f1629", height: "100vh" }}>
          <div className="w-full max-w-md mx-auto py-4">

            {/* Form Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#6366f1" }} />
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Admin Setup</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Create Admin Account</h2>
              <p className="text-gray-500 mt-1 text-sm">This will be the master admin of Smart Academia</p>
            </div>

            {error && (
              <div className="rounded-xl p-3 flex items-center gap-2 mb-4" style={{ background: "#ef444422", border: "1px solid #ef444444" }}>
                <span className="material-symbols-outlined text-sm text-red-400">error</span>
                <p className="text-sm text-red-400 flex-1">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">person</span>
                  <input 
                    type="text" 
                    name="fullName" 
                    value={formData.fullName}
                    onChange={handleChange} 
                    required 
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 pl-10 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm border-gray-700 bg-gray-800/50"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">mail</span>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange} 
                    required 
                    placeholder="admin@smartacademia.com"
                    className="w-full px-4 py-3 pl-10 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm border-gray-700 bg-gray-800/50"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">lock</span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    value={formData.password} 
                    onChange={handleChange}
                    required 
                    placeholder="Create a strong password"
                    className="w-full px-4 py-3 pl-10 pr-10 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm border-gray-700 bg-gray-800/50"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                  >
                    <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
                
                {/* Password strength indicators */}
                {formData.password && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[
                      { test: passwordStrength.length, label: "8+ chars" },
                      { test: passwordStrength.uppercase, label: "Uppercase" },
                      { test: passwordStrength.number, label: "Number" },
                    ].map(rule => (
                      <span key={rule.label} className={`text-xs px-2 py-1 rounded-full transition-colors ${
                        rule.test ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-gray-800 text-gray-500 border border-gray-700"
                      }`}>
                        {rule.test ? "✓" : "○"} {rule.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">lock</span>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword} 
                    onChange={handleChange}
                    required 
                    placeholder="Confirm your password"
                    className={`w-full px-4 py-3 pl-10 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm bg-gray-800/50 ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? "border-red-500"
                        : "border-gray-700"
                    }`}
                  />
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Setup Key */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Setup Key
                  <span className="ml-1 text-gray-500">(from .env file)</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">key</span>
                  <input 
                    type={showSetupKey ? "text" : "password"} 
                    name="setupKey" 
                    value={formData.setupKey}
                    onChange={handleChange} 
                    required 
                    placeholder="Enter setup key"
                    className="w-full px-4 py-3 pl-10 pr-10 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm border-gray-700 bg-gray-800/50"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowSetupKey(!showSetupKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                  >
                    <span className="material-symbols-outlined text-lg">{showSetupKey ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
              >
                {isSubmitting ? (
                  <>
                    <div className="relative w-4 h-4">
                      <div className="absolute inset-0 rounded-full border-2 border-indigo-900" />
                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                    </div>
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

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <button onClick={() => navigate("/login")} className="font-bold transition-all hover:scale-105" style={{ color: "#818cf8" }}>
                  Go to Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setup;