import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF385C",
          foreground: "#FFFFFF",
        },
        dark: "#1A1A2E",
        background: "#FFFFFF",
        surface: "#F7F7F7",
        foreground: "#222222",
        "text-primary": "#222222",
        "text-secondary": "#717171",
        success: "#008A05",
        warning: "#E07912",
        error: "#C13515",
        border: "#DDDDDD",
        input: "#DDDDDD",
        ring: "#FF385C",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#222222",
        },
        muted: {
          DEFAULT: "#F7F7F7",
          foreground: "#717171",
        },
        accent: {
          DEFAULT: "#F7F7F7",
          foreground: "#222222",
        },
        destructive: {
          DEFAULT: "#C13515",
          foreground: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
