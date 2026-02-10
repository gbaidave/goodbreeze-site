import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors based on logo
        primary: {
          DEFAULT: "#00adb5", // Teal
          light: "#00e5ff",   // Bright teal
          dark: "#008a91",    // Darker teal
        },
        accent: {
          purple: "#a855f7",  // Electric purple
          blue: "#3b82f6",    // Electric blue
        },
        dark: {
          DEFAULT: "#0a0a0a",
          800: "#1a1a1a",
          700: "#2a2a2a",
        },
        gray: {
          700: "#71717a",
          500: "#a1a1aa",
          300: "#d4d4d8",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-hero": "linear-gradient(135deg, #00adb5 0%, #3b82f6 50%, #a855f7 100%)",
        "gradient-accent": "linear-gradient(90deg, #00adb5 0%, #00e5ff 100%)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display": ["72px", { lineHeight: "1.1", fontWeight: "700" }],
        "h1": ["56px", { lineHeight: "1.2", fontWeight: "700" }],
        "h2": ["40px", { lineHeight: "1.3", fontWeight: "600" }],
        "h3": ["32px", { lineHeight: "1.4", fontWeight: "500" }],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
