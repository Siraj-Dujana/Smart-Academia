import React from 'react';

const HowItWorksSection = ({ 
  title = "How It Works",
  subtitle = "Get started in just a few simple steps and unlock your full learning potential.",
  steps = [
    { number: "1", icon: "person_add", title: "Register", description: "Create your account as a student or a teacher.", color: "#6366f1" },
    { number: "2", icon: "search", title: "Select Course", description: "Browse our extensive library and enroll in a course.", color: "#a855f7" },
    { number: "3", icon: "laptop_mac", title: "Learn & Practice", description: "Engage with lessons, complete labs, and take quizzes.", color: "#22c55e" },
    { number: "4", icon: "monitoring", title: "Track Progress", description: "See your performance and get insights from the dashboard.", color: "#f59e0b" }
  ],
  className = ""
}) => {
  return (
    <section id="how-it-works" className={`py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 ${className}`} style={{ background: "#0c0e1e" }}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#6366f1" }} />
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Simple Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            {title}
          </h2>
          <p className="text-gray-500 mt-3">
            {subtitle}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative rounded-2xl overflow-hidden p-6 flex flex-col items-center text-center gap-3 group transition-all duration-300 hover:scale-105"
              style={{ background: "#0f1629", border: `1px solid ${step.color}33` }}
            >
              {/* Breathing inner glow */}
              <div 
                className="absolute inset-0 transition-all duration-[4000ms] ease-in-out"
                style={{ 
                  background: `radial-gradient(circle at center, ${step.color} 0%, transparent 70%)`,
                  opacity: 0,
                  animation: 'breatheGlow 4s ease-in-out infinite',
                }}
              />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `radial-gradient(ellipse at 50% 0%, ${step.color}15 0%, transparent 80%)` }} />
              
              {/* Step Number */}
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg" style={{ background: `${step.color}22`, border: `1px solid ${step.color}44`, color: step.color }}>
                  {step.number}
                </div>
              </div>
              
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl flex items-center justify-center relative z-10 transition-all duration-300 group-hover:scale-110" style={{ background: `${step.color}22`, border: `1px solid ${step.color}44` }}>
                <span className="material-symbols-outlined text-2xl" style={{ color: step.color }}>{step.icon}</span>
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
              </div>
              
              {/* Connector line (only between steps on desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5" style={{ background: step.color, opacity: 0.3 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
          @keyframes breatheGlow {
            0%, 100% { opacity: 0; }
            50% { opacity: 0.25; }
          }
        `}
      </style>
    </section>
  );
};

export default HowItWorksSection;