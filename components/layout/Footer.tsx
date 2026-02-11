import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-gray-800 py-12 px-6 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">Good Breeze AI</h3>
            <p className="text-gray-400 text-sm">
              AI Operations That Scale Your Business
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Tools</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/tools/sales-analyzer" className="hover:text-primary transition-colors">
                  Sales Analyzer
                </Link>
              </li>
              <li>
                <span className="text-gray-600">SEO Audit (Coming Soon)</span>
              </li>
              <li>
                <span className="text-gray-600">Website Audit (Coming Soon)</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="https://www.linkedin.com/in/davesilverstein/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
          <p className="mb-3">&copy; {new Date().getFullYear()} Good Breeze AI LLC. All rights reserved.</p>
          <div className="flex justify-center gap-6">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-use" className="hover:text-primary transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
