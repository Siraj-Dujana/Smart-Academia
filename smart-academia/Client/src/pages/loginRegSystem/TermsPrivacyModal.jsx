import React, { useState, useEffect } from 'react';

/**
 * TermsPrivacyModal Component
 * 
 * Professional modal displaying Terms of Service and Privacy Policy
 * for SmartAcademia educational platform with modern UI/UX
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback function to close modal
 */

const TermsPrivacyModal = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('acceptance');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Handle backdrop click to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Track scroll progress
  const handleScroll = (e) => {
    const element = e.target;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    setScrollProgress(progress);
  };

  // Auto-detect active section on scroll
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
    { id: 'acceptance', title: 'Acceptance of Terms', icon: '✓' },
    { id: 'responsibilities', title: 'User Responsibilities', icon: '👤' },
    { id: 'data-collection', title: 'Data Collection', icon: '📊' },
    { id: 'data-usage', title: 'Data Usage & Protection', icon: '🔒' },
    { id: 'academic-integrity', title: 'Academic Integrity', icon: '🎓' },
    { id: 'intellectual-property', title: 'Intellectual Property', icon: '©️' },
    { id: 'termination', title: 'Account Termination', icon: '⚙️' },
    { id: 'contact', title: 'Contact & Support', icon: '📧' }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-6xl w-full h-[90vh] flex overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Left Sidebar - Navigation */}
        <div className="hidden lg:block w-80 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-6 sticky top-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">school</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">SmartAcademia</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Legal & Privacy</p>
              </div>
            </div>
            
            <div className="relative mb-4">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
              <input 
                type="text"
                placeholder="Search terms..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span className="text-sm font-medium">{section.title}</span>
                  {activeSection === section.id && (
                    <span className="ml-auto text-xs">●</span>
                  )}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Terms & Privacy Policy
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
            
            {/* Scroll Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-200"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div 
            className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-10"
            onScroll={handleScroll}
          >
            {/* Section 1: Acceptance of Terms */}
            <section id="acceptance" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">✓</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Acceptance of Terms</h2>
              </div>
              <div className="ml-4 pl-6 border-l-4 border-blue-500 space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                <p>By accessing and using SmartAcademia, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy.</p>
                <p>These terms constitute a legal agreement between you and SmartAcademia governing your use of our educational platform.</p>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border-l-4 border-amber-500">
                  <p className="text-amber-800 dark:text-amber-200 text-sm">
                    <strong>📌 Important:</strong> Continued use of the platform implies ongoing acceptance of any updated terms. We'll notify you of significant changes via email.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: User Responsibilities */}
            <section id="responsibilities" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">👤</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Responsibilities</h2>
              </div>
              <div className="ml-4 pl-6 border-l-4 border-emerald-500 space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Account Security</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {['Maintain confidentiality of login credentials', 'Do not share accounts with others', 'Immediately report unauthorized access', 'Use strong, unique passwords'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-emerald-500">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Appropriate Use</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {['Use platform only for educational purposes', 'Respect institutional policies', 'Do not disrupt platform functionality', 'Report issues through proper channels'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-emerald-500">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Data Collection */}
            <section id="data-collection" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">📊</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Collection</h2>
              </div>
              <div className="ml-4 pl-6 border-l-4 border-purple-500">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 p-5 rounded-xl">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-xl">📝</span> Personal Information
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Full name and contact details</li>
                      <li>• Student/Employee ID numbers</li>
                      <li>• Institutional email addresses</li>
                      <li>• Department and specialization</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 p-5 rounded-xl">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-xl">🎓</span> Academic Data
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Course enrollment information</li>
                      <li>• Assignment submissions and grades</li>
                      <li>• Academic progress and performance</li>
                      <li>• Learning analytics and engagement</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    <strong>🔒 Transparency:</strong> We only collect data necessary for educational purposes and platform functionality. Your data is never sold to third parties.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Data Usage & Protection */}
            <section id="data-usage" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">🔒</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Usage & Protection</h2>
              </div>
              <div className="ml-4 pl-6 border-l-4 border-cyan-500 space-y-4">
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { title: 'Purpose', items: ['Course management', 'Academic tracking', 'Personalized learning'] },
                    { title: 'Security Measures', items: ['End-to-end encryption', 'Regular audits', 'Access controls'] },
                    { title: 'Data Sharing', items: ['Educational institutions', 'Service providers', 'Legal requirements'] }
                  ].map((col, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{col.title}</h4>
                      <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        {col.items.map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 5: Academic Integrity */}
            <section id="academic-integrity" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">🎓</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Integrity</h2>
              </div>
              <div className="ml-4 pl-6 border-l-4 border-red-500">
                <p className="text-gray-600 dark:text-gray-400 mb-4">SmartAcademia is committed to upholding the highest standards of academic integrity. Users must adhere to institutional honor codes and academic policies.</p>
                <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-5 rounded-xl border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                    <span className="text-xl">⚠️</span> Prohibited Activities
                  </h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {['Plagiarism or unauthorized collaboration', 'Sharing of assessment materials', 'Impersonation or identity fraud', 'Unauthorized access to course materials'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                        <span>🚫</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Violations may result in account suspension, grade penalties, and institutional disciplinary action.</p>
              </div>
            </section>

            {/* Section 6: Intellectual Property */}
            <section id="intellectual-property" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">©️</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Intellectual Property</h2>
              </div>
              <div className="ml-4 pl-6 border-l-4 border-indigo-500 space-y-3 text-gray-600 dark:text-gray-400">
                <p><strong className="text-gray-900 dark:text-white">Platform Content:</strong> All platform software, design, and proprietary content are owned by SmartAcademia and protected by intellectual property laws.</p>
                <p><strong className="text-gray-900 dark:text-white">User Content:</strong> Users retain ownership of their submitted academic work but grant SmartAcademia license to store, display, and process such content for educational purposes.</p>
                <p><strong className="text-gray-900 dark:text-white">Institutional Materials:</strong> Course materials provided by educational institutions remain the property of the respective institutions.</p>
              </div>
            </section>

            {/* Section 7: Account Termination */}
            <section id="termination" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">⚙️</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Termination</h2>
              </div>
              <div className="ml-4 pl-6 border-l-4 border-gray-500 space-y-3 text-gray-600 dark:text-gray-400">
                <p><strong className="text-gray-900 dark:text-white">User-Initiated:</strong> Users may request account deletion through institutional channels. Some academic records may be retained for institutional requirements.</p>
                <p><strong className="text-gray-900 dark:text-white">Platform-Initiated:</strong> SmartAcademia reserves the right to suspend or terminate accounts for violations of terms, academic integrity breaches, security concerns, or institutional requests.</p>
              </div>
            </section>

            {/* Section 8: Contact & Support */}
            <section id="contact" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">📧</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact & Support</h2>
              </div>
              <div className="ml-4 pl-6 border-l-4 border-teal-500">
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 p-5 rounded-xl text-center">
                  <p className="text-gray-700 dark:text-gray-300 mb-3">Have questions about these terms or privacy practices?</p>
                  <a 
                    href="mailto:privacy@smartacademia.edu" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    <span className="material-symbols-outlined text-lg">mail</span>
                    privacy@smartacademia.edu
                  </a>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                By using SmartAcademia, you acknowledge that you have read and understood these terms.
              </p>
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 font-medium"
              >
                I Understand & Agree
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPrivacyModal;