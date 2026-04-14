import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Import Components
import Header from "../components/sections/LandingPage/Header";
import Footer from "../components/sections/LandingPage/Footer";
import FloatingButtons from "../components/sections/LandingPage/FloatingButtons";
import HeroSection from "../components/sections/LandingPage/HeroSection";
import ProblemSection from "../components/sections/LandingPage/ProblemSection";
import FeaturesSection from "../components/sections/LandingPage/FeaturesSection";
import BenefitsSection from "../components/sections/LandingPage/BenefitsSection";
import HowItWorksSection from "../components/sections/LandingPage/HowItWorksSection";
import CTASection from "../components/sections/LandingPage/CTASection";

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
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

  useEffect(() => {
    // Simulate loading (remove this if you don't need it)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-white overflow-x-hidden">
      
      {/* Floating Buttons */}
      <FloatingButtons
        showScrollTop={showScrollTop}
        onScrollToTop={scrollToTop}
        onChatClick={() => handleNavigate("/chat")}
      />

      {/* Header */}
      <Header
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onLogin={() => handleNavigate("/login")}
        onRegister={() => handleNavigate("/register")}
        isScrolled={isScrolled}
      />

      <main className="overflow-x-hidden">
        <HeroSection onButtonClick={() => handleNavigate("/register")} />
        <ProblemSection />
        <FeaturesSection />
        <BenefitsSection />
        <HowItWorksSection />
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