import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true, // ✅ Listen on 0.0.0.0
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // ✅ Cần cho Docker volume watching
    },
    hmr: {
      // ✅ Hot Module Replacement cho Docker
      clientPort: 5173,
    },
  },

  preview: {
    host: true,
    port: 5173,
  },
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
