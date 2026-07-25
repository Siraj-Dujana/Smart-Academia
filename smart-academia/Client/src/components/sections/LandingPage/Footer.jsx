import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const Footer = ({ 
  projectName = "Smart Academia",
  currentYear = new Date().getFullYear(),
  studentName = "Siraj Ahmed",
  contactEmail = "dujanadujana16@gmail.com"
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
      y: 20,
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

  return (
    <motion.footer 
      ref={sectionRef}
      className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-t"
      style={{ 
        background: "#0c0e1e",
        borderColor: "rgba(255, 255, 255, 0.06)"
      }}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={containerVariants}
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
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8"
          variants={containerVariants}
        >
          {/* Left - Logo & Name */}
          <motion.div className="flex items-center gap-3" variants={itemVariants}>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110" style={{ background: "linear-gradient(135deg, #ffffff, #ffffff)" }}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l9-5-9 5-9-5m9 5v5m0-5v5m0 0l-9-5m9 5l9-5" />
              </svg>
            </div>
            <span className="text-base font-bold text-white">{projectName}</span>
          </motion.div>

          {/* Center - Developed by */}
          <motion.p className="text-sm text-gray-400" variants={itemVariants}>
            Developed by <span className="text-white font-semibold hover:text-indigo-300 transition-colors duration-300">{studentName}</span>
          </motion.p>

          {/* Right - Email */}
          <motion.a 
            href={`mailto:${contactEmail}`}
            className="text-sm text-gray-400 hover:text-indigo-400 transition-colors duration-300 flex items-center gap-1.5"
            variants={itemVariants}
            whileHover={{ x: 3 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {contactEmail}
          </motion.a>
        </motion.div>

        {/* Divider & Copyright */}
        <motion.div 
          className="mt-8 pt-6 border-t text-center"
          style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
          variants={itemVariants}
        >
          <p className="text-xs text-gray-500">
            © {currentYear} <span className="text-white">{projectName}</span>. All rights reserved.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;