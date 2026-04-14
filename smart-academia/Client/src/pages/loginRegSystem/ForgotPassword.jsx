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

  const otpRefs = useRef([]);

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
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-white">
      <div className="min-h-screen flex flex-col lg:flex-row">

        {/* Left brand panel - Desktop */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 w-1/2 p-8 lg:p-12 text-center">
          <div className="flex flex-col items-center gap-6 max-w-md">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 text-white">
              <span className="material-symbols-outlined text-4xl">lock_reset</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Smart Academia</h1>
            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300">Reset your password securely</p>

            {/* Step indicators */}
            <div className="flex items-center gap-3 mt-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step === s ? "bg-blue-600 text-white scale-110" :
                    step > s ? "bg-green-500 text-white" :
                    "bg-gray-200 dark:bg-gray-600 text-gray-500"
                  }`}>
                    {step > s ? "✓" : s}
                  </div>
                  {s < 3 && <div className={`w-6 h-0.5 ${step > s ? "bg-green-500" : "bg-gray-200 dark:bg-gray-600"}`} />}
                </div>
              ))}
            </div>
            <div className="flex gap-6 text-xs text-gray-500">
              <span className={step >= 1 ? "text-blue-600 font-medium" : ""}>Email</span>
              <span className={step >= 2 ? "text-blue-600 font-medium" : ""}>OTP</span>
              <span className={step >= 3 ? "text-blue-600 font-medium" : ""}>Password</span>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 px-4 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">lock_reset</span>
            </div>
          </div>
          <h1 className="text-xl font-bold">Reset Password</h1>
          <p className="text-sm text-blue-100 mt-1">Secure password recovery</p>
          
          {/* Mobile step indicators */}
          <div className="flex justify-center items-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s ? "bg-white text-blue-600" :
                  step > s ? "bg-green-400 text-white" :
                  "bg-white/30 text-white"
                }`}>
                  {step > s ? "✓" : s}
                </div>
                {s < 3 && <div className={`w-4 h-0.5 ${step > s ? "bg-green-400" : "bg-white/30"}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex flex-col items-center justify-center p-5 sm:p-6 lg:p-8">
          <div className="w-full max-w-md space-y-5 sm:space-y-6">

            {/* Form Header */}
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {stepTitles[step].title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-xs sm:text-sm">
                {stepTitles[step].sub}
              </p>
            </div>

            {/* Error / Success banners */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 text-base sm:text-lg">error</span>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex-1">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600 text-base sm:text-lg">check_circle</span>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 flex-1">{success}</p>
              </div>
            )}

            {/* ===== STEP 1: Email ===== */}
            {step === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">mail</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder="Enter your registered email"
                      className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-2.5 sm:py-3 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Sending OTP...</>
                  ) : "Send OTP"}
                </button>
                <button type="button" onClick={() => navigate("/login")}
                  className="w-full py-2.5 sm:py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Back to Login
                </button>
              </form>
            )}

            {/* ===== STEP 2: OTP ===== */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-5 sm:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                    Enter the 6-digit code
                  </label>
                  <div className="flex gap-2 sm:gap-3 justify-center flex-wrap" onPaste={handleOTPPaste}>
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
                        className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none transition-all duration-200 ${
                          digit ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600"
                        } focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                  <p className="text-center text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-3">
                    You can paste the OTP directly
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.join("").length !== 6}
                  className="w-full flex justify-center items-center gap-2 py-2.5 sm:py-3 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Verifying...</>
                  ) : "Verify OTP"}
                </button>

                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Didn't receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={countdown > 0 || isLoading}
                      className={`font-medium transition-colors ${
                        countdown > 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:text-blue-500"
                      }`}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                    </button>
                  </p>
                </div>

                <button type="button" onClick={() => { setStep(1); setError(""); setSuccess(""); setOtp(["","","","","",""]); }}
                  className="w-full py-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  ← Change email
                </button>
              </form>
            )}

            {/* ===== STEP 3: New Password ===== */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">lock</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                      placeholder="Create a strong password"
                      className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <span className="material-symbols-outlined text-base sm:text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
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
                      <span key={rule.label} className={`text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-full transition-colors ${
                        rule.test ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                      }`}>
                        {rule.test ? "✓" : "·"} {rule.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">lock</span>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                      placeholder="Confirm your new password"
                      className={`w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        confirmPassword && newPassword !== confirmPassword
                          ? "border-red-400" : "border-gray-300 dark:border-gray-600"
                      }`}
                      disabled={isLoading}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <span className="material-symbols-outlined text-base sm:text-lg">{showConfirm ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-[10px] sm:text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-2.5 sm:py-3 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Resetting...</>
                  ) : "Reset Password"}
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