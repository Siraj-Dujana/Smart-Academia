import React from 'react';

const FeaturesSection = ({ 
  title = "One Platform, Two Powerful Experiences",
  features = {
    student: {
      icon: "school",
      title: "For Students: Your Learning Companion",
      color: "#6366f1",
      features: [
        { icon: "auto_stories", title: "Interactive Lessons", description: "Engaging multimedia content in structured learning paths" },
        { icon: "quiz", title: "AI-Powered Quizzes", description: "Intelligent assessments with instant feedback" },
        { icon: "terminal", title: "Auto-Graded Coding Labs", description: "Real-time code evaluation and feedback" },
        { icon: "analytics", title: "Progress Analyzer", description: "Visual insights into your learning journey" },
        { icon: "smart_toy", title: "AI Tutor Chatbot", description: "24/7 personalized learning assistance" },
        { icon: "security", title: "Anti-Cheating System", description: "Ensuring academic integrity in assessments" }
      ]
    },
    teacher: {
      icon: "groups",
      title: "For Teachers: Your Command Center",
      color: "#a855f7",
      features: [
        { icon: "library_books", title: "Course Management", description: "Create and organize engaging course content" },
        { icon: "assignment", title: "Lab Management", description: "Define and manage coding assignments" },
        { icon: "grade", title: "Automated Grading", description: "Save time with AI-powered assessment" },
        { icon: "monitoring", title: "Student Monitoring", description: "Track progress and identify needs" },
        { icon: "notifications", title: "Announcements", description: "Communicate effectively with students" },
        { icon: "admin_panel_settings", title: "Academic Integrity", description: "Maintain fair assessment practices" }
      ]
    }
  },
  className = ""
}) => {
  return (
    <section id="features" className={`py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 ${className}`} style={{ background: "#0c0e1e" }}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#6366f1" }} />
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Platform Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            {title}
          </h2>
          <p className="text-gray-500 mt-3">
            Empowering both students and teachers with cutting-edge tools
          </p>
        </div>

        {/* Student Features */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
              <span className="material-symbols-outlined text-xl" style={{ color: "#6366f1" }}>{features.student.icon}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">{features.student.title}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.student.features.map((feature, index) => (
              <div
                key={index}
                className="relative rounded-2xl overflow-hidden p-5 flex flex-col gap-3 group transition-all duration-300 hover:scale-105"
                style={{ background: "#0f1629", border: `1px solid ${features.student.color}33` }}
              >
                {/* Breathing inner glow */}
                <div 
                  className="absolute inset-0 transition-all duration-[4000ms] ease-in-out"
                  style={{ 
                    background: `radial-gradient(circle at center, ${features.student.color} 0%, transparent 70%)`,
                    opacity: 0,
                    animation: 'breatheGlow 4s ease-in-out infinite',
                  }}
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `radial-gradient(ellipse at 50% 0%, ${features.student.color}15 0%, transparent 80%)` }} />
                
                <div className="w-12 h-12 rounded-xl flex items-center justify-center relative z-10 transition-all duration-300 group-hover:scale-110" style={{ background: `${features.student.color}22`, border: `1px solid ${features.student.color}44` }}>
                  <span className="material-symbols-outlined text-xl" style={{ color: features.student.color }}>{feature.icon}</span>
                </div>
                <div className="relative z-10">
                  <h4 className="text-base font-bold text-white mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Features */}
        <div>
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#a855f722", border: "1px solid #a855f744" }}>
              <span className="material-symbols-outlined text-xl" style={{ color: "#a855f7" }}>{features.teacher.icon}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">{features.teacher.title}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.teacher.features.map((feature, index) => (
              <div
                key={index}
                className="relative rounded-2xl overflow-hidden p-5 flex flex-col gap-3 group transition-all duration-300 hover:scale-105"
                style={{ background: "#0f1629", border: `1px solid ${features.teacher.color}33` }}
              >
                {/* Breathing inner glow */}
                <div 
                  className="absolute inset-0 transition-all duration-[4000ms] ease-in-out"
                  style={{ 
                    background: `radial-gradient(circle at center, ${features.teacher.color} 0%, transparent 70%)`,
                    opacity: 0,
                    animation: 'breatheGlow 4s ease-in-out infinite',
                  }}
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `radial-gradient(ellipse at 50% 0%, ${features.teacher.color}15 0%, transparent 80%)` }} />
                
                <div className="w-12 h-12 rounded-xl flex items-center justify-center relative z-10 transition-all duration-300 group-hover:scale-110" style={{ background: `${features.teacher.color}22`, border: `1px solid ${features.teacher.color}44` }}>
                  <span className="material-symbols-outlined text-xl" style={{ color: features.teacher.color }}>{feature.icon}</span>
                </div>
                <div className="relative z-10">
                  <h4 className="text-base font-bold text-white mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
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

export default FeaturesSection;