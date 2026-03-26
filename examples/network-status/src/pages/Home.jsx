import React from "react";
import { Alert, Button, Link } from "@trussworks/react-uswds";
import { useOfflineStatus } from "@nmfs-ocio/react-radfish";

const HomePage = () => {
  const { isOffline } = useOfflineStatus();
  return (
    <div className="grid-container">
      <h1>Network Status Example</h1>
      <Alert type="info" headingLevel={"h2"} heading="Information">
        This is an example of a network status indicator. The application will display a toast
        notification for 5 seconds when network is offline.
        <br />
        <Link
          href="https://nmfs-radfish.github.io/radfish/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <br />
          <Button type="button" className="padding-4">
            Go To Documentation
          </Button>
        </Link>
      </Alert>
      <h3 className="header-body">Network Status: {isOffline ? "Offline ❌" : "Online ✅"}</h3>
    </div>
  );
};

export default HomePage;
