import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const HowItWorksSection = ({ 
  title = "How It Works",
  subtitle = "Get started in just a few simple steps and unlock your full learning potential.",
  steps = [
    { number: "01", title: "Register", description: "Create your account as a student or a teacher and join the Smart Academia community.", color: "#6366f1" },
    { number: "02", title: "Select Course", description: "Browse our extensive library and enroll in a course that matches your interests.", color: "#6366f1" },
    { number: "03", title: "Learn & Practice", description: "Engage with interactive lessons, complete coding labs, and take AI-powered quizzes.", color: "#6366f1" },
    { number: "04", title: "Track Progress", description: "Monitor your performance, get AI-powered insights, and celebrate your achievements.", color: "#6366f1" }
  ],
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

  return (
    <section 
      id="how-it-works" 
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
            {subtitle}
          </p>
        </motion.div>
        
        {/* Steps Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 sm:mt-16 relative"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Connector lines between steps */}
          <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5" style={{ background: "linear-gradient(90deg, #ffffff, #f6f4f8, #ffffff, #ffffff)", opacity: 1 }} />
          
          {steps.map((step, index) => {
            const isHovered = hoveredIndex === index;
            
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative rounded-2xl overflow-hidden p-0 transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
                style={{ 
                  background: "#0c0e1e", 
                  border: `1px solid ${step.color}33`,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                  minHeight: '280px'
                }}
                whileHover={{
                  boxShadow: `0 8px 40px ${step.color}25`,
                  transition: { duration: 0.3 }
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Hover overlay */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${step.color}15 0%, transparent 80%)` }}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
                
                {/* Sliding background - bottom to top */}
                <div 
                  className={`absolute inset-0 bg-white transform transition-transform duration-500 ease-out ${
                    isHovered ? 'translate-y-0' : 'translate-y-full'
                  }`}
                />
                
                <div className="relative z-10 p-6 min-h-[280px] flex flex-col items-center justify-center">
                  {/* Step Number - Large and prominent */}
                  <motion.div 
                    className="text-6xl sm:text-7xl font-black transition-colors duration-300 mb-4"
                    style={{
                      color: isHovered ? '#000000' : step.color,
                      opacity: isHovered ? 0.15 : 0.3
                    }}
                    animate={{
                      scale: isHovered ? 1.1 : 1,
                      opacity: isHovered ? 0.15 : 0.3
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {step.number}
                  </motion.div>
                  
                  {/* Step Title */}
                  <motion.h3 
                    className={`text-xl font-bold transition-colors duration-300 text-center ${
                      isHovered ? 'text-black' : 'text-white'
                    }`}
                    animate={{
                      y: isHovered ? -5 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {step.title}
                  </motion.h3>
                  
                  {/* Step Description */}
                  <motion.p 
                    className="text-sm text-center transition-all duration-300 mt-2 max-w-xs"
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
                    {step.description}
                  </motion.p>
                  
                  {/* Step indicator dot */}
                  <motion.div 
                    className="w-2 h-2 rounded-full mt-4 transition-colors duration-300"
                    style={{
                      background: isHovered ? '#000000' : step.color,
                      opacity: isHovered ? 1 : 0.5
                    }}
                  />
                </div>

                {/* Subtle glow on hover */}
                <motion.div 
                  className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ 
                    background: `linear-gradient(135deg, ${step.color}10, transparent 60%)`,
                  }}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
            );
          })}
        </motion.div>
        
        {/* Bottom decorative line */}
        <motion.div 
          className="w-32 h-1 rounded-full mx-auto mt-16"
          style={{ 
            background: "linear-gradient(90deg, #ffffff, #f6f5f7, #fdfffe, #fdfdfd)",
            opacity: 1
          }}
          initial={{ width: 0 }}
          animate={isVisible ? { width: 128 } : { width: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        />
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