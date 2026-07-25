import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const Footer = ({
  projectName = "Smart Academia",
  currentYear = new Date().getFullYear(),
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const quickLinks = [
    { id: "home", label: "Home" },
    { id: "problem", label: "Problem" },
    { id: "features", label: "Features" },
    { id: "benefits", label: "Benefits" },
    { id: "how-it-works", label: "How It Works" },
  ];

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

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const handleNavClick = (id) => {
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <motion.footer
      ref={sectionRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden border-t border-white/10 bg-[#0c0e1e]"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-16">

          {/* Left */}
          <div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 items-center justify-center rounded-3xl bg-white transition-all duration-300 hover:scale-105 hover:shadow-2xl flex-shrink-0">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-black"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 14l9-5-9-5-9 5 9 5zm0 0v7m0-7l9-5m-9 5l-9-5"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {projectName}
                </h2>

                <p className="text-sm sm:text-base text-gray-400 mt-2 max-w-md leading-relaxed">
                  AI-powered learning platform that enhances education through
                  personalized learning, intelligent assessments, automated
                  evaluation, and real-time progress tracking.
                </p>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="text-center sm:text-left lg:justify-self-end">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">
              Quick Links
            </h3>

            <div className="grid grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-3 sm:gap-y-4">
              {quickLinks.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="group inline-flex items-center justify-center sm:justify-start w-fit text-sm sm:text-base text-gray-400 transition-all duration-300 hover:text-white mx-auto sm:mx-0"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 sm:my-10 lg:my-12 h-px bg-white/10" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            © {currentYear}{" "}
            <span className="text-white">{projectName}</span>.
            All rights reserved.
          </p>

          <p className="text-xs sm:text-sm text-gray-500 text-center">
            Built for modern education.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;