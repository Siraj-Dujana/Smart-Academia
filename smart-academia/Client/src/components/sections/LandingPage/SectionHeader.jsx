import React from 'react';

const SectionHeader = ({ 
  title, 
  subtitle, 
  className = "",
  titleSize = "text-2xl sm:text-3xl md:text-4xl",
  subtitleSize = "text-sm sm:text-base",
  align = "text-center"
}) => {
  return (
    <div className={`flex flex-col gap-3 sm:gap-4 ${align} max-w-3xl mx-auto ${className}`}>
      <h2 className={`${titleSize} font-bold leading-tight tracking-[-0.015em]`}>{title}</h2>
      {subtitle && (
        <p className={`${subtitleSize} font-normal leading-normal text-gray-600 dark:text-gray-400`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;