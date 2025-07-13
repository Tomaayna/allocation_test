/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: [
    require("@tailwindcss/postcss"), // v4 用プラグイン
    require("autoprefixer"),         // v4 では省略可（Tailwind 内部で自動）
  ],
};