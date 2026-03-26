import "../styles/theme.css";
import React, { useState } from "react";
import { dispatchToast } from "@nmfs-ocio/react-radfish";
import { Button, Form, FormGroup, Grid, Label, TextInput } from "@trussworks/react-uswds";

const FULL_NAME = "fullName";
const NICKNAME = "nickname";

const HomePage = () => {
  const [formData, setFormData] = useState({});

  // Function to handle changes in the "Full Name" input field
  // Updates the fullName value in the formData state
  const handleFullNameChange = (event, formData) => {
    const { value } = event.target;
    setFormData({
      ...formData, // Preserve existing form data
      [FULL_NAME]: value, // Update the "Full Name" field
      [NICKNAME]: value === "" ? "" : formData[NICKNAME], // Clear the "Nickname" field if "Full Name" is empty
    });
  };

  const handleNickNameChange = (event, formData) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      [NICKNAME]: value,
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
        <Label className="text-bold" htmlFor={FULL_NAME}>
          Full Name
        </Label>
        <TextInput
          id={FULL_NAME}
          name={FULL_NAME}
          type="text"
          placeholder="Full Name"
          value={formData[FULL_NAME] || ""}
          onChange={(event) => handleFullNameChange(event, formData)} // Call the handleFullNameChange function to update the "Full Name" field
        />
        {formData[FULL_NAME] && ( // Render the "Nickname" field only if "Full Name" is not empty
          <>
            <Label className="text-bold" htmlFor={NICKNAME}>
              Nickname
            </Label>
            <TextInput
              id={NICKNAME}
              name={NICKNAME}
              type="text"
              placeholder="Nickname"
              value={formData[NICKNAME] || ""}
              onChange={(event) => handleNickNameChange(event, formData)} // Call the handleNickNameChange function to update the "Nickname" field
            />
          </>
        )}
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
