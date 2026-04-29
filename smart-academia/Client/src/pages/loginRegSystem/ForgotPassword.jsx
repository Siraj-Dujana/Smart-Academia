import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();

  // step 1 = enter email, step 2 = enter OTP, step 3 = new password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Animation states
  const [animateSchool, setAnimateSchool] = useState(false);
  const [animateTitle, setAnimateTitle] = useState(false);
  const [animateTagline, setAnimateTagline] = useState(false);

  const otpRefs = useRef([]);

  useEffect(() => {
    const t1 = setTimeout(() => setAnimateSchool(true), 300);
    const t2 = setTimeout(() => setAnimateTitle(true), 600);
    const t3 = setTimeout(() => setAnimateTagline(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto focus first OTP input when step 2 loads
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // ===== STEP 1: Send OTP =====
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) return setError("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Invalid email format");

    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/otp/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message);
      setSuccess(data.message);
      setCountdown(60);
      setStep(2);
    } catch {
      setError("Cannot connect to server. Make sure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== STEP 2: Verify OTP =====
  const handleOTPInput = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    const otpValue = otp.join("");
    if (otpValue.length !== 6) return setError("Please enter the complete 6-digit OTP");

    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/otp/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message);
      setSuccess("OTP verified! Set your new password.");
      setStep(3);
    } catch {
      setError("Cannot connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setError("");
    setOtp(["", "", "", "", "", ""]);
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/otp/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message);
      setSuccess("New OTP sent!");
      setCountdown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("Cannot connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== STEP 3: Reset Password =====
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) return setError("Password must be at least 8 characters");
    if (!/[A-Z]/.test(newPassword)) return setError("Password must contain at least one uppercase letter");
    if (!/[a-z]/.test(newPassword)) return setError("Password must contain at least one lowercase letter");
    if (!/\d/.test(newPassword)) return setError("Password must contain at least one number");
    if (newPassword !== confirmPassword) return setError("Passwords do not match");

    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/otp/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join(""), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message);
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      setError("Cannot connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles = {
    1: { title: "Forgot Password?", sub: "Enter your email and we'll send you an OTP" },
    2: { title: "Enter OTP", sub: `We sent a 6-digit code to ${email}` },
    3: { title: "New Password", sub: "Choose a strong password for your account" },
  };

  return (
    <div className="h-screen w-full overflow-hidden" style={{ fontFamily: "'Lexend', sans-serif", background: "#0c0e1e" }}>
      <div className="h-full flex flex-col lg:flex-row">

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

        {/* Desktop Brand Section */}
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

            {/* Step Indicators */}
            <div className="flex items-center gap-3 mt-8 w-full justify-center">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step === s ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white scale-110 shadow-lg" :
                    step > s ? "bg-green-500 text-white" :
                    "bg-gray-800 text-gray-500"
                  }`}>
                    {step > s ? "✓" : s}
                  </div>
                  {s < 3 && <div className={`w-8 h-0.5 ${step > s ? "bg-green-500" : "bg-gray-800"}`} />}
                </div>
              ))}
            </div>
            <div className="flex gap-6 text-xs text-gray-500">
              <span className={step >= 1 ? "text-indigo-400 font-medium" : ""}>Email</span>
              <span className={step >= 2 ? "text-indigo-400 font-medium" : ""}>OTP</span>
              <span className={step >= 3 ? "text-indigo-400 font-medium" : ""}>Password</span>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-8 overflow-y-auto" style={{ background: "#0f1629" }}>
          <div className="w-full max-w-md space-y-6 py-6">

            {/* Form Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#6366f1" }} />
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Secure Recovery</span>
              </div>
              <h1 className="text-3xl font-black text-white">
                {stepTitles[step].title}
              </h1>
              <p className="text-gray-500 mt-2 text-sm">
                {stepTitles[step].sub}
              </p>
            </div>

            {/* Error / Success banners */}
            {error && (
              <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#ef444422", border: "1px solid #ef444444" }}>
                <span className="material-symbols-outlined text-sm text-red-400">error</span>
                <p className="text-sm text-red-400 flex-1">{error}</p>
              </div>
            )}
            {success && (
              <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#22c55e22", border: "1px solid #22c55e44" }}>
                <span className="material-symbols-outlined text-sm text-green-400">check_circle</span>
                <p className="text-sm text-green-400 flex-1">{success}</p>
              </div>
            )}

            {/* ===== STEP 1: Email ===== */}
            {step === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">mail</span>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder="Enter your registered email"
                      className="w-full px-4 py-3 pl-10 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm border-gray-700 bg-gray-800/50"
                      disabled={isLoading}
                    />
                  </div>
                </div>
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
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">send</span>
                      Send OTP
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all hover:scale-105"
                  style={{ color: "#818cf8", background: "transparent", border: "1px solid #334155" }}
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Back to Login
                </button>
              </form>
            )}

            {/* ===== STEP 2: OTP ===== */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center block mb-4">
                    Enter the 6-digit code
                  </label>
                  <div className="flex gap-3 justify-center" onPaste={handleOTPPaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOTPInput(index, e.target.value)}
                        onKeyDown={(e) => handleOTPKeyDown(index, e)}
                        className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl text-white focus:outline-none transition-all duration-200 ${
                          digit ? "border-indigo-500 bg-indigo-500/20" : "border-gray-700 bg-gray-800/50"
                        } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20`}
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.join("").length !== 6}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
                >
                  {isLoading ? (
                    <>
                      <div className="relative w-4 h-4">
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-900" />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                      </div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">verified</span>
                      Verify OTP
                    </>
                  )}
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Didn't receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={countdown > 0 || isLoading}
                      className={`font-bold transition-all hover:scale-105 ${
                        countdown > 0 ? "text-gray-500 cursor-not-allowed" : "text-indigo-400"
                      }`}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                    </button>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => { setStep(1); setError(""); setSuccess(""); setOtp(["","","","","",""]); }}
                  className="w-full text-sm text-gray-500 hover:text-indigo-400 transition-colors"
                >
                  ← Change email
                </button>
              </form>
            )}

            {/* ===== STEP 3: New Password ===== */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">lock</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                      placeholder="Create a strong password"
                      className="w-full px-4 py-3 pl-10 pr-10 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm border-gray-700 bg-gray-800/50"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                    >
                      <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                  
                  {/* Password strength hints */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[
                      { test: newPassword.length >= 8, label: "8+ chars" },
                      { test: /[A-Z]/.test(newPassword), label: "Uppercase" },
                      { test: /[a-z]/.test(newPassword), label: "Lowercase" },
                      { test: /\d/.test(newPassword), label: "Number" },
                    ].map((rule) => (
                      <span key={rule.label} className={`text-xs px-2 py-1 rounded-full transition-colors ${
                        rule.test ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-gray-800 text-gray-500 border border-gray-700"
                      }`}>
                        {rule.test ? "✓" : "○"} {rule.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">lock</span>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                      placeholder="Confirm your new password"
                      className={`w-full px-4 py-3 pl-10 pr-10 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm bg-gray-800/50 ${
                        confirmPassword && newPassword !== confirmPassword ? "border-red-500" : "border-gray-700"
                      }`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                    >
                      <span className="material-symbols-outlined text-lg">{showConfirm ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                  )}
                </div>

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
                      Resetting...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">lock_reset</span>
                      Reset Password
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;