export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Teal Palette - Monochromatic
        "teal": {
          "deep": "#004d4d",      // Deep teal - darkest
          "dark": "#006666",      // Dark teal
          "base": "#008080",      // Base teal
          "medium": "#00a3a3",    // Medium teal
          "light": "#4dd0d0",     // Light teal
          "pale": "#b2e6e6",      // Pale teal - lightest
          "50": "#e0f7f7",        // Very pale teal
          "100": "#b2e6e6",
          "200": "#80d4d4",
          "300": "#4dd0d0",
          "400": "#26c0c0",
          "500": "#00a3a3",
          "600": "#008080",
          "700": "#006666",
          "800": "#004d4d",
          "900": "#003333",
        },
        // Complementary Yellow - defined at root level for all utilities
        "yellow-accent": "#ffd700",     // Gold accent
        "yellow-warm": "#ffc107",       // Warm yellow
        "yellow-soft": "#fff9c4",        // Soft yellow
        "yellow-pale": "#fffde7",        // Pale yellow
        // Keep nested for backward compatibility
        "yellow": {
          "accent": "#ffd700",
          "warm": "#ffc107",
          "soft": "#fff9c4",
          "pale": "#fffde7",
        },
        // Complementary Blue
        "blue": {
          "teal": "#0087a8",        // Blue-teal blend
          "ocean": "#006994",       // Ocean blue
          "sky": "#4fc3f7",         // Sky blue
          "pale": "#e1f5fe",        // Pale blue
        },
        // Legacy brand colors (keeping for compatibility)
        "brand-gray": "var(--brand-gray)",
        "brand-blue": "var(--brand-blue)",
        "brand-lightblue": "var(--brand-lightblue)",
        "brand-yellow": "var(--brand-yellow)",
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
        slideDown: "slideDown 0.3s ease-out",
        slideUp: "slideUp 0.5s ease-out",
        scaleIn: "scaleIn 0.3s ease-out",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        bounce: "bounce 1s infinite",
        spin: "spin 1s linear infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        slideInLeft: "slideInLeft 0.5s ease-out",
        slideInRight: "slideInRight 0.5s ease-out",
        fadeInUp: "fadeInUp 0.6s ease-out",
        fadeInDown: "fadeInDown 0.6s ease-out",
        scaleUp: "scaleUp 0.3s ease-out",
        shimmerCard: "shimmerCard 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(0, 128, 128, 0.5)" },
          "100%": { boxShadow: "0 0 20px rgba(0, 128, 128, 0.8), 0 0 30px rgba(0, 128, 128, 0.4)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleUp: {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmerCard: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      boxShadow: {
        "teal": "0 4px 14px 0 rgba(0, 128, 128, 0.15)",
        "teal-lg": "0 10px 25px -3px rgba(0, 128, 128, 0.2), 0 4px 6px -2px rgba(0, 128, 128, 0.1)",
        "teal-xl": "0 20px 25px -5px rgba(0, 128, 128, 0.2), 0 10px 10px -5px rgba(0, 128, 128, 0.1)",
        "glow-teal": "0 0 20px rgba(0, 128, 128, 0.4)",
        "glow-yellow": "0 0 20px rgba(255, 215, 0, 0.4)",
      },
    },
  },
  plugins: [],
};
