import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Partners | Good Breeze AI",
  description: "Meet the trusted partners who help us deliver world class automation and marketing solutions to our clients.",
};

const partners = [
  {
    name: "Capricorn PMS",
    category: "Automation Partner",
    description: "Capricorn PMS specializes in property management solutions and workflow automation. Their expertise in complex system integrations helps us deliver robust automation solutions to clients with unique operational needs.",
    website: "https://capricornpms.com/",
    services: ["Property Management Systems", "Workflow Automation", "System Integration"]
  },
  {
    name: "Silvernail Web Design",
    category: "Marketing Partner",
    description: "Silvernail Web Design brings decades of experience in web design, SEO, and digital marketing. Their strategic approach to online presence complements our automation services perfectly, helping clients grow and scale their digital footprint.",
    website: "https://silvernailwebdesign.com/",
    services: ["Web Design", "SEO Services", "Digital Marketing"]
  },
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-primary transition-colors">
            Home
          </Link>
          <span className="text-gray-600 mx-2">/</span>
          <span className="text-gray-300">Partners</span>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-[#00adb5] to-[#3b82f6] bg-clip-text text-transparent">
            Our Trusted Partners
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We collaborate with industry leading experts to deliver comprehensive solutions that go beyond automation. Meet the partners who help us serve our clients better.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="bg-dark-700 rounded-2xl border border-primary/20 p-8 hover:border-primary/50 transition-all duration-300 flex flex-col"
            >
              {/* Header with logo on right */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="mb-3">
                    <span className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-xs text-primary font-semibold">
                      {partner.category}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{partner.name}</h3>
                </div>

                {/* Logo placeholder - styled text for now */}
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary/20 to-accent-blue/20 border-2 border-primary/30 flex items-center justify-center flex-shrink-0 ml-4">
                  <span className="text-2xl font-bold text-primary">
                    {partner.name.split(' ').map(word => word[0]).join('')}
                  </span>
                </div>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed flex-grow">
                {partner.description}
              </p>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Services:</h4>
                <ul className="space-y-1">
                  {partner.services.map((service, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-300">
                      <span className="text-primary mr-2">•</span>
                      <span>{service}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105 text-center mt-auto"
              >
                Visit {partner.name} →
              </a>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-dark-700 rounded-2xl border border-primary/20 p-12">
          <h2 className="text-3xl font-bold mb-4">Interested in Partnering With Us?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            We're always looking to collaborate with experts who share our commitment to delivering real value to SMBs. If you think we'd be a good fit, let's talk.
          </p>
          <a
            href="mailto:contact@goodbreeze.ai"
            className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105"
          >
            contact@goodbreeze.ai
          </a>
        </div>
      </div>
    </div>
  );
}
