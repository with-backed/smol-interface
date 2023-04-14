/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      colors: {
        fine: "#D4FF59",
        risky: "#FFCF53",
        rekt: "#FF679E",
        "fine-faint": "#F6FFDE",
        "risky-faint": "#FFF5DD",
        "rekt-faint": "#FFE0EC",
        grey: "#999999",
        "unclickable-grey": "#EEEEEE",
      },
    },
  },
  plugins: [],
};
