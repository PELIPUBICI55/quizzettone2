import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // IMPORTANTE: tsconfig.server.json compila già in "dist" (dist/server/...).
    // Se Vite buildasse anche lui in "dist" con emptyOutDir svuoterebbe
    // la build del server. Per questo il client va in dist/client.
    outDir: "dist/client",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/socket.io": {
        target: "http://localhost:3001",
        ws: true,
      },
    },
  },
});
