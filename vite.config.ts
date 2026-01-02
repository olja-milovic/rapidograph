import { extname, relative, resolve } from "path";
import { defineConfig } from "vite";
import dtsPlugin from "vite-plugin-dts";
import { fileURLToPath } from "node:url";
import { glob } from "glob";

export default defineConfig({
  plugins: [
    dtsPlugin({
      include: ["lib"],
      exclude: [
        "lib/**/*.test.ts",
        "lib/shared/index.ts",
        "lib/utils/index.ts",
      ],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "lib/index.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      external: ["lit", /^lit\//, /^@lit\//],
      input: Object.fromEntries(
        [...glob.sync("lib/*.ts"), ...glob.sync("lib/components/**/*.ts")].map(
          (file) => [
            relative("lib", file.slice(0, file.length - extname(file).length)),
            fileURLToPath(new URL(file, import.meta.url)),
          ],
        ),
      ),

      output: {
        entryFileNames: "[name].js",
        preserveModules: true,
        preserveModulesRoot: "lib",
        hoistTransitiveImports: false,
      },
    },
    sourcemap: true,
  },
});
