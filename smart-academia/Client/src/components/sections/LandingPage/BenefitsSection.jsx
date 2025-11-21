import React from 'react';
import BenefitCard from '../../cards/LandingPage/BenefitCard';

const BenefitsSection = ({ 
  title = "Why Choose SmartAcademia?",
  subtitle = "We fill the gaps that other platforms miss",
  benefits = [
    { icon: "auto_awesome", title: "AI-Powered", description: "Personalized learning beyond static content" },
    { icon: "code", title: "Auto-Graded Labs", description: "Instant feedback on coding assignments" },
    { icon: "group", title: "Dual Platform", description: "Complete ecosystem for students & teachers" },
    { icon: "security", title: "Anti-Cheating", description: "Built-in integrity measures for fair assessment" }
  ],
  background = "bg-gray-50 dark:bg-gray-800",
  padding = "py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8",
  className = ""
}) => {
  return (
    <section className={`${padding} ${background} ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-3 sm:gap-4 text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em]">
            {title}
          </h2>
          <p className="text-sm sm:text-base font-normal leading-normal text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;