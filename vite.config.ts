import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
	if (mode === "demo")
		return {
			base: "engine",
			build: {
				outDir: "docs",
			},
		};

	return {
		build: {
			outDir: "dist",
			lib: {
				entry: resolve(__dirname, "src/index.ts"),
				name: "PolyomEngine",
				fileName: (fmt) => `polyom-engine.${fmt}.js`,
			},
		},
	};
});
