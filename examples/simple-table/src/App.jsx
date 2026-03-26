import "./index.css";
import React from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { Application } from "@nmfs-ocio/react-radfish";
import HomePage from "./pages/Home";

function App() {
  return (
    <Application>
      <div className="App grid-container">
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </Router>
      </div>
    </Application>
  );
}

export default App;
