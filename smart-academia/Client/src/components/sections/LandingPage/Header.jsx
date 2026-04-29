import React, { useState, useEffect } from 'react';

const Header = ({ 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  onLogin, 
  onRegister,
  onNavClick,
  companyName = "Smart Academia" 
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navItems = [
    { id: "problem", label: "Problem" },
    { id: "features", label: "Features" },
    { id: "benefits", label: "Benefits" },
    { id: "how-it-works", label: "How It Works" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${
        isScrolled 
          ? "bg-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-lg" 
          : "bg-transparent border-b border-transparent"
      }`}
      style={{ fontFamily: "'Lexend', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Section - Scrolls to top */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l9-5-9 5-9-5m9 5v5m0-5v5m0 0l-9-5m9 5l9-5" />
              </svg>
            </div>
            <h2 className={`text-lg sm:text-xl font-black transition-all duration-300 ${
              isScrolled 
                ? "bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent" 
                : "text-white"
            }`}>
              {companyName}
            </h2>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavClick(item.id)}
                className={`text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${
                  isScrolled 
                    ? "text-gray-400 hover:text-indigo-400" 
                    : "text-gray-300 hover:text-indigo-400"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={onLogin}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${
                isScrolled 
                  ? "text-indigo-400 hover:text-indigo-300" 
                  : "text-indigo-400 hover:text-indigo-300"
              }`}
            >
              Login
            </button>

            <button 
              onClick={onRegister}
              className="px-5 py-2 text-sm font-bold text-white transition-all duration-300 rounded-xl hover:scale-105 hover:-translate-y-0.5 cursor-pointer shadow-md"
              style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
            >
              Register
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              className="p-2 rounded-md transition-all duration-300"
              style={{ color: isScrolled ? "#818cf8" : "#ffffff" }}
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
          <div className="md:hidden absolute top-16 sm:top-20 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-2xl animate-slideDown z-50">
            <div className="px-4 py-4 space-y-1">
              {/* Navigation Links */}
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavClick(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-sm font-medium text-gray-400 hover:text-indigo-400 hover:bg-gray-800 transition-all duration-300 py-3 px-3 rounded-lg transform hover:translate-x-2 cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
              
              {/* Auth Buttons */}
              <div className="flex flex-col gap-3 pt-3 mt-2 border-t border-gray-800">
                <button 
                  onClick={() => {
                    onLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-indigo-400 transition-all duration-300 hover:scale-105"
                  style={{ background: "transparent", border: "1px solid #334155" }}
                >
                  <span className="material-symbols-outlined text-base">login</span>
                  Login
                </button>
                <button 
                  onClick={() => {
                    onRegister();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
                >
                  <span className="material-symbols-outlined text-base">person_add</span>
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