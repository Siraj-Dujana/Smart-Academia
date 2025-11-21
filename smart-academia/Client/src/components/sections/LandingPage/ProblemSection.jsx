import React from 'react';
import ChallengeCard from '../../cards/LandingPage/ChallengeCard';

const ProblemSection = ({ 
  title = "The Challenges in Modern Education",
  subtitle = "Addressing the core issues that hinder effective learning and teaching",
  challenges = [
    {
      icon: "school",
      title: "Students Struggle With",
      challenges: [
        "No timely feedback on coding labs and assignments",
        "Lack of structured, progressive learning paths",
        "Difficulty tracking academic performance",
        "Limited access to personalized learning resources"
      ],
      color: "text-red-500"
    },
    {
      icon: "groups",
      title: "Teachers Face",
      challenges: [
        "Excessive time spent on manual grading",
        "Difficulty monitoring student progress",
        "Limited tools for interactive content",
        "Challenges in maintaining academic integrity"
      ],
      color: "text-orange-500"
    }
  ],
  background = "bg-white dark:bg-gray-900",
  padding = "py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8",
  className = ""
}) => {
  return (
    <section id="solutions" className={`${padding} ${background} ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col gap-8 sm:gap-10">
        <div className="flex flex-col gap-3 sm:gap-4 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em]">
            {title}
          </h2>
          <p className="text-sm sm:text-base font-normal leading-normal text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {challenges.map((challenge, index) => (
            <ChallengeCard
              key={index}
              icon={challenge.icon}
              title={challenge.title}
              challenges={challenge.challenges}
              color={challenge.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;