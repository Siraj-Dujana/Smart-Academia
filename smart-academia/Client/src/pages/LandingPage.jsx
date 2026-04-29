import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Import Components
import Header from "../components/sections/LandingPage/Header";
import Footer from "../components/sections/LandingPage/Footer";
import HeroSection from "../components/sections/LandingPage/HeroSection";
import ProblemSection from "../components/sections/LandingPage/ProblemSection";
import FeaturesSection from "../components/sections/LandingPage/FeaturesSection";
import BenefitsSection from "../components/sections/LandingPage/BenefitsSection";
import HowItWorksSection from "../components/sections/LandingPage/HowItWorksSection";
import CTASection from "../components/sections/LandingPage/CTASection";

// Loading Spinner Component with SVG Icon
const LoadingSpinner = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "#0c0e1e", fontFamily: "'Lexend', sans-serif" }}>
    <div className="flex flex-col items-center gap-6">
      {/* Animated SVG Icon */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full blur-xl animate-pulse" style={{ background: "#6366f1", opacity: 0.5 }} />
        <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full animate-bounce-slow" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
          <svg className="w-12 h-12 sm:w-14 sm:h-14 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l9-5-9 5-9-5m9 5v5m0-5v5m0 0l-9-5m9 5l9-5" />
          </svg>
        </div>
      </div>
      
      {/* Loading Text with dots animation */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-base sm:text-lg font-medium text-white">Loading Smart Academia</p>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#6366f1", animationDelay: "0s" }} />
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#818cf8", animationDelay: "0.2s" }} />
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#a855f7", animationDelay: "0.4s" }} />
        </div>
      </div>
    </div>

    <style>
      {`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}
    </style>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Smooth scroll to section function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    // Simulate loading time for smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      setIsScrolled(window.scrollY > 50);
      
      if (mobileMenuOpen && window.innerWidth < 1024) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = 'unset';
      clearTimeout(timer);
    };
  }, [mobileMenuOpen]);

  // Check URL hash on load and scroll to section
  useEffect(() => {
    if (!isLoading) {
      const hash = window.location.hash;
      if (hash) {
        const sectionId = hash.substring(1);
        setTimeout(() => {
          scrollToSection(sectionId);
        }, 100);
      }
    }
  }, [isLoading]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden pt-16 sm:pt-20" style={{ background: "#0c0e1e", fontFamily: "'Lexend', sans-serif" }}>
      
      {/* Global scrollbar styling */}
      <style>
        {`
          /* Custom scrollbar for the whole page */
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #1e293b;
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #6366f1;
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #818cf8;
          }
          
          /* For Firefox */
          * {
            scrollbar-width: thin;
            scrollbar-color: #6366f1 #1e293b;
          }

          /* Fade in animation for content */
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.8s ease-out forwards;
          }
        `}
      </style>
      
      {/* Header */}
      <Header
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onLogin={() => handleNavigate("/login")}
        onRegister={() => handleNavigate("/register")}
        isScrolled={isScrolled}
        onNavClick={scrollToSection}
      />

      {/* Main Content with fade-in animation */}
      <main className="overflow-x-hidden animate-fadeIn">
        <HeroSection onButtonClick={() => handleNavigate("/register")} />
        
        {/* Add IDs to all sections for navigation */}
        <div id="problem">
          <ProblemSection />
        </div>
        
        <div id="features">
          <FeaturesSection />
        </div>
        
        <div id="benefits">
          <BenefitsSection />
        </div>
        
        <div id="how-it-works">
          <HowItWorksSection />
        </div>
        
        <CTASection
          primaryButton={{ text: "Get Started", onClick: () => handleNavigate("/register") }}
          secondaryButton={{ text: "Login to Account", onClick: () => handleNavigate("/login") }}
        />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;