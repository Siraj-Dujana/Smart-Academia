import React from 'react';

const CTASection = ({ 
  title = "Ready to Transform Education?",
  subtitle = "Join the future of learning with AI-powered education platform",
  primaryButton = {
    text: "Get Started Free",
    onClick: () => {}
  },
  secondaryButton = {
    text: "Login to Account",
    onClick: () => {}
  },
  background = "bg-blue-600",
  padding = "py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8",
  className = ""
}) => {
  return (
    <section className={`${padding} ${background} ${className}`}>
      <div className="max-w-4xl mx-auto text-center text-white">
        <div className="flex flex-col gap-4 sm:gap-6 items-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em]">
            {title}
          </h2>
          <p className="max-w-2xl text-blue-100 text-sm sm:text-lg">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 justify-center">
            <button 
              onClick={primaryButton.onClick}
              className="flex min-w-[140px] sm:min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 sm:h-12 px-4 sm:px-5 bg-white text-blue-600 text-sm sm:text-base font-bold leading-normal tracking-[0.015em] hover:bg-gray-200 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span className="truncate">{primaryButton.text}</span>
            </button>
            <button 
              onClick={secondaryButton.onClick}
              className="flex min-w-[140px] sm:min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 sm:h-12 px-4 sm:px-5 bg-transparent text-white text-sm sm:text-base font-bold leading-normal tracking-[0.015em] border border-white/50 hover:bg-white/10 transform hover:scale-105 transition-all duration-300"
            >
              <span className="truncate">{secondaryButton.text}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;