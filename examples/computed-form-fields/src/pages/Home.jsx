import "../styles/theme.css";
import React, { useState } from "react";
import { dispatchToast } from "@nmfs-ocio/react-radfish";
import {
  Alert,
  Button,
  Form,
  FormGroup,
  Grid,
  Label,
  Select,
  TextInput,
} from "@trussworks/react-uswds";

const NUMBER_OF_FISH = "numberOfFish";
const SPECIES = "species";
const COMPUTED_PRICE = "computedPrice";

const speciesData = ["grouper", "salmon", "marlin", "mahimahi"];
const speciesPriceMap = {
  grouper: 25.0,
  salmon: 58.0,
  marlin: 100.0,
  mahimahi: 44.0,
};

const computeFieldValue = (numberOfFish, species) => {
  let computedPrice = parseInt(numberOfFish || 0) * parseInt(speciesPriceMap[species] || 0);
  return computedPrice.toString();
};

const HomePage = () => {
  const [formData, setFormData] = useState({});

  // Function to handle changes in the "Number of Fish" input field
  // Updates the NUMBER_OF_FISH value in the formData state
  const handleNumberFishChange = (event, formData) => {
    const { value } = event.target;
    setFormData({
      ...formData, // Preserve existing form data
      [NUMBER_OF_FISH]: value, // Update the "Number of Fish" field
      [COMPUTED_PRICE]: computeFieldValue(value, formData?.species || ""), // Call the computeFieldValue function to update the "Computed Price" field
    });
  };

  const handleSelectChange = (event, formData) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      [SPECIES]: value,
      [COMPUTED_PRICE]: computeFieldValue(formData?.numberOfFish || 0, value),
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatchToast({ status: "success", message: "Successful form submission" });
  };

  return (
    <Form
      onSubmit={handleSubmit}
      className="maxw-full margin-205 padding-205 bg-white radius-8px shadow-2"
    >
      <FormGroup>
        <Label className="text-bold" htmlFor={NUMBER_OF_FISH}>
          Number of Fish
        </Label>
        <Alert type="info" slim={true}>
          Example of a linked input. The value of this input is used to calculate{" "}
          <strong>Computed Price</strong> below.
        </Alert>
        <TextInput
          className="text-bold"
          id={NUMBER_OF_FISH}
          name={NUMBER_OF_FISH}
          type="number"
          placeholder="0"
          min="0"
          value={formData[NUMBER_OF_FISH] || ""} // Display the current state value
          onChange={(event) => handleNumberFishChange(event, formData)} // Trigger the handler on change
        />
        <Label className="text-bold" htmlFor={SPECIES}>
          Species
        </Label>
        <Alert type="info" slim={true}>
          The current implementation is using our mock server which can be found at /directory.
          Documentation for the mock service worker can be found at{" "}
          <a href="https://nmfs-radfish.github.io/radfish/developer-documentation/building-your-application/patterns/mock-api">
            this link
          </a>
        </Alert>
        <Select
          id={SPECIES}
          name={SPECIES}
          value={formData[SPECIES] || ""}
          onChange={(event) => handleSelectChange(event, formData)}
        >
          <option value="">Select Species</option>
          {speciesData.map((option) => (
            <option key={option} value={option.toLowerCase()}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </Select>
        <Label className="text-bold" htmlFor={COMPUTED_PRICE}>
          Computed Price
        </Label>
        <Alert type="info" slim={true}>
          Readonly input. Its value is calculated based on the number of fish and species selected.
        </Alert>
        <TextInput
          readOnly
          id={COMPUTED_PRICE}
          name={COMPUTED_PRICE}
          type="text"
          placeholder="Computed Price"
          value={formData[COMPUTED_PRICE] || ""}
        />
        <Grid className="display-flex flex-justify">
          <Button type="submit" className="margin-top-1 margin-right-0 order-last">
            Submit
          </Button>
        </Grid>
      </FormGroup>
    </Form>
  );
};

export default HomePage;
