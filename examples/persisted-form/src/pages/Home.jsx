import "../index.css";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FormGroup, TextInput, Label, Button, Form } from "@trussworks/react-uswds";
import { useApplication, dispatchToast } from "@nmfs-ocio/react-radfish";

const HomePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({});

  // Access the application instance and formData collection
  const application = useApplication();
  const formDataCollection = application.stores.formData.getCollection("formData");

  // Load existing form data from the collection
  const findExistingForm = useCallback(async () => {
    if (id) {
      const [found] = await formDataCollection.find({
        id: id,
      });

      if (found) {
        setFormData({ ...found });
      } else {
        navigate("/");
      }
    }
  }, [id, formDataCollection, navigate]);

  useEffect(() => {
    findExistingForm();
  }, [findExistingForm]);

  // Update form data in state as user types (auto-save on form submission)
  const handleChange = (event) => {
    const { name, value } = event.target;
    const processedValue = event.target.type === "number" ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = {};

    for (let [key, value] of formData.entries()) {
      values[key] = key === "numberOfFish" || key === "computedPrice" ? Number(value) : value;
    }

    if (!id) {
      // Create new form entry
      const newForm = {
        id: crypto.randomUUID(),
        ...values,
        isDraft: false,
      };
      await formDataCollection.create(newForm);
      navigate(`/${newForm.id}`);
      dispatchToast({
        status: "success",
        message: "Your form has been successfully saved offline! You can now revisit it anytime.",
      });
    } else {
      // Update existing form
      const updatedForm = { id, ...values, isDraft: false };
      await formDataCollection.update(updatedForm);
      setFormData(updatedForm);
      dispatchToast({
        status: "success",
        message: "Your changes have been saved! The form has been updated successfully.",
      });
      // after updating the data in IndexedDB, we can execute any other logic here
      // eg. execute a POST request to an API
    }
  };

  return (
    <Form
      className="maxw-full margin-205 padding-205 bg-white radius-8px shadow-2"
      onSubmit={handleSubmit}
    >
      <FormGroup>
        <Label className="text-bold" htmlFor="fullName">
          Name
        </Label>
        <TextInput
          id="fullName"
          name="fullName"
          type="text"
          value={formData?.fullName || ""}
          onChange={handleChange}
        />
        <Label className="text-bold" htmlFor="numberOfFish">
          Number of Fish
        </Label>
        <TextInput
          id="numberOfFish"
          name="numberOfFish"
          type="number"
          value={formData?.numberOfFish || ""}
          onChange={handleChange}
        />
        <Label className="text-bold" htmlFor="species">
          Species
        </Label>
        <TextInput
          id="species"
          name="species"
          type="text"
          value={formData?.species || ""}
          onChange={handleChange}
        />
        <Label className="text-bold" htmlFor="computedPrice">
          Price (Dollars)
        </Label>
        <div className="input-wrapper">
          <span className="dollar-sign">$</span>
          <TextInput
            id="computedPrice"
            name="computedPrice"
            type="number"
            value={formData?.computedPrice || ""}
            onChange={handleChange}
            className="dollar-input"
          />
        </div>
        <Button type="submit" className="margin-top-2">
          Submit
        </Button>
      </FormGroup>
    </Form>
  );
};

export default HomePage;
