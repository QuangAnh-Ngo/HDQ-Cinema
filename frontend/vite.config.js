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
    
    allowedHosts: [
      'hdqcinema.io.vn',
      'www.hdqcinema.io.vn'
    ],
  },

  preview: {
    host: true,
    port: 4173,
    strictPort: true,
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
