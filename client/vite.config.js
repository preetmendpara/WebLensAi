import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    port: 5173,
    // Backend lives on PORT from server/.env. Proxy keeps the client
    // origin-clean so no CORS handling is needed in dev.
    proxy: { "/api": { target: "http://localhost:5174", changeOrigin: true } },
  },
});
