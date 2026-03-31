import fs from "fs";
import path from "path";

/**
 * Parse SCSS content string and extract variable definitions
 * Supports simple variable definitions like: $variable-name: #hex;
 * @param {string} content - SCSS content as a string
 * @returns {Object} Object mapping variable names (without $) to values
 */
export function parseScssContent(content) {
  const variables = {};

  // Match SCSS variable definitions: $variable-name: value;
  // Captures: variable name (without $) and value (without semicolon)
  const variableRegex = /^\s*\$([a-zA-Z_][\w-]*)\s*:\s*([^;]+);/gm;

  let match;
  while ((match = variableRegex.exec(content)) !== null) {
    const name = match[1].trim();
    let value = match[2].trim();

    // Remove !default flag if present
    value = value.replace(/\s*!default\s*$/, "").trim();

    // Convert kebab-case to camelCase for config compatibility
    const camelName = name.replace(/-([a-z])/g, (_, letter) =>
      letter.toUpperCase(),
    );
    variables[camelName] = value;
  }

  return variables;
}

/**
 * Parse SCSS file and extract variable definitions
 * Supports simple variable definitions like: $variable-name: #hex;
 * @param {string} filePath - Path to the SCSS file
 * @returns {Object} Object mapping variable names (without $) to values
 */
export function parseScssVariables(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, "utf-8");
  return parseScssContent(content);
}

/**
 * Normalize color value (strip quotes if present)
 */
export function normalizeColorValue(value) {
  return value.replace(/['"]/g, '');
}

/**
 * Check if a value is a USWDS system color token
 * Matches patterns like: blue-60v, gray-cool-30, red-warm-50v, green-cool-40v
 * See: https://designsystem.digital.gov/design-tokens/color/system-tokens/
 */
export function isUswdsToken(value) {
  // USWDS token pattern: color-family[-modifier]-grade[v]
  // Examples: blue-60v, gray-cool-30, red-warm-50v, mint-cool-40v
  const tokenPattern = /^(black|white|red|orange|gold|yellow|green|mint|cyan|blue|indigo|violet|magenta|gray)(-warm|-cool|-vivid)?(-[0-9]+v?)?$/;
  return tokenPattern.test(value);
}

/**
 * Format value for USWDS @use statement
 * - USWDS tokens: quoted ('blue-60v')
 * - Custom values (hex, etc.): unquoted (#0093D0)
 */
export function formatUswdsValue(value) {
  const normalized = normalizeColorValue(value);
  if (isUswdsToken(normalized)) {
    return `'${normalized}'`; // USWDS tokens are quoted
  }
  return normalized; // Custom values (hex, etc.) are unquoted
}

/**
 * Extract valid USWDS settings variable names from the installed @uswds/uswds package.
 * Reads the _settings-*.scss files in uswds-core and collects all $theme-* variable declarations.
 *
 * @param {string} [uswdsPackagesDir] - Path to @uswds/uswds/packages. Defaults to node_modules resolution.
 * @returns {Set<string>} Set of valid variable names in kebab-case (without $ prefix)
 */
export function getValidUswdsSettings(uswdsPackagesDir) {
  if (!uswdsPackagesDir) {
    uswdsPackagesDir = path.join(process.cwd(), "node_modules/@uswds/uswds/packages");
  }

  const settingsDir = path.join(uswdsPackagesDir, "uswds-core/src/styles/settings");
  const validSettings = new Set();

  if (!fs.existsSync(settingsDir)) {
    return validSettings;
  }

  const settingsFiles = fs.readdirSync(settingsDir).filter((f) => f.endsWith(".scss"));

  for (const file of settingsFiles) {
    const content = fs.readFileSync(path.join(settingsDir, file), "utf-8");
    const varRegex = /^\s*\$(theme-[\w-]+)\s*:/gm;
    let match;
    while ((match = varRegex.exec(content)) !== null) {
      validSettings.add(match[1]);
    }
  }

  return validSettings;
}

/**
 * Validate that all variables in a parsed uswds-config.scss are valid USWDS settings.
 * Variables are expected in camelCase (as returned by parseScssContent).
 *
 * @param {Object} parsedTokens - Object from parseScssContent (camelCase keys)
 * @param {string} [uswdsPackagesDir] - Optional path to @uswds/uswds/packages
 * @returns {{ valid: boolean, invalidVariables: string[] }}
 */
export function validateUswdsConfig(parsedTokens, uswdsPackagesDir) {
  const validSettings = getValidUswdsSettings(uswdsPackagesDir);
  const invalidVariables = [];

  for (const camelKey of Object.keys(parsedTokens)) {
    // Convert camelCase back to kebab-case for comparison
    const kebabKey = camelKey.replace(/([A-Z])/g, "-$1").toLowerCase();
    if (!validSettings.has(kebabKey)) {
      invalidVariables.push(kebabKey);
    }
  }

  return {
    valid: invalidVariables.length === 0,
    invalidVariables,
  };
}

/**
 * Load theme tokens from uswds-config.scss (preferred) or theme.scss (legacy)
 * Returns: { uswdsTokens: {}, isUswdsConfig: boolean }
 *
 * File Priority:
 * 1. uswds-config.scss (new approach) - USWDS variables are used as-is, no transformation
 * 2. theme.scss (legacy) - Variables are auto-transformed to USWDS format for backward compatibility
 */
export function loadThemeFiles(themeDir) {
  const uswdsConfigFile = path.join(themeDir, "styles", "uswds-config.scss");
  const themeFile = path.join(themeDir, "styles", "theme.scss");

  let uswdsTokens = {};
  let isUswdsConfig = false;

  if (fs.existsSync(uswdsConfigFile)) {
    uswdsTokens = parseScssVariables(uswdsConfigFile);
    isUswdsConfig = true;
  } else if (fs.existsSync(themeFile)) {
    uswdsTokens = parseScssVariables(themeFile);
    isUswdsConfig = false;
  }

  return { uswdsTokens, isUswdsConfig };
}
