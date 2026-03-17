import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Alert, Link, Button, GridContainer } from "@trussworks/react-uswds";
import { Application } from "@nmfs-ocio/react-radfish";
import HomePage from "./pages/Home";

function App({ application }) {
  return (
    <Application application={application}>
      <GridContainer>
        <h1>Persisted Form Example</h1>
        <FormInfoAnnotation />
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
    <Alert type="info" heading="Information" headingLevel="h2">
      This example demonstrates RADFish's persistent form capabilities using the Application and Collection
      patterns. Form data is automatically stored in IndexedDB with schema validation and type safety.
      <br />
      <br />
      Key features demonstrated:
      <ul>
        <li><strong>Schema-based validation</strong>: Data types are enforced automatically</li>
        <li><strong>Auto-save on submission</strong>: Form state persists across browser sessions</li>
        <li><strong>URL-based form loading</strong>: Forms can be bookmarked and shared</li>
        <li><strong>Type-safe collections</strong>: Consistent API for data operations</li>
      </ul>
      <br />
      To see form persistence in action, submit the form to get a unique URL, then bookmark or refresh 
      the page. Your data will be automatically restored from IndexedDB.
      <br />
      <br />
      <Link href="https://nmfs-radfish.github.io/radfish" target="_blank" rel="noopener noreferrer">
        <Button type="button">Go To Documentation</Button>
      </Link>
    </Alert>
  );
};

export default App;
