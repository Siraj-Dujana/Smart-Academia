import React from 'react';

const FloatingButtons = ({ 
  showScrollTop, 
  onScrollToTop, 
  onChatClick,
  chatTooltip = "AI Chat Assistant",
  scrollTooltip = "Scroll to Top",
  chatIcon = "smart_toy",
  scrollIcon = "arrow_upward",
  chatPosition = "bottom-6 left-6",
  scrollPosition = "bottom-6 right-6",
  chatColor = "from-blue-500 to-blue-600",
  scrollColor = "from-blue-500 to-blue-600"
}) => {
  return (
    <>
      {/* Chatbot Icon */}
      <div className={`fixed ${chatPosition} z-50`}>
        <button
          onClick={onChatClick}
          className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${chatColor} text-white rounded-full shadow-2xl flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transform hover:scale-110 transition-all duration-300 group animate-bounce hover:animate-none`}
        >
          <span className="material-symbols-outlined text-xl sm:text-2xl">{chatIcon}</span>
          
          {/* Pulsing Ring Effect */}
          <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Notification Dot */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          
          {/* Tooltip */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg">
            {chatTooltip}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-800 rotate-45"></div>
          </div>
        </button>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={onScrollToTop}
          className={`fixed ${scrollPosition} z-50 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${scrollColor} text-white rounded-full shadow-2xl flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transform hover:scale-110 transition-all duration-300 animate-bounce hover:animate-none`}
        >
          <span className="material-symbols-outlined text-xl sm:text-2xl">{scrollIcon}</span>
          
          {/* Tooltip */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg">
            {scrollTooltip}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-800 rotate-45"></div>
          </div>
        </button>
      )}
    </>
  );
};

export default FloatingButtons;