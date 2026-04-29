import React from 'react';

const Footer = ({ 
  projectName = "Smart Academia",
  tagline = "AI-powered learning platform - Final Year Project",
  currentYear = new Date().getFullYear(),
  studentName = "Siraj Ahmed & Shagufta",
  university = "Sukkur IBA University",
  githubLink = "#",
  demoLink = "#",
  contactEmail = "dujanadujana16@gmail.com"
}) => {
  return (
    <footer className="border-t" style={{ background: "#0f1629", borderColor: "#1e293b" }}>
      <div className="max-w-7xl mx-auto py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8">
          {/* Project Info */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l9-5-9 5-9-5m9 5v5m0-5v5m0 0l-9-5m9 5l9-5" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {projectName}
              </h2>
            </div>
            <p className="text-sm text-gray-500 mb-2">{tagline}</p>
            <p className="text-xs text-gray-500">
              Developed by <span className="text-indigo-400">{studentName}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {university}
            </p>
          </div>

          {/* Links Section */}
          <div className="flex flex-col items-center sm:items-end gap-4">
            {/* Project Links */}
            <div className="flex flex-col items-center sm:items-end gap-2">
              <h3 className="font-bold text-sm text-gray-400">Project Links</h3>
              <div className="flex gap-4">
                <a 
                  href={githubLink}
                  className="text-sm text-gray-500 hover:text-indigo-400 transition-all duration-300 flex items-center gap-1 hover:-translate-y-0.5"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="material-symbols-outlined text-base">code</span>
                  GitHub
                </a>
                <a 
                  href={demoLink}
                  className="text-sm text-gray-500 hover:text-indigo-400 transition-all duration-300 flex items-center gap-1 hover:-translate-y-0.5"
                  target="_blank"
                  rel="noopener noreferrer"
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
                className="text-sm text-gray-500 hover:text-indigo-400 transition-all duration-300 flex items-center justify-center sm:justify-end gap-1 hover:-translate-y-0.5"
              >
                <span className="material-symbols-outlined text-base">mail</span>
                {contactEmail}
              </a>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: "#1e293b" }}>
          <p className="text-xs text-gray-500">
            © {currentYear} {projectName} • Final Year Project • {university}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            This project is for academic purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;