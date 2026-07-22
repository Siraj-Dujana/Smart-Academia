import React, { useState, useEffect } from 'react';

const Header = ({ 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  onLogin, 
  onRegister,
  onNavClick,
  companyName = "Smart Academia", 
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  
  const navItems = [
    { id: "home", label: "Home" },
    { id: "problem", label: "Problem" },
    { id: "features", label: "Features" },
    { id: "benefits", label: "Benefits" },
    { id: "how-it-works", label: "How It Works" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Check if at the very top of the page
      if (window.scrollY < 100) {
        setActiveSection("home");
        return;
      }
      
      // Find which section is currently in view
      const sections = navItems.map(item => document.getElementById(item.id));
      let currentSection = "home";
      let foundSection = false;
      
      sections.forEach((section, index) => {
        if (section && !foundSection) {
          const rect = section.getBoundingClientRect();
          
          // Check if section is in viewport (considering header offset)
          if (rect.top <= 150 && rect.bottom >= 0) {
            currentSection = navItems[index].id;
            foundSection = true;
          }
        }
      });
      
      setActiveSection(currentSection);
    };
    
    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (itemId) => {
    if (itemId === "home") {
      // Scroll to top for home
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveSection("home");
    } else {
      // For other sections, use the provided onNavClick
      onNavClick(itemId);
      setActiveSection(itemId);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${
        isScrolled 
          ? "bg-[#0c0e1e]/95 backdrop-blur-md border-b border-white/10 shadow-lg" 
          : "bg-transparent border-b border-transparent"
      }`}
      style={{ fontFamily: "'Lexend', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Section - Scrolls to top */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110" style={{ background: "linear-gradient(135deg, #ffffff, #ffffff)" }}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l9-5-9 5-9-5m9 5v5m0-5v5m0 0l-9-5m9 5l9-5" />
              </svg>
            </div>
            <h2 className={`text-lg sm:text-xl font-black transition-all duration-300 ${
              isScrolled 
                ? "text-white" 
                : "text-white"
            }`}>
              {companyName}
            </h2>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-4">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <div key={item.id} className="relative overflow-hidden rounded-lg group">
                  {/* Sliding background - active or hover */}
                  <div 
                    className={`absolute inset-0 bg-white transform transition-transform duration-300 ease-out ${
                      isActive ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'
                    }`}
                  />
                  {/* Button */}
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`relative z-10 px-4 py-2.5 text-sm font-medium transition-all duration-300 cursor-pointer ${
                      isActive ? 'text-black' : 'text-white/80 group-hover:text-black'
                    }`}
                  >
                    {item.label}
                  </button>
                </div>
              );
            })}
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={onLogin}
              className="px-5 py-2 text-sm font-bold text-black transition-all duration-300 rounded-xl hover:scale-105 hover:-translate-y-0.5 cursor-pointer shadow-md"
              style={{ background: "linear-gradient(135deg, #ffffff, #ffffff)" }}
            >
              Login
            </button>

            <button 
              onClick={onRegister}
              className="px-5 py-2 text-sm font-bold text-black transition-all duration-300 rounded-xl hover:scale-105 hover:-translate-y-0.5 cursor-pointer shadow-md"
              style={{ background: "linear-gradient(135deg, #ffffff, #ffffff)" }}
            >
              Register
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              className="p-2 rounded-md transition-all duration-300 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="material-symbols-outlined text-2xl transform transition-transform duration-300">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 sm:top-20 left-0 right-0 bg-[#0c0e1e]/95 backdrop-blur-md border-b border-white/10 shadow-2xl animate-slideDown z-50">
            <div className="px-4 py-4 space-y-1">
              {/* Navigation Links - Same style as desktop */}
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <div key={item.id} className="relative overflow-hidden rounded-lg group">
                    {/* Sliding background - active or hover */}
                    <div 
                      className={`absolute inset-0 bg-white transform transition-transform duration-300 ease-out ${
                        isActive ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'
                      }`}
                    />
                    {/* Button */}
                    <button
                      onClick={() => {
                        handleNavClick(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`relative z-10 block w-full text-left px-4 py-3 text-sm font-medium transition-all duration-300 cursor-pointer ${
                        isActive ? 'text-black' : 'text-gray-400 group-hover:text-black'
                      }`}
                    >
                      {item.label}
                    </button>
                  </div>
                );
              })}
              
              {/* Auth Buttons - Now matching desktop style */}
              <div className="flex flex-col gap-3 pt-3 mt-2 border-t border-white/10">
                <button 
                  onClick={() => {
                    onLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-black transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 cursor-pointer shadow-md"
                  style={{ background: "linear-gradient(135deg, #ffffff, #ffffff)" }}
                >
                  Login
                </button>
                <button 
                  onClick={() => {
                    onRegister();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-black transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 cursor-pointer shadow-md"
                  style={{ background: "linear-gradient(135deg, #ffffff, #ffffff)" }}
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slideDown {
            animation: slideDown 0.3s ease-out;
          }
        `}
      </style>
    </header>
  );
};

export default Header;