import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Mini Bar ──────────────────────────────────────────────────
const MiniBar = ({ value = 0, color = "#6366f1", height = 6 }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height, background: "#1e293b" }}>
    <div
      className="h-full rounded-full"
      style={{
        width: `${Math.min(value, 100)}%`,
        background: `linear-gradient(90deg, ${color}cc, ${color})`,
        boxShadow: `0 0 8px ${color}66`,
        transition: "width 1s cubic-bezier(.4,0,.2,1)"
      }}
    />
  </div>
);

// ── Glow Card ─────────────────────────────────────────────────
const GlowCard = ({ icon, label, color }) => {
  return (
    <div 
      className="relative rounded-2xl overflow-hidden p-4 flex flex-col items-center gap-2 group transition-all duration-300 hover:scale-105" 
      style={{ 
        background: "#0f1629", 
        border: `1px solid ${color}33`,
      }}
    >
      {/* Breathing inner glow */}
      <div 
        className="absolute inset-0 transition-all duration-[4000ms] ease-in-out"
        style={{ 
          background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
          opacity: 0,
          animation: 'breatheGlow 4s ease-in-out infinite',
        }}
      />
      
      {/* Hover overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}30 0%, transparent 80%)` }} />
      
      <div className="w-10 h-10 rounded-xl flex items-center justify-center relative z-10 transition-all duration-300 group-hover:scale-110" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
        <span className="material-symbols-outlined text-lg transition-all duration-300 group-hover:scale-110" style={{ color }}>{icon}</span>
      </div>
      <div className="text-center relative z-10">
        <p className="text-xs font-bold text-white tracking-tight">{label}</p>
      </div>
      
      <style>
        {`
          @keyframes breatheGlow {
            0%, 100% { 
              opacity: 0;
            }
            50% { 
              opacity: 0.25;
            }
          }
        `}
      </style>
    </div>
  );
};
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
      const response = await fetch(`${API}/api/auth/login`, {
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
        navigate("/admin/dashboard");
      }
    } catch (error) {
      setApiError("Cannot connect to server. Make sure backend is running on port 5000.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: "auto_awesome", label: "AI Powered", color: "#6366f1" },
    { icon: "psychology", label: "Smart Learning", color: "#a855f7" },
    { icon: "support_agent", label: "24/7 Support", color: "#22c55e" },
    { icon: "verified", label: "Secure", color: "#f59e0b" },
  ];

  return (
    <div className="h-screen w-full overflow-hidden" style={{ fontFamily: "'Lexend', sans-serif", background: "#0c0e1e" }}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
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
              Smart Academia
            </h1>
            <p className={`text-sm text-gray-400 mt-2 transition-all duration-700 ${animateTagline ? 'opacity-100' : 'opacity-0'}`}>
              Your Academic Journey, Amplified by AI.
            </p>
          </div>
        </div>

        {/* Desktop Brand Section - Full height left side */}
        <div className="hidden lg:flex flex-col items-center justify-center w-1/2 p-12 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)" }}>
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: "#6366f1" }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ background: "#a855f7" }} />
          
          <div className="relative flex flex-col items-center gap-6 max-w-md">
            <div className={`flex h-20 w-20 items-center justify-center rounded-full transition-all duration-700 transform ${animateSchool ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l9-5-9 5-9-5m9 5v5m0-5v5m0 0l-9-5m9 5l9-5" />
              </svg>
            </div>
            <h1 className={`text-5xl font-black text-white transition-all duration-700 transform ${animateTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Smart Academia
            </h1>
            <p className={`text-xl text-gray-400 transition-all duration-700 ${animateTagline ? 'opacity-100' : 'opacity-0'}`}>
              Your Academic Journey, Amplified by AI.
            </p>
            
            <div className="grid grid-cols-2 gap-3 mt-8 w-full">
              {features.map((f) => (
                <GlowCard key={f.label} icon={f.icon} label={f.label} color={f.color} />
              ))}
            </div>
          </div>
        </div>

        {/* Login Form Section - Full height right side */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-8 overflow-y-auto" style={{ background: "#0f1629" }}>
          <div className="w-full max-w-md space-y-6 py-6">

            {/* Form Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#6366f1" }} />
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Access Portal</span>
              </div>
              <h1 className="text-3xl font-black text-white">Welcome back</h1>
              <p className="text-gray-500 mt-2 text-sm">Sign in to your account</p>
            </div>

            {/* API Error Banner */}
            {apiError && (
              <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#ef444422", border: "1px solid #ef444444" }}>
                <span className="material-symbols-outlined text-sm text-red-400">error</span>
                <p className="text-sm text-red-400 flex-1">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider" htmlFor="email">
                  Email address
                </label>
                <div className={`relative ${shake.email ? 'animate-shake' : ''}`}>
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">mail</span>
                  <input
                    className={`w-full px-4 py-3 pl-10 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm ${
                      errors.email ? "border-red-500" : "border-gray-700 bg-gray-800/50"
                    }`}
                    id="email" name="email" placeholder="Enter your email"
                    value={formData.email} onChange={handleChange}
                    type="email" disabled={isLoading}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <div className={`relative ${shake.password ? 'animate-shake' : ''}`}>
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">lock</span>
                  <input
                    className={`w-full px-4 py-3 pl-10 pr-10 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm ${
                      errors.password ? "border-red-500" : "border-gray-700 bg-gray-800/50"
                    }`}
                    id="password" name="password" placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password} onChange={handleChange} disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs font-medium transition-colors hover:scale-105"
                  style={{ color: "#818cf8" }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
              >
                {isLoading ? (
                  <>
                    <div className="relative w-4 h-4">
                      <div className="absolute inset-0 rounded-full border-2 border-indigo-900" />
                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                    </div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">login</span>
                    Sign in
                  </>
                )}
              </button>

            </form>

            {/* Register Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="font-bold transition-all hover:scale-105"
                  style={{ color: "#818cf8" }}
                >
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