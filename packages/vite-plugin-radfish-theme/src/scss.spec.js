import { describe, it, expect } from "vitest";
import path from "path";
import { parseScssContent, isUswdsToken, formatUswdsValue, normalizeColorValue, getValidUswdsSettings, validateUswdsConfig } from "./scss.js";

describe("parseScssContent", () => {
  it("parses simple SCSS variable definitions", () => {
    const content = `$primary: #0054a4;\n$secondary: #0093d0;`;
    const result = parseScssContent(content);
    expect(result.primary).toBe("#0054a4");
    expect(result.secondary).toBe("#0093d0");
  });

  it("converts kebab-case to camelCase", () => {
    const content = `$base-lightest: gray-5;`;
    const result = parseScssContent(content);
    expect(result.baseLightest).toBe("gray-5");
  });

  it("strips !default flag", () => {
    const content = `$primary: blue-60v !default;`;
    const result = parseScssContent(content);
    expect(result.primary).toBe("blue-60v");
  });

  it("handles quoted values", () => {
    const content = `$primary: 'blue-60v';`;
    const result = parseScssContent(content);
    expect(result.primary).toBe("'blue-60v'");
  });

  it("returns empty object for empty content", () => {
    const result = parseScssContent("");
    expect(result).toEqual({});
  });

  it("ignores comments and non-variable lines", () => {
    const content = `// This is a comment\n.class { color: red; }\n$primary: #000;`;
    const result = parseScssContent(content);
    expect(Object.keys(result)).toEqual(["primary"]);
    expect(result.primary).toBe("#000");
  });

  it("handles indented variable definitions", () => {
    const content = `  $primary: #0054a4;`;
    const result = parseScssContent(content);
    expect(result.primary).toBe("#0054a4");
  });

  it("handles multiple variables with mixed types", () => {
    const content = `
$primary: blue-60v;
$secondary: #0093d0;
$base-lightest: gray-cool-5;
$accent-warm: orange-30v;
`;
    const result = parseScssContent(content);
    expect(result.primary).toBe("blue-60v");
    expect(result.secondary).toBe("#0093d0");
    expect(result.baseLightest).toBe("gray-cool-5");
    expect(result.accentWarm).toBe("orange-30v");
  });
});

describe("normalizeColorValue", () => {
  it("strips single quotes", () => {
    expect(normalizeColorValue("'blue-60v'")).toBe("blue-60v");
  });

  it("strips double quotes", () => {
    expect(normalizeColorValue('"blue-60v"')).toBe("blue-60v");
  });

  it("returns unquoted values unchanged", () => {
    expect(normalizeColorValue("#0054a4")).toBe("#0054a4");
  });
});

describe("isUswdsToken", () => {
  it("recognizes basic color tokens", () => {
    expect(isUswdsToken("blue")).toBe(true);
    expect(isUswdsToken("red")).toBe(true);
    expect(isUswdsToken("green")).toBe(true);
    expect(isUswdsToken("gray")).toBe(true);
    expect(isUswdsToken("black")).toBe(true);
    expect(isUswdsToken("white")).toBe(true);
  });

  it("recognizes tokens with grade", () => {
    expect(isUswdsToken("blue-60")).toBe(true);
    expect(isUswdsToken("red-50")).toBe(true);
    expect(isUswdsToken("gray-5")).toBe(true);
  });

  it("recognizes tokens with vivid grade", () => {
    expect(isUswdsToken("blue-60v")).toBe(true);
    expect(isUswdsToken("red-50v")).toBe(true);
  });

  it("recognizes tokens with modifier", () => {
    expect(isUswdsToken("gray-cool-30")).toBe(true);
    expect(isUswdsToken("gray-warm-50")).toBe(true);
    expect(isUswdsToken("red-vivid")).toBe(true);
  });

  it("recognizes tokens with modifier and vivid grade", () => {
    expect(isUswdsToken("mint-cool-40v")).toBe(true);
    expect(isUswdsToken("green-cool-40v")).toBe(true);
  });

  it("rejects hex colors", () => {
    expect(isUswdsToken("#0054a4")).toBe(false);
    expect(isUswdsToken("#fff")).toBe(false);
  });

  it("rejects arbitrary strings", () => {
    expect(isUswdsToken("primary")).toBe(false);
    expect(isUswdsToken("some-random-value")).toBe(false);
  });
});

describe("formatUswdsValue", () => {
  it("quotes USWDS token values", () => {
    expect(formatUswdsValue("blue-60v")).toBe("'blue-60v'");
    expect(formatUswdsValue("gray-cool-30")).toBe("'gray-cool-30'");
  });

  it("leaves hex values unquoted", () => {
    expect(formatUswdsValue("#0054a4")).toBe("#0054a4");
    expect(formatUswdsValue("#fff")).toBe("#fff");
  });

  it("strips quotes before checking token", () => {
    expect(formatUswdsValue("'blue-60v'")).toBe("'blue-60v'");
  });

  it("leaves non-token non-hex values unquoted", () => {
    expect(formatUswdsValue("primary")).toBe("primary");
  });
});

