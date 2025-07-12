import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Official Cartier Foundation Colors
        white: "#FFFFFF",
        black: "#000000",
        cartier: {
          cream: "#F8F6F0",
          burgundy: "#801B2B",
          "burgundy-light": "#9D2B3A",
          "burgundy-dark": "#6B1724",
          "pearl-gray": "#F5F5F5",
        },
        
        // Semantic colors
        primary: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#801B2B", // Cartier Burgundy
          600: "#6B1724",
          700: "#5A1420",
          800: "#4A111B",
          900: "#3A0E16",
        },
        gray: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        serif: ["Georgia", "Times New Roman", "serif"],
        mono: ["SF Mono", "Monaco", "Cascadia Code", "monospace"],
      },
      fontSize: {
        'hero-cartier': ['clamp(48px, 8vw, 72px)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'headline-cartier': ['clamp(32px, 5vw, 48px)', { lineHeight: '1.2' }],
        'subhead-cartier': ['clamp(18px, 3vw, 24px)', { lineHeight: '1.3' }],
        'body-cartier': ['16px', { lineHeight: '1.6' }],
        'hero': ['clamp(48px, 8vw, 72px)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h1': ['clamp(36px, 6vw, 48px)', { lineHeight: '1.2' }],
        'h2': ['clamp(28px, 4vw, 36px)', { lineHeight: '1.3' }],
        'h3': ['clamp(20px, 3vw, 24px)', { lineHeight: '1.4' }],
        'body-large': ['18px', { lineHeight: '1.6' }],
        'body': ['16px', { lineHeight: '1.6' }],
        'small': ['14px', { lineHeight: '1.5' }],
        'caption': ['12px', { lineHeight: '1.4', letterSpacing: '0.05em' }],
      },
      spacing: {
        // 8px base unit system
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "7": "28px",
        "8": "32px",
        "9": "36px",
        "10": "40px",
        "12": "48px",
        "16": "64px",
        "20": "80px",
        "24": "96px",
        "32": "128px",
        "40": "160px",
        "48": "192px",
        "56": "224px",
        "64": "256px",
      },
      borderRadius: {
        "sm": "4px",
        "md": "6px",
        "lg": "8px",
        "xl": "12px",
        "2xl": "16px",
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'strong': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config; 