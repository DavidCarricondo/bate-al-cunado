// Copia los ficheros del juego a www/ (lo que se publica en GitHub Pages y se empaqueta en la app).
// Uso: node scripts/build-web.mjs   (VERSION=<id> para versionar la caché del service worker)
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const OUT = "www";
const FILES = ["index.html", "manifest.webmanifest", "sw.js", "data", "images", "icons"];
const version = process.env.VERSION || String(Date.now());

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);
for (const f of FILES) cpSync(f, `${OUT}/${f}`, { recursive: true });
writeFileSync(`${OUT}/sw.js`, readFileSync(`${OUT}/sw.js`, "utf8").replaceAll("__VERSION__", version));
console.log(`www/ listo (versión ${version})`);
