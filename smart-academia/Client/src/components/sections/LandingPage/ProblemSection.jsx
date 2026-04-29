import React from 'react';
import ChallengeCard from '../../cards/LandingPage/ChallengeCard';

const ProblemSection = ({ 
  title = "The Challenges in Modern Education",
  subtitle = "Addressing the core issues that hinder effective learning and teaching",
  challenges = [
    {
      icon: "school",
      title: "Students Struggle With",
      challenges: [
        "No timely feedback on coding labs and assignments",
        "Lack of structured, progressive learning paths",
        "Difficulty tracking academic performance",
        "Limited access to personalized learning resources"
      ],
      color: "#6366f1"
    },
    {
      icon: "groups",
      title: "Teachers Face",
      challenges: [
        "Excessive time spent on manual grading",
        "Difficulty monitoring student progress",
        "Limited tools for interactive content",
        "Challenges in maintaining academic integrity"
      ],
      color: "#a855f7"
    }
  ],
  className = ""
}) => {
  return (
    <section id="solutions" className={`py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 ${className}`} style={{ background: "#0f1629" }}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ background: "#ef444422", border: "1px solid #ef444444" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#ef4444" }} />
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Problems We Solve</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            {title}
          </h2>
          <p className="text-gray-500 mt-3 max-w-2xl">
            {subtitle}
          </p>
        </div>
        
        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 sm:mt-16">
          {challenges.map((challenge, index) => (
            <div
              key={index}
              className="relative rounded-2xl overflow-hidden p-6 transition-all duration-300 hover:scale-105"
              style={{ background: "#0f1629", border: `1px solid ${challenge.color}33` }}
            >
              {/* Breathing inner glow */}
              <div 
                className="absolute inset-0 transition-all duration-[4000ms] ease-in-out"
                style={{ 
                  background: `radial-gradient(circle at center, ${challenge.color} 0%, transparent 70%)`,
                  opacity: 0,
                  animation: 'breatheGlow 4s ease-in-out infinite',
                }}
              />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `radial-gradient(ellipse at 50% 0%, ${challenge.color}15 0%, transparent 80%)` }} />
              
              {/* Header */}
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${challenge.color}22`, border: `1px solid ${challenge.color}44` }}>
                  <span className="material-symbols-outlined text-2xl" style={{ color: challenge.color }}>{challenge.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{challenge.title}</h3>
              </div>
              
              {/* Challenges List */}
              <ul className="space-y-3 relative z-10">
                {challenge.challenges.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-base mt-0.5" style={{ color: challenge.color }}>error</span>
                    <span className="text-gray-400 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
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

export default ProblemSection;