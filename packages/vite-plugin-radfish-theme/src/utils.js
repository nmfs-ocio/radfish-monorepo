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
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".eot": "application/vnd.ms-fontobject",
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
 * Build a connect-style middleware that serves files from a root directory.
 * Includes path-traversal protection and Content-Type detection.
 * Strips query strings from the request URL before resolving.
 */
export function createStaticAssetHandler(rootDir) {
  return (req, res, next) => {
    const url = (req.url || "").split("?")[0];
    const relative = url.replace(/^\//, "");
    const filePath = path.resolve(rootDir, relative);

    // Prevent path traversal attacks
    if (!filePath.startsWith(rootDir)) {
      return next();
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.setHeader("Content-Type", getContentType(path.extname(filePath)));
      fs.createReadStream(filePath).pipe(res);
    } else {
      next();
    }
  };
}

/**
 * Resolve USWDS dist directories relative to the consumer's project.
 * Returns { imgDir, fontsDir } — either may be null if not installed.
 */
export function getUswdsAssetDirs(cwd = process.cwd()) {
  const distDir = path.join(cwd, "node_modules/@uswds/uswds/dist");
  const imgDir = path.join(distDir, "img");
  const fontsDir = path.join(distDir, "fonts");
  return {
    imgDir: fs.existsSync(imgDir) ? imgDir : null,
    fontsDir: fs.existsSync(fontsDir) ? fontsDir : null,
  };
}

/**
 * Compute MD5 hash of a file's content
 */
export function computeFileHash(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  return crypto.createHash("md5").update(content).digest("hex");
}
