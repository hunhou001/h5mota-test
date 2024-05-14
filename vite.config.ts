import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { createMpaPlugin } from "vite-plugin-virtual-mpa";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    createMpaPlugin({
      pages: [
        {
          name: "applytower",
          filename: "applytower/index.html",
          entry: "/workbench/applytower/main.tsx",
          template: "workbench/applytower/index.html",
        },
        {
          name: "info",
          filename: "info/index.html",
          entry: "/workbench/info/main.tsx",
          template: "workbench/info/index.html",
        },
        {
          name: "tower",
          filename: "tower/index.html",
          entry: "/workbench/tower/main.tsx",
          template: "workbench/tower/index.html",
        },
        {
          name: "index",
          filename: "index.html",
          entry: "/workbench/main.tsx",
          template: "workbench/index.html",
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  css: {
    modules: {
      localsConvention: "camelCase",
    },
  },

  server: {
    proxy: {
      "/api": "https://test.mota.press",
    },
  },

  build: {
    outDir: "client",
    // rollupOptions: {
    //   input: {
    //     main: path.resolve(__dirname, "index.html"),
    //     info: path.resolve(__dirname, "workbench/info/index.html"),
    //     tower: path.resolve(__dirname, "workbench/tower/index.html"),
    //     applytower: path.resolve(__dirname, "workbench/applytower/index.html"),
    //   },
    // },
  },
});
