#!/usr/bin/env node
/**
 * Usage:  node split-monorepo.js monorepo-sketch.txt ./output
 *
 * Scans for markers like:
 *   /*────────────────────── src/App.tsx ───────────────────────*\/
 * Writes everything that follows into that filename until the next marker.
 */
import fs from "fs";
import fse from "fs-extra";
import path from "path";

const [ , , sketchPath, outDir = "./generated" ] = process.argv;
if (!sketchPath) {
  console.error("Pass the sketch file path (and optional output dir).");
  process.exit(1);
}

const marker = /^\/\*─+\s+(.+?)\s+─+\*\/$/;
const lines  = fs.readFileSync(sketchPath, "utf8").split(/\r?\n/);

let currentFile = null;
let buffer      = [];

function flush() {
  if (!currentFile) return;
  const target = path.join(outDir, currentFile);
  fse.ensureDirSync(path.dirname(target));
  fs.writeFileSync(target, buffer.join("\n"));
  console.log("✓", target);
  buffer = [];
}

for (const ln of lines) {
  const m = ln.match(marker);
  if (m) {
    flush();
    currentFile = m[1].trim();
  } else {
    buffer.push(ln);
  }
}
flush();
console.log("✅  Done.");
