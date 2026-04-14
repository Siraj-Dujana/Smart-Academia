import React from 'react';

const ChallengeCard = ({ 
  icon, 
  title, 
  challenges, 
  color = "text-blue-100",
  iconColor = "text-white",
  className = "",
  onClick
}) => {
  return (
    <div 
      className={`
        bg-white/10 
        backdrop-blur-sm 
        rounded-xl 
        sm:rounded-2xl 
        p-4 
        sm:p-6 
        md:p-8 
        border 
        border-white/20 
        transition-all 
        duration-300 
        hover:border-white/40 
        hover:shadow-2xl 
        hover:scale-[1.01] 
        sm:hover:scale-[1.02] 
        group 
        cursor-pointer 
        ${className}
      `}
      onClick={onClick}
    >
      {/* Header Section */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl bg-white/20 group-hover:bg-white/30 transition-all duration-300 flex-shrink-0">
          <span className={`material-symbols-outlined text-lg sm:text-xl md:text-2xl ${iconColor}`}>
            {icon}
          </span>
        </div>
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight tracking-[-0.015em] text-white">
          {title}
        </h3>
      </div>
      
      {/* Challenges List */}
      <ul className="space-y-3 sm:space-y-4">
        {challenges.map((challenge, index) => (
          <li 
            key={index} 
            className="flex items-start gap-2 sm:gap-3 transition-all duration-300 group-hover:translate-x-1"
          >
            {/* Number Badge */}
            <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 mt-0.5 flex-shrink-0">
              <span className={`${color} text-xs sm:text-sm font-bold`}>
                {index + 1}
              </span>
            </div>
            
            {/* Challenge Text */}
            <span className="text-xs sm:text-sm md:text-base leading-relaxed tracking-[0.015em] text-blue-100 group-hover:text-white transition-colors duration-300">
              {challenge}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChallengeCard;