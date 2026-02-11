export default function TermsOfUse() {
  return (
    <main className="min-h-screen bg-dark py-24 px-6 sm:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-white">Terms And Conditions</h1>
        <p className="text-gray-400 mb-12">Effective Date: 2025-08-05</p>

        <div className="prose prose-invert prose-primary max-w-none space-y-8">
          <section>
            <p className="text-gray-300 leading-relaxed">
              These Terms of Use ("Terms") govern your use of the website located at <a href="https://goodbreeze.ai" className="text-primary hover:underline">https://goodbreeze.ai</a> and any related services, content, or tools offered by Good Breeze AI ("we," "us," "our"). By accessing or using our website or services, you agree to be bound by these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Use of Our Services</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              You agree to use our website and services only for lawful purposes and in accordance with these Terms. You may not:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Attempt to reverse-engineer, copy, or resell our systems or materials</li>
              <li>Use our automations or AI tools to transmit unlawful, malicious, or unauthorized content</li>
              <li>Interfere with the operation of our services or connected third-party systems</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              We reserve the right to suspend or terminate access to our services at our sole discretion if we believe you are in violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Scope of Coverage</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              These Terms apply to your use of:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Our public website and its contents</li>
              <li>Our AI-powered automation and consulting services</li>
              <li>Any systems, workflows, or tools provided as part of a client engagement</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Separate contractual agreements may govern specific client relationships (e.g., engagement agreements, statements of work, or retainer addenda). These Terms do not override such agreements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Data Provided to Us</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              You are solely responsible for the accuracy, legality, and authorization of any data, credentials, content, or access you provide to us, including but not limited to:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>API keys, usernames, and passwords</li>
              <li>Client/customer data or datasets</li>
              <li>Operational documentation or instructions</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              We are not responsible for the outcomes of workflows configured using inaccurate or unauthorized information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. No Guarantee of Performance</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We provide our services and any AI-powered outputs "as is" and "as available." We make no guarantees regarding:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Uptime, speed, or performance of automated workflows</li>
              <li>Accuracy or completeness of AI-generated responses</li>
              <li>Reliability or availability of third-party platforms used in automation (e.g., n8n, Make.com, Zapier)</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              It is your responsibility to review and validate any outputs before acting on them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              All content, documentation, workflows, and original materials created by Good Breeze AI remain our intellectual property unless otherwise specified in a separate agreement.
            </p>
            <p className="text-gray-300 leading-relaxed">
              You may not reuse, resell, or distribute our work without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Feedback and Suggestions</h2>
            <p className="text-gray-300 leading-relaxed">
              Any feedback or suggestions submitted to us about our tools or services may be used without restriction to improve our offerings. You will not be entitled to compensation or acknowledgment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Modifications to These Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update these Terms at any time. Changes will be effective immediately upon posting to our website. Continued use of our services after changes are posted constitutes your acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Termination</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to terminate your access to our website or services at any time, without notice, for conduct that we believe violates these Terms, is harmful to other users, or interferes with our operations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Governing Law</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms are governed by and interpreted under the laws of the State of California. Any disputes shall be resolved in the courts located in Orange County, California.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              Questions about these Terms? Contact us at <a href="mailto:contact@goodbreeze.ai" className="text-primary hover:underline">contact@goodbreeze.ai</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
