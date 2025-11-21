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
            <a className="text-sm font-medium p-[5px] hover:text-blue-600 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer" href="#courses">Courses</a>
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
            <div className="px-4 py-4 space-y-3">
              <a className="block text-sm font-medium hover:text-blue-600 transition-colors duration-300 py-2 transform hover:translate-x-2" href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a className="block text-sm font-medium hover:text-blue-600 transition-colors duration-300 py-2 transform hover:translate-x-2" href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
              <a className="block text-sm font-medium hover:text-blue-600 transition-colors duration-300 py-2 transform hover:translate-x-2" href="#courses" onClick={() => setMobileMenuOpen(false)}>Courses</a>
              <a className="block text-sm font-medium hover:text-blue-600 transition-colors duration-300 py-2 transform hover:translate-x-2" href="#solutions" onClick={() => setMobileMenuOpen(false)}>Solutions</a>
              <div className="flex flex-col gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button onClick={onLogin} className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-300 text-left transform hover:translate-x-2">Login</button>
                <button onClick={onRegister} className="w-full px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">Register</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;