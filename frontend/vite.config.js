import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:8000", changeOrigin: true },
      "/predict": { target: "http://localhost:8000", changeOrigin: true },
      "/history": { target: "http://localhost:8000", changeOrigin: true },
      "/diseases": { target: "http://localhost:8000", changeOrigin: true },
      "/report": { target: "http://localhost:8000", changeOrigin: true },
      "/health": { target: "http://localhost:8000", changeOrigin: true },
    },
  },
});
