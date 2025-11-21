import React from 'react';

const SectionWrapper = ({ 
  id, 
  children, 
  className = "", 
  bgColor = "bg-white dark:bg-gray-900",
  padding = "py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8",
  maxWidth = "max-w-7xl"
}) => {
  return (
    <section id={id} className={`${padding} ${bgColor} ${className}`}>
      <div className={`${maxWidth} mx-auto`}>
        {children}
      </div>
    </section>
  );
};

export default SectionWrapper;