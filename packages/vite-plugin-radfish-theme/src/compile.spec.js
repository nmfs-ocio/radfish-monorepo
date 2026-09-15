import { describe, it, expect } from "vitest";
import { generateUswdsEntryScss } from "./compile.js";

describe("generateUswdsEntryScss", () => {
  const tokens = { themeColorPrimary: "#005ea2" };

  it("defaults asset paths to /uswds-img and /uswds-fonts when base is '/'", () => {
    const out = generateUswdsEntryScss(tokens, true);
    expect(out).toContain(`$theme-image-path: "/uswds-img"`);
    expect(out).toContain(`$theme-font-path: "/uswds-fonts"`);
  });

  it("prefixes asset paths with Vite base", () => {
    const out = generateUswdsEntryScss(tokens, true, { base: "/my-app/" });
    expect(out).toContain(`$theme-image-path: "/my-app/uswds-img"`);
    expect(out).toContain(`$theme-font-path: "/my-app/uswds-fonts"`);
  });

  it("does not double-slash when base has no trailing slash", () => {
    const out = generateUswdsEntryScss(tokens, true, { base: "/my-app" });
    expect(out).toContain(`$theme-image-path: "/my-app/uswds-img"`);
    expect(out).not.toContain(`//uswds-img`);
  });

  it("skips injecting $theme-image-path when consumer declared it", () => {
    const out = generateUswdsEntryScss(
      { ...tokens, themeImagePath: '"/custom-img"' },
      true,
    );
    const matches = out.match(/\$theme-image-path:/g) || [];
    expect(matches.length).toBe(1);
    expect(out).toContain(`/custom-img`);
    expect(out).not.toContain(`/uswds-img`);
  });

  it("skips injecting $theme-font-path when consumer declared it", () => {
    const out = generateUswdsEntryScss(
      { ...tokens, themeFontPath: '"/custom-fonts"' },
      true,
    );
    const matches = out.match(/\$theme-font-path:/g) || [];
    expect(matches.length).toBe(1);
    expect(out).toContain(`/custom-fonts`);
    expect(out).not.toContain(`/uswds-fonts`);
  });

  it("skips injecting $theme-show-notifications when consumer declared it", () => {
    const out = generateUswdsEntryScss(
      { ...tokens, themeShowNotifications: "true" },
      true,
    );
    const matches = out.match(/\$theme-show-notifications:/g) || [];
    expect(matches.length).toBe(1);
    expect(out).toContain(`$theme-show-notifications: true`);
  });

  it("injects $theme-show-notifications: false by default", () => {
    const out = generateUswdsEntryScss(tokens, true);
    expect(out).toContain(`$theme-show-notifications: false`);
  });

  it("does not inject path defaults in legacy (theme.scss) mode", () => {
    // Legacy mode keys would collide with USWDS's expected names — skip the
    // consumer-declared check entirely.
    const out = generateUswdsEntryScss(tokens, false);
    expect(out).toContain(`$theme-image-path: "/uswds-img"`);
    expect(out).toContain(`$theme-font-path: "/uswds-fonts"`);
  });
});
