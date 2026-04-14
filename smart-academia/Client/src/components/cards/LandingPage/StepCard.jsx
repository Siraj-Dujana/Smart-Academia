import React, { useState } from 'react';

const StepCard = ({ 
  number, 
  icon, 
  title, 
  description, 
  onClick,
  bgColor = "bg-blue-600/20",
  hoverBgColor = "group-hover:bg-blue-600",
  textColor = "text-blue-600",
  hoverTextColor = "group-hover:text-white",
  className = "",
  showButton = false,
  buttonText = "Continue",
  buttonColor = "bg-blue-600 hover:bg-blue-700",
  onButtonClick,
  isLoading = false
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
        flex-col 
        items-center 
        text-center 
        gap-2 
        sm:gap-3 
        md:gap-4 
        group 
        ${onClick ? 'cursor-pointer' : ''} 
        ${className}
      `} 
      onClick={handleCardClick}
    >
      {/* Icon Circle with Number Badge */}
      <div className="relative">
        {/* Step Number Badge */}
        {number && (
          <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-10">
            <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white text-[10px] sm:text-xs font-bold shadow-lg">
              {number}
            </div>
          </div>
        )}
        
        {/* Icon Container */}
        <div className={`
          flex 
          items-center 
          justify-center 
          w-12 
          h-12 
          sm:w-14 
          sm:h-14 
          md:w-16 
          md:h-16 
          rounded-full 
          ${bgColor} 
          ${textColor} 
          mb-2 
          sm:mb-3 
          md:mb-4 
          transition-all 
          duration-500 
          group-hover:scale-110 
          group-hover:shadow-xl
          ${hoverBgColor} 
          ${hoverTextColor}
        `}>
          <span className="material-symbols-outlined text-xl sm:text-2xl md:text-3xl">
            {icon}
          </span>
        </div>
      </div>
      
      {/* Title */}
      <h3 className="text-sm sm:text-base md:text-lg font-bold group-hover:text-blue-600 transition-colors duration-300">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300 max-w-[200px] sm:max-w-[250px] md:max-w-none">
        {description}
      </p>

      {/* Optional Button */}
      {showButton && (
        <button
          className={`
            mt-2 
            sm:mt-3 
            md:mt-4 
            flex 
            items-center 
            justify-center 
            rounded-lg 
            h-7 
            sm:h-8 
            md:h-9 
            px-3 
            sm:px-4 
            text-[10px] 
            sm:text-xs 
            md:text-sm 
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
            w-auto
            min-w-[100px]
          `}
          onClick={handleButtonClick}
          disabled={isActionLoading}
        >
          {isActionLoading ? (
            <span className="flex items-center justify-center gap-1 sm:gap-2">
              <svg 
                className="animate-spin h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" 
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

export default StepCard;