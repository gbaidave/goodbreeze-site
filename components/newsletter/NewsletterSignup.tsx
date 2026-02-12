"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setFormStatus('success');
        setFormData({ name: '', email: '' });
      } else {
        setFormStatus('error');
        setErrorMessage(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      setFormStatus('error');
      setErrorMessage('Network error. Please try again later.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-2xl border border-primary/30 p-12 text-center">
      <h2 className="text-3xl font-bold text-white mb-4">Get Notified When We Publish New Resources</h2>
      <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
        Join our mailing list to receive guides, templates, and automation tips straight to your inbox.
      </p>

      {formStatus === 'success' ? (
        <div className="max-w-md mx-auto text-center p-6 bg-primary/10 border border-primary/30 rounded-lg">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-white mb-2">You're subscribed!</h3>
          <p className="text-gray-300">
            Thank you for joining our newsletter. You'll receive valuable automation tips, guides, and exclusive insights to help you scale your business efficiently.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="flex-1 px-4 py-3 rounded-lg bg-dark border border-primary/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
              required
              disabled={formStatus === 'loading'}
            />
            <input
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="flex-1 px-4 py-3 rounded-lg bg-dark border border-primary/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
              required
              disabled={formStatus === 'loading'}
            />
          </div>
          {formStatus === 'error' && (
            <p className="text-red-400 text-sm text-center">{errorMessage}</p>
          )}
          <button
            type="submit"
            disabled={formStatus === 'loading'}
            className="w-full px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formStatus === 'loading' ? 'Subscribing...' : 'Subscribe to Newsletter'}
          </button>
        </form>
      )}
    </div>
  );
}
