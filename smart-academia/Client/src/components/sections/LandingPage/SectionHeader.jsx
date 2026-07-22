import React from 'react';

const SectionHeader = ({ 
  title, 
  subtitle, 
  badge,
  className = "",
  titleSize = "text-3xl sm:text-4xl",
  subtitleSize = "text-base",
  align = "text-center"
}) => {
  return (
    <div className={`flex flex-col gap-4 items-center ${align} max-w-3xl mx-auto ${className}`}>
      {/* Badge (optional) */}
      {badge && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2 relative overflow-hidden group">
          {/* Sliding background effect for badge */}
          <div 
            className="absolute inset-0 transform transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0"
            style={{ background: `${badge.color || "#6366f1"}22`, border: `1px solid ${badge.color || "#6366f1"}44` }}
          />
          <div className="relative z-10 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: badge.color || "#6366f1" }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: badge.color || "#6366f1" }}>
              {badge.text}
            </span>
          </div>
        </div>
      )}
      
      {/* Title */}
      <h2 className={`${titleSize} font-black text-white leading-tight relative group`}>
        {/* Sliding underline effect */}
        <span className="relative inline-block">
          {title}
          <span 
            className="absolute bottom-0 left-0 h-[3px] rounded-full transform transition-transform duration-500 ease-out translate-x-full group-hover:translate-x-0"
            style={{ 
              width: '100%', 
              background: 'linear-gradient(90deg, #6366f1, #818cf8)',
              transformOrigin: 'right'
            }}
          />
        </span>
      </h2>
      
      {/* Subtitle */}
      {subtitle && (
        <p className={`${subtitleSize} text-gray-500 leading-relaxed relative group`}>
          <span className="relative inline-block">
            {subtitle}
            <span 
              className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-indigo-500 to-purple-500 transform transition-transform duration-500 ease-out scale-x-0 group-hover:scale-x-100"
              style={{ width: '100%', transformOrigin: 'left' }}
            />
          </span>
        </p>
      )}
    </div>
  );
};

export default SectionHeader;