import "../styles/theme.css";
import React, { useState } from "react";
import { dispatchToast } from "@nmfs-ocio/react-radfish";
import {
  Button,
  ErrorMessage,
  Form,
  FormGroup,
  Grid,
  Label,
  TextInput,
} from "@trussworks/react-uswds";
import { CONSTANTS } from "../config/form";
import { fullNameValidators } from "../utilities/fieldValidators";

const { FULL_NAME } = CONSTANTS;

const HomePage = () => {
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: value };
      return updatedForm;
    });
  };

  const handleBlur = (event, validators) => {
    const { name, value } = event.target;
    setValidationErrors((prev) => ({
      ...prev,
      ...handleInputValidationLogic(name, value, validators),
    }));
  };

  const handleInputValidationLogic = (name, value, validators) => {
    if (validators && validators.length > 0) {
      for (let validator of validators) {
        if (!validator.test(value)) {
          return { [name]: validator.message };
        }
      }
    }
    return { [name]: null };
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatchToast({ status: "success", message: "Successful form submission!" });
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
        {validationErrors[FULL_NAME] && <ErrorMessage>{validationErrors[FULL_NAME]}</ErrorMessage>}
        <TextInput
          id={FULL_NAME}
          name={FULL_NAME}
          type="text"
          placeholder="Full Name"
          value={formData[FULL_NAME] || ""}
          aria-invalid={validationErrors[FULL_NAME] ? "true" : "false"}
          validationStatus={validationErrors[FULL_NAME] ? "error" : undefined}
          onChange={handleChange}
          onBlur={(e) => handleBlur(e, fullNameValidators)}
        />
        <Grid className="display-flex flex-justify">
          <Button
            disabled={validationErrors[FULL_NAME]}
            type="submit"
            className="margin-top-1 margin-right-0 order-last"
          >
            Submit
          </Button>
        </Grid>
      </FormGroup>
    </Form>
  );
};

export default HomePage;
