import vinext from 'vinext';
import { defineConfig } from 'vite';

export default defineConfig({
  // This repository is served from /personal-website/ on GitHub Pages.
  base: process.env.GITHUB_ACTIONS ? '/personal-website/' : '/',
  plugins: [vinext()],
});
