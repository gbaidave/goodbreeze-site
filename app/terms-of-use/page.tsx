export default function TermsOfUse() {
  return (
    <main className="min-h-screen bg-dark py-24 px-6 sm:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-white">Terms of Use</h1>
        <p className="text-gray-400 mb-12">Effective Date: August 5, 2025</p>

        <div className="prose prose-invert prose-primary max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-gray-300 leading-relaxed">
              These terms govern use of https://goodbreeze.ai and related services offered by Good Breeze AI. By accessing the website or services, you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Use of Services</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              You agree to use our services for lawful purposes only. Prohibited activities include:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Reverse-engineering, copying, or reselling our systems or materials</li>
              <li>Transmitting unlawful content through automations</li>
              <li>Interfering with service operations</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              We reserve the right to terminate access for violations of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Scope of Coverage</h2>
            <p className="text-gray-300 leading-relaxed">
              These terms apply to the public website, AI-powered automation services, and provided systems. However, separate contractual agreements may govern specific client relationships and override these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Data Responsibility</h2>
            <p className="text-gray-300 leading-relaxed">
              You are responsible for the accuracy and legality of provided data, including API keys, usernames, passwords, and customer datasets. We are not liable for outcomes resulting from inaccurate information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">No Performance Guarantees</h2>
            <p className="text-gray-300 leading-relaxed">
              Services are provided "as is" and "as available" with no guarantees regarding uptime, AI accuracy, or third-party platform reliability. Users must validate all outputs before use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed">
              All original materials remain the property of Good Breeze AI unless separately agreed in writing. Reuse or redistribution requires written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Feedback</h2>
            <p className="text-gray-300 leading-relaxed">
              Any suggestions or feedback you submit may be used without restriction or compensation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Modifications</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update these terms at any time. Continued use of our services indicates acceptance of updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Termination</h2>
            <p className="text-gray-300 leading-relaxed">
              We may terminate your access to services without notice if these terms are violated.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Governing Law</h2>
            <p className="text-gray-300 leading-relaxed">
              These terms are governed by California law. Disputes will be resolved in Orange County courts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              Questions about these terms? Contact us at contact@goodbreeze.ai.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
