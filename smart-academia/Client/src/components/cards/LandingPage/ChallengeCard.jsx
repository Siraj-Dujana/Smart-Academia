import React from 'react';

const ChallengeCard = ({ 
  icon, 
  title, 
  challenges, 
  color = "text-blue-500",
  iconColor = "text-blue-600",
  className = "",
  onClick
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 group ${className}`} 
         onClick={onClick}>
      <div className="flex items-center gap-3 mb-4">
        <span className={`material-symbols-outlined text-xl sm:text-2xl ${iconColor} transform group-hover:scale-110 transition-transform duration-300`}>{icon}</span>
        <h3 className="text-lg sm:text-xl font-bold group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
      </div>
      <ul className="space-y-2 sm:space-y-3 text-gray-600 dark:text-gray-400">
        {challenges.map((challenge, index) => (
          <li key={index} className="flex items-start gap-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
            <span className={`${color} text-sm sm:text-lg mt-0.5`}>•</span>
            <span className="text-xs sm:text-sm">{challenge}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChallengeCard;