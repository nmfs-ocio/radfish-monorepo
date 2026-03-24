import React, { useState, useEffect } from "react";
import { useApplication } from "@nmfs-ocio/react-radfish";
import { Button, Alert, Link } from "@trussworks/react-uswds";

const HomePage = () => {
    const [formData, setFormData] = useState([]);

    // Access the application instance and formData collection
    const application = useApplication();
    const formDataCollection = application.stores.fishingData.getCollection("formData");
  
    useEffect(() => {
      const getFormData = async () => {
        // Find all form data entries
        const data = await formDataCollection.find();
        setFormData(data);
      };
      getFormData();
    }, []);
  
    const createData = async (e) => {
      e.preventDefault();
      const newData = {
        id: crypto.randomUUID(),
        fullName: "Bilbo Baggins",
        species: "Mahimahi",
        computedPrice: 100,
        numberOfFish: 5,
        isDraft: true,
      };
  
      // Create the data in the collection
      await formDataCollection.create(newData);
  
      // Refresh the data display
      const allData = await formDataCollection.find();
      setFormData(allData);
    };
  
    const updateData = async (e, data) => {
      e.preventDefault();
  
      const updatedData = {
        ...data,
        numberOfFish: data.numberOfFish + 1,
        computedPrice: data.computedPrice + 10,
      };
  
      // Update the data in the collection
      await formDataCollection.update(updatedData);
  
      // Update the state
      setFormData((prevData) =>
        prevData.map((item) => (item.id === data.id ? updatedData : item))
      );
    };
  
    const deleteData = async (e, data) => {
      e.preventDefault();
      if (data.id) {
        // Delete the data from the collection
        await formDataCollection.delete({id: data.id});
        setFormData((prevData) =>
          prevData.filter((item) => item.id !== data.id)
        );
      }
    };
  
    return (
      <div className="grid-container">
        <h1>On Device Storage Example</h1>
        <Alert type="info" heading="Information" headingLevel="h2">
          This example demonstrates how to use RADFish's <strong>Application</strong> instance
          and <strong>Collections</strong> to interact with on-device storage. 
          It shows how to create, read, update, and delete (CRUD) data using IndexedDB 
          with schema validation and type safety.
          <br />
          <br />
          Please note that if you choose to test this example with the network
          connection offline, you won’t be able to refresh the page. To do this,
          you must ensure that Service Worker is registered, which requires the
          example to be served as a production build using{" "}
          <strong>npm run build</strong> and serving that output using a basic HTTP
          server such as <strong>serve build</strong>.
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
        <br />
        <Button type="submit" onClick={(e) => createData(e)}>
          Create Data
        </Button>
  
        <h2>Saved Data</h2>
  
        {formData &&
          formData.map((data, i) => {
            return (
              <div key={i}>
                Name: {data?.fullName}
                <br />
                Species: {data?.species}
                <br />
                Number of Fish: {data?.numberOfFish}
                <br />
                Price: {data?.computedPrice}
                <br />
                <Button type="submit" onClick={(e) => updateData(e, data)}>
                  Update Data
                </Button>
                <Button type="submit" onClick={(e) => deleteData(e, data)}>
                  Delete Data
                </Button>
                <hr />
              </div>
            );
          })}
      </div>
    );
};

export default HomePage;