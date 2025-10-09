// src/components/PrivacyPolicy.tsx - New GDPR-compliant Privacy Policy Component
// This component renders a full privacy policy page. Use it in a route like pages/privacy-policy.tsx.
// It includes standard sections: introduction, data collection, legal basis, user rights, etc.
// Tailored to your app's features (e.g., registration, optional geolocation). Update placeholders (e.g., company name, contact) as needed.
// Styled to match your app's theme for consistency.

import React from 'react'

interface PrivacyPolicyProps {
  // Optional props for customization (e.g., company name)
  companyName?: string
  contactEmail?: string
  lastUpdated?: string
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({
  companyName = 'TimeSwap.',
  contactEmail = 'privacy@timeswap.com',
  lastUpdated = 'October 07, 2025'
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-500 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl text-white">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-white/80 text-lg">
            Last updated: {lastUpdated}
          </p>
          <p className="text-white/70 mt-2">
            {companyName} is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal data in compliance with GDPR and other applicable laws.
          </p>
        </header>

        {/* Sections */}
        <section className="space-y-6 mb-8">
          {/* 1. Introduction */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-white/90 mb-4">
              We respect your privacy and are committed to protecting your personal data. This Privacy Policy applies to our website and services (the "Services"). By using our Services, you consent to the practices described here.
            </p>
            <p className="text-white/80">
              We act as the Data Controller for the personal data we collect. For questions, contact us at <a href={`mailto:${contactEmail}`} className="text-blue-200 underline hover:text-blue-100">{contactEmail}</a>.
            </p>
          </div>

          {/* 2. Data We Collect */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">2. Data We Collect</h2>
            <ul className="space-y-2 text-white/90 list-disc list-inside">
              <li><strong>Registration Data:</strong> Full name, email, username, password (hashed), optional phone, and location (if consented).</li>
              <li><strong>Geolocation Data:</strong> Approximate city-level location (via browser API) only if you explicitly consent during registration. Not stored without submission.</li>
              <li><strong>Usage Data:</strong> IP address, browser type, access times (for security and analytics).</li>
              <li><strong>Cookies:</strong> Essential cookies for authentication; no tracking cookies without consent.</li>
            </ul>
            <p className="text-white/80 mt-4">
              We minimize data collection to what is necessary for providing our Services.
            </p>
          </div>

          {/* 3. How We Use Your Data */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Data</h2>
            <p className="text-white/90 mb-4">
              We use your data to:
            </p>
            <ul className="space-y-2 text-white/90 list-disc list-inside">
              <li>Process registrations and authenticate users.</li>
              <li>Auto-fill optional fields (e.g., location) with consent.</li>
              <li>Improve Services (e.g., analytics, no personal profiling).</li>
              <li>Comply with legal obligations (e.g., fraud prevention).</li>
            </ul>
            <p className="text-white/80 mt-4">
              Data is not sold or shared with third parties except processors (e.g., Supabase for auth) under strict agreements.
            </p>
          </div>

          {/* 4. Legal Basis (GDPR) */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">4. Legal Basis for Processing</h2>
            <p className="text-white/90 mb-4">
              Under GDPR:
            </p>
            <ul className="space-y-2 text-white/90 list-disc list-inside">
              <li><strong>Consent (Art. 6(1)(a)):</strong> For optional geolocation.</li>
              <li><strong>Contract (Art. 6(1)(b)):</strong> For registration and authentication.</li>
              <li><strong>Legitimate Interests (Art. 6(1)(f)):</strong> For security and analytics (balanced against your rights).</li>
            </ul>
          </div>

          {/* 5. Data Retention */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
            <p className="text-white/90">
              We retain data only as long as necessary: e.g., registration data until account deletion; geolocation until form submission (if consented). Logs are kept for 30 days for security.
            </p>
          </div>

          {/* 6. Your Rights */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-white/90 mb-4">
              You have the following GDPR rights:
            </p>
            <ul className="space-y-2 text-white/90 list-disc list-inside">
              <li><strong>Access (Art. 15):</strong> Request a copy of your data.</li>
              <li><strong>Rectification (Art. 16):</strong> Correct inaccurate data.</li>
              <li><strong>Erasure (Art. 17):</strong> Delete your data (e.g., revoke consent clears location).</li>
              <li><strong>Restriction (Art. 18):</strong> Limit processing.</li>
              <li><strong>Portability (Art. 20):</strong> Receive data in machine-readable format.</li>
              <li><strong>Object (Art. 21):</strong> Oppose processing based on legitimate interests.</li>
              <li><strong>Withdraw Consent:</strong> At any time, without affecting prior processing.</li>
            </ul>
            <p className="text-white/80 mt-4">
              To exercise rights, email {contactEmail}. We respond within 1 month.
            </p>
          </div>

          {/* 7. Security */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">7. Security</h2>
            <p className="text-white/90">
              We use HTTPS, encryption (e.g., hashed passwords), and access controls. However, no system is 100% secure—report issues to {contactEmail}.
            </p>
          </div>

          {/* 8. International Transfers */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">8. International Transfers</h2>
            <p className="text-white/90">
              Data is stored in the EU/EEA (Supabase). Any transfers outside use Standard Contractual Clauses (SCCs) for safeguards.
            </p>
          </div>

          {/* 9. Children's Privacy */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
            <p className="text-white/90">
              Our Services are not for children under 16. We do not knowingly collect their data.
            </p>
          </div>

          {/* 10. Changes to Policy */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
            <p className="text-white/90">
              We may update this policy. Changes will be posted here with the new "Last updated" date. Continued use constitutes acceptance.
            </p>
          </div>

          {/* 11. Contact */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p className="text-white/90">
              For privacy concerns: <a href={`mailto:${contactEmail}`} className="text-blue-200 underline hover:text-blue-100">{contactEmail}</a>.<br />
              Data Protection Officer: Available upon request.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-white/70 mt-8 pt-6 border-t border-white/20">
          <p>&copy; {lastUpdated.split(' ')[0]} {companyName}. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}

export default PrivacyPolicy