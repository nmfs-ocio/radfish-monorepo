import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Get the cache directory path for compiled theme files
 * Uses node_modules/.cache/radfish-theme/<themeName>/ to keep project clean
 */
export function getCacheDir(themeName) {
  return path.join(process.cwd(), "node_modules", ".cache", "radfish-theme", themeName);
}

/**
 * Copy directory recursively
 */
export function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Get content type for file extension
 */
export function getContentType(ext) {
  const types = {
    ".png": "image/png",
    ".ico": "image/x-icon",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
  };
  return types[ext] || "application/octet-stream";
}

/**
 * Generate manifest icon array for PWA manifest
 * Uses generic filenames so developers can simply replace files in themes/<theme>/assets/
 */
export function getManifestIcons() {
  return [
    {
      src: "icons/favicon.ico",
      sizes: "64x64 32x32 24x24 16x16",
      type: "image/x-icon",
    },
    {
      src: "icons/icon-512.png",
      type: "image/png",
      sizes: "512x512",
      purpose: "any",
    },
    {
      src: "icons/icon-512.png",
      type: "image/png",
      sizes: "512x512",
      purpose: "maskable",
    },
  ];
}

/**
 * Compute MD5 hash of a file's content
 */
export function computeFileHash(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  return crypto.createHash("md5").update(content).digest("hex");
}
