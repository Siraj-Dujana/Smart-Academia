import React from 'react';

const CTASection = ({ 
  title = "Ready to Transform Your Academic Journey?",
  subtitle = "Join thousands of students and educators who are already using Smart Academia to enhance their learning and teaching experience.",
  primaryButton = {
    text: "Get Started Free",
    onClick: () => {}
  },
  secondaryButton = {
    text: "Login to Account",
    onClick: () => {}
  },
  className = ""
}) => {
  return (
    <section className={`relative overflow-hidden py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 ${className}`} style={{ background: "#0c0e1e" }}>
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: "#6366f1" }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ background: "#a855f7" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl rounded-full blur-3xl opacity-10" style={{ background: "#6366f1" }} />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-gray-800 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 mx-auto" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#6366f1" }} />
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Get Started Today</span>
          </div>
          
          {/* Title */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            {title}
          </h2>
          
          {/* Subtitle */}
          <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            {subtitle}
          </p>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={primaryButton.onClick}
              className="flex items-center justify-center gap-2 rounded-xl px-6 sm:px-8 py-3 text-sm sm:text-base font-bold text-white transition-all duration-300 hover:scale-105 shadow-lg"
              style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              <span>{primaryButton.text}</span>
            </button>
            <button 
              onClick={secondaryButton.onClick}
              className="flex items-center justify-center gap-2 rounded-xl px-6 sm:px-8 py-3 text-sm sm:text-base font-medium transition-all duration-300 hover:scale-105"
              style={{ color: "#818cf8", background: "transparent", border: "1px solid #334155" }}
            >
              <span className="material-symbols-outlined text-base">login</span>
              <span>{secondaryButton.text}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;