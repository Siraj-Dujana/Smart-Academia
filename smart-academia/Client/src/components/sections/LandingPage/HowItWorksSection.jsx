import React from 'react';
import StepCard from '../../cards/LandingPage/StepCard';

const HowItWorksSection = ({ 
  title = "How It Works",
  subtitle = "Get started in just a few simple steps and unlock your full learning potential.",
  steps = [
    { number: "1", icon: "person_add", title: "Register", description: "Create your account as a student or a teacher." },
    { number: "2", icon: "search", title: "Select Course", description: "Browse our extensive library and enroll in a course." },
    { number: "3", icon: "laptop_mac", title: "Learn & Practice", description: "Engage with lessons, complete labs, and take quizzes." },
    { number: "4", icon: "monitoring", title: "Track Progress", description: "See your performance and get insights from the dashboard." }
  ],
  background = "bg-white dark:bg-gray-900",
  padding = "py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8",
  className = ""
}) => {
  return (
    <section id="how-it-works" className={`${padding} ${background} ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col gap-8 sm:gap-12 items-center">
        <div className="flex flex-col gap-3 sm:gap-4 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em]">{title}</h2>
          <p className="text-sm sm:text-base font-normal leading-normal text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <StepCard
              key={index}
              number={step.number}
              icon={step.icon}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;