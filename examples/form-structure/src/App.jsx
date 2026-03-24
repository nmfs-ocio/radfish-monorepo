import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Alert, Button, Link, GridContainer } from "@trussworks/react-uswds";
import { Application } from "@nmfs-ocio/react-radfish";

import HomePage from "./pages/Home";

function App() {
  return (
    <Application>
      <GridContainer>
        <div className="App grid-container">
          <h1>Structured Form</h1>
          <FormInfoAnnotation />
          <br />
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
    <Alert type="info" headingLevel={"h2"} heading="Information" validation>
      This example of building a non-trivial form using core components provided by <Link href="https://github.com/trussworks/react-uswds" target="_blank" rel="noopener noreferrer">Trussworks react-uswds</Link>. There are several useful elements that make up this example.
      <ul>
        <li>The Form structure is defined using the <em>Grid</em> components provided by <code>trussworks/react-uswds</code>.</li>
        <li>A <code>useEffect</code> hook is used to set the input focus when the page loads.</li>
        <li>A <code>handleSubmit</code> has been defined, showing how the <code>formData</code> elements can be retrieved and the form reset.</li>
      </ul>
      <strong>Note:</strong> Annotations are for informational purposes only. In production, you
      would remove the annotations. Components with annotations above them are optional. You can
      choose whether or not to use them in your application.
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
