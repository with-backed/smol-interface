/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      colors: {
        fine: "#D4FF59",
        risky: "#FFCF53",
        yikes: "#FF679E",
        black: "#000000",
        "fine-faint": "#F6FFDE",
        "risky-faint": "#FFF5DD",
        "yikes-faint": "#FFE0EC",
        "black-faint": "#E2E2E2",
        "light-grey": "#F3F3F3",
        "medium-grey": "#E2e2e2",
        grey: "#999999",
        "completed-grey": "#404040",
        "liquidate-red": "#FF3131",
        "link-text": "#0000FF",
      },
    },
  },
  plugins: [],
};
