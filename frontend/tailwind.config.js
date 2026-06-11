/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'SF Pro Display'",
          "'SF Pro Text'",
          "'Helvetica Neue'",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        orange: {
          50: "rgba(249,115,22,0.06)",
          100: "rgba(249,115,22,0.12)",
          200: "rgba(249,115,22,0.2)",
          500: "#f97316",
          600: "#ea580c",
        },
        green: {
          50: "rgba(34,197,94,0.06)",
          100: "rgba(34,197,94,0.12)",
          200: "rgba(34,197,94,0.2)",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.35s ease-out",
        shimmer: "shimmer 2s infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0, transform: "translateY(6px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        slideUp: { "0%": { transform: "translateY(14px)", opacity: 0 }, "100%": { transform: "translateY(0)", opacity: 1 } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        pulseSoft: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.6 } },
      },
    },
  },
  plugins: [],
};