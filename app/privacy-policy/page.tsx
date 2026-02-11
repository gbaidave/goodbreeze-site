export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-dark py-24 px-6 sm:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-white">Privacy Policy</h1>
        <p className="text-gray-400 mb-12">Effective Date: August 5, 2025</p>

        <div className="prose prose-invert prose-primary max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Who We Are</h2>
            <p className="text-gray-300 leading-relaxed">
              Good Breeze AI ("we," "our," "us") is an AI solutions provider specializing in automation, consulting, and system design.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">What Information We Collect</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We collect information directly from clients and prospects, including:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Contact details (name, email, phone number)</li>
              <li>Business information</li>
              <li>Service-related data</li>
              <li>Sensitive credentials (if voluntarily shared for integration purposes)</li>
              <li>Payment information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Information is used to:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Deliver services and configure integrations</li>
              <li>Schedule meetings and consultations</li>
              <li>Process payments</li>
              <li>Improve our offerings</li>
              <li>Send marketing communications (with opt-in)</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4 font-semibold">
              We do not sell or rent your personal information under any circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Tools</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We utilize various third-party services to deliver our solutions:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Scheduling platforms</li>
              <li>Payment processors (Stripe, PayPal)</li>
              <li>Automation tools (n8n, Zapier, Make.com)</li>
              <li>CRM systems</li>
              <li>AI assistants for service delivery</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Email Communications</h2>
            <p className="text-gray-300 leading-relaxed">
              Email marketing is available through opt-in only. Unsubscribe options are provided in all marketing messages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
            <p className="text-gray-300 leading-relaxed">
              Residents of California and other jurisdictions with data protection laws may request access, correction, deletion, or communication withdrawal by contacting us at contact@goodbreeze.ai.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Data Retention</h2>
            <p className="text-gray-300 leading-relaxed">
              We keep information only as long as necessary for service delivery, legal compliance, or record maintenance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We use commercially reasonable measures to protect your data. However, we advise users to avoid sharing unnecessary sensitive information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at contact@goodbreeze.ai.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
