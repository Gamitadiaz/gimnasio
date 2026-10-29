import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// La app vive en https://gamitadiaz.github.io/gimnasio/, por eso todo cuelga de /gimnasio/.
export default defineConfig({
  base: "/gimnasio/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icono.svg"],
      manifest: {
        name: "Gimnasio",
        short_name: "Gimnasio",
        description: "Mi registro de cardio, fuerza y flexibilidad",
        lang: "es-MX",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/gimnasio/",
        scope: "/gimnasio/",
        icons: [
          { src: "icono-192.png", sizes: "192x192", type: "image/png" },
          { src: "icono-512.png", sizes: "512x512", type: "image/png" },
          { src: "icono-mask.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      // Guarda toda la app en el celular para que abra sin internet.
      workbox: { globPatterns: ["**/*.{js,css,html,svg,png,woff2}"] },
    }),
  ],
});
