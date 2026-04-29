import React from 'react';

const AIDashboard = ({ 
  className = "",
  aspectRatio = "aspect-[3/1] xs:aspect-[2/1] sm:aspect-[5/2] md:aspect-[3/1] lg:aspect-video",
  borderRadius = "rounded-lg sm:rounded-xl",
}) => {
  const icons = [
    {
      position: "left-[5%] xs:left-[8%] sm:left-[10%] top-[15%] xs:top-[18%] sm:top-[20%]",
      icon: (
        <svg className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      label: "AI Brain",
      color: "#6366f1",
      animation: "animate-float-1"
    },
    {
      position: "right-[5%] xs:right-[8%] sm:right-[10%] top-[15%] xs:top-[18%] sm:top-[20%]",
      icon: (
        <svg className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      label: "Code Assistant",
      color: "#a855f7",
      animation: "animate-float-2"
    },
    {
      position: "left-1/2 bottom-[15%] xs:bottom-[18%] sm:bottom-[20%]",
      icon: (
        <svg className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      label: "Analytics",
      color: "#ffffff",
      animation: "animate-float-3",
      translate: "-translate-x-1/2"
    }
  ];

  const floatingElements = [
    { size: "w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4", position: { left: '10%', top: '10%' }, color: "#6366f1", animation: "animate-float-1" },
    { size: "w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3", position: { right: '10%', top: '10%' }, color: "#a855f7", animation: "animate-float-2" },
    { size: "w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4", position: { left: '5%', top: '45%' }, color: "#ffffff", animation: "animate-float-3" },
    { size: "w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3", position: { right: '5%', top: '45%' }, color: "#ffffff", animation: "animate-float-1" },
    { size: "w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4", position: { left: '18%', bottom: '10%' }, color: "#6366f1", animation: "animate-float-2" },
    { size: "w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3", position: { right: '18%', bottom: '10%' }, color: "#a855f7", animation: "animate-float-3" }
  ];

  return (
    <div className={`w-full ${aspectRatio} ${borderRadius} flex items-center justify-center relative overflow-hidden ${className}`} style={{ background: "transparent" }}>
      {/* Background glow effects - subtle */}
      <div className="absolute top-0 left-0 w-32 h-32 rounded-full blur-2xl opacity-10" style={{ background: "#6366f1" }} />
      <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-10" style={{ background: "#a855f7" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl opacity-5" style={{ background: "#6366f1" }} />
      
      <div className="relative w-full h-full flex items-center justify-center p-2 xs:p-3 sm:p-4">
        
        {/* Main Icons */}
        {icons.map((iconConfig, index) => (
          <div
            key={index}
            className={`absolute ${iconConfig.position} w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-lg sm:rounded-xl md:rounded-2xl flex flex-col items-center justify-center shadow-lg transform ${iconConfig.animation} z-10 ${iconConfig.translate || ''} transition-all duration-300 hover:scale-110`}
            style={{ background: iconConfig.color === "#ffffff" ? "rgba(255, 255, 255, 0.08)" : `${iconConfig.color}18`, border: `1px solid ${iconConfig.color === "#ffffff" ? "rgba(255, 255, 255, 0.2)" : `${iconConfig.color}33`}`, backdropFilter: 'blur(4px)' }}
          >
            <div style={{ color: iconConfig.color }}>
              {iconConfig.icon}
            </div>
            <span className="text-[8px] xs:text-[10px] sm:text-xs font-medium mt-1" style={{ color: iconConfig.color }}>
              {iconConfig.label}
            </span>
          </div>
        ))}
        
        {/* Central glowing orb - more subtle */}
        <div className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full blur-xl animate-pulse" style={{ background: "radial-gradient(circle, #6366f140 0%, transparent 70%)" }} />
        
        {/* Floating Elements */}
        {floatingElements.map((element, index) => (
          <div
            key={index}
            className={`absolute ${element.size} rounded-full ${element.animation}`}
            style={{
              left: element.position.left,
              top: element.position.top,
              right: element.position.right,
              bottom: element.position.bottom,
              background: element.color,
              opacity: element.color === "#ffffff" ? 0.2 : 0.25,
              boxShadow: `0 0 6px ${element.color}`
            }}
          />
        ))}
        
        {/* Data Flow Lines - more subtle */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-[15%] xs:left-[20%] sm:left-[25%] top-[20%] xs:top-[25%] sm:top-[30%] right-[15%] xs:right-[20%] sm:right-[25%] h-0.5 bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent animate-pulse" />
          <div className="absolute left-1/2 top-[30%] xs:top-[35%] sm:top-[40%] bottom-[20%] xs:bottom-[25%] sm:bottom-[30%] w-0.5 bg-gradient-to-b from-transparent via-purple-400/30 to-transparent animate-pulse" />
          <div className="absolute left-[30%] bottom-[25%] right-[30%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
      </div>

      <style>
        {`
          @keyframes float-1 {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes float-2 {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          @keyframes float-3 {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
          }
          .animate-float-1 { animation: float-1 3s ease-in-out infinite; }
          .animate-float-2 { animation: float-2 4s ease-in-out infinite; }
          .animate-float-3 { animation: float-3 3.5s ease-in-out infinite; }
        `}
      </style>
    </div>
  );
};

export default AIDashboard;