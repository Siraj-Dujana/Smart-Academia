import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ChallengeCard from '../../cards/LandingPage/ChallengeCard';

const ProblemSection = ({ 
  title = "The Challenges in Modern Education",
  subtitle = "Addressing the core issues that hinder effective learning and teaching",
  challenges = [
    {
      title: "Students Struggle With",
      challenges: [
        "No timely feedback on coding labs and assignments",
        "Lack of structured, progressive learning paths",
        "Difficulty tracking academic performance",
        "Limited access to personalized learning resources"
      ],
      color: "#ffffff"
    },
    {
      title: "Teachers Face",
      challenges: [
        "Excessive time spent on manual grading",
        "Difficulty monitoring student progress",
        "Limited tools for interactive content",
        "Challenges in maintaining academic integrity"
      ],
      color: "#ffffff"
    }
  ],
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

  // Animation variants
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

  const listItemVariants = {
    hidden: { 
      opacity: 0, 
      x: -10 
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
        duration: 0.4
      }
    }
  };

  return (
    <section 
      id="problem" 
      ref={sectionRef}
      className={`py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden ${className}`} 
      style={{ background: "#0c0e1e" }}
    >
      {/* Background gradients - matching HeroSection */}
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
        {/* Section Header - Matching HeroSection title style */}
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
        
        {/* Challenges Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 sm:mt-16"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {challenges.map((challenge, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative rounded-2xl overflow-hidden p-6 transition-all duration-300 hover:scale-[1.02] group"
              style={{ 
                background: "#0c0e1e", 
                border: `1px solid ${challenge.color}33`,
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
              }}
              whileHover={{
                boxShadow: `0 8px 40px ${challenge.color}15`,
                transition: { duration: 0.3 }
              }}
            >
              {/* Hover overlay */}
              <motion.div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${challenge.color}15 0%, transparent 80%)` }}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Header - Matching HeroSection button style */}
              <div className="flex items-center gap-3 mb-6 relative z-10">
                
                <motion.h3 
                  className="text-xl font-bold text-white"
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  {challenge.title}
                </motion.h3>
              </div>
              
              {/* Challenges List */}
              <motion.ul className="space-y-3 relative z-10">
                {challenge.challenges.map((item, idx) => (
                  <motion.li 
                    key={idx} 
                    variants={listItemVariants}
                    className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1"
                    whileHover={{ 
                      x: 5,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <motion.span 
                      className="material-symbols-outlined text-base mt-0.5" 
                      style={{ color: challenge.color }}
                      whileHover={{ 
                        scale: 1.2,
                        rotate: [0, 10, -10, 0],
                        transition: { duration: 0.3 }
                      }}
                    >
                      error
                    </motion.span>
                    <span className="text-gray-400 text-sm leading-relaxed">{item}</span>
                  </motion.li>
                ))}
              </motion.ul>

              {/* Subtle glow on hover */}
              <motion.div 
                className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{ 
                  background: `linear-gradient(135deg, ${challenge.color}10, transparent 60%)`,
                }}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
          ))}
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

export default ProblemSection;