import "./index.css";
import React from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { Application } from "@nmfs-ocio/react-radfish";
import { Alert, Button, GridContainer, Link } from "@trussworks/react-uswds";
import HomePage from "./pages/Home";

function App() {
  return (
    <Application>
      <GridContainer>
        <Router>
          <div className="App">
            <h1>Computed Form Fields Example</h1>
            <FormInfoAnnotation />
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </div>
        </Router>
      </GridContainer>
    </Application>
  );
}

const FormInfoAnnotation = () => {
  return (
    <Alert type="info" headingLevel={"h2"} heading="Information">
      In this example, the <strong>Computed Price</strong> is calculated by taking{" "}
      <strong>Number of Fish</strong> and multiplying it by the price for the selected <strong>Species</strong>. The
      price for each species is a defined in <strong>speciesPriceMap</strong> object and calculated in the <strong>computeFieldValue</strong> function.
      <br />
      <br />
      <Link
        href="https://nmfs-radfish.github.io/radfish/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button type="button">Go To Documentation</Button>
      </Link>
    </Alert>
  );
};

export default App;
