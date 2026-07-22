import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

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
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Animation variants - matching ProblemSection
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
        duration: 0.6
      }
    }
  };

  const headerVariants = {
    hidden: { 
      opacity: 0, 
      y: -20 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 120,
        duration: 0.7
      }
    }
  };

  return (
    <section 
      id="features" 
      ref={sectionRef}
      className={`py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden ${className}`} 
      style={{ background: "#0c0e1e" }}
    >
      {/* Background gradients - matching ProblemSection */}
      <motion.div 
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: "#000000" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isVisible ? { opacity: 0.2, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      <motion.div 
        className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15"
        style={{ background: "#000000" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isVisible ? { opacity: 0.15, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl rounded-full blur-3xl opacity-10"
        style={{ background: "#000000" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isVisible ? { opacity: 0.1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
      />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header - Matching ProblemSection style */}
        <motion.div 
          className="flex flex-col items-center text-center max-w-3xl mx-auto"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={headerVariants}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
            {title}
          </h2>
          <p className="text-base md:text-lg text-gray-400 mt-3 max-w-2xl leading-relaxed">
            Empowering both students and teachers with cutting-edge tools
          </p>
        </motion.div>

        {/* Student Features */}
        <motion.div 
          className="mt-12 sm:mt-16"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div 
            className="flex items-center justify-center gap-3 mb-8"
            variants={headerVariants}
          >
            <motion.div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                background: `${features.student.color}22`, 
                border: `1px solid ${features.student.color}44`
              }}
              whileHover={{ 
                scale: 1.1,
                rotate: [0, -5, 5, 0],
                transition: { duration: 0.3 }
              }}
            >
              <span className="material-symbols-outlined text-2xl" style={{ color: features.student.color }}>{features.student.icon}</span>
            </motion.div>
            <motion.h3 
              className="text-xl font-bold text-white"
              whileHover={{ x: 3 }}
              transition={{ duration: 0.2 }}
            >
              {features.student.title}
            </motion.h3>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.student.features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative rounded-2xl overflow-hidden p-6 transition-all duration-300 hover:scale-[1.02] group"
                style={{ 
                  background: "#0c0e1e", 
                  border: `1px solid ${features.student.color}33`,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
                }}
                whileHover={{
                  boxShadow: `0 8px 40px ${features.student.color}25`,
                  transition: { duration: 0.3 }
                }}
              >
                {/* Hover overlay */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${features.student.color}15 0%, transparent 80%)` }}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
                
                <motion.div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110" 
                  style={{ 
                    background: `${features.student.color}22`, 
                    border: `1px solid ${features.student.color}44`
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.3 }
                  }}
                >
                  <span className="material-symbols-outlined text-2xl" style={{ color: features.student.color }}>{feature.icon}</span>
                </motion.div>
                <div className="relative z-10">
                  <motion.h4 
                    className="text-base font-bold text-white mb-1"
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    {feature.title}
                  </motion.h4>
                  <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">{feature.description}</p>
                </div>

                {/* Subtle glow on hover */}
                <motion.div 
                  className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ 
                    background: `linear-gradient(135deg, ${features.student.color}10, transparent 60%)`,
                  }}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Teacher Features */}
        <motion.div 
          className="mt-12 sm:mt-16"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div 
            className="flex items-center justify-center gap-3 mb-8"
            variants={headerVariants}
          >
            <motion.div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                background: `${features.teacher.color}22`, 
                border: `1px solid ${features.teacher.color}44`
              }}
              whileHover={{ 
                scale: 1.1,
                rotate: [0, -5, 5, 0],
                transition: { duration: 0.3 }
              }}
            >
              <span className="material-symbols-outlined text-2xl" style={{ color: features.teacher.color }}>{features.teacher.icon}</span>
            </motion.div>
            <motion.h3 
              className="text-xl font-bold text-white"
              whileHover={{ x: 3 }}
              transition={{ duration: 0.2 }}
            >
              {features.teacher.title}
            </motion.h3>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.teacher.features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative rounded-2xl overflow-hidden p-6 transition-all duration-300 hover:scale-[1.02] group"
                style={{ 
                  background: "#0c0e1e", 
                  border: `1px solid ${features.teacher.color}33`,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
                }}
                whileHover={{
                  boxShadow: `0 8px 40px ${features.teacher.color}25`,
                  transition: { duration: 0.3 }
                }}
              >
                {/* Hover overlay */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${features.teacher.color}15 0%, transparent 80%)` }}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
                
                <motion.div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110" 
                  style={{ 
                    background: `${features.teacher.color}22`, 
                    border: `1px solid ${features.teacher.color}44`
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.3 }
                  }}
                >
                  <span className="material-symbols-outlined text-2xl" style={{ color: features.teacher.color }}>{feature.icon}</span>
                </motion.div>
                <div className="relative z-10">
                  <motion.h4 
                    className="text-base font-bold text-white mb-1"
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    {feature.title}
                  </motion.h4>
                  <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">{feature.description}</p>
                </div>

                {/* Subtle glow on hover */}
                <motion.div 
                  className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ 
                    background: `linear-gradient(135deg, ${features.teacher.color}10, transparent 60%)`,
                  }}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
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