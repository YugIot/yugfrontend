/** @type {import('tailwindcss').Config} */
// tailwind.config.js

module.exports = {
  // ...
  theme: {
    extend: {
      colors: {
        primary: '#3490dc', // Customize this color
        // Add more custom colors here
      },
      fontFamily: {
        sans: ['Helvetica', 'Arial', 'sans'],
        // Add custom fonts here
      },
    },
  },  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  // ...
};
