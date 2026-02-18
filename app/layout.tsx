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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
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
