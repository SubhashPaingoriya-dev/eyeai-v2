/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        brand: {
          cyan:   "#06b6d4",
          violet: "#8b5cf6",
          green:  "#10b981",
          amber:  "#f59e0b",
          rose:   "#f43f5e",
          blue:   "#3b82f6",
          orange: "#f97316",
        },
        surface: {
          0: "#070a0f",
          1: "#0d1117",
          2: "#111827",
          3: "#1a2332",
          4: "#1e2d3d",
          5: "#243447",
        },
      },
      backgroundImage: {
        "grid-dark": "linear-gradient(rgba(6,182,212,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.03) 1px,transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      backgroundSize: {
        "grid-60": "60px 60px",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "scan": "scan 2s ease-in-out infinite",
        "shimmer": "shimmer 1.5s infinite",
        "blink": "blink 1.5s ease-in-out infinite",
        "count-up": "count-up 1s ease-out forwards",
        "slide-up": "slide-up 0.4s ease-out forwards",
        "fade-in": "fade-in 0.3s ease-out forwards",
      },
      keyframes: {
        "pulse-glow": {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(6,182,212,0.3)" },
          "50%": { boxShadow: "0 0 0 12px rgba(6,182,212,0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        scan: {
          "0%": { top: "0%", opacity: 0 },
          "10%": { opacity: 1 },
          "90%": { opacity: 1 },
          "100%": { top: "100%", opacity: 0 },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        blink: {
          "0%,100%": { opacity: 1 },
          "50%": { opacity: 0.2 },
        },
        "slide-up": {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [],
};
