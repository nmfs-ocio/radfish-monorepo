/**
 * App.jsx - Main Application Component
 *
 * Welcome to RADFish! This is the entry point for your application.
 *
 * This file sets up:
 *   - The Application wrapper (provides offline storage, state management)
 *   - Header with navigation
 *   - React Router for page routing
 *
 * Quick Start:
 *   1. Add new pages in src/pages/
 *   2. Add routes in the <Routes> section below
 *   3. Add navigation links in the ExtendedNav primaryItems array
 *
 * Theme customization:
 *   - Edit themes/noaa-theme/styles/theme.scss for colors and styles
 *   - App name and icons are configured in the theme plugin (vite.config.js)
 *
 * Learn more: https://nmfs-radfish.github.io/radfish/
 */

import "./index.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import React, { useState } from "react";
import { Application } from "@nmfs-radfish/react-radfish";
import {
  GridContainer,
  NavMenuButton,
  NavDropDownButton,
  Menu,
  ExtendedNav,
  Header,
} from "@trussworks/react-uswds";

import HomePage from "./pages/Home";

function onToggle(index, setIsOpen) {
  setIsOpen((prev) => prev.map((val, i) => (i === index ? !val : false)));
}

function App({ application }) {
  const [isExpanded, setExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState([false]);

  const handleToggleMobileNav = () => setExpanded((prev) => !prev);

  const menuItems = [
    <Link to="/" key="one">
      Simple link one
    </Link>,
    <Link to="/" key="two">
      Simple link two
    </Link>,
  ];

  const primaryItems = [
    <React.Fragment key="one">
      <NavDropDownButton
        onToggle={() => onToggle(0, setIsOpen)}
        menuId="nav-dropdown"
        isOpen={isOpen[0]}
        label="Nav Label"
        isCurrent={true}
      />
      <Menu
        items={menuItems}
        isOpen={isOpen[0]}
        id="nav-dropdown"
      />
    </React.Fragment>,
    <Link to="/" key="two" className="usa-nav__link">
      <span>Parent link</span>
    </Link>,
    <Link to="/" key="three" className="usa-nav__link">
      <span>Parent link</span>
    </Link>,
  ];

  const secondaryItems = [
    <Link to="/" key="one">
      Simple link one
    </Link>,
    <Link to="/" key="two">
      Simple link two
    </Link>,
  ];

  return (
    <Application application={application}>
      <a className="usa-skipnav" href="#main-content">
        Skip to main content
      </a>
      <main id="main-content">
        <BrowserRouter>
          {/* Header - Uses USWDS Extended Header component */}
          <Header extended showMobileOverlay={isExpanded}>
            <div className="usa-navbar">
              <Link to="/" className="header-logo-link">
                <img
                  src={import.meta.env.RADFISH_LOGO}
                  alt={import.meta.env.RADFISH_APP_NAME}
                  className="header-logo"
                />
              </Link>
              <NavMenuButton
                onClick={handleToggleMobileNav}
                label="Menu"
              />
            </div>
            <ExtendedNav
              primaryItems={primaryItems}
              secondaryItems={secondaryItems}
              mobileExpanded={isExpanded}
              onToggleMobileNav={handleToggleMobileNav}
            />
          </Header>

          {/* Main Content Area */}
          <GridContainer>
            <Routes>
              <Route path="/" element={<HomePage />} />
              {/* Add more routes here:
                  <Route path="/about" element={<AboutPage />} />
              */}
            </Routes>
          </GridContainer>
        </BrowserRouter>
      </main>
    </Application>
  );
}

export default App;
