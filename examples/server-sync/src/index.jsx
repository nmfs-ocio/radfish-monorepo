import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/theme.css";
import App from "./App";
import { Application } from "@nmfs-ocio/radfish";
import { IndexedDBConnector } from "@nmfs-ocio/radfish/storage";
import { ErrorBoundary } from "@nmfs-ocio/react-radfish";

async function enableMocking() {
  const { worker } = await import("./mocks/browser");
  const onUnhandledRequest = "bypass";

  if (import.meta.env.MODE === "development") {
    return worker.start({
      onUnhandledRequest,
      serviceWorker: {
        url: `/mockServiceWorker.js`,
      },
    });
  }

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start({
    onUnhandledRequest,
    serviceWorker: {
      url: `/service-worker.js`,
    },
  });
}

const app = new Application({
  stores: {
    syncData: {
      connector: new IndexedDBConnector(
        import.meta.env.VITE_INDEXED_DB_NAME || "server-sync-app",
      ),
      collections: {
        localData: {
          schema: {
            fields: {
              id: { type: "string", primaryKey: true },
              value: { type: "string" },
              isSynced: { type: "boolean" },
            },
          },
        },
        lastSyncFromServer: {
          schema: {
            fields: {
              id: { type: "string", primaryKey: true },
              time: { type: "number" },
            },
          },
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));

enableMocking().then(() => {
  root.render(
    <ErrorBoundary>
      <React.StrictMode>
        <App application={app} />
      </React.StrictMode>
    </ErrorBoundary>,
  );
});
