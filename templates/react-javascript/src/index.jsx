import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Application } from "@nmfs-ocio/radfish";

// Vite leaves BASE_URL without a trailing slash when `base` is set that way.
const baseUrl = import.meta.env.BASE_URL.replace(/\/?$/, "/");

const root = ReactDOM.createRoot(document.getElementById("root"));

const app = new Application({
  serviceWorker: {
    url: `${baseUrl}service-worker.js`,
  },
});

app.on("ready", async () => {
  root.render(
    <React.StrictMode>
      <App application={app} />
    </React.StrictMode>,
  );
});
