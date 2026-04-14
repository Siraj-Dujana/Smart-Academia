import React, { useState } from 'react';

const CourseCard = ({ 
  title, 
  level, 
  levelColor, 
  description, 
  onEnroll,
  buttonText = "Enroll Now",
  buttonColor = "bg-blue-600 hover:bg-blue-700",
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleEnroll = async (e) => {
    e.stopPropagation();
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await onEnroll();
    } catch (error) {
      console.error("Enrollment error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`
      relative 
      group 
      flex 
      flex-1 
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
      cursor-pointer 
      transition-all 
      duration-500 
      hover:shadow-2xl 
      hover:-translate-y-2 
      sm:hover:-translate-y-3 
      hover:border-blue-300 
      dark:hover:border-blue-600 
      hover:bg-blue-50 
      dark:hover:bg-blue-900/20 
      ${className}
    `}>
      {/* Content Section */}
      <div className="flex flex-col gap-3 sm:gap-4 flex-grow">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          <h3 className="text-sm sm:text-base md:text-lg font-bold leading-tight text-center sm:text-left group-hover:text-blue-600 transition-colors duration-300">
            {title}
          </h3>
          <span className={`
            inline-flex 
            items-center 
            justify-center
            rounded-full 
            ${levelColor} 
            px-2 
            sm:px-2.5 
            py-0.5 
            text-[10px] 
            sm:text-xs 
            font-medium 
            whitespace-nowrap
            transform 
            group-hover:scale-110 
            transition-transform 
            duration-300
          `}>
            {level}
          </span>
        </div>
        
        {/* Description */}
        <p className="text-xs sm:text-sm md:text-base font-normal leading-relaxed text-gray-600 dark:text-gray-400 flex-grow group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300 text-center sm:text-left">
          {description}
        </p>
      </div>
      
      {/* Button with Loading State */}
      <button 
        className={`
          mt-4 
          sm:mt-5 
          md:mt-6 
          w-full 
          flex 
          cursor-pointer 
          items-center 
          justify-center 
          overflow-hidden 
          rounded-lg 
          h-9 
          sm:h-10 
          md:h-11 
          px-3 
          sm:px-4 
          md:px-5 
          ${buttonColor} 
          text-white 
          text-xs 
          sm:text-sm 
          font-bold 
          leading-normal 
          tracking-[0.015em] 
          transform 
          hover:scale-105 
          active:scale-95
          transition-all 
          duration-300 
          group-hover:shadow-lg
          disabled:opacity-70 
          disabled:cursor-not-allowed 
          disabled:hover:scale-100
        `}
        onClick={handleEnroll}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg 
              className="animate-spin h-4 w-4 text-white" 
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
            <span>Enrolling...</span>
          </span>
        ) : (
          <span className="truncate">{buttonText}</span>
        )}
      </button>
    </div>
  );
};

export default CourseCard;