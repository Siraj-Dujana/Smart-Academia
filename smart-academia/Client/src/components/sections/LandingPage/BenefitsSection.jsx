import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const BenefitsSection = ({ 
  title = "Why Choose Smart Academia?",
  subtitle = "We fill the gaps that other platforms miss",
  benefits = [
    {  title: "AI-Powered", description: "Personalized learning beyond static content", color: "#6366f1" },
    {  title: "Auto-Graded Labs", description: "Instant feedback on coding assignments", color: "#6366f1" },
    {  title: "Dual Platform", description: "Complete ecosystem for students & teachers", color: "#6366f1" },
    {  title: "Anti-Cheating", description: "Built-in integrity measures for fair assessment", color: "#6366f1" }
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

  // Animation variants - matching FeaturesSection
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
      id="benefits" 
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
            {subtitle}
          </p>
        </motion.div>
        
        {/* Benefits Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 sm:mt-16"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {benefits.map((benefit, index) => {
            const isHovered = hoveredIndex === index;
            
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative rounded-2xl overflow-hidden p-0 transition-all duration-300 hover:scale-[1.02] group"
                style={{ 
                  background: "#0c0e1e", 
                  border: `1px solid ${benefit.color}33`,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                  minHeight: '180px'
                }}
                whileHover={{
                  boxShadow: `0 8px 40px ${benefit.color}25`,
                  transition: { duration: 0.3 }
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Hover overlay */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${benefit.color}15 0%, transparent 80%)` }}
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
                
                <div className="relative z-10 p-6 min-h-[180px] flex flex-col items-center justify-center">
                 
                  
                  {/* Title - Always visible, changes color on hover */}
                  <motion.h3 
                    className={`text-lg font-bold mt-4 mb-2 transition-colors duration-300 ${
                      isHovered ? 'text-black' : 'text-white'
                    }`}
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    {benefit.title}
                  </motion.h3>
                  
                  {/* Description - Only visible on hover */}
                  <motion.p 
                    className="text-sm text-center transition-all duration-300"
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
                    {benefit.description}
                  </motion.p>
                </div>

                {/* Subtle glow on hover */}
                <motion.div 
                  className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ 
                    background: `linear-gradient(135deg, ${benefit.color}10, transparent 60%)`,
                  }}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
            );
          })}
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

export default BenefitsSection;