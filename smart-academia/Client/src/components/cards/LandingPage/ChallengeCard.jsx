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
      className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 transition-all duration-300 hover:border-white/40 hover:shadow-2xl hover:scale-[1.02] group cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/20 group-hover:bg-white/30 transition-all duration-300">
          <span className={`material-symbols-outlined text-xl sm:text-2xl ${iconColor}`}>
            {icon}
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold leading-tight tracking-[-0.015em] text-white">
          {title}
        </h3>
      </div>
      <ul className="space-y-4">
        {challenges.map((challenge, index) => (
          <li 
            key={index} 
            className="flex items-start gap-3 transition-all duration-300 group-hover:translate-x-1"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 mt-0.5 flex-shrink-0">
              <span className={`${color} text-sm font-bold`}>{index + 1}</span>
            </div>
            <span className="text-sm sm:text-base leading-normal tracking-[0.015em] text-blue-100 group-hover:text-white">
              {challenge}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChallengeCard;