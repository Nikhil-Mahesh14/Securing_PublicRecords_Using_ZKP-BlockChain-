export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#111827",
        graphite: "#374151",
        mint: "#00A884",
        coral: "#F9735B",
        violet: "#7C3AED"
      },
      boxShadow: {
        glass: "0 24px 70px rgba(17, 24, 39, 0.14)"
      }
    }
  },
  plugins: []
};