// Resolve the USWDS packages directory using Node module resolution.
// require.resolve returns the dist entry point, so walk up to the package root.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const uswdsEntry = require.resolve("@uswds/uswds");
const uswdsRoot = uswdsEntry.substring(0, uswdsEntry.indexOf("@uswds/uswds/") + "@uswds/uswds/".length);
const uswdsPackagesDir = path.join(uswdsRoot, "packages");

describe("getValidUswdsSettings", () => {
  it("returns a non-empty set of valid settings from the installed USWDS package", () => {
    const settings = getValidUswdsSettings(uswdsPackagesDir);
    expect(settings).toBeInstanceOf(Set);
    expect(settings.size).toBeGreaterThan(0);
  });

  it("includes known color settings", () => {
    const settings = getValidUswdsSettings(uswdsPackagesDir);
    expect(settings.has("theme-color-primary")).toBe(true);
    expect(settings.has("theme-color-secondary")).toBe(true);
    expect(settings.has("theme-color-base")).toBe(true);
    expect(settings.has("theme-color-error")).toBe(true);
    expect(settings.has("theme-color-warning")).toBe(true);
    expect(settings.has("theme-color-success")).toBe(true);
    expect(settings.has("theme-color-info")).toBe(true);
  });

  it("includes known component settings", () => {
    const settings = getValidUswdsSettings(uswdsPackagesDir);
    expect(settings.has("theme-accordion-font-family")).toBe(true);
    expect(settings.has("theme-button-border-radius")).toBe(true);
    expect(settings.has("theme-header-font-family")).toBe(true);
    expect(settings.has("theme-table-border-color")).toBe(true);
  });

  it("includes known typography settings", () => {
    const settings = getValidUswdsSettings(uswdsPackagesDir);
    expect(settings.has("theme-font-type-sans")).toBe(true);
    expect(settings.has("theme-body-font-family")).toBe(true);
    expect(settings.has("theme-respect-user-font-size")).toBe(true);
  });

  it("includes known spacing settings", () => {
    const settings = getValidUswdsSettings(uswdsPackagesDir);
    expect(settings.has("theme-grid-container-max-width")).toBe(true);
    expect(settings.has("theme-site-margins-width")).toBe(true);
    expect(settings.has("theme-border-radius-md")).toBe(true);
  });

  it("includes known general settings", () => {
    const settings = getValidUswdsSettings(uswdsPackagesDir);
    expect(settings.has("theme-show-notifications")).toBe(true);
    expect(settings.has("theme-image-path")).toBe(true);
    expect(settings.has("theme-focus-color")).toBe(true);
  });

  it("does not include arbitrary names", () => {
    const settings = getValidUswdsSettings(uswdsPackagesDir);
    expect(settings.has("theme-fake-setting")).toBe(false);
    expect(settings.has("not-a-real-variable")).toBe(false);
  });

  it("returns empty set when given a non-existent path", () => {
    const settings = getValidUswdsSettings("/non/existent/path");
    expect(settings.size).toBe(0);
  });
});

describe("validateUswdsConfig", () => {
  it("passes for valid USWDS config variables", () => {
    const tokens = parseScssContent(`
$theme-color-primary: #0055a4;
$theme-color-secondary: #0093d0;
$theme-color-base-lightest: #ffffff;
`);
    const result = validateUswdsConfig(tokens, uswdsPackagesDir);
    expect(result.valid).toBe(true);
    expect(result.invalidVariables).toEqual([]);
  });

  it("detects invalid variable names", () => {
    const tokens = parseScssContent(`
$theme-color-primary: #0055a4;
$theme-fake-setting: red;
$not-a-uswds-var: blue;
`);
    const result = validateUswdsConfig(tokens, uswdsPackagesDir);
    expect(result.valid).toBe(false);
    expect(result.invalidVariables).toContain("theme-fake-setting");
    expect(result.invalidVariables).toContain("not-a-uswds-var");
    expect(result.invalidVariables).not.toContain("theme-color-primary");
  });

  it("passes for component settings", () => {
    const tokens = parseScssContent(`
$theme-accordion-font-family: "sans";
$theme-button-border-radius: "md";
$theme-header-max-width: "desktop";
`);
    const result = validateUswdsConfig(tokens, uswdsPackagesDir);
    expect(result.valid).toBe(true);
    expect(result.invalidVariables).toEqual([]);
  });

  it("passes for an empty config", () => {
    const result = validateUswdsConfig({}, uswdsPackagesDir);
    expect(result.valid).toBe(true);
    expect(result.invalidVariables).toEqual([]);
  });
});
