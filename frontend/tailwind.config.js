/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        leaf: { 50: "#f0faf0", 100: "#dcf5dc", 200: "#b8ebb8", 300: "#82d882", 400: "#4bbf4b", 500: "#2e9e2e", 600: "#1f7a1f", 700: "#175c17", 800: "#114411", 900: "#0b2e0b" },
        soil: { 50: "#fdf8f0", 100: "#faecd8", 200: "#f4d4a8", 300: "#eab86e", 400: "#de9b3f", 500: "#c97f20", 600: "#a86018", 700: "#874814", 800: "#6b3813", 900: "#572e12" },
        cream: "#faf9f5",
        bark: "#2c1a0e",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        float: "float 3s ease-in-out infinite",
        wiggle: "wiggle 0.3s ease",
      },
      keyframes: {
        fadeUp: { "0%": { opacity: 0, transform: "translateY(24px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        wiggle: { "0%,100%": { transform: "rotate(0)" }, "25%": { transform: "rotate(-5deg)" }, "75%": { transform: "rotate(5deg)" } },
      },
    },
  },
  plugins: [],
};
