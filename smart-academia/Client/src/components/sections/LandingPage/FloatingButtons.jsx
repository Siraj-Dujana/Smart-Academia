import React from 'react';

const FloatingButtons = ({ 
  showScrollTop, 
  onScrollToTop, 
  onChatClick 
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={onScrollToTop}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
          style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
        >
          <span className="material-symbols-outlined text-white text-xl">arrow_upward</span>
        </button>
      )}
      
      {/* Chat Button */}
      <button
        onClick={onChatClick}
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
        style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
      >
        <span className="material-symbols-outlined text-white text-xl">chat</span>
      </button>
    </div>
  );
};

export default FloatingButtons;