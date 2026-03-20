import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ← Set VITE_API_URL in frontend/.env for production
// During dev, requests to /api/* are proxied to the backend
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3001", // ← Dev backend URL
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
