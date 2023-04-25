/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      colors: {
        fine: "#D4FF59",
        risky: "#FFCF53",
        yikes: "#FF679E",
        "fine-faint": "#F6FFDE",
        "risky-faint": "#FFF5DD",
        "yikes-faint": "#FFE0EC",
        "light-grey": "#F8F8F8",
        "medium-grey": "#E2e2e2",
        grey: "#999999",
        "unclickable-grey": "#EEEEEE",
        "completed-grey": "#404040",
        "liquidate-red": "#FF3131",
        "link-text": "#0000FF",
      },
    },
  },
  plugins: [],
};
