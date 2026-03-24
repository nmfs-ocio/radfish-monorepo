import "./index.css";
import React from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import HomePage from "./pages/Home";
import { Alert, Button, Link, GridContainer } from "@trussworks/react-uswds";
import { Application } from "@nmfs-ocio/react-radfish";

function App({ application }) {
  return (
    <Application application={application}>
      <GridContainer>
        <h1>Multi-Step</h1>
        <FormInfoAnnotation />
        <br />
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/:id" element={<HomePage />} />
          </Routes>
        </Router>
      </GridContainer>
    </Application>
  );
}

const FormInfoAnnotation = () => {
  return (
    <Alert type="info" headingLevel={"h2"} heading="Information">
      This is an example of a multistep form, where the form needs to keep track of the current step
      that the user is on. This current step should persist through refresh, along with the data for
      that specific form, on the correct step.
      <br />
      <br />
      <strong>Note:</strong> Annotations are for informational purposes only. In production, you
      would remove the annotations. Components with annotations above them are optional. You can
      choose whether or not to use them in your application.
      <br />
      <br />
      <Link href="https://nmfs-radfish.github.io/radfish" target="_blank" rel="noopener noreferrer">
        <Button type="button">Go To Documentation</Button>
      </Link>
    </Alert>
  );
};

export default App;
