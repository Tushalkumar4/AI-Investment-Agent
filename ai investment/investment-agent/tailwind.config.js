/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B0E14",
          soft: "#11151F",
          line: "#1D2330",
        },
        paper: "#EDEFF3",
        signal: {
          invest: "#00D9A3",
          pass: "#FF5C5C",
          watch: "#F5A623",
        },
        dim: "#6B7280",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(180deg, rgba(237,239,243,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(237,239,243,0.06) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
