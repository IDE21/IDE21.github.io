// Builds the static site into dist/: compiled JS, compiled Tailwind CSS, HTML and public files.
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");

await build({
  entryPoints: ["src/app.jsx"],
  bundle: true,
  minify: true,
  outfile: "dist/app.js",
  jsx: "transform",
  define: { "process.env.NODE_ENV": '"production"' },
  target: ["es2019"],
  logLevel: "info",
});

execFileSync("npx", ["@tailwindcss/cli", "-i", "src/input.css", "-o", "dist/styles.css", "--minify"], { stdio: "inherit" });

cpSync("src/index.html", "dist/index.html");
cpSync("public", "dist", { recursive: true });
console.log("Built dist/");
