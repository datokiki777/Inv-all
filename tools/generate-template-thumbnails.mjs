#!/usr/bin/env node
/**
 * Regenerates src/assets/template-thumbnails/*.png (small + `-large` enlarged versions) from the REAL PDF
 * template components (rendered with a neutral sample invoice).
 *
 * RUN THIS whenever a template's look changes — the thumbnails are static
 * images, so they go stale otherwise:
 *     node tools/generate-template-thumbnails.mjs
 *
 * Needs: npm deps installed (esbuild comes with Vite), `pdftoppm`
 * (poppler-utils) and ImageMagick's `convert` on PATH.
 */
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "src/assets/template-thumbnails");
const work = fs.mkdtempSync(path.join(os.tmpdir(), "thumbs-"));
const THUMB_WIDTH = 360; // px — crisp at ~100-180 CSS px on 2-3x phone screens
const LARGE_WIDTH = 1100; // px — the enlarged view fills a ~400 CSS px dialog, i.e. ~1100 device px on a 2.75x phone

// Vite resolves `foo.ttf?url` to a hashed URL; plain Node can't. In this
// Node run the "URL" is just the absolute file path, which react-pdf's
// Font.register accepts directly.
const viteUrlImports = {
  name: "vite-url-imports",
  setup(b) {
    b.onResolve({ filter: /\?url$/ }, (args) => ({
      path: path.resolve(args.resolveDir, args.path.replace(/\?url$/, "")), namespace: "asset-url"
    }));
    b.onLoad({ filter: /.*/, namespace: "asset-url" }, (args) => ({
      contents: `export default ${JSON.stringify(args.path)};`, loader: "js"
    }));
  }
};

const bundleFile = path.join(work, "bundle.mjs");
await build({
  entryPoints: [path.join(root, "tools/thumbnailSample.tsx")],
  outfile: bundleFile, bundle: true, platform: "node", format: "esm",
  tsconfig: path.join(root, "tsconfig.json"),
  external: ["react", "react/jsx-runtime", "@react-pdf/renderer"],
  plugins: [viteUrlImports], logLevel: "error",
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" }
});

// The bundle lives in a temp dir, so bare imports must resolve from the repo.
fs.symlinkSync(path.join(root, "node_modules"), path.join(work, "node_modules"));
const { renderAllSamplePdfs } = await import(pathToFileURL(bundleFile).href);
const ids = await renderAllSamplePdfs(work);

fs.mkdirSync(outDir, { recursive: true });
for (const id of ids) {
  const base = path.join(work, id);
  for (const [suffix, width] of [["", THUMB_WIDTH], ["-large", LARGE_WIDTH]]) {
    const raster = `${base}${suffix}`;
    execFileSync("pdftoppm", ["-png", "-singlefile", "-f", "1", "-l", "1", "-scale-to-x", String(width), "-scale-to-y", "-1", `${base}.pdf`, raster]);
    // Quantize: text-on-white compresses to a fraction of the size with no visible loss at this scale.
    const target = path.join(outDir, `${id}${suffix}.png`);
    execFileSync("convert", [`${raster}.png`, "-strip", "-dither", "None", "-colors", "256", `PNG8:${target}`]);
    console.log(`${id}${suffix}.png  ${(fs.statSync(target).size / 1024).toFixed(1)} KB`);
  }
}
fs.rmSync(work, { recursive: true, force: true });
console.log(`Done — ${ids.length} thumbnails in ${path.relative(root, outDir)}`);
