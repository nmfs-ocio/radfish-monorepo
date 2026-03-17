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
        <div className="App grid-container">
          <h1>Conditional Form Fields Example</h1>
          <FormInfoAnnotation />
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </Router>
        </div>
      </GridContainer>
    </Application>
  );
}

const FormInfoAnnotation = () => {
  return (
    <Alert type="info" headingLevel={"h2"} heading="Information">
      This is an example of a form with form inputs that control the visibility of other fields. In
      this example, the <strong>Nickname</strong> field appears whenever <strong>Full Name</strong>{" "}
      contains a value.
      <br />
      <br />
      Note, that this does not check if the name is valid or not (only that it exists). For form
      field validators, please see the{" "}
      <Link
        href="https://github.com/NMFS-RADFish/boilerplate/tree/main/examples/field-validators"
        target="_blank"
        rel="noopener noreferrer"
      >
        field-validators example{" "}
      </Link>
      .
      <br />
      <br />
      <Link href="https://nmfs-radfish.github.io/radfish" target="_blank" rel="noopener noreferrer">
        <Button type="button">Go To Documentation</Button>
      </Link>
    </Alert>
  );
};

export default App;
