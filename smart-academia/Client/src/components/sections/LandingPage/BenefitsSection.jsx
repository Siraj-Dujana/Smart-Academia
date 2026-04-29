import React from 'react';

const BenefitsSection = ({ 
  title = "Why Choose Smart Academia?",
  subtitle = "We fill the gaps that other platforms miss",
  benefits = [
    { icon: "auto_awesome", title: "AI-Powered", description: "Personalized learning beyond static content", color: "#6366f1" },
    { icon: "code", title: "Auto-Graded Labs", description: "Instant feedback on coding assignments", color: "#a855f7" },
    { icon: "group", title: "Dual Platform", description: "Complete ecosystem for students & teachers", color: "#22c55e" },
    { icon: "security", title: "Anti-Cheating", description: "Built-in integrity measures for fair assessment", color: "#f59e0b" }
  ],
  className = ""
}) => {
  return (
    <section className={`py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 ${className}`} style={{ background: "#0f1629" }}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#6366f1" }} />
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Smart Academia Benefits</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            {title}
          </h2>
          <p className="text-gray-500 mt-3">
            {subtitle}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="relative rounded-2xl overflow-hidden p-6 flex flex-col items-center text-center gap-3 group transition-all duration-300 hover:scale-105"
              style={{ background: "#0f1629", border: `1px solid ${benefit.color}33` }}
            >
              {/* Breathing inner glow */}
              <div 
                className="absolute inset-0 transition-all duration-[4000ms] ease-in-out"
                style={{ 
                  background: `radial-gradient(circle at center, ${benefit.color} 0%, transparent 70%)`,
                  opacity: 0,
                  animation: 'breatheGlow 4s ease-in-out infinite',
                }}
              />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `radial-gradient(ellipse at 50% 0%, ${benefit.color}15 0%, transparent 80%)` }} />
              
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl flex items-center justify-center relative z-10 transition-all duration-300 group-hover:scale-110" style={{ background: `${benefit.color}22`, border: `1px solid ${benefit.color}44` }}>
                <span className="material-symbols-outlined text-2xl" style={{ color: benefit.color }}>{benefit.icon}</span>
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{benefit.description}</p>
              </div>
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

export default BenefitsSection;