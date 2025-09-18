/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#E6F1F3",
          100: "#CCE3E7",
          200: "#99C7CF",
          300: "#66ABB7",
          400: "#338FA0",
          500: "#036074",
          600: "#033C4A", // azul-petróleo da logo (principal)
          700: "#022F3A",
          800: "#012229",
          900: "#001518",
        },
        ink: "#0f172a",
        "muted-ink": "#64748b",
        surface: "#ffffff",
      },
      boxShadow: { soft: "0 6px 24px rgba(2,6,23,.06)" },
      borderRadius: { xl2: "1rem" },
    },
  },
  plugins: [],
};
