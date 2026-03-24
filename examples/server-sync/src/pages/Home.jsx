import React, { useState, useEffect } from "react";
import { Button, Alert, Link } from "@trussworks/react-uswds";
import { Spinner, Table, useOfflineStatus, useApplication } from "@nmfs-ocio/react-radfish";
import { MSW_ENDPOINT } from "../mocks/handlers";

// Constants for status messages
const OFFLINE_ALREADY_SYNCED = "Offline data is already up-to-date.";
const SERVER_SYNC_FAILED = "App is offline. Unable to sync with the server.";
const SERVER_SYNC_SUCCESS = "Data synced with the server.";

export const HomePage = () => {
  // Check if the app is offline using the `useOfflineStatus` hook
  const { isOffline } = useOfflineStatus();

  // Access the application instance and collections
  const application = useApplication();
  const localDataCollection = application.stores.syncData.getCollection("localData");
  const lastSyncCollection = application.stores.syncData.getCollection("lastSyncFromServer");

  // State for loading spinner, sync status, and data to display in the table
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ message: "", lastSynced: "" });
  const [data, setData] = useState([]);

  // Effect to load the last synced time from IndexedDB
  useEffect(() => {
    const loadLastSyncedTime = async () => {
      if (!lastSyncCollection) return; // Wait for collection to be ready
      
      const [lastSyncRecord] = await lastSyncCollection.find({ id: "lastSynced" });
      if (lastSyncRecord?.time) {
        const lastSyncTime = new Date(lastSyncRecord.time).toLocaleString();
        setSyncStatus((prev) => ({
          ...prev,
          lastSynced: lastSyncTime,
        }));
      }
    };

    loadLastSyncedTime();
  }, [isOffline, lastSyncCollection]);

  // Load existing synced data on page load
  useEffect(() => {
    const loadExistingData = async () => {
      if (!localDataCollection) return; // Wait for collection to be ready
      
      const existingData = await localDataCollection.find();
      setData(existingData);
    };

    loadExistingData();
  }, [localDataCollection]);

  // Helper function to make a GET request using the Fetch API
  const getRequestWithFetch = async (endpoint) => {
    try {
      const response = await fetch(`${endpoint}`, {
        // Example header for token-based authentication
        // Replace or extend with required headers for your API
        headers: { "X-Access-Token": "your-access-token" },
      });

      if (!response.ok) {
        // Set error with the JSON response
        const error = await response.json();
        return error;
      }

      return await response.json();
    } catch (err) {
      // Set error in case of an exception
      return { error: `[GET]: Error fetching data: ${err}` };
    }
  };

  // Function to sync data with the server
  const syncToServer = async () => {
    if (isOffline) {
      // Show an error if the app is offline
      setSyncStatus({ message: SERVER_SYNC_FAILED, lastSynced: syncStatus.lastSynced });
      return;
    }


    setIsLoading(true);
    try {
      // Fetch data from the mock server
      const { data: serverData } = await getRequestWithFetch(MSW_ENDPOINT.GET);

      // Retrieve existing data from IndexedDB
      const offlineData = await localDataCollection.find();

      // Compare offline data with server data
      if (JSON.stringify(offlineData) !== JSON.stringify(serverData)) {
        // Clear existing data and insert new server data
        const existingData = await localDataCollection.find();
        for (const item of existingData) {
          await localDataCollection.delete({ id: item.id });
        }
        
        // Insert new server data with proper schema mapping
        for (const item of serverData) {
          await localDataCollection.create({
            id: item.uuid || crypto.randomUUID(),
            value: item.value,
            isSynced: item.isSynced,
          });
        }

        // Save the current timestamp as the last sync time
        const currentTimestamp = Date.now();
        const existingSync = await lastSyncCollection.find({ id: "lastSynced" });
        
        if (existingSync.length > 0) {
          await lastSyncCollection.update({ id: "lastSynced", time: currentTimestamp });
        } else {
          await lastSyncCollection.create({ id: "lastSynced", time: currentTimestamp });
        }

        const lastSyncTime = new Date(currentTimestamp).toLocaleString();
        setSyncStatus({ message: SERVER_SYNC_SUCCESS, lastSynced: lastSyncTime });
        
        // Refresh local data display
        const updatedData = await localDataCollection.find();
        setData(updatedData);
      } else {
        // If data is already up-to-date, show a relevant message
        setSyncStatus({ message: OFFLINE_ALREADY_SYNCED, lastSynced: syncStatus.lastSynced });
      }
    } catch (error) {
      console.error("An error occurred during sync:", error);
      setSyncStatus({ message: "Sync failed due to an error.", lastSynced: syncStatus.lastSynced });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h1>Server Sync Example</h1>
      <InfoAnnotation />
      <div className="server-sync">
        <Button onClick={syncToServer} disabled={isLoading}>
          {isLoading ? <Spinner width={20} height={20} stroke={2} /> : "Sync with Server"}
        </Button>
        <div
          className={`${
            syncStatus.message.includes("offline") ? "text-red" : "text-green"
          } margin-left-2 margin-top-2`}
        >
          {syncStatus.message}
        </div>
        <div className="margin-left-2">
          {syncStatus.lastSynced && (
            <strong>
              <span>Last Synced: {syncStatus.lastSynced}</span>
            </strong>
          )}
        </div>
        <Table
          data={data}
          columns={[
            { key: "id", label: "ID", sortable: true },
            { key: "value", label: "Value", sortable: true },
            { key: "isSynced", label: "Synced with Server", sortable: false },
          ]}
        />
      </div>
    </>
  );
};

const InfoAnnotation = () => {
  return (
    <Alert type="info" heading="Information" headingLevel="h2">
      This example demonstrates server-to-client data synchronization using RADFish's Application 
      and Collection patterns. It shows how to fetch data from an API and persist it in IndexedDB 
      with schema validation for offline access.
      <br />
      <br />
      Key features demonstrated:
      <ul>
        <li><strong>Schema-based Collections</strong>: Type-safe data storage with validation</li>
        <li><strong>Offline Detection</strong>: Automatic handling of network state changes</li>
        <li><strong>Data Comparison</strong>: Smart sync that only updates when data differs</li>
        <li><strong>Timestamp Tracking</strong>: Records and displays last successful sync time</li>
      </ul>
      <br />
      This example uses Mock Service Worker to simulate API responses. In production, 
      this would integrate with your actual API endpoints.
      <br />
      <br />
      <strong>Test instructions:</strong> Use browser DevTools Network tab to toggle offline mode 
      and observe how the sync behavior changes.
      <br />
      <br />
      <Link href="https://nmfs-radfish.github.io/radfish" target="_blank" rel="noopener noreferrer">
        <Button type="button">Go To Documentation</Button>
      </Link>
    </Alert>
  );
};

export default HomePage;
