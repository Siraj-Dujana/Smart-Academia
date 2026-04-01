import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';

const TeacherRegistration = () => {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: "", employeeId: "", email: "", password: "",
    confirmPassword: "", department: "Computer Science",
    specialization: "", qualification: "",
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
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (step === 2) setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }, [step]);

  useEffect(() => {
    if (formData.confirmPassword) validateField("confirmPassword", formData.confirmPassword);
  }, [formData.password]);

  const fieldConfig = {
    fullName: {
      label: "Full Name", icon: "person", type: "text",
      placeholder: "Enter your full name",
      validation: (v) => v.trim().length >= 2,
      successMsg: "Name looks good!", errorMsg: "Full name is required",
    },
    employeeId: {
      label: "CMS ID", icon: "badge", type: "text",
      placeholder: "e.g. 023-22-0327",
      validation: (v) => /^\d{3}-\d{2}-\d{4}$/.test(v),
      successMsg: "Valid CMS ID!", errorMsg: "Format: XXX-XX-XXXX",
    },
    email: {
      label: "Email", icon: "mail", type: "email",
      placeholder: "Enter your email address",
      validation: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      successMsg: "Email format is correct!", errorMsg: "Valid email is required",
    },
    password: {
      label: "Password", icon: "lock", type: "password",
      placeholder: "Create a password",
      validation: (v) => v.length >= 8 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v),
      successMsg: "Strong password!", errorMsg: "8+ chars with uppercase, lowercase & number",
    },
    confirmPassword: {
      label: "Confirm Password", icon: "lock", type: "password",
      placeholder: "Confirm your password",
      validation: (v, all) => v === all.password && v.length > 0,
      successMsg: "Passwords match!", errorMsg: "Passwords do not match",
    },
    specialization: {
      label: "Specialization", icon: "psychology", type: "text",
      placeholder: "e.g. Machine Learning",
      validation: (v) => v.trim().length >= 2,
      successMsg: "Specialization added!", errorMsg: "Specialization is required",
    },
    qualification: {
      label: "Qualification", icon: "school", type: "text",
      placeholder: "e.g. PhD Computer Science",
      validation: (v) => v.trim().length >= 2,
      successMsg: "Qualification added!", errorMsg: "Qualification is required",
    },
  };

  const departments = ["Computer Science", "Business Administration", "Mechanical Engineering", "Fine Arts", "Electrical Engineering", "Civil Engineering", "Mathematics", "Physics"];

  const validateField = (name, value) => {
    if (fieldConfig[name]) {
      const { validation, successMsg } = fieldConfig[name];
      const isValid = name === "confirmPassword" ? validation(value, formData) : validation(value);
      setSuccess(prev => ({ ...prev, [name]: isValid ? successMsg : "" }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setApiError("");
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    validateField(name, value);
  };

  const triggerShake = (field) => {
    setShake(prev => ({ ...prev, [field]: true }));
    setTimeout(() => setShake(prev => ({ ...prev, [field]: false })), 500);
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(fieldConfig).forEach(field => {
      const { validation, errorMsg } = fieldConfig[field];
      const isValid = field === "confirmPassword" ? validation(formData[field], formData) : validation(formData[field]);
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
      Object.keys(formErrors).forEach(f => triggerShake(f));
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/otp/send-reg-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, fullName: formData.fullName }),
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
    if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOTPPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted.split("")); otpRefs.current[5]?.focus(); }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setApiError("");
    const otpValue = otp.join("");
    if (otpValue.length !== 6) return setApiError("Please enter the complete 6-digit OTP");

    setIsLoading(true);
    try {
      const verifyRes = await fetch(`${API}/api/otp/verify-reg-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: otpValue }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) return setApiError(verifyData.message);

      const regRes = await fetch(`${API}/api/auth/register/teacher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          employeeId: formData.employeeId,
          email: formData.email,
          password: formData.password,
          department: formData.department,
          specialization: formData.specialization,
          qualification: formData.qualification,
        }),
      });
      const regData = await regRes.json();
      if (!regRes.ok) return setApiError(regData.message);

      localStorage.setItem("token", regData.token);
      localStorage.setItem("user", JSON.stringify(regData.user));
      setApiSuccess("Registration successful! Redirecting...");
      setTimeout(() => navigate('/teacher/dashboard'), 1500);
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
        body: JSON.stringify({ email: formData.email, fullName: formData.fullName }),
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
                onClick={() => fieldName === "password" ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}>
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

  const features = ["Course Management", "AI Analytics", "Student Progress", "Secure"];

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

        {/* Desktop Brand */}
        <div className="hidden lg:flex flex-col items-center bg-gray-50 dark:bg-gray-800 w-1/2 p-8 lg:p-12 text-center">
          <div className="flex flex-col items-center gap-6 max-w-md mt-25">
            <div className={`mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 text-white transition-all duration-700 transform ${animateSchool ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
              <span className="material-symbols-outlined" style={{ fontSize: "3rem" }}>school</span>
            </div>
            <h1 className={`text-3xl lg:text-4xl font-bold transition-all duration-700 transform ${animateTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Teacher Registration
            </h1>
            <p className={`text-xl text-gray-600 dark:text-gray-300 transition-all duration-700 ${animateTagline ? 'opacity-100' : 'opacity-0'}`}>
              Create your account to manage courses, labs, quizzes, and student progress.
            </p>

            {/* Step indicators */}
            <div className="flex items-center gap-3 mt-4">
              {[{ num: 1, label: "Fill Form" }, { num: 2, label: "Verify Email" }, { num: 3, label: "Done" }].map((s, i) => (
                <div key={s.num} className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      step === s.num ? "bg-blue-600 text-white scale-110" :
                      step > s.num ? "bg-green-500 text-white" :
                      "bg-gray-200 dark:bg-gray-600 text-gray-500"
                    }`}>
                      {step > s.num ? "✓" : s.num}
                    </div>
                    <span className={`text-xs ${step >= s.num ? "text-blue-600 font-medium" : "text-gray-400"}`}>{s.label}</span>
                  </div>
                  {i < 2 && <div className={`w-8 h-0.5 mb-4 ${step > s.num ? "bg-green-500" : "bg-gray-200 dark:bg-gray-600"}`} />}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {features.map(f => (
                <span key={f} className="px-3 py-2 bg-white dark:bg-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-sm"
                  style={{ opacity: animateTagline ? 1 : 0, transition: 'all 0.5s' }}>{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-2xl">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 shadow-sm">

              {apiError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-600 text-lg">error</span>
                  <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
                </div>
              )}
              {apiSuccess && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                  <p className="text-sm text-green-600 dark:text-green-400">{apiSuccess}</p>
                </div>
              )}

              {/* STEP 1: Form */}
              {step === 1 && (
                <form onSubmit={handleSendOTP} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                    {renderInputField("fullName")}
                    {renderInputField("employeeId")}
                  </div>
                  {renderInputField("email")}
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                    {renderInputField("password")}
                    {renderInputField("confirmPassword")}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                    <label className="flex flex-col">
                      <p className="pb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Department</p>
                      <div className="relative flex w-full items-center">
                        <span className="material-symbols-outlined pointer-events-none absolute left-3 text-gray-400 text-lg">corporate_fare</span>
                        <select className="w-full px-3 py-3 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          name="department" value={formData.department} onChange={handleChange} disabled={isLoading}>
                          {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <span className="material-symbols-outlined pointer-events-none absolute right-3 text-gray-400 text-lg">expand_more</span>
                      </div>
                    </label>
                    {renderInputField("specialization")}
                  </div>
                  {renderInputField("qualification")}
                  <div className="flex flex-col gap-3">
                    <button type="submit" disabled={isLoading}
                      className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      {isLoading ? (
                        <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Sending OTP...</>
                      ) : (
                        <><span className="material-symbols-outlined text-base">mail</span> Verify Email & Continue</>
                      )}
                    </button>
                    <button type="button" onClick={() => navigate('/register')} disabled={isLoading}
                      className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors">
                      Back to Role Selection
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: OTP */}
              {step === 2 && (
                <form onSubmit={handleVerifyAndRegister} className="space-y-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mx-auto mb-4">
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">mark_email_unread</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Check Your Email</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      We sent a 6-digit code to <strong>{formData.email}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">Enter the 6-digit OTP</label>
                    <div className="flex gap-3 justify-center" onPaste={handleOTPPaste}>
                      {otp.map((digit, index) => (
                        <input key={index} ref={el => otpRefs.current[index] = el}
                          type="text" inputMode="numeric" maxLength={1} value={digit}
                          onChange={e => handleOTPInput(index, e.target.value)}
                          onKeyDown={e => handleOTPKeyDown(index, e)}
                          className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none transition-all duration-200 ${
                            digit ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600"
                          } focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                          disabled={isLoading} />
                      ))}
                    </div>
                    <p className="text-center text-xs text-gray-500 mt-2">You can paste the OTP directly</p>
                  </div>

                  <button type="submit" disabled={isLoading || otp.join("").length !== 6}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {isLoading ? (
                      <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Verifying & Creating Account...</>
                    ) : "Verify & Create Account"}
                  </button>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Didn't receive the code?{" "}
                      <button type="button" onClick={handleResendOTP} disabled={countdown > 0 || isLoading}
                        className={`font-medium transition-colors ${countdown > 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:text-blue-500"}`}>
                        {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                      </button>
                    </p>
                    <button type="button" onClick={() => { setStep(1); setApiError(""); setApiSuccess(""); setOtp(["","","","","",""]); }}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                      ← Edit registration details
                    </button>
                  </div>
                </form>
              )}

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

export default TeacherRegistration;