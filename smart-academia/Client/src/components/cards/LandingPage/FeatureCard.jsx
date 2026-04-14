import React, { useState } from 'react';

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  onClick,
  iconColor = "text-blue-600",
  className = "",
  buttonText,
  buttonColor = "bg-blue-600 hover:bg-blue-700",
  showButton = false,
  isLoading = false,
  onButtonClick
}) => {
  const [localLoading, setLocalLoading] = useState(false);

  const handleCardClick = () => {
    if (onClick && !isLoading && !localLoading) {
      onClick();
    }
  };

  const handleButtonClick = async (e) => {
    e.stopPropagation();
    if (isLoading || localLoading || !onButtonClick) return;
    
    setLocalLoading(true);
    try {
      await onButtonClick();
    } catch (error) {
      console.error("Action error:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  const isActionLoading = isLoading || localLoading;

  return (
    <div 
      className={`
        flex 
        flex-1 
        gap-3 
        sm:gap-4 
        rounded-xl 
        sm:rounded-2xl 
        border 
        border-gray-200 
        dark:border-gray-700 
        bg-white 
        dark:bg-gray-800 
        p-4 
        sm:p-5 
        md:p-6 
        flex-col 
        shadow-sm 
        transition-all 
        duration-500 
        hover:shadow-2xl 
        hover:-translate-y-2 
        sm:hover:-translate-y-3 
        hover:border-blue-300 
        dark:hover:border-blue-600 
        hover:bg-blue-50 
        dark:hover:bg-blue-900/20 
        group 
        ${onClick ? 'cursor-pointer' : ''} 
        ${className}
      `} 
      onClick={handleCardClick}
    >
      {/* Icon Section */}
      <div className={`
        ${iconColor} 
        transform 
        group-hover:scale-110 
        group-hover:rotate-3 
        transition-transform 
        duration-300
      `}>
        <span className="material-symbols-outlined text-2xl sm:text-3xl md:text-4xl">
          {icon}
        </span>
      </div>
      
      {/* Text Section */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <h3 className="text-sm sm:text-base md:text-lg font-bold leading-tight group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-xs sm:text-sm md:text-base font-normal leading-relaxed text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
          {description}
        </p>
      </div>

      {/* Optional Button */}
      {showButton && (
        <button
          className={`
            mt-2 
            sm:mt-3 
            md:mt-4 
            w-full 
            flex 
            items-center 
            justify-center 
            rounded-lg 
            h-8 
            sm:h-9 
            md:h-10 
            px-3 
            sm:px-4 
            text-xs 
            sm:text-sm 
            font-medium 
            ${buttonColor} 
            text-white 
            transition-all 
            duration-300 
            hover:scale-105 
            active:scale-95
            disabled:opacity-70 
            disabled:cursor-not-allowed 
            disabled:hover:scale-100
          `}
          onClick={handleButtonClick}
          disabled={isActionLoading}
        >
          {isActionLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg 
                className="animate-spin h-3 w-3 sm:h-4 sm:w-4 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Loading...</span>
            </span>
          ) : (
            <span>{buttonText}</span>
          )}
        </button>
      )}
    </div>
  );
};

export default FeatureCard;