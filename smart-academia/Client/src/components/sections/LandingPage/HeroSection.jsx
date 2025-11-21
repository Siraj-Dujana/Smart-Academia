import React from 'react';
import AIDashboard from './AIDashboard';

const HeroSection = ({ 
  title = "Revolutionize Learning with AI",
  subtitle = "SmartAcademia empowers students to master complex topics with personalized AI support, while giving teachers powerful tools to automate grading and track progress.",
  buttonText = "Get Started Free",
  onButtonClick,
  background = "bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900",
  padding = "py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8",
  className = ""
}) => {
  return (
    <section className={`${padding} ${background} ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
          <div className="flex flex-col gap-4 sm:gap-6 text-center lg:text-left animate-fadeInUp">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight tracking-[-0.033em]">
              {title}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-normal leading-normal text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
            <div className="flex justify-center lg:justify-start mt-4">
              <button 
                onClick={onButtonClick}
                className="flex min-w-[160px] sm:min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 sm:h-12 px-6 sm:px-8 bg-blue-600 text-white text-sm sm:text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span>{buttonText}</span>
              </button>
            </div>
          </div>
          
          <AIDashboard className="order-first lg:order-last" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;