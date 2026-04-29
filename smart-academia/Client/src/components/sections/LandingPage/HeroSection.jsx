import React, { useState, useEffect } from 'react';
import AIDashboard from './AIDashboard';

const HeroSection = ({ 
  title = "Revolutionize Learning with AI",
  subtitle = "SmartAcademia empowers students to master complex topics with personalized AI support, while giving teachers powerful tools to automate grading and track progress.",
  buttonText = "Get Started",
  onButtonClick,
  className = ""
}) => {
  const [animateTitle, setAnimateTitle] = useState(false);
  const [animateSubtitle, setAnimateSubtitle] = useState(false);
  const [animateButton, setAnimateButton] = useState(false);
  const [animateDashboard, setAnimateDashboard] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setAnimateTitle(true), 300);
    const t2 = setTimeout(() => setAnimateSubtitle(true), 600);
    const t3 = setTimeout(() => setAnimateButton(true), 900);
    const t4 = setTimeout(() => setAnimateDashboard(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8" style={{ background: "#0c0e1e" }}>
      {/* Background gradients - same as login page */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: "#6366f1" }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ background: "#a855f7" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl rounded-full blur-3xl opacity-10" style={{ background: "#6366f1" }} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          
          {/* Left Content */}
          <div className="flex flex-col gap-4 sm:gap-6 text-center lg:text-left">
            {/* School Icon - Same as login page */}
            {/* <div className={`flex justify-center lg:justify-start mb-2 transition-all duration-700 transform ${animateTitle ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
              <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l9-5-9 5-9-5m9 5v5m0-5v5m0 0l-9-5m9 5l9-5" />
                </svg>
              </div>
            </div> */}
            
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-white transition-all duration-700 transform ${animateTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {title}
            </h1>
            
            <p className={`text-base md:text-lg text-gray-400 leading-relaxed transition-all duration-700 ${animateSubtitle ? 'opacity-100' : 'opacity-0'}`}>
              {subtitle}
            </p>
            
            <div className={`flex justify-center lg:justify-start mt-4 transition-all duration-700 transform ${animateButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <button 
                onClick={onButtonClick}
                className="flex items-center justify-center gap-2 rounded-xl h-12 px-8 text-sm font-bold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
              >
                <span className="material-symbols-outlined text-base">auto_awesome</span>
                <span>{buttonText}</span>
              </button>
            </div>
          </div>
          
          {/* Right Dashboard */}
          <div className={`order-first lg:order-last transition-all duration-700 transform ${animateDashboard ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <AIDashboard />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;