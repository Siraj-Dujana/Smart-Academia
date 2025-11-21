import React from 'react';

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
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center text-center gap-3 sm:gap-4 group ${className}`} 
         onClick={onClick}>
      <div className={`flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full ${bgColor} ${textColor} mb-2 sm:mb-4 transition-all duration-500 group-hover:scale-110 ${hoverBgColor} ${hoverTextColor} group-hover:shadow-lg`}>
        <span className="material-symbols-outlined text-xl sm:text-3xl">{icon}</span>
      </div>
      <h3 className="text-base sm:text-lg font-bold group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">{description}</p>
    </div>
  );
};

export default StepCard;