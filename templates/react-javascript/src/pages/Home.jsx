/**
 * Home.jsx - Welcome Page
 *
 * This is the default home page for your RADFish application.
 * Replace this content with your own!
 */

import "../index.css";
import { Button } from "@trussworks/react-uswds";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>Welcome to RADFish</h1>

      <p>
        You're ready to start building your fisheries data collection application.
        This template includes everything you need to get started.
      </p>

      <h2>Quick Start</h2>
      <ul>
        <li>
          Edit <code>vite.config.js</code> to change app name and description
        </li>
        <li>
          Edit <code>src/App.jsx</code> to modify the header and navigation
        </li>
        <li>
          Edit <code>src/pages/Home.jsx</code> to change this page
        </li>
        <li>
          Replace images in <code>themes/noaa-theme/assets/</code> to change logo and favicon
        </li>
      </ul>

      <h2>What's Included</h2>
      <ul>
        <li>
          <strong>USWDS Components</strong> - U.S. Web Design System via react-uswds
        </li>
        <li>
          <strong>Offline Storage</strong> - IndexedDB for offline-first data collection
        </li>
        <li>
          <strong>Theming</strong> - Customizable NOAA brand colors and styles
        </li>
        <li>
          <strong>PWA Ready</strong> - Progressive Web App support for mobile deployment
        </li>
      </ul>

      <h2>Resources</h2>
      <p>
        <Link
          to="https://nmfs-radfish.github.io/radfish/developer-documentation/getting-started"
          target="_blank"
        >
          <Button type="button">Documentation</Button>
        </Link>{" "}
        <Link to="https://github.com/NMFS-RADFish/radfish" target="_blank">
          <Button type="button" outline>
            GitHub
          </Button>
        </Link>{" "}
        <Link to="https://trussworks.github.io/react-uswds/?path=/docs/welcome--docs" target="_blank">
          <Button type="button" outline>
            React USWDS
          </Button>
        </Link>{" "}
        <Link to="https://designsystem.digital.gov/" target="_blank">
          <Button type="button" outline>
            USWDS
          </Button>
        </Link>
      </p>
    </div>
  );
}

export default HomePage;
