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

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleRegister = () => {
    navigate("/register");
    setMobileMenuOpen(false);
  };

  const handleLogin = () => {
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-white">
      {/* Floating Buttons */}
      <FloatingButtons 
        showScrollTop={showScrollTop}
        onScrollToTop={scrollToTop}
        onChatClick={() => navigate("/chat")}
      />

      {/* Header */}
      <Header 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <main>
        {/* Hero Section */}
        <HeroSection 
          onButtonClick={handleRegister}
        />

        {/* Problem Section */}
        <ProblemSection />

       

        {/* Features Section */}
        <FeaturesSection />

        {/* Benefits Section */}
        <BenefitsSection />

        {/* How It Works */}
        <HowItWorksSection />

        {/* Final CTA */}
        <CTASection 
          primaryButton={{
            text: "Get Started",
            onClick: handleRegister
          }}
          secondaryButton={{
            text: "Login to Account", 
            onClick: handleLogin
          }}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;

