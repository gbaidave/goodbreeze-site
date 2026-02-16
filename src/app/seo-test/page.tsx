'use client';

import { useState } from 'react';

export default function SEOTestPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    url: '',
    focus_keyword: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('https://n8n.goodbreeze.ai/webhook/seo-audit-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2">SEO Audit PDF Test</h1>
          <p className="text-gray-400 mb-8">Test the SEO Audit PDF generation workflow</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                id="username"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Dave Smith"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="dave@example.com"
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
                Website URL *
              </label>
              <input
                type="url"
                id="url"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label htmlFor="focus_keyword" className="block text-sm font-medium text-gray-300 mb-2">
                Focus Keyword (optional)
              </label>
              <input
                type="text"
                id="focus_keyword"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.focus_keyword}
                onChange={(e) => setFormData({ ...formData, focus_keyword: e.target.value })}
                placeholder="workflow automation"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Generating PDF...' : 'Generate SEO Audit PDF'}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <p className="text-red-200">Error: {error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 p-6 bg-green-900/50 border border-green-500 rounded-lg">
              <h2 className="text-xl font-bold text-green-200 mb-4">✓ PDF Generated Successfully!</h2>
              <div className="space-y-2 text-gray-300">
                <p><span className="font-semibold">Filename:</span> {result.pdf_filename || result.filename}</p>
                <p><span className="font-semibold">File ID:</span> {result.file_id}</p>
                <a
                  href={result.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Download PDF →
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Test page for SEO Audit PDF workflow</p>
          <p className="mt-2">Webhook: https://n8n.goodbreeze.ai/webhook/seo-audit-pdf</p>
        </div>
      </div>
    </div>
  );
}
