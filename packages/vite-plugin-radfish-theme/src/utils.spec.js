import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import {
  getContentType,
  getManifestIcons,
  createStaticAssetHandler,
} from "./utils.js";

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

  it("returns correct MIME type for .woff2", () => {
    expect(getContentType(".woff2")).toBe("font/woff2");
  });

  it("returns correct MIME type for .woff", () => {
    expect(getContentType(".woff")).toBe("font/woff");
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

describe("createStaticAssetHandler", () => {
  // Build a fixture tree:
  //   <tmp>/
  //     root/file.svg         ← legitimate target
  //     sibling/secret.txt    ← outside root; must not be reachable via ..
  //     rootleak/leak.txt     ← shares prefix with root; must not be reachable
  let tmpDir;
  let rootDir;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "radfish-static-"));
    rootDir = path.join(tmpDir, "root");
    fs.mkdirSync(rootDir);
    fs.writeFileSync(path.join(rootDir, "file.svg"), "<svg/>");

    fs.mkdirSync(path.join(tmpDir, "sibling"));
    fs.writeFileSync(path.join(tmpDir, "sibling", "secret.txt"), "nope");

    fs.mkdirSync(path.join(tmpDir, "rootleak"));
    fs.writeFileSync(path.join(tmpDir, "rootleak", "leak.txt"), "nope");
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  // Minimal fake res: collect what the handler wrote so we can assert on it.
  const makeRes = () => {
    const chunks = [];
    return {
      headers: {},
      chunks,
      setHeader(name, value) {
        this.headers[name.toLowerCase()] = value;
      },
      // Mimic the Writable surface that fs.createReadStream(...).pipe() uses.
      write(chunk) {
        chunks.push(chunk);
        return true;
      },
      end(chunk) {
        if (chunk) chunks.push(chunk);
        this.ended = true;
      },
      on() {},
      once() {},
      emit() {},
    };
  };

  it("serves a file inside the root", async () => {
    const handler = createStaticAssetHandler(rootDir);
    const res = makeRes();
    let nextCalled = false;
    await new Promise((resolve) => {
      res.end = function (chunk) {
        if (chunk) this.chunks.push(chunk);
        this.ended = true;
        resolve();
      };
      handler({ url: "/file.svg" }, res, () => {
        nextCalled = true;
        resolve();
      });
    });
    expect(nextCalled).toBe(false);
    expect(res.headers["content-type"]).toBe("image/svg+xml");
  });

  it("rejects traversal via .. and calls next()", () => {
    const handler = createStaticAssetHandler(rootDir);
    const res = makeRes();
    let nextCalled = false;
    handler({ url: "/../sibling/secret.txt" }, res, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(true);
    expect(res.headers["content-type"]).toBeUndefined();
  });

  it("rejects prefix-collision paths (e.g. /root vs /rootleak)", () => {
    // Resolve from tmpDir as "root" so a request for "../rootleak/..."
    // would otherwise pass a naive startsWith(rootDir) check.
    const handler = createStaticAssetHandler(rootDir);
    const res = makeRes();
    let nextCalled = false;
    handler({ url: "/../rootleak/leak.txt" }, res, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(true);
    expect(res.headers["content-type"]).toBeUndefined();
  });

  it("calls next() for missing files", () => {
    const handler = createStaticAssetHandler(rootDir);
    const res = makeRes();
    let nextCalled = false;
    handler({ url: "/does-not-exist.svg" }, res, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(true);
  });

  it("strips query strings before resolving", () => {
    const handler = createStaticAssetHandler(rootDir);
    const res = makeRes();
    let nextCalled = false;
    handler({ url: "/file.svg?v=123" }, res, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(false);
    expect(res.headers["content-type"]).toBe("image/svg+xml");
  });
});
