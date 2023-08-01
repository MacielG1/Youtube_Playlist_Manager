/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      screens: {
        xs: "500px",
        lg: "1124px",
        "3xl": "1650px",
      },
    },
    // colors: {
    //   background: "rgb(var(--color-background) / <alpha-value>)",
    //   foreground: "rgb(var(--color-foreground) / <alpha-value>)",
    // },
  },
  darkMode: "class",
  plugins: [],
};
