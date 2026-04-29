import React from 'react';

const SectionWrapper = ({ 
  id, 
  children, 
  className = "", 
  bgColor = "#0c0e1e",
  padding = "py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8",
  maxWidth = "max-w-7xl",
  withGradient = false
}) => {
  return (
    <section 
      id={id} 
      className={`relative overflow-hidden ${padding} ${className}`}
      style={{ background: bgColor }}
    >
      {/* Optional background gradients */}
      {withGradient && (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: "#6366f1" }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ background: "#a855f7" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl rounded-full blur-3xl opacity-10" style={{ background: "#6366f1" }} />
        </>
      )}
      
      <div className={`relative z-10 ${maxWidth} mx-auto`}>
        {children}
      </div>
    </section>
  );
};

export default SectionWrapper;