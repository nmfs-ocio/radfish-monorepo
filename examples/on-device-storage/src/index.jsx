import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/theme.css";
import App from "./App";
import { ErrorBoundary } from "@nmfs-ocio/react-radfish";
import { Application } from "@nmfs-ocio/radfish";
import { IndexedDBConnector } from "@nmfs-ocio/radfish/storage";

const app = new Application({
  stores: {
    fishingData: {
      connector: new IndexedDBConnector(
        import.meta.env.VITE_INDEXED_DB_NAME || "on-device-storage-app",
      ),
      collections: {
        formData: {
          schema: {
            fields: {
              id: { type: "string", primaryKey: true },
              fullName: { type: "string" },
              email: { type: "string" },
              phoneNumber: { type: "string" },
              numberOfFish: { type: "number" },
              species: { type: "string" },
              computedPrice: { type: "number" },
              isDraft: { type: "boolean" },
            },
          },
        },
        species: {
          schema: {
            fields: {
              id: { type: "string", primaryKey: true },
              name: { type: "string" },
              price: { type: "number" },
            },
          },
        },
        homebaseData: {
          schema: {
            fields: {
              id: { type: "string", primaryKey: true },
              KEY: { type: "string" },
              REPORT_TYPE: { type: "string" },
              SORT_KEY: { type: "string" },
              TRIP_TYPE: { type: "string" },
              VALUE: { type: "string" },
            },
          },
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));

app.on("ready", () => {
  root.render(
    <ErrorBoundary>
      <React.StrictMode>
        <App application={app} />
      </React.StrictMode>
    </ErrorBoundary>,
  );
});
