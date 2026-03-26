import { describe, it, expect } from "vitest";
import { getContentType, getManifestIcons } from "./utils.js";

describe("getContentType", () => {
  it("returns correct MIME type for .png", () => {
    expect(getContentType(".png")).toBe("image/png");
  });

  it("returns correct MIME type for .ico", () => {
    expect(getContentType(".ico")).toBe("image/x-icon");
  });

  it("returns correct MIME type for .jpg", () => {
    expect(getContentType(".jpg")).toBe("image/jpeg");
  });

  it("returns correct MIME type for .jpeg", () => {
    expect(getContentType(".jpeg")).toBe("image/jpeg");
  });

  it("returns correct MIME type for .svg", () => {
    expect(getContentType(".svg")).toBe("image/svg+xml");
  });

  it("returns correct MIME type for .webp", () => {
    expect(getContentType(".webp")).toBe("image/webp");
  });

  it("returns application/octet-stream for unknown extensions", () => {
    expect(getContentType(".xyz")).toBe("application/octet-stream");
    expect(getContentType(".txt")).toBe("application/octet-stream");
  });
});

describe("getManifestIcons", () => {
  it("returns an array of icon objects", () => {
    const icons = getManifestIcons();
    expect(Array.isArray(icons)).toBe(true);
    expect(icons.length).toBe(3);
  });

  it("includes favicon.ico entry", () => {
    const icons = getManifestIcons();
    const favicon = icons.find((i) => i.src === "icons/favicon.ico");
    expect(favicon).toBeDefined();
    expect(favicon.type).toBe("image/x-icon");
  });

  it("includes icon-512.png entries with any and maskable purposes", () => {
    const icons = getManifestIcons();
    const pngIcons = icons.filter((i) => i.src === "icons/icon-512.png");
    expect(pngIcons.length).toBe(2);
    const purposes = pngIcons.map((i) => i.purpose);
    expect(purposes).toContain("any");
    expect(purposes).toContain("maskable");
  });
});
