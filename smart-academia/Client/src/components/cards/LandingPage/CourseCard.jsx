import React from 'react';

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
  return (
    <div className={`relative group flex flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 flex-col shadow-sm cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${className}`}>
      <div className="flex flex-col gap-3 sm:gap-4 flex-grow">
        <div className="flex items-center justify-between flex-col sm:flex-row gap-2 sm:gap-0">
          <h3 className="text-base sm:text-lg font-bold leading-tight text-center sm:text-left group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
          <span className={`inline-flex items-center rounded-full ${levelColor} px-2.5 py-0.5 text-xs font-medium transform group-hover:scale-110 transition-transform duration-300`}>
            {level}
          </span>
        </div>
        <p className="text-xs sm:text-sm font-normal leading-normal text-gray-600 dark:text-gray-400 flex-grow group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300 text-center sm:text-left">
          {description}
        </p>
      </div>
      <button 
        className={`mt-4 sm:mt-6 w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 ${buttonColor} text-white text-sm font-bold leading-normal tracking-[0.015em] transform hover:scale-105 transition-all duration-300 group-hover:shadow-lg`}
        onClick={onEnroll}
      >
        <span className="truncate">{buttonText}</span>
      </button>
    </div>
  );
};

export default CourseCard;