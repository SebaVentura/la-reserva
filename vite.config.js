// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // Import the plugin

export default defineConfig({
    base: "/la-reserva/", // 👈 igual al nombre EXACTO del repo

  plugins: [
    react(),
    tailwindcss(), // Add the plugin here
  ],
});