export default function TermsOfUse() {
  return (
    <main className="min-h-screen bg-dark py-24 px-6 sm:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-white">Terms of Use</h1>
        <p className="text-gray-400 mb-12">Effective Date: August 5, 2025</p>

        <div className="prose prose-invert prose-primary max-w-none space-y-8">
          <section>
            <p className="text-gray-300 leading-relaxed mb-6">
              These Terms govern use of <a href="https://goodbreeze.ai" className="text-primary hover:underline">https://goodbreeze.ai</a> and related services offered by Good Breeze AI. By accessing the website or services, users agree to be bound by these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Use of Services</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Users must use the website and services lawfully and in accordance with the Terms. Prohibited activities include:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Attempt to reverse-engineer, copy, or resell our systems or materials</li>
              <li>Using automations or AI tools to transmit unlawful or unauthorized content</li>
              <li>Interfering with service operation or third-party systems</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Good Breeze AI reserves the right to suspend or terminate access if violations occur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Scope of Coverage</h2>
            <p className="text-gray-300 leading-relaxed">
              The Terms apply to the public website, AI-powered automation and consulting services, and related tools. Separate agreements may govern specific client relationships and override these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Data Provided to Us</h2>
            <p className="text-gray-300 leading-relaxed">
              Users are solely responsible for accuracy and legality of provided data, including API keys, passwords, client data, and operational documentation. The company is not responsible for outcomes based on inaccurate information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. No Guarantee of Performance</h2>
            <p className="text-gray-300 leading-relaxed">
              Services are provided "as is" without guarantees regarding uptime, AI accuracy, or third-party platform reliability. Users must review and validate outputs before acting.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              All content, documentation, workflows, and original materials created by Good Breeze AI remain our intellectual property unless otherwise specified in a separate agreement.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Reuse or resale without written permission is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Feedback and Suggestions</h2>
            <p className="text-gray-300 leading-relaxed">
              Feedback submitted may be used without restriction or compensation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Modifications to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              The company may update Terms at any time. Continued use constitutes acceptance of updates.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Termination</h2>
            <p className="text-gray-300 leading-relaxed">
              Access may be terminated at any time for violations or conduct deemed harmful.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Governing Law</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms are governed by California law. Disputes are resolved in Orange County, California courts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              Questions can be directed to <a href="mailto:contact@goodbreeze.ai" className="text-primary hover:underline">contact@goodbreeze.ai</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
