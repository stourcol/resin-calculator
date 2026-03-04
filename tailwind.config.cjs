module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-color)',
        card: 'var(--card-bg)',
        primary: {
          DEFAULT: '#0071e3',
          dark: '#2997ff',
        }
      },
      borderRadius: {
        'apple': '20px',
      }
    },
  },
  plugins: [],
}
