import "./index.css";
import React from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { Application } from "@nmfs-ocio/react-radfish";
import { Button, Alert, GridContainer, Link } from "@trussworks/react-uswds";
import HomePage from "./pages/Home";

const App = () => {
  return (
    <Application>
      <GridContainer>
        <div className="App grid-container">
          <h1>Mock API Example</h1>
          <InfoAnnotation />
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </Router>
        </div>
      </GridContainer>
    </Application>
  );
};

const InfoAnnotation = () => {
  return (
    <Alert type="info" heading="Information" headingLevel="h2">
      This is an example of how to use the <strong>native fetch API</strong> along
      with       <Link
        href="https://mswjs.io/"
        target="_blank"
        rel="noopener noreferrer"
      ><strong>Mock Service Worker</strong></Link> in order to create a mock API to
      serve data to your client. Requests to this mock API will be intercepted
      by mock service worker API methods and respond with expected data, which
      simulates a REST API to consume.
      <br />
      <br />
      <Link
        href="https://nmfs-radfish.github.io/radfish"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button type="button">Go To Documentation</Button>
      </Link>
    </Alert>
  );
};

export default App;
