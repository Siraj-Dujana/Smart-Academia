import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const FeaturesSection = ({ 
  title = "One Platform, Two Powerful Experiences",
  features = {
    student: {
      title: "For Students: Your Learning Companion",
      color: "#6366f1",
      features: [
        { title: "Interactive Lessons", description: "Engaging multimedia content in structured learning paths" },
        { title: "AI-Powered Quizzes", description: "Intelligent assessments with instant feedback" },
        { title: "Auto-Graded Coding Labs", description: "Real-time code evaluation and feedback" },
        { title: "Progress Analyzer", description: "Visual insights into your learning journey" },
        { title: "AI Tutor Chatbot", description: "24/7 personalized learning assistance" },
        { title: "Anti-Cheating System", description: "Ensuring academic integrity in assessments" }
      ]
    },
    teacher: {
      title: "For Teachers: Your Command Center",
      color: "#a855f7",
      features: [
        { title: "Course Management", description: "Create and organize engaging course content" },
        { title: "Lab Management", description: "Define and manage coding assignments" },
        { title: "Automated Grading", description: "Save time with AI-powered assessment" },
        { title: "Student Monitoring", description: "Track progress and identify needs" },
        { title: "Announcements", description: "Communicate effectively with students" },
        { title: "Academic Integrity", description: "Maintain fair assessment practices" }
      ]
    }
  },
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
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

  const getUniqueKey = (section, index) => {
    return `${section}-${index}`;
  };

  return (
    <section 
      id="features" 
      ref={sectionRef}
      className={`py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden ${className}`} 
      style={{ background: "#0c0e1e" }}
    >
      {/* Background gradients */}
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
        {/* Section Header */}
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
            className="flex items-center justify-center mb-8"
            variants={headerVariants}
          >
            <motion.h3 
              className="text-xl font-bold text-white"
              whileHover={{ x: 3 }}
              transition={{ duration: 0.2 }}
            >
              {features.student.title}
            </motion.h3>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.student.features.map((feature, index) => {
              const key = getUniqueKey('student', index);
              const isHovered = hoveredIndex === key;
              
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative rounded-2xl overflow-hidden p-0 transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
                  style={{ 
                    background: "#0c0e1e", 
                    border: `1px solid ${features.student.color}33`,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                    minHeight: '120px'
                  }}
                  whileHover={{
                    boxShadow: `0 8px 40px ${features.student.color}25`,
                    transition: { duration: 0.3 }
                  }}
                  onMouseEnter={() => setHoveredIndex(key)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Hover overlay */}
                  <motion.div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${features.student.color}15 0%, transparent 80%)` }}
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  
                  {/* Sliding background - bottom to top (like Header nav) */}
                  <div 
                    className={`absolute inset-0 bg-white transform transition-transform duration-500 ease-out ${
                      isHovered ? 'translate-y-0' : 'translate-y-full'
                    }`}
                  />
                  
                  <div className="relative z-10 p-6 min-h-[120px] flex items-center">
                    <div className="w-full text-center">
                      {/* Feature Title - Always visible, changes color on hover */}
                      <motion.h4 
                        className={`text-base font-bold transition-colors duration-300 ${
                          isHovered ? 'text-black' : 'text-white'
                        }`}
                        animate={{
                          y: isHovered ? -5 : 0
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {feature.title}
                      </motion.h4>
                      
                      {/* Feature Description - slides in from bottom on hover */}
                      <motion.p 
                        className="text-sm text-center transition-all duration-300 mt-1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: isHovered ? 1 : 0,
                          y: isHovered ? 0 : 10
                        }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        style={{
                          color: isHovered ? '#000000' : 'transparent'
                        }}
                      >
                        {feature.description}
                      </motion.p>
                    </div>
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
              );
            })}
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
            className="flex items-center justify-center mb-8"
            variants={headerVariants}
          >
            <motion.h3 
              className="text-xl font-bold text-white"
              whileHover={{ x: 3 }}
              transition={{ duration: 0.2 }}
            >
              {features.teacher.title}
            </motion.h3>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.teacher.features.map((feature, index) => {
              const key = getUniqueKey('teacher', index);
              const isHovered = hoveredIndex === key;
              
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative rounded-2xl overflow-hidden p-0 transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
                  style={{ 
                    background: "#0c0e1e", 
                    border: `1px solid ${features.teacher.color}33`,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                    minHeight: '120px'
                  }}
                  whileHover={{
                    boxShadow: `0 8px 40px ${features.teacher.color}25`,
                    transition: { duration: 0.3 }
                  }}
                  onMouseEnter={() => setHoveredIndex(key)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Hover overlay */}
                  <motion.div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${features.teacher.color}15 0%, transparent 80%)` }}
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  
                  {/* Sliding background - bottom to top (like Header nav) */}
                  <div 
                    className={`absolute inset-0 bg-white transform transition-transform duration-500 ease-out ${
                      isHovered ? 'translate-y-0' : 'translate-y-full'
                    }`}
                  />
                  
                  <div className="relative z-10 p-6 min-h-[120px] flex items-center">
                    <div className="w-full text-center">
                      {/* Feature Title - Always visible, changes color on hover */}
                      <motion.h4 
                        className={`text-base font-bold transition-colors duration-300 ${
                          isHovered ? 'text-black' : 'text-white'
                        }`}
                        animate={{
                          y: isHovered ? -5 : 0
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {feature.title}
                      </motion.h4>
                      
                      {/* Feature Description - slides in from bottom on hover */}
                      <motion.p 
                        className="text-sm text-center transition-all duration-300 mt-1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: isHovered ? 1 : 0,
                          y: isHovered ? 0 : 10
                        }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        style={{
                          color: isHovered ? '#000000' : 'transparent'
                        }}
                      >
                        {feature.description}
                      </motion.p>
                    </div>
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
              );
            })}
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