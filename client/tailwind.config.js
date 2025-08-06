/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        desktop: "1024px",
      },
      fontFamily: {
        mono: [
          "Monaco",
          "Menlo",
          "Ubuntu Mono",
          "Consolas",
          "source-code-pro",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
