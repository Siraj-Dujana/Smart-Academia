import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

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
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
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
      ref={sectionRef}
      className={`py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden ${className}`} 
      style={{ background: "#0c0e1e" }}
    >
      {/* Background gradients - matching other sections */}
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
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header - Matching other sections */}
        <motion.div 
          className="flex flex-col items-center text-center"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.h2 
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight"
            variants={headerVariants}
          >
            {title}
          </motion.h2>
          
          <motion.p 
            className="text-base md:text-lg text-gray-400 mt-3 max-w-2xl leading-relaxed"
            variants={headerVariants}
          >
            {subtitle}
          </motion.p>
        </motion.div>
        
        {/* Buttons - Matching card style from other sections */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 sm:mt-10"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Primary Button */}
          <motion.div
            variants={itemVariants}
            className="relative rounded-2xl overflow-hidden p-0 transition-all duration-300 hover:scale-[1.02] group w-full sm:w-auto min-w-[200px]"
            style={{ 
              background: "#0c0e1e", 
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
            }}
            whileHover={{
              boxShadow: '0 8px 40px rgba(99, 102, 241, 0.25)',
              borderColor: 'rgba(99, 102, 241, 0.3)',
              transition: { duration: 0.3 }
            }}
            onMouseEnter={() => setHoveredButton('primary')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            {/* Hover overlay */}
            <motion.div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 80%)' }}
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Sliding background - bottom to top */}
            <div 
              className={`absolute inset-0 bg-white transform transition-transform duration-500 ease-out ${
                hoveredButton === 'primary' ? 'translate-y-0' : 'translate-y-full'
              }`}
            />
            
            <button 
              onClick={primaryButton.onClick}
              className="relative z-10 px-6 sm:px-8 py-3.5 text-sm sm:text-base font-bold transition-all duration-300 w-full"
              style={{ 
                color: hoveredButton === 'primary' ? '#000000' : '#ffffff'
              }}
            >
              <span className="flex items-center justify-center gap-2">
              
                {primaryButton.text}
              </span>
            </button>

            {/* Subtle glow */}
            <motion.div 
              className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{ 
                background: 'linear-gradient(135deg, rgba(99,102,241,0.1), transparent 60%)',
              }}
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>

          {/* Secondary Button */}
          <motion.div
            variants={itemVariants}
            className="relative rounded-2xl overflow-hidden p-0 transition-all duration-300 hover:scale-[1.02] group w-full sm:w-auto min-w-[200px]"
            style={{ 
              background: "#0c0e1e", 
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
            }}
            whileHover={{
              boxShadow: '0 8px 40px rgba(168, 85, 247, 0.15)',
              borderColor: 'rgba(168, 85, 247, 0.2)',
              transition: { duration: 0.3 }
            }}
            onMouseEnter={() => setHoveredButton('secondary')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            {/* Hover overlay */}
            <motion.div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.1) 0%, transparent 80%)' }}
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Sliding background - bottom to top */}
            <div 
              className={`absolute inset-0 bg-white transform transition-transform duration-500 ease-out ${
                hoveredButton === 'secondary' ? 'translate-y-0' : 'translate-y-full'
              }`}
            />
            
            <button 
              onClick={secondaryButton.onClick}
              className="relative z-10 px-6 sm:px-8 py-3.5 text-sm sm:text-base font-medium transition-all duration-300 w-full"
              style={{ 
                color: hoveredButton === 'secondary' ? '#000000' : '#fefefe'
              }}
            >
              <span className="flex items-center justify-center gap-2">
                
                {secondaryButton.text}
              </span>
            </button>

            {/* Subtle glow */}
            <motion.div 
              className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{ 
                background: 'linear-gradient(135deg, rgba(168,85,247,0.1), transparent 60%)',
              }}
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
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

export default CTASection;