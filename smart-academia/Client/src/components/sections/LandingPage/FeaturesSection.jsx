import React from 'react';
import FeatureCard from '../../cards/LandingPage/FeatureCard';

const FeaturesSection = ({ 
  title = "One Platform, Two Powerful Experiences",
  features = {
    student: {
      icon: "school",
      title: "For Students: Your Learning Companion",
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
  background = "bg-white dark:bg-gray-900",
  padding = "py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8",
  className = ""
}) => {
  return (
    <section id="features" className={`${padding} ${background} ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col gap-8 sm:gap-10">
        <div className="flex flex-col gap-3 sm:gap-4 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em]">
            {title}
          </h2>
        </div>

        {/* Student Features */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 justify-center">
            <span className="material-symbols-outlined text-blue-600 text-2xl sm:text-3xl">{features.student.icon}</span>
            <h3 className="text-xl sm:text-2xl font-bold text-center">{features.student.title}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.student.features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>

        {/* Teacher Features */}
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 justify-center">
            <span className="material-symbols-outlined text-blue-600 text-2xl sm:text-3xl">{features.teacher.icon}</span>
            <h3 className="text-xl sm:text-2xl font-bold text-center">{features.teacher.title}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.teacher.features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;