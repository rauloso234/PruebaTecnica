import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const path = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig({
  root: path("."),
  publicDir: false,
  resolve: {
    alias: [
      { find: /^next\/link$/, replacement: path("./link.tsx") },
      { find: "@", replacement: path("../../src") },
    ],
  },
  esbuild: { jsx: "automatic" },
  server: {
    host: "127.0.0.1",
    strictPort: true,
    fs: { allow: [path("."), path("../fixtures"), path("../../src"), path("../../node_modules")] },
  },
});
