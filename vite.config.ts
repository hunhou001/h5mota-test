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
          name: "release",
          filename: "release/index.html",
          entry: "/src/pages/release/main.tsx",
          data: {
            title: "H5测试区 - 发布",
          },
        },
        {
          name: "route",
          filename: "route/index.html",
          entry: "/src/pages/route/main.tsx",
          data: {
            title: "H5测试区 - 录像检测日志",
          },
        },
        {
          name: "applytower",
          filename: "applytower/index.html",
          entry: "/src/pages/applytower/main.tsx",
          data: {
            title: "H5测试区 - 发塔",
          },
        },
        {
          name: "info",
          filename: "info/index.html",
          entry: "/src/pages/info/main.tsx",
          data: {
            title: "H5测试区 - 修改信息",
          },
        },
        {
          name: "up2cos",
          filename: "up2cos/index.html",
          entry: "/src/pages/up2cos/main.tsx",
          data: {
            title: "H5测试区 - 自助更新",
          },
        },
        {
          name: "tower",
          filename: "tower/index.html",
          entry: "/src/pages/tower/main.tsx",
          data: {
            title: "H5测试区 - 详情",
          },
        },
        {
          name: "index",
          filename: "index.html",
          entry: "/src/pages/index/main.tsx",
          data: {
            title: "H5测试区 - 主页",
          },
        },
        {
          name: "admin",
          filename: "admin/index.html",
          entry: "/src/pages/admin/main.tsx",
          data: {
            title: "H5测试区 - 管理",
          },
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
    // 本地 dev：避免 confirm 等长请求在 Vite→test.mota.press 代理层先 504（需重启 dev）
    proxy: {
      "/api": {
        target: process.env.H5TEST_BACKEND_ORIGIN || "https://test.mota.press",
        changeOrigin: true,
        timeout: 600_000,
        proxyTimeout: 600_000,
      },
    },
  },

  build: {
    outDir: "dist",
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
