/**
 * LoggerDemo.jsx — shows how a developer uses the RADFish logger.
 *
 * The entire setup lives in src/index.jsx (the `logger:` block on Application).
 * Here, a component just grabs the logger with the useLogger() hook and calls it.
 * That's the whole developer experience:
 *
 *   const logger = useLogger();
 *   logger.stream("app").info("user clicked save", { id });
 *
 * Logs go to the browser console AND to IndexedDB (configured in index.jsx).
 * The "Load persisted logs" button reads them back from IndexedDB to prove
 * persistence — and shows that filtered (debug) and redacted (secret) records
 * never got stored.
 */

import { useState } from "react";
import { useLogger } from "@nmfs-ocio/react-radfish";
import { Button } from "@trussworks/react-uswds";

export default function LoggerDemo() {
  const logger = useLogger(); // <-- the only line a developer needs to reach the logger
  const app = logger.stream("app");
  const system = logger.stream("system");

  const [persisted, setPersisted] = useState(null);

  const loadPersisted = async () => setPersisted(await logger.persistence.loadLogs());
  const clearPersisted = async () => {
    await logger.persistence.clearLogs();
    setPersisted([]);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem 1rem" }}>
      <h1>RADFish Logger — developer demo</h1>
      <p>
        The logger is configured once in <code>src/index.jsx</code>. This component reaches it
        with one line: <code>const logger = useLogger()</code>. Click the buttons, then open
        DevTools console (raw records) and Application &rarr; IndexedDB &rarr; <code>radfish-app-logs</code>.
      </p>

      <h2>Log something</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        <Button type="button" onClick={() => app.info("user clicked save", { id: 42 })}>
          app.info ✅
        </Button>
        <Button type="button" onClick={() => app.warn("response was slow", { ms: 1800 })}>
          app.warn ⚠️
        </Button>
        <Button type="button" onClick={() => app.error("checkout failed", { code: "ETIMEOUT" })}>
          app.error 🔴 (a real app error)
        </Button>
        <Button type="button" onClick={() => system.warn("storage almost full", { usagePct: 92 })}>
          system.warn 🛠️
        </Button>
        <Button type="button" outline onClick={() => app.debug("verbose detail")}>
          app.debug 🤫 (filtered out)
        </Button>
        <Button type="button" outline onClick={() => app.info("my password is hunter2")}>
          log a "password" 🚫 (redacted)
        </Button>
      </div>

      <h2>Persistence (IndexedDB)</h2>
      <p>
        Logs survive a refresh. Load them back from IndexedDB — note that <em>debug</em> and the
        <em> redacted</em> record are absent (they were filtered/dropped before storage).
      </p>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <Button type="button" onClick={loadPersisted}>
          Load persisted logs
        </Button>
        <Button type="button" outline onClick={clearPersisted}>
          Clear persisted logs
        </Button>
      </div>

      {persisted !== null && (
        <div style={{ border: "1px solid #ddd", borderRadius: "6px", padding: "0.75rem" }}>
          <strong>{persisted.length} record(s) in IndexedDB</strong>
          <ul className="persisted-list" style={{ margin: "0.5rem 0 0", padding: 0 }}>
            {persisted.map((r, i) => (
              <li key={i} style={{ listStyle: "none", padding: "0.3rem 0", borderBottom: "1px solid #eee", fontSize: "0.85rem" }}>
                <strong>[{r.stream}]</strong> <em>{r.level}</em> — {r.message}{" "}
                <small style={{ color: "#666" }}>{JSON.stringify(r.attributes)}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
