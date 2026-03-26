import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/theme.css";
import App from "./App";
import { Application } from "@nmfs-ocio/radfish";
import { IndexedDBConnector } from "@nmfs-ocio/radfish/storage";
import { ErrorBoundary } from "@nmfs-ocio/react-radfish";

const app = new Application({
  serviceWorker: {
    url: import.meta.env.MODE === "development" ? "/mockServiceWorker.js" : "/service-worker.js",
  },
  stores: {
    formData: {
      connector: new IndexedDBConnector(
        import.meta.env.VITE_INDEXED_DB_NAME || "persisted-form-app",
      ),
      collections: {
        formData: {
          schema: {
            fields: {
              id: { type: "string", primaryKey: true },
              fullName: { type: "string" },
              numberOfFish: { type: "number" },
              species: { type: "string" },
              computedPrice: { type: "number" },
              isDraft: { type: "boolean" },
            },
          },
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));

app.on("ready", async () => {
  root.render(
    <ErrorBoundary>
      <React.StrictMode>
        <App application={app} />
      </React.StrictMode>
    </ErrorBoundary>,
  );
});
