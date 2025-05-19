// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default { 
  content: [
    "./src/**/*.{js,jsx,ts,tsx}" // chỉnh tùy theo cấu trúc project của bạn
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
