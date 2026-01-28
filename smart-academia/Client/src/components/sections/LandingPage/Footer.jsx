import React from 'react';

const Footer = ({ 
  projectName = "SmartAcademia",
  tagline = "AI-powered learning platform - Final Year Project",
  currentYear = new Date().getFullYear(),
  studentName = "Siraj Ahmed and Shagufta",
  university = "Sukkur IBA University",
  githubLink = "#",
  demoLink = "#",
  contactEmail = "dujanadujana16@gmail.com"
}) => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8">
          {/* Project Info */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
              <span className="material-symbols-outlined text-blue-600 text-2xl">school</span>
              <h2 className="text-lg sm:text-xl font-bold">{projectName}</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{tagline}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Developed by {studentName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {university}
            </p>
          </div>

          {/* Links Section */}
          <div className="flex flex-col items-center sm:items-end gap-4">
            {/* Project Links */}
            <div className="flex flex-col items-center sm:items-end gap-2">
              <h3 className="font-bold text-sm">Project Links</h3>
              <div className="flex gap-4">
                <a 
                  href={githubLink}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors duration-300 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">code</span>
                  GitHub
                </a>
                <a 
                  href={demoLink}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors duration-300 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">play_arrow</span>
                  Live Demo
                </a>
              </div>
            </div>

            {/* Contact */}
            <div className="text-center sm:text-right">
              <a 
                href={`mailto:${contactEmail}`}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors duration-300 flex items-center justify-center sm:justify-end gap-1"
              >
                <span className="material-symbols-outlined text-base">mail</span>
                {contactEmail}
              </a>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            © {currentYear} {projectName} • Final Year Project • {university}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            This project is for academic purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;