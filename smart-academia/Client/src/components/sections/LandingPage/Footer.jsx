import React from 'react';

const Footer = ({ 
  companyName = "SmartAcademia",
  logo = "school",
  tagline = "AI-powered learning for the future.",
  currentYear = new Date().getFullYear(),
  platformLinks = [
    { label: "Features", href: "#features" },
    { label: "Courses", href: "#courses" },
    { label: "Solutions", href: "#solutions" },
    { label: "How It Works", href: "#how-it-works" }
  ],
  companyLinks = [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" }
  ],
  legalLinks = [
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" }
  ],
  socialLinks = [
    { 
      icon: "facebook", 
      href: "#",
      svg: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    },
    { 
      icon: "twitter", 
      href: "#",
      svg: <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
    },
    { 
      icon: "linkedin", 
      href: "#",
      svg: <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    }
  ]
}) => {
  const renderLinks = (links) => (
    <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
      {links.map((link, index) => (
        <li key={index}>
          <a className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors duration-300" href={link.href}>
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <span className="material-symbols-outlined text-blue-600 text-xl sm:text-2xl">{logo}</span>
              <h2 className="text-base sm:text-lg font-bold">{companyName}</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{tagline}</p>
          </div>
          <div>
            <h3 className="font-bold mb-2 sm:mb-4 text-sm sm:text-base">Platform</h3>
            {renderLinks(platformLinks)}
          </div>
          <div>
            <h3 className="font-bold mb-2 sm:mb-4 text-sm sm:text-base">Company</h3>
            {renderLinks(companyLinks)}
          </div>
          <div>
            <h3 className="font-bold mb-2 sm:mb-4 text-sm sm:text-base">Legal</h3>
            {renderLinks(legalLinks)}
          </div>
        </div>
        <div className="mt-8 sm:mt-12 border-t border-gray-200 dark:border-gray-700 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
            © {currentYear} {companyName}. All rights reserved.
          </p>
          <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-0">
            {socialLinks.map((social, index) => (
              <a 
                key={index}
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors duration-300 transform hover:scale-110" 
                href={social.href}
              >
                <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
                  {social.svg}
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;