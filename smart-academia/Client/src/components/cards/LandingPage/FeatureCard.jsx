import React from 'react';

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  onClick,
  iconColor = "text-blue-600",
  className = ""
}) => {
  return (
    <div className={`flex flex-1 gap-3 sm:gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 flex-col shadow-sm cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 group ${className}`} 
         onClick={onClick}>
      <div className={`${iconColor} transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
        <span className="material-symbols-outlined text-3xl sm:text-4xl">{icon}</span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base sm:text-lg font-bold leading-tight group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
        <p className="text-xs sm:text-sm font-normal leading-normal text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;