import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://goodbreeze.ai"),
  title: {
    default: "Good Breeze AI | AI Automation & Intelligence for Small Business",
    template: "%s | Good Breeze AI",
  },
  description:
    "Good Breeze AI helps small businesses and startups cut busywork, outmaneuver competitors, and grow faster with AI automation and free intelligence tools.",
  openGraph: {
    type: "website",
    siteName: "Good Breeze AI",
    title: "Good Breeze AI | AI Automation & Intelligence for Small Business",
    description:
      "Good Breeze AI helps small businesses and startups cut busywork, outmaneuver competitors, and grow faster with AI automation and free intelligence tools.",
    url: "https://goodbreeze.ai",
  },
  twitter: {
    card: "summary_large_image",
    site: "@goodbreezeai",
    title: "Good Breeze AI | AI Automation & Intelligence for Small Business",
    description:
      "Good Breeze AI helps small businesses and startups cut busywork, outmaneuver competitors, and grow faster with AI automation and free intelligence tools.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Good Breeze AI",
  url: "https://goodbreeze.ai",
  description:
    "AI automation and competitive intelligence services for small businesses and startups. We help business owners cut busywork, understand their market, and grow without hiring a bigger team.",
  serviceType: [
    "AI Automation",
    "Workflow Automation",
    "Competitive Intelligence",
    "SEO Consulting",
    "Process Optimization",
    "Content Automation",
  ],
  areaServed: "Worldwide",
  priceRange: "$$",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    url: "https://goodbreeze.ai/contact",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Good Breeze AI",
  url: "https://goodbreeze.ai",
  description:
    "AI automation and competitive intelligence for small businesses and startups.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://goodbreeze.ai/?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="schema-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script
          id="schema-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PVPFGHR8');`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-dark text-white`}
      >
        <AuthProvider>
          <Header />
          <main className="pt-16">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
