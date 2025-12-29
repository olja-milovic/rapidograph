import { extname, relative, resolve } from "path";
import { defineConfig } from "vite";
import dtsPlugin from "vite-plugin-dts";
import { fileURLToPath } from "node:url";
import { glob } from "glob";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import path from "node:path";

export default defineConfig({
  plugins: [
    libInjectCss(),
    dtsPlugin({ include: ["lib"], exclude: ["lib/**/*.test.ts"] }),
  ],
  resolve: {
    alias: {
      "@helpers": path.resolve(__dirname, "lib/helpers"),
      "@utils": path.resolve(__dirname, "lib/utils"),
      "@types": path.resolve(__dirname, "lib/types"),
      "@components": path.resolve(__dirname, "lib/components"),
    },
  },
  build: {
    cssCodeSplit: true,
    lib: {
      entry: resolve(__dirname, "lib/index.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      external: ["lit", "lit/decorators.js", "lit/directives/*"],
      input: Object.fromEntries(
        glob
          .sync("lib/**/*.ts", { ignore: ["lib/**/*.test.ts"] })
          .map((file) => [
            relative("lib", file.slice(0, file.length - extname(file).length)),
            fileURLToPath(new URL(file, import.meta.url)),
          ]),
      ),

      output: {
        assetFileNames: "assets/[name][extname]",
        entryFileNames: "[name].js",
      },
    },
    sourcemap: true,
  },
});
