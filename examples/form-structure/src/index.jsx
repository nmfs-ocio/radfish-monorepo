import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "@nmfs-ocio/react-radfish";
import "./styles/theme.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <ErrorBoundary>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ErrorBoundary>
);