export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-gray": "var(--brand-gray)",
        "brand-blue": "var(--brand-blue)",
        "brand-lightblue": "var(--brand-lightblue)",
        "brand-yellow": "var(--brand-yellow)",
      },
    },
  },
  plugins: [],
};
