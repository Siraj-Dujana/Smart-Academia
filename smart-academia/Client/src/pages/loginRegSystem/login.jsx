  import React, { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ── Glow Card (feature badge, left panel) ──────────────────────
  const GlowCard = ({ icon, label }) => {
    return (
      <div
        className="relative rounded-2xl overflow-hidden p-4 flex flex-col items-center gap-2 group transition-all duration-300 hover:scale-105"
        style={{
          background: "#0c0e1e",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Hover overlay - matches card pattern from landing page */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(254, 254, 254, 0.15) 0%, transparent 80%)" }}
        />

        
        <div className="text-center relative z-10">
          <p className="text-xs font-bold text-white tracking-tight">{label}</p>
        </div>
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

    // Animation states - staggered entrance, matching HeroSection pattern
    const [animateLogo, setAnimateLogo] = useState(false);
    const [animateTitle, setAnimateTitle] = useState(false);
    const [animateTagline, setAnimateTagline] = useState(false);
    const [animateForm, setAnimateForm] = useState(false);

    useEffect(() => {
      const t1 = setTimeout(() => setAnimateLogo(true), 300);
      const t2 = setTimeout(() => setAnimateTitle(true), 600);
      const t3 = setTimeout(() => setAnimateTagline(true), 900);
      const t4 = setTimeout(() => setAnimateForm(true), 1100);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
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
      { icon: "auto_awesome", label: "AI Powered" },
      { icon: "psychology", label: "Smart Learning" },
      { icon: "support_agent", label: "24/7 Support" },
      { icon: "verified", label: "Secure" },
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

          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: #1e293b; border-radius: 10px; }
          ::-webkit-scrollbar-thumb { background: #ffffff; border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: #e2e8f0; }
          * { scrollbar-width: thin; scrollbar-color: #ffffff #1e293b; }
        `}</style>

        <div className="flex flex-col lg:flex-row h-full w-full">

          {/* Mobile Brand Section */}
          <div className="lg:hidden relative overflow-hidden flex-shrink-0" style={{ background: "#0c0e1e", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "#000000" }} />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: "#000000" }} />

            <div className="relative flex flex-col items-center justify-center py-10 px-6 text-center">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-white transition-all duration-700 transform ${animateLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                <svg className="w-9 h-9 text-black" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v7m0-7l9-5m-9 5l-9-5" />
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
          <div className="hidden lg:flex flex-col items-center justify-center w-1/2 p-12 text-center relative overflow-hidden" style={{ background: "#0c0e1e" }}>
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: "#000000" }} />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ background: "#000000" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl rounded-full blur-3xl opacity-10" style={{ background: "#000000" }} />

            <div className="relative flex flex-col items-center gap-6 max-w-md z-10">
              <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-white transition-all duration-700 transform ${animateLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-50'} hover:scale-105 hover:shadow-xl`}>
                <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v7m0-7l9-5m-9 5l-9-5" />
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
                  <GlowCard key={f.label}  label={f.label} />
                ))}
              </div>
            </div>
          </div>

          {/* Login Form Section - Full height right side */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-8 overflow-y-auto" style={{ background: "#0c0e1e" }}>
            <div className={`w-full max-w-md space-y-6 py-6 transition-all duration-700 transform ${animateForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

              {/* Form Header */}
              <div className="text-center">
                
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
                      className={`w-full px-4 py-3 pl-10 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200 text-sm focus:ring-1 focus:white ${
                        errors.email ? "border border-red-500" : "border"
                      }`}
                      style={{ background: "#1e293b", borderColor: errors.email ? undefined : "rgba(255,255,255,0.06)" }}
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
                      className={`w-full px-4 py-3 pl-10 pr-10 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200 text-sm focus:ring-1 focus:white ${
                        errors.password ? "border border-red-500" : "border"
                      }`}
                      style={{ background: "#1e293b", borderColor: errors.password ? undefined : "rgba(255,255,255,0.06)" }}
                      id="password" name="password" placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password} onChange={handleChange} disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
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
                    className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login Button - white/black, matches landing page primary button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-black transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{ background: "linear-gradient(135deg, #ffffff, #ffffff)" }}
                >
                  {isLoading ? (
                    <>
                      <div className="relative w-4 h-4">
                        <div className="absolute inset-0 rounded-full border-2 border-gray-400" />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-black animate-spin" />
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
                    className="font-bold text-white hover:text-gray-300 transition-colors"
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