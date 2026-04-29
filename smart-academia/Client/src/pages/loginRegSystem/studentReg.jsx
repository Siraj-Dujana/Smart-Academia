import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const StudentRegistration = () => {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: "",
    studentId: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "Computer Science",
    semester: "1st",
  });

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [shake, setShake] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);

  const [animateSchool, setAnimateSchool] = useState(false);
  const [animateTitle, setAnimateTitle] = useState(false);
  const [animateTagline, setAnimateTagline] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setAnimateSchool(true), 300);
    const t2 = setTimeout(() => setAnimateTitle(true), 600);
    const t3 = setTimeout(() => setAnimateTagline(true), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (step === 2) setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }, [step]);

  useEffect(() => {
    if (formData.confirmPassword)
      validateField("confirmPassword", formData.confirmPassword);
  }, [formData.password]);

  const fieldConfig = {
    fullName: {
      label: "Full Name",
      icon: "person",
      type: "text",
      placeholder: "Enter your full name",
      validation: (v) => v.trim().length >= 2,
      successMsg: "Name looks good!",
      errorMsg: "Full name is required",
    },
    studentId: {
      label: "Student ID",
      icon: "badge",
      type: "text",
      placeholder: "e.g. 023-22-0327",
      validation: (v) => /^\d{3}-\d{2}-\d{4}$/.test(v),
      successMsg: "Valid Student ID!",
      errorMsg: "Format: XXX-XX-XXXX",
    },
    email: {
      label: "Email",
      icon: "mail",
      type: "email",
      placeholder: "Enter your email address",
      validation: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      successMsg: "Email format is correct!",
      errorMsg: "Valid email is required",
    },
    password: {
      label: "Password",
      icon: "lock",
      type: "password",
      placeholder: "Create a password",
      validation: (v) =>
        v.length >= 8 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v),
      successMsg: "Strong password!",
      errorMsg: "8+ chars with uppercase, lowercase & number",
    },
    confirmPassword: {
      label: "Confirm Password",
      icon: "lock",
      type: "password",
      placeholder: "Confirm your password",
      validation: (v, all) => v === all.password && v.length > 0,
      successMsg: "Passwords match!",
      errorMsg: "Passwords do not match",
    },
  };

  const departments = [
    "Computer Science",
    "Business Administration",
    "Mechanical Engineering",
    "Fine Arts",
    "Mathematics",
  ];
  const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

  const validateField = (name, value) => {
    if (fieldConfig[name]) {
      const { validation, successMsg } = fieldConfig[name];
      const isValid =
        name === "confirmPassword"
          ? validation(value, formData)
          : validation(value);
      setSuccess((prev) => ({ ...prev, [name]: isValid ? successMsg : "" }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setApiError("");
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    validateField(name, value);
  };

  const triggerShake = (field) => {
    setShake((prev) => ({ ...prev, [field]: true }));
    setTimeout(() => setShake((prev) => ({ ...prev, [field]: false })), 500);
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(fieldConfig).forEach((field) => {
      const { validation, errorMsg } = fieldConfig[field];
      const isValid =
        field === "confirmPassword"
          ? validation(formData[field], formData)
          : validation(formData[field]);
      if (!formData[field] || !isValid) newErrors[field] = errorMsg;
    });
    return newErrors;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setApiError("");
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      Object.keys(formErrors).forEach((f) => triggerShake(f));
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/otp/send-reg-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
        }),
      });
      const data = await res.json();
      if (!res.ok) return setApiError(data.message);
      setApiSuccess(`Verification OTP sent to ${formData.email}`);
      setCountdown(60);
      setStep(2);
    } catch {
      setApiError("Cannot connect to server. Make sure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPInput = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
  };

  const handleOTPPaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setApiError("");
    const otpValue = otp.join("");
    if (otpValue.length !== 6)
      return setApiError("Please enter the complete 6-digit OTP");

    setIsLoading(true);
    try {
      const verifyRes = await fetch(`${API}/api/otp/verify-reg-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: otpValue }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) return setApiError(verifyData.message);

      const regRes = await fetch(`${API}/api/auth/register/student`, {
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
      const regData = await regRes.json();
      if (!regRes.ok) return setApiError(regData.message);

      localStorage.setItem("token", regData.token);
      localStorage.setItem("user", JSON.stringify(regData.user));
      setApiSuccess("Registration successful! Redirecting...");
      setStep(3);
      setTimeout(() => navigate("/student/dashboard"), 1500);
    } catch {
      setApiError("Cannot connect to server. Make sure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setApiError("");
    setOtp(["", "", "", "", "", ""]);
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/otp/send-reg-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
        }),
      });
      const data = await res.json();
      if (!res.ok) return setApiError(data.message);
      setApiSuccess("New OTP sent!");
      setCountdown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setApiError("Cannot connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputField = (fieldName) => {
    const config = fieldConfig[fieldName];
    if (!config) return null;
    const isPasswordField =
      fieldName === "password" || fieldName === "confirmPassword";
    const showText =
      fieldName === "password" ? showPassword : showConfirmPassword;

    return (
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {config.label}
        </label>
        <div className={`relative ${shake[fieldName] ? "animate-shake" : ""}`}>
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
            {config.icon}
          </span>
          <input
            className={`w-full px-4 py-3 pl-10 pr-10 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm ${
              errors[fieldName]
                ? "border-red-500"
                : success[fieldName]
                  ? "border-green-500"
                  : "border-gray-700 bg-gray-800/50"
            }`}
            placeholder={config.placeholder}
            type={
              isPasswordField ? (showText ? "text" : "password") : config.type
            }
            name={fieldName}
            value={formData[fieldName]}
            onChange={handleChange}
            disabled={isLoading}
          />
          {isPasswordField && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
              onClick={() =>
                fieldName === "password"
                  ? setShowPassword(!showPassword)
                  : setShowConfirmPassword(!showConfirmPassword)
              }
            >
              <span className="material-symbols-outlined text-lg">
                {showText ? "visibility_off" : "visibility"}
              </span>
            </button>
          )}
        </div>
        {errors[fieldName] && (
          <p className="text-xs text-red-400">{errors[fieldName]}</p>
        )}
        {success[fieldName] && !errors[fieldName] && (
          <p className="text-xs text-green-400">{success[fieldName]}</p>
        )}
      </div>
    );
  };

  return (
    <div
      className="h-screen w-full overflow-hidden"
      style={{ fontFamily: "'Lexend', sans-serif", background: "#0c0e1e" }}
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        
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
        {/* Mobile Brand Section - Fixed */}
        <div
          className="lg:hidden relative overflow-hidden flex-shrink-0"
          style={{
            background:
              "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)",
            borderBottom: "1px solid #1e293b",
          }}
        >
          <div
            className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20"
            style={{ background: "#6366f1" }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15"
            style={{ background: "#a855f7" }}
          />

          <div className="relative flex flex-col items-center justify-center py-8 px-6 text-center">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full transition-all duration-700 transform ${animateSchool ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
              style={{
                background: "linear-gradient(135deg, #6366f1, #818cf8)",
              }}
            >
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l9-5-9-5-9 5 9 5zm0 0l9-5-9 5-9-5m9 5v5m0-5v5m0 0l-9-5m9 5l9-5"
                />
              </svg>
            </div>
            <h1
              className={`text-2xl font-black text-white mt-4 transition-all duration-700 transform ${animateTitle ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              Student Registration
            </h1>
            <p
              className={`text-sm text-gray-400 mt-2 transition-all duration-700 ${animateTagline ? "opacity-100" : "opacity-0"}`}
            >
              Create your student account
            </p>

            {/* Mobile Step Indicators - Simple circles */}
            <div className="flex justify-center items-center gap-4 mt-6">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step === s
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white scale-110 shadow-lg"
                      : step > s
                        ? "bg-green-500 text-white"
                        : "bg-gray-800 text-gray-500"
                  }`}
                >
                  {step > s ? "✓" : s}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Left Sidebar */}
        <div
          className="hidden lg:flex flex-col items-center justify-center w-1/2 h-full relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)",
          }}
        >
          <div
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: "#6366f1" }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15"
            style={{ background: "#a855f7" }}
          />

          <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full px-8">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full transition-all duration-700 transform ${animateSchool ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
              style={{
                background: "linear-gradient(135deg, #6366f1, #818cf8)",
              }}
            >
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l9-5-9-5-9 5 9 5zm0 0l9-5-9 5-9-5m9 5v5m0-5v5m0 0l-9-5m9 5l9-5"
                />
              </svg>
            </div>
            <h1
              className={`text-3xl font-black text-white mt-6 transition-all duration-700 transform ${animateTitle ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              Student Registration
            </h1>
            <p
              className={`text-gray-400 mt-2 transition-all duration-700 ${animateTagline ? "opacity-100" : "opacity-0"}`}
            >
              Create your account for Smart Academia
            </p>

            {/* Desktop Step Indicators */}
            <div className="flex items-center justify-center gap-6 mt-10">
              {[
                { num: 1, label: "Details" },
                { num: 2, label: "Verify" },
                { num: 3, label: "Complete" },
              ].map((s) => (
                <div key={s.num} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      step === s.num
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white scale-110 shadow-lg"
                        : step > s.num
                          ? "bg-green-500 text-white"
                          : "bg-gray-800 text-gray-500"
                    }`}
                  >
                    {step > s.num ? "✓" : s.num}
                  </div>
                  <span
                    className={`text-xs ${step >= s.num ? "text-indigo-400" : "text-gray-500"}`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Scrollable Form */}
        <div
          className="flex-1 flex flex-col items-center justify-start p-6 overflow-y-auto custom-scroll"
          style={{ background: "#0f1629", height: "100vh" }}
        >
          <div className="w-full max-w-md mx-auto py-4">
            {/* Form Header */}
            <div className="text-center mb-6">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
                style={{
                  background: "#6366f122",
                  border: "1px solid #6366f144",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "#6366f1" }}
                />
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  Student Registration
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                {step === 1 && "Create Account"}
                {step === 2 && "Verify Email"}
                {step === 3 && "Welcome!"}
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                {step === 1 && "Fill in your details to get started"}
                {step === 2 &&
                  `Enter the 6-digit code sent to ${formData.email}`}
                {step === 3 && "Your account has been successfully created"}
              </p>
            </div>

            {/* Error / Success banners */}
            {apiError && (
              <div
                className="rounded-xl p-3 flex items-center gap-2 mb-4"
                style={{
                  background: "#ef444422",
                  border: "1px solid #ef444444",
                }}
              >
                <span className="material-symbols-outlined text-sm text-red-400">
                  error
                </span>
                <p className="text-sm text-red-400 flex-1">{apiError}</p>
              </div>
            )}
            {apiSuccess && step !== 3 && (
              <div
                className="rounded-xl p-3 flex items-center gap-2 mb-4"
                style={{
                  background: "#22c55e22",
                  border: "1px solid #22c55e44",
                }}
              >
                <span className="material-symbols-outlined text-sm text-green-400">
                  check_circle
                </span>
                <p className="text-sm text-green-400 flex-1">{apiSuccess}</p>
              </div>
            )}

            {/* STEP 1: Registration Form */}
            {step === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                {renderInputField("fullName")}
                {renderInputField("studentId")}
                {renderInputField("email")}
                {renderInputField("password")}
                {renderInputField("confirmPassword")}

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Department
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                      corporate_fare
                    </span>
                    <select
                      className="w-full px-3 py-3 pl-10 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm border-gray-700 bg-gray-800/50 appearance-none"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      disabled={isLoading}
                    >
                      {departments.map((d) => (
                        <option
                          key={d}
                          value={d}
                          className="bg-gray-800 text-white hover:bg-indigo-600"
                        >
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Semester
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                      calendar_today
                    </span>
                    <select
                      className="w-full px-3 py-3 pl-10 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm border-gray-700 bg-gray-800/50 appearance-none"
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      disabled={isLoading}
                    >
                      {semesters.map((s) => (
                        <option
                          key={s}
                          value={s}
                          className="bg-gray-800 text-white hover:bg-indigo-600"
                        >
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #818cf8)",
                  }}
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
                      <span className="material-symbols-outlined text-base">
                        mail
                      </span>
                      Continue
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all hover:scale-105"
                  style={{
                    color: "#818cf8",
                    background: "transparent",
                    border: "1px solid #334155",
                  }}
                >
                  <span className="material-symbols-outlined text-base">
                    arrow_back
                  </span>
                  Back
                </button>
              </form>
            )}

            {/* STEP 2: OTP Verification */}
            {step === 2 && (
              <form onSubmit={handleVerifyAndRegister} className="space-y-6">
                <div className="flex justify-center">
                  <div
                    className="flex items-center justify-center w-16 h-16 rounded-full"
                    style={{
                      background: "#6366f122",
                      border: "1px solid #6366f144",
                    }}
                  >
                    <span className="material-symbols-outlined text-2xl text-indigo-400">
                      mark_email_unread
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center block mb-4">
                    Enter 6-digit OTP
                  </label>
                  <div
                    className="flex gap-2 justify-center flex-wrap"
                    onPaste={handleOTPPaste}
                  >
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
                        className={`w-10 h-12 text-center text-lg font-bold border-2 rounded-xl text-white focus:outline-none transition-all duration-200 ${
                          digit
                            ? "border-indigo-500 bg-indigo-500/20"
                            : "border-gray-700 bg-gray-800/50"
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
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #818cf8)",
                  }}
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
                      <span className="material-symbols-outlined text-base">
                        verified
                      </span>
                      Verify & Create Account
                    </>
                  )}
                </button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-500">
                    Didn't receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={countdown > 0 || isLoading}
                      className={`font-bold transition-all hover:scale-105 ${countdown > 0 ? "text-gray-500 cursor-not-allowed" : "text-indigo-400"}`}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                    </button>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setApiError("");
                      setApiSuccess("");
                      setOtp(["", "", "", "", "", ""]);
                    }}
                    className="text-sm text-gray-500 hover:text-indigo-400 transition-colors"
                  >
                    ← Back to form
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Success */}
            {step === 3 && (
              <div className="text-center space-y-6">
                <div
                  className="flex items-center justify-center w-20 h-20 rounded-full mx-auto"
                  style={{
                    background: "#22c55e22",
                    border: "1px solid #22c55e44",
                  }}
                >
                  <span className="material-symbols-outlined text-4xl text-green-400">
                    check_circle
                  </span>
                </div>
                <div>
                  <p className="text-gray-400">Registration successful!</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Redirecting to dashboard...
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="relative w-6 h-6">
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-900" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
                  </div>
                </div>
              </div>
            )}

            {/* Login Link */}
            {step !== 3 && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="font-bold transition-all hover:scale-105"
                    style={{ color: "#818cf8" }}
                  >
                    Sign in
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistration;
