import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Application } from "@nmfs-ocio/radfish";
import { next, drop } from "@nmfs-ocio/radfish/logger";

const root = ReactDOM.createRoot(document.getElementById("root"));

const app = new Application({
  serviceWorker: {
    url: "/service-worker.js",
  },
  // Logger config — declare stream levels + (optional) IndexedDB persistence.
  // The framework wires the console + IndexedDB sinks for you. Access it
  // anywhere with the useLogger() hook.
  logger: {
    streams: {
      app: { level: "info" }, // your feature logs
      system: { level: "warn" }, // infrastructure logs (quieter)
    },
    indexedDB: { dbName: "radfish-app-logs", maxSize: "5MB" }, 
    middleware: [
      // enrich every record with a session id
      (record) => {
        record.attributes.sessionId = "demo-session";
        return next();
      },
      // redact: drop anything that looks like sensitive data before it's stored
      (record) =>
        /password|token|secret|ssn/i.test(`${record.message} ${JSON.stringify(record.attributes)}`)
          ? drop("redacted: contained sensitive data")
          : next(),
    ],
  },
});

app.on("ready", async () => {
  root.render(
    <React.StrictMode>
      <App application={app} />
    </React.StrictMode>,
  );
});
