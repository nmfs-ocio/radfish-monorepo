import fs from "fs";
import path from "path";
import { getCacheDir, getContentType, getManifestIcons } from "./utils.js";
import { loadThemeFiles } from "./scss.js";
import { precompileUswds, precompileThemeScss } from "./compile.js";

/**
 * Configure dev server middleware and SCSS watcher
 * @param {Object} server - Vite dev server instance
 * @param {Object} ctx - Plugin context { config, themeDir, themeName }
 */
export function configureServer(server, ctx) {
  const { config, themeDir, themeName } = ctx;

  // Serve manifest.json in dev mode
  server.middlewares.use("/manifest.json", (_req, res) => {
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
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(manifest, null, 2));
  });

  // Serve theme assets if theme directory exists
  if (!themeDir) return;

  const cacheDir = getCacheDir(themeName);

  // Serve pre-compiled CSS files at /radfish-theme/*
  server.middlewares.use("/radfish-theme", (req, res, next) => {
    const fileName = req.url?.replace(/^\//, "") || "";
    const filePath = path.resolve(cacheDir, fileName);

    // Prevent path traversal attacks
    if (!filePath.startsWith(cacheDir)) {
      return next();
    }

    if (fs.existsSync(filePath) && filePath.endsWith(".css")) {
      res.setHeader("Content-Type", "text/css");
      fs.createReadStream(filePath).pipe(res);
    } else {
      next();
    }
  });

  // Watch theme SCSS files for changes and recompile
  const uswdsConfigPath = path.join(themeDir, "styles", "uswds-config.scss");
  const themePath = path.join(themeDir, "styles", "theme.scss");
  const filesToWatch = [];

  // Add both files to watcher (whichever exist)
  if (fs.existsSync(uswdsConfigPath)) {
    server.watcher.add(uswdsConfigPath);
    filesToWatch.push(uswdsConfigPath);
  }
  if (fs.existsSync(themePath)) {
    server.watcher.add(themePath);
    filesToWatch.push(themePath);
  }

  server.watcher.on("change", (changedPath) => {
    if (filesToWatch.includes(changedPath)) {
      // Theme file(s) changed - recompile everything and restart
      const fileName = path.basename(changedPath);
      console.log(`[radfish-theme] ${fileName} changed, recompiling...`);
      const { uswdsTokens, isUswdsConfig } = loadThemeFiles(themeDir);
      precompileUswds(themeDir, themeName, uswdsTokens, isUswdsConfig);
      precompileThemeScss(themeDir, themeName);
      console.log("[radfish-theme] Restarting server...");
      server.restart();
    }
  });

  const themeAssetsDir = path.join(themeDir, "assets");
  if (!fs.existsSync(themeAssetsDir)) return;

  // Serve /icons/* from themes/<themeName>/assets/ directory
  server.middlewares.use("/icons", (req, res, next) => {
    const filePath = path.resolve(themeAssetsDir, req.url?.replace(/^\//, "") || "");

    // Prevent path traversal attacks
    if (!filePath.startsWith(themeAssetsDir)) {
      return next();
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.setHeader(
        "Content-Type",
        getContentType(path.extname(filePath)),
      );
      fs.createReadStream(filePath).pipe(res);
    } else {
      next();
    }
  });

  console.log("[radfish-theme] Serving assets from:", themeAssetsDir);
}
