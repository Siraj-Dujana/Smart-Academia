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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2" style={{ background: `${badge.color || "#6366f1"}22`, border: `1px solid ${badge.color || "#6366f1"}44` }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: badge.color || "#6366f1" }} />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: badge.color || "#6366f1" }}>
            {badge.text}
          </span>
        </div>
      )}
      
      {/* Title */}
      <h2 className={`${titleSize} font-black text-white leading-tight`}>
        {title}
      </h2>
      
      {/* Subtitle */}
      {subtitle && (
        <p className={`${subtitleSize} text-gray-500 leading-relaxed`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;