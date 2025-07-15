module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',          // ← 特に使わないが残しておいてよい
  theme: {
    extend: {
      colors: {
        fg:     'var(--fg)',
        bg:     'var(--bg)',
        accent: 'var(--accent)',
      },
    },
  },
  plugins: [],
};
