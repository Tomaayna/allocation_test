/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",      // ← React/TS ファイルを必ず含める
  ],
  theme: { extend: {} },
  plugins: [],
};
