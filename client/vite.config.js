import { defineConfig, loadEnv } from "vite";

import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load environment variables based on the mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      host: true,
      port: 3000,
      strictPort: true,
      proxy: {
        "/api": {
          target: env.VITE_BACKEND_URL ?? "http://localhost:5000/api",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    plugins: [
      react(),
      VitePWA({
        devOptions: {
          enabled: false,
        },
        manifest: {
          theme_color: "#fff",
          background_color: "#fff",
          display: "fullscreen",
          scope: "/",
          start_url: "/",
          name: "ChatGPT",
          short_name: "ChatGPT",
          description: "ChatGPT OpenAI",
          icons: [
            {
              src: "/manifest/icon-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/manifest/icon-256x256.png",
              sizes: "256x256",
              type: "image/png",
            },
            {
              src: "/manifest/icon-384x384.png",
              sizes: "384x384",
              type: "image/png",
            },
            {
              src: "/manifest/icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
    ],
  };
});
