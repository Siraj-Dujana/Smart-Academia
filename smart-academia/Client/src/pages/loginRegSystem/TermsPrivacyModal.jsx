import React, { useState, useEffect } from 'react';

/**
 * TermsPrivacyModal Component
 * 
 * Professional modal displaying Terms of Service and Privacy Policy
 * for SmartAcademia educational platform
 */

const TermsPrivacyModal = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('acceptance');
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleScroll = (e) => {
    const element = e.target;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    setScrollProgress(progress);
  };

  useEffect(() => {
    const handleActiveSection = () => {
      const sections = document.querySelectorAll('section[id]');
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          setActiveSection(section.id);
        }
      });
    };
    
    if (isOpen) {
      window.addEventListener('scroll', handleActiveSection);
      return () => window.removeEventListener('scroll', handleActiveSection);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms' },
    { id: 'responsibilities', title: 'User Responsibilities' },
    { id: 'data-collection', title: 'Data Collection' },
    { id: 'data-usage', title: 'Data Usage & Protection' },
    { id: 'academic-integrity', title: 'Academic Integrity' },
    { id: 'intellectual-property', title: 'Intellectual Property' },
    { id: 'termination', title: 'Account Termination' },
    { id: 'contact', title: 'Contact' }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-2xl max-w-5xl w-full h-[90vh] flex overflow-hidden shadow-2xl border border-gray-800 flex-col lg:flex-row">
        
        {/* Left Sidebar - Navigation (Desktop) */}
        <div className="hidden lg:block w-72 bg-gray-900 border-r border-gray-800 overflow-y-auto">
          <div className="p-6 sticky top-0 bg-gray-900">
            <div className="mb-6 pb-6 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white mb-1">Smart Academia</h2>
              <p className="text-xs text-gray-500">Legal Terms & Privacy</p>
            </div>
            
            <nav className="space-y-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`block px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    activeSection === section.id
                      ? 'bg-gray-800 text-indigo-400 font-medium'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex overflow-x-auto border-b border-gray-800 bg-gray-900 p-3 gap-2 flex-shrink-0">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                activeSection === section.id
                  ? 'bg-gray-800 text-indigo-400'
                  : 'text-gray-400 bg-gray-800/50'
              }`}
            >
              {section.title.split(' ').slice(0, 2).join(' ')}
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 z-10">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-semibold text-white">
                  Terms & Privacy Policy
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-300 p-1 hover:bg-gray-800 rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Scroll Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800">
              <div 
                className="h-full bg-indigo-500 transition-all duration-200"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div 
            className="flex-1 overflow-y-auto p-6 space-y-8"
            onScroll={handleScroll}
          >
            {/* Section 1: Acceptance of Terms */}
            <section id="acceptance" className="scroll-mt-24">
              <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-gray-800">1. Acceptance of Terms</h2>
              <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
                <p>By accessing and using Smart Academia, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy.</p>
                <p>These terms constitute a legal agreement between you and Smart Academia governing your use of our educational platform.</p>
                <div className="bg-gray-800/50 p-4 rounded-lg border-l-2 border-indigo-500 mt-3">
                  <p className="text-indigo-300 text-xs">
                    <strong>Note:</strong> Continued use of the platform implies ongoing acceptance of any updated terms. Significant changes will be notified via email.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: User Responsibilities */}
            <section id="responsibilities" className="scroll-mt-24">
              <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-gray-800">2. User Responsibilities</h2>
              <div className="space-y-4 text-sm text-gray-400 leading-relaxed">
                <div>
                  <h3 className="font-medium text-gray-300 mb-2">Account Security</h3>
                  <ul className="space-y-1 list-disc list-inside ml-2">
                    <li>Maintain confidentiality of login credentials</li>
                    <li>Do not share accounts with others</li>
                    <li>Immediately report unauthorized access</li>
                    <li>Use strong, unique passwords</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-300 mb-2">Appropriate Use</h3>
                  <ul className="space-y-1 list-disc list-inside ml-2">
                    <li>Use platform only for educational purposes</li>
                    <li>Respect institutional policies</li>
                    <li>Do not disrupt platform functionality</li>
                    <li>Report issues through proper channels</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3: Data Collection */}
            <section id="data-collection" className="scroll-mt-24">
              <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-gray-800">3. Data Collection</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-800">
                  <h3 className="font-medium text-gray-300 mb-2">Personal Information</h3>
                  <ul className="space-y-1 text-sm text-gray-400 list-disc list-inside">
                    <li>Full name and contact details</li>
                    <li>Student or Employee ID numbers</li>
                    <li>Institutional email addresses</li>
                    <li>Department and specialization</li>
                  </ul>
                </div>
                <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-800">
                  <h3 className="font-medium text-gray-300 mb-2">Academic Data</h3>
                  <ul className="space-y-1 text-sm text-gray-400 list-disc list-inside">
                    <li>Course enrollment information</li>
                    <li>Assignment submissions and grades</li>
                    <li>Academic progress and performance</li>
                    <li>Learning analytics and engagement</li>
                  </ul>
                </div>
              </div>
              <div className="bg-gray-800/30 p-3 rounded-lg">
                <p className="text-sm text-gray-400">We only collect data necessary for educational purposes and platform functionality. Your data is never sold to third parties.</p>
              </div>
            </section>

            {/* Section 4: Data Usage & Protection */}
            <section id="data-usage" className="scroll-mt-24">
              <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-gray-800">4. Data Usage & Protection</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-800">
                  <h3 className="font-medium text-gray-300 mb-2">Purpose</h3>
                  <ul className="space-y-1 text-sm text-gray-400 list-disc list-inside">
                    <li>Course management</li>
                    <li>Academic tracking</li>
                    <li>Personalized learning</li>
                  </ul>
                </div>
                <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-800">
                  <h3 className="font-medium text-gray-300 mb-2">Security Measures</h3>
                  <ul className="space-y-1 text-sm text-gray-400 list-disc list-inside">
                    <li>End-to-end encryption</li>
                    <li>Regular security audits</li>
                    <li>Strict access controls</li>
                  </ul>
                </div>
                <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-800">
                  <h3 className="font-medium text-gray-300 mb-2">Data Sharing</h3>
                  <ul className="space-y-1 text-sm text-gray-400 list-disc list-inside">
                    <li>Educational institutions</li>
                    <li>Authorized service providers</li>
                    <li>Legal requirements only</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5: Academic Integrity */}
            <section id="academic-integrity" className="scroll-mt-24">
              <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-gray-800">5. Academic Integrity</h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">Smart Academia is committed to upholding the highest standards of academic integrity. Users must adhere to institutional honor codes and academic policies.</p>
              <div className="bg-red-950/20 p-4 rounded-lg border border-red-900/30">
                <h3 className="font-medium text-red-300 mb-2">Prohibited Activities</h3>
                <ul className="space-y-1 text-sm text-gray-400 list-disc list-inside">
                  <li>Plagiarism or unauthorized collaboration</li>
                  <li>Sharing of assessment materials</li>
                  <li>Impersonation or identity fraud</li>
                  <li>Unauthorized access to course materials</li>
                </ul>
              </div>
              <p className="mt-4 text-sm text-gray-400">Violations may result in account suspension, grade penalties, and institutional disciplinary action.</p>
            </section>

            {/* Section 6: Intellectual Property */}
            <section id="intellectual-property" className="scroll-mt-24">
              <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-gray-800">6. Intellectual Property</h2>
              <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
                <p><strong className="text-gray-300">Platform Content:</strong> All platform software, design, and proprietary content are owned by Smart Academia and protected by intellectual property laws.</p>
                <p><strong className="text-gray-300">User Content:</strong> Users retain ownership of their submitted academic work but grant Smart Academia license to store, display, and process such content for educational purposes.</p>
                <p><strong className="text-gray-300">Institutional Materials:</strong> Course materials provided by educational institutions remain the property of the respective institutions.</p>
              </div>
            </section>

            {/* Section 7: Account Termination */}
            <section id="termination" className="scroll-mt-24">
              <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-gray-800">7. Account Termination</h2>
              <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
                <p><strong className="text-gray-300">User-Initiated:</strong> Users may request account deletion through institutional channels. Some academic records may be retained for institutional requirements.</p>
                <p><strong className="text-gray-300">Platform-Initiated:</strong> Smart Academia reserves the right to suspend or terminate accounts for violations of terms, academic integrity breaches, security concerns, or institutional requests.</p>
              </div>
            </section>

            {/* Section 8: Contact */}
            <section id="contact" className="scroll-mt-24">
              <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-gray-800">8. Contact</h2>
              <div className="bg-gray-800/30 p-5 rounded-lg text-center border border-gray-800">
                <p className="text-sm text-gray-400 mb-3">Have questions about these terms or privacy practices?</p>
                <a 
                  href="mailto:privacy@smartacademia.edu" 
                  className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  privacy@smartacademia.edu
                </a>
              </div>
            </section>

            {/* Footer */}
            <div className="pt-6 border-t border-gray-800 text-center">
              <p className="text-xs text-gray-500 mb-4">
                By using Smart Academia, you acknowledge that you have read and understood these terms.
              </p>
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 font-medium text-sm"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPrivacyModal;