/**
 * Default configuration values (used if radfish.config.js is missing)
 * Exported so vite.config.js can import and use default colors
 */
export function getDefaultConfig() {
  return {
    theme: "noaa-theme",
    name: "RADFish Application",
    shortName: "RADFish",
    description: "RADFish React App",
  };
}

/**
 * Deep merge two objects (target values override source)
 */
export function deepMerge(source, target) {
  const result = { ...source };
  for (const key of Object.keys(target)) {
    if (target[key] && typeof target[key] === "object" && !Array.isArray(target[key])) {
      result[key] = deepMerge(source[key] || {}, target[key]);
    } else {
      result[key] = target[key];
    }
  }
  return result;
}
