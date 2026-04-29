import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import TermsPrivacyModal from './TermsPrivacyModal';

const Register = () => {
  // ========== STATE MANAGEMENT ==========
  const [formData, setFormData] = useState({
    role: "student",
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [showTermsModal, setShowTermsModal] = useState(false);

  // ========== ANIMATION STATES ==========
  const [animateSchool, setAnimateSchool] = useState(false);
  const [animateTitle, setAnimateTitle] = useState(false);
  const [animateTagline, setAnimateTagline] = useState(false);

  // ========== NAVIGATION HANDLERS ==========
  const handleStudentRegister = () => {
    if (formData.terms) {
      navigate('/register/student');
    } else {
      setErrors({ terms: "You must accept the terms and conditions" });
    }
  };

  const handleTeacherRegister = () => {
    if (formData.terms) {
      navigate('/register/teacher');
    } else {
      setErrors({ terms: "You must accept the terms and conditions" });
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  // ========== FORM HANDLERS ==========
  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    if (errors.terms) {
      setErrors((prev) => ({ ...prev, terms: "" }));
    }
  };

  const handleTermsAccept = () => {
    const newTermsValue = !formData.terms;
    setFormData((prev) => ({ ...prev, terms: newTermsValue }));
    if (errors.terms) {
      setErrors((prev) => ({ ...prev, terms: "" }));
    }
  };

  // ========== ANIMATION EFFECTS ==========
  useEffect(() => {
    const timer1 = setTimeout(() => setAnimateSchool(true), 300);
    const timer2 = setTimeout(() => setAnimateTitle(true), 600);
    const timer3 = setTimeout(() => setAnimateTagline(true), 900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

// ========== GLOW CARD COMPONENT ==========
const GlowCard = ({ icon, label, color, onClick, isSelected }) => {
  return (
    <div 
      className="relative rounded-2xl overflow-hidden py-4 px-4 flex items-center gap-3 group cursor-pointer transition-all duration-300 hover:scale-105" 
      style={{ 
        background: "#0f1629", 
        border: `2px solid ${isSelected ? color : `${color}33`}`,
      }}
      onClick={onClick}
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
        <span className="material-symbols-outlined text-xl transition-all duration-300 group-hover:scale-110" style={{ color }}>{icon}</span>
      </div>
      <div className="text-center relative z-10">
        <p className="text-sm font-bold text-white tracking-tight">{label}</p>
      </div>
      
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: color }} />
      )}
      
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

  return (
    <div className="min-h-screen w-full overflow-hidden" style={{ fontFamily: "'Lexend', sans-serif", background: "#0c0e1e" }}>
      <div className="min-h-screen flex flex-col lg:flex-row">
        
        {/* ========== MOBILE BRAND SECTION ========== */}
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

        {/* ========== DESKTOP BRAND SECTION ========== */}
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

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-3 mt-8 w-full">
              {[
                { icon: "auto_awesome", label: "AI Powered", color: "#6366f1" },
                { icon: "psychology", label: "Smart Learning", color: "#a855f7" },
                { icon: "support_agent", label: "24/7 Support", color: "#22c55e" },
                { icon: "verified", label: "Secure", color: "#f59e0b" }
              ].map((feature) => (
                <div key={feature.label} className="relative rounded-2xl overflow-hidden p-4 flex flex-col items-center gap-2 group" style={{ background: "#0f1629", border: `1px solid ${feature.color}33` }}>
                  {/* Breathing inner glow */}
                  <div 
                    className="absolute inset-0 transition-all duration-[4000ms] ease-in-out"
                    style={{ 
                      background: `radial-gradient(circle at center, ${feature.color} 0%, transparent 70%)`,
                      opacity: 0,
                      animation: 'breatheGlowFeature 4s ease-in-out infinite',
                    }}
                  />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `radial-gradient(ellipse at 50% 0%, ${feature.color}30 0%, transparent 80%)` }} />
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center relative z-10 transition-all duration-300 group-hover:scale-110" style={{ background: `${feature.color}22`, border: `1px solid ${feature.color}44` }}>
                    <span className="material-symbols-outlined text-lg transition-all duration-300 group-hover:scale-110" style={{ color: feature.color }}>{feature.icon}</span>
                  </div>
                  <div className="text-center relative z-10">
                    <p className="text-xs font-bold text-white tracking-tight">{feature.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========== REGISTRATION FORM SECTION ========== */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-8 overflow-y-auto" style={{ background: "#0f1629" }}>
          <div className="w-full max-w-md space-y-6 py-6">
            
            {/* Form Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#6366f1" }} />
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Join Us</span>
              </div>
              <h1 className="text-3xl font-black text-white">
                Join Smart Academia
              </h1>
              <p className="text-gray-500 mt-2 text-sm">
                Choose your role to get started
              </p>
            </div>

            {/* ========== ROLE SELECTION GLOW CARDS ========== */}
            <div className="grid grid-cols-2 gap-4">
              <GlowCard 
                icon="school"
                label="Student"
                color="#6366f1"
                isSelected={formData.role === 'student'}
                onClick={() => handleRoleSelect('student')}
              />
              
              <GlowCard 
                icon="person"
                label="Teacher"
                color="#a855f7"
                isSelected={formData.role === 'teacher'}
                onClick={() => handleRoleSelect('teacher')}
              />
            </div>


            {/* ========== TERMS AND CONDITIONS ========== */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <input
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-700 rounded mt-0.5 flex-shrink-0"
                  style={{ background: "#1e293b" }}
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={formData.terms}
                  onChange={handleTermsAccept}
                />
                <label
                  className="text-sm text-gray-400 leading-relaxed"
                  htmlFor="terms"
                >
                  I agree to the{" "}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                    className="font-medium transition-colors hover:scale-105"
                    style={{ color: "#818cf8" }}
                  >
                    Terms & Privacy Policy
                  </button>
                </label>
              </div>
              {errors.terms && (
                <p className="text-xs text-red-400 ml-7">
                  {errors.terms}
                </p>
              )}
            </div>

            {/* ========== CONTINUE BUTTON ========== */}
            <button
              onClick={formData.role === 'student' ? handleStudentRegister : handleTeacherRegister}
              disabled={!formData.terms}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
            >
              <span className="material-symbols-outlined text-base">arrow_forward</span>
              Continue as {formData.role === 'student' ? 'Student' : 'Teacher'}
            </button>

            {/* ========== LOGIN LINK ========== */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <button 
                  onClick={handleBackToLogin}
                  className="font-bold transition-all hover:scale-105"
                  style={{ color: "#818cf8" }}
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feature glow animation keyframes */}
      <style>
        {`
          @keyframes breatheGlowFeature {
            0%, 100% { 
              opacity: 0;
            }
            50% { 
              opacity: 0.25;
            }
          }
        `}
      </style>
      
      {/* Terms & Privacy Modal */}
      <TermsPrivacyModal 
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </div>
  );
};

export default Register;