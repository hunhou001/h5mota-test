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
          entry: "/src/pages/applytower/main.tsx",
          data: {
            title: "H5测试区 - 发塔",
          }
        },
        {
          name: "info",
          filename: "info/index.html",
          entry: "/src/pages/info/main.tsx",
          data: {
            title: "H5测试区 - 修改信息",
          }
        },
        {
          name: "tower",
          filename: "tower/index.html",
          entry: "/src/pages/tower/main.tsx",
          data: {
            title: "H5测试区 - 详情",
          }
        },
        {
          name: "index",
          filename: "index.html",
          entry: "/src/pages/index/main.tsx",
          data: {
            title: "H5测试区 - 主页",
          }
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
