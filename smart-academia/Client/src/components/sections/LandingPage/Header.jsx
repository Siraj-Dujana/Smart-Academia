import React from 'react';

const Header = ({ 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  onLogin, 
  onRegister,
  logo = "school",
  companyName = "SmartAcademia" 
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="material-symbols-outlined text-blue-600 text-2xl sm:text-3xl animate-pulse">{logo}</span>
            <h2 className="text-lg sm:text-xl font-bold">{companyName}</h2>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-9">
            <a className="text-sm font-medium p-[5px] hover:text-blue-600 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer" href="#features">Features</a>
            <a className="text-sm font-medium p-[5px] hover:text-blue-600 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer" href="#how-it-works">How It Works</a>
      
            <a className="text-sm font-medium p-[5px] hover:text-blue-600 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer" href="#solutions">Solutions</a>
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <button 
              onClick={onLogin}
              className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              Login
            </button>

            <button 
              onClick={onRegister}
              className="px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            >
              Register
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="material-symbols-outlined transform transition-transform duration-300">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
      {mobileMenuOpen && (
  <div className="md:hidden absolute top-14 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg animate-slideDown">
    <div className="px-4 py-4 space-y-1">
      {/* Navigation Links with Hover Effects */}
      <a 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300 py-3 px-3 rounded-lg transform hover:translate-x-2"
        href="#features" 
        onClick={() => setMobileMenuOpen(false)}
      >
        Features
      </a>
      <a 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300 py-3 px-3 rounded-lg transform hover:translate-x-2"
        href="#how-it-works" 
        onClick={() => setMobileMenuOpen(false)}
      >
        How It Works
      </a>
      <a 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300 py-3 px-3 rounded-lg transform hover:translate-x-2"
        href="#solutions" 
        onClick={() => setMobileMenuOpen(false)}
      >
        Solutions
      </a>
      
      {/* Auth Buttons with Proper Width */}
      <div className="flex flex-col items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => {
            onLogin();
            setMobileMenuOpen(false);
          }}
          className="flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white text-blue-600 text-sm font-bold leading-normal tracking-[0.015em] border border-blue-600 hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <span className="truncate">Login</span>
        </button>
        <button 
          onClick={() => {
            onRegister();
            setMobileMenuOpen(false);
          }}
          className="flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <span className="truncate">Register</span>
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </header>
  );
};

export default Header;