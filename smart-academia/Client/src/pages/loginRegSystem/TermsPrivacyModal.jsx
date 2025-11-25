import React from 'react';

/**
 * TermsPrivacyModal Component
 * 
 * A comprehensive modal displaying the Terms of Service and Privacy Policy
 * for SmartAcademia educational platform.
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback function to close modal
 */

const TermsPrivacyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Handle backdrop click to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                SmartAcademia Terms & Privacy Policy
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Last Updated: {new Date().toLocaleDateString()}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">
                close
              </span>
            </button>
          </div>

          {/* Table of Contents */}
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Quick Navigation</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• <a href="#acceptance" className="hover:underline">1. Acceptance of Terms</a></li>
              <li>• <a href="#user-responsibilities" className="hover:underline">2. User Responsibilities</a></li>
              <li>• <a href="#data-collection" className="hover:underline">3. Data Collection</a></li>
              <li>• <a href="#data-usage" className="hover:underline">4. Data Usage & Protection</a></li>
              <li>• <a href="#academic-integrity" className="hover:underline">5. Academic Integrity</a></li>
              <li>• <a href="#intellectual-property" className="hover:underline">6. Intellectual Property</a></li>
              <li>• <a href="#termination" className="hover:underline">7. Account Termination</a></li>
            </ul>
          </div>

          {/* Policy Content */}
          <div className="space-y-8 text-gray-700 dark:text-gray-300">
            
            {/* Section 1: Acceptance of Terms */}
            <section id="acceptance" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>By accessing and using SmartAcademia, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy.</p>
                <p>These terms constitute a legal agreement between you and SmartAcademia governing your use of our educational platform.</p>
                <p className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border-l-4 border-yellow-500">
                  <strong>Note:</strong> Continued use of the platform implies ongoing acceptance of any updated terms.
                </p>
              </div>
            </section>

            {/* Section 2: User Responsibilities */}
            <section id="user-responsibilities" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. User Responsibilities</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <h3 className="font-semibold text-gray-900 dark:text-white">2.1 Account Security</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Maintain confidentiality of login credentials</li>
                  <li>Do not share accounts with other individuals</li>
                  <li>Immediately report unauthorized access</li>
                  <li>Use strong, unique passwords</li>
                </ul>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mt-4">2.2 Appropriate Use</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Use platform only for intended educational purposes</li>
                  <li>Respect all institutional policies and guidelines</li>
                  <li>Do not attempt to disrupt platform functionality</li>
                  <li>Report technical issues through proper channels</li>
                </ul>
              </div>
            </section>

            {/* Section 3: Data Collection */}
            <section id="data-collection" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Data Collection</h2>
              <div className="space-y-4 text-sm leading-relaxed">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Personal Information</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Full name and contact details</li>
                      <li>Student/Employee ID numbers</li>
                      <li>Institutional email addresses</li>
                      <li>Department and specialization</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Academic Data</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Course enrollment information</li>
                      <li>Assignment submissions and grades</li>
                      <li>Academic progress and performance</li>
                      <li>Learning analytics and engagement</li>
                    </ul>
                  </div>
                </div>
                
                <p className="bg-green-50 dark:bg-green-900/20 p-3 rounded border-l-4 border-green-500">
                  <strong>Transparency:</strong> We only collect data necessary for educational purposes and platform functionality.
                </p>
              </div>
            </section>

            {/* Section 4: Data Usage & Protection */}
            <section id="data-usage" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Data Usage & Protection</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <h3 className="font-semibold text-gray-900 dark:text-white">4.1 Purpose of Data Usage</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Facilitate course management and enrollment</li>
                  <li>Track academic progress and performance</li>
                  <li>Provide personalized learning experiences</li>
                  <li>Generate institutional reports and analytics</li>
                </ul>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mt-4">4.2 Security Measures</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>End-to-end encryption for data transmission</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication protocols</li>
                  <li>Data backup and disaster recovery systems</li>
                </ul>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mt-4">4.3 Data Sharing</h3>
                <p>We do not sell or rent your personal information. Data may be shared with:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Educational institutions for academic purposes</li>
                  <li>Service providers under strict confidentiality</li>
                  <li>When required by law or legal process</li>
                </ul>
              </div>
            </section>

            {/* Section 5: Academic Integrity */}
            <section id="academic-integrity" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Academic Integrity</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>SmartAcademia is committed to upholding the highest standards of academic integrity. Users must adhere to institutional honor codes and academic policies.</p>
                
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Prohibited Activities</h4>
                  <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300">
                    <li>Plagiarism or unauthorized collaboration</li>
                    <li>Sharing of assessment materials</li>
                    <li>Impersonation or identity fraud</li>
                    <li>Unauthorized access to course materials</li>
                  </ul>
                </div>
                
                <p><strong>Consequences:</strong> Violations may result in account suspension, grade penalties, and institutional disciplinary action.</p>
              </div>
            </section>

            {/* Section 6: Intellectual Property */}
            <section id="intellectual-property" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Intellectual Property</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <h3 className="font-semibold text-gray-900 dark:text-white">6.1 Platform Content</h3>
                <p>All platform software, design, and proprietary content are owned by SmartAcademia and protected by intellectual property laws.</p>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mt-4">6.2 User Content</h3>
                <p>Users retain ownership of their submitted academic work but grant SmartAcademia license to store, display, and process such content for educational purposes.</p>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mt-4">6.3 Institutional Materials</h3>
                <p>Course materials provided by educational institutions remain the property of the respective institutions.</p>
              </div>
            </section>

            {/* Section 7: Account Termination */}
            <section id="termination" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Account Termination</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <h3 className="font-semibold text-gray-900 dark:text-white">7.1 User-Initiated</h3>
                <p>Users may request account deletion through institutional channels. Note that some academic records may be retained for institutional requirements.</p>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mt-4">7.2 Platform-Initiated</h3>
                <p>SmartAcademia reserves the right to suspend or terminate accounts for:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Violation of terms and policies</li>
                  <li>Academic integrity violations</li>
                  <li>Security concerns or unauthorized access</li>
                  <li>Institutional request</li>
                </ul>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-8">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Contact & Support</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                For questions about these terms or privacy practices, contact your institutional administrator or email: 
                <a href="mailto:privacy@smartacademia.edu" className="underline ml-1">privacy@smartacademia.edu</a>
              </p>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By using SmartAcademia, you acknowledge you have read and understood these terms.
            </p>
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPrivacyModal;