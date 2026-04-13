import "./index.css";
import React from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { Application } from "@nmfs-ocio/react-radfish";
import { GridContainer } from "@trussworks/react-uswds";
import HomePage from "./pages/Home";

function App() {
  return (
    <Application>
      <GridContainer>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </Router>
      </GridContainer>
    </Application>
  );
}

export default App;
