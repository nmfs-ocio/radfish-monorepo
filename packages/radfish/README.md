# radfish

![Version](https://img.shields.io/github/package-json/v/nmfs-ocio/radfish-monorepo?filename=packages/radfish/package.json)

The radfish NPM package contains the core Javascript modules needed to power any RADFish project. The idea is that these modules are framework agnostic, and should be fully functional whether you are building an application in React, Svelte, or even Vanilla JavaScript.

## Installation

Install Radfish with npm:

```bash
npm install @nmfs-ocio/radfish
```

This library is open source and can be found here:  https://www.npmjs.com/package/@nmfs-radfish/radfish

## Usage

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Application } from "@nmfs-radfish/radfish";

// Initialize the application
const app = new Application({
  serviceWorker: {
    url:
      import.meta.env.MODE === "development"
        ? "/mockServiceWorker.js"
        : "/service-worker.js",
  },
  mocks: {
    handlers: import("../mocks/browser.js"),  // Specify mock handlers for MSW
  },
});

// Wait until the application is ready before rendering the React app
app.on("ready", () => {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      { /* Your application code */ }
    </React.StrictMode>,
  );
});
```

## Contributing
Contributions are welcome! If you would like to contribute, please read our [contributing guide](https://nmfs-radfish.github.io/radfish/about/contribute) and follow the steps.
