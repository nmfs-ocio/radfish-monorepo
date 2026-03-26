import fs from "fs";
import path from "path";
import { getCacheDir, copyDirSync, getManifestIcons } from "./utils.js";

/**
 * closeBundle hook - write manifest.json, copy assets and CSS to dist
 * @param {Object} ctx - Plugin context { config, resolvedViteConfig, themeDir, themeName }
 */
export function closeBundle(ctx) {
  const { config, resolvedViteConfig, themeDir, themeName } = ctx;

  if (!config || !resolvedViteConfig) return;

  // Only write manifest for build, not serve
  const outDir = resolvedViteConfig.build?.outDir || "dist";
  const outDirPath = path.resolve(resolvedViteConfig.root, outDir);
  const manifestPath = path.resolve(outDirPath, "manifest.json");

  // Ensure output directory exists
  if (!fs.existsSync(outDirPath)) {
    return; // Build hasn't created output dir yet
  }

  // Copy theme assets to dist/icons if using theme directory
  if (themeDir) {
    const themeAssetsDir = path.join(themeDir, "assets");
    const distIconsDir = path.join(outDirPath, "icons");
    if (fs.existsSync(themeAssetsDir)) {
      copyDirSync(themeAssetsDir, distIconsDir);
      console.log("[radfish-theme] Copied theme assets to:", distIconsDir);
    }

    // Copy pre-compiled CSS files to dist/radfish-theme/
    const cacheDir = getCacheDir(themeName);
    const distThemeDir = path.join(outDirPath, "radfish-theme");
    if (fs.existsSync(cacheDir)) {
      if (!fs.existsSync(distThemeDir)) {
        fs.mkdirSync(distThemeDir, { recursive: true });
      }
      const cssFiles = ["uswds-precompiled.css", "theme.css"];
      for (const cssFile of cssFiles) {
        const srcPath = path.join(cacheDir, cssFile);
        const destPath = path.join(distThemeDir, cssFile);
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
        }
      }
      console.log("[radfish-theme] Copied CSS files to:", distThemeDir);
    }
  }

  const manifest = {
    short_name: config.shortName,
    name: config.name,
    description: config.description,
    icons: getManifestIcons(),
    start_url: ".",
    display: "standalone",
    theme_color: config.pwa.themeColor,
    background_color: config.pwa.backgroundColor,
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log("[radfish-theme] Wrote manifest.json to", manifestPath);
}
