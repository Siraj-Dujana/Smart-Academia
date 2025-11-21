import React from 'react';
import CourseCard from '../../cards/LandingPage/CourseCard';

const CourseSection = ({ 
  title = "Course Highlights",
  subtitle = "Explore our curated selection of courses designed to elevate your skills.",
  courses = [
    {
      title: "Introduction to Python",
      level: "Beginner",
      levelColor: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
      description: "Learn the fundamentals of Python programming, from variables to object-oriented principles."
    },
    {
      title: "Machine Learning",
      level: "Intermediate",
      levelColor: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300",
      description: "Dive into machine learning concepts, algorithms, and practical applications with real-world datasets."
    },
    {
      title: "Advanced AI Systems",
      level: "Expert",
      levelColor: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300",
      description: "Master advanced AI topics including neural networks, deep learning, and reinforcement learning."
    }
  ],
  onEnroll,
  background = "bg-gray-50 dark:bg-gray-800",
  padding = "py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8",
  className = ""
}) => {
  return (
    <section id="courses" className={`${padding} ${background} ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col gap-8 sm:gap-10">
        <div className="flex flex-col gap-3 sm:gap-4 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em]">{title}</h2>
          <p className="text-sm sm:text-base font-normal leading-normal text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {courses.map((course, index) => (
            <CourseCard
              key={index}
              title={course.title}
              level={course.level}
              levelColor={course.levelColor}
              description={course.description}
              onEnroll={onEnroll}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseSection;