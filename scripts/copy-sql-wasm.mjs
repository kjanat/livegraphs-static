#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Source files from node_modules
const sqlJsPath = join(__dirname, "..", "node_modules", "sql.js", "dist");
const publicPath = join(__dirname, "..", "public", "sql-js");

// Create sql-js directory in public if it doesn't exist
if (!existsSync(publicPath)) {
  mkdirSync(publicPath, { recursive: true });
}

// Files to copy
const filesToCopy = ["sql-wasm.js", "sql-wasm.wasm"];

// Copy each file
filesToCopy.forEach((file) => {
  const source = join(sqlJsPath, file);
  const dest = join(publicPath, file);

  if (existsSync(source)) {
    copyFileSync(source, dest);
    console.log(`✓ Copied ${file} to public/sql-js/`);
  } else {
    console.error(`✗ File not found: ${source}`);
  }
});

console.log("SQL.js files copied successfully!");
