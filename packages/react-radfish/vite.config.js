import path from "path";
import { defineConfig, loadEnv } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "index.js"),
      name: "@nmfs-ocio/react-radfish",
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "@nmfs-ocio/radfish"],
      output: {
        globals: {
          react: "React",
        },
      },
    },
  },
  plugins: [react(), cssInjectedByJsPlugin()],
  test: {
    environment: "jsdom",
    include: ["**/*.spec.{js,jsx}"],
    globals: true,
  },
});
