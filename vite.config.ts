import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  server: {
    port: 3001,
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      name: "handwriting-board",
      fileName: (format) => `handwriting-board.${format}.js`,
    },
  },
});
