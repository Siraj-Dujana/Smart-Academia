import React from 'react';

const BenefitCard = ({ 
  icon, 
  title, 
  description, 
  onClick,
  iconColor = "text-blue-600",
  className = ""
}) => {
  return (
    <div 
      className={`
        flex 
        flex-row 
        sm:flex-col 
        gap-3 
        sm:gap-4 
        rounded-xl 
        border 
        border-gray-200 
        dark:border-gray-700 
        bg-white 
        dark:bg-gray-800 
        p-3 
        sm:p-4 
        md:p-6 
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
        group 
        ${className}
      `} 
      onClick={onClick}
    >
      {/* Icon Section */}
      <div className={`
        ${iconColor} 
        transform 
        group-hover:scale-110 
        group-hover:rotate-3 
        transition-transform 
        duration-300
        flex-shrink-0
      `}>
        <span className="material-symbols-outlined text-2xl sm:text-3xl md:text-4xl">
          {icon}
        </span>
      </div>
      
      {/* Text Section */}
      <div className="flex flex-col gap-1 flex-1">
        <h3 className="text-sm sm:text-base md:text-lg font-bold leading-tight group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-xs sm:text-sm font-normal leading-relaxed text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
          {description}
        </p>
      </div>
    </div>
  );
};

export default BenefitCard;