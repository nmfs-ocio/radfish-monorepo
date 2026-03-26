import "../styles/theme.css";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Toast, useApplication } from "@nmfs-ocio/react-radfish";
import { FormGroup, Grid, TextInput, Button, Label, Form, Select } from "@trussworks/react-uswds";
import { CONSTANTS, STATES, TOTAL_STEPS } from "../config/form";
import { TOAST_CONFIG, TOAST_LIFESPAN, useToast } from "../hooks/useToast";

const { fullName, email, city, state, zipcode } = CONSTANTS;

const HomePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({});
  const { toast, showToast, dismissToast } = useToast();
  const location = useLocation();
  const [errors, setErrors] = useState({
    email: "",
    fullName: "",
    city: "",
    state: "",
    zipcode: "",
  });

  // RADFish Application provides centralized storage management
  // Access the formData collection to persist form state across sessions
  const application = useApplication();
  const formDataCollection = application.stores.formData.getCollection("formData");
  // Validate required fields based on current step
  const validateForm = () => {
    const newErrors = { email: "", fullName: "", city: "", state: "", zipcode: "" };

    // Step 1 validations
    if (!formData[fullName]) newErrors[fullName] = "Full name is required";
    if (!formData[email]) newErrors[email] = "Email is required";
    if (formData.currentStep === 2) {
      if (!formData[city]) newErrors[city] = "City is required";
      if (!formData[state]) newErrors[state] = "State is required";
      if (!formData[zipcode]) newErrors[zipcode] = "Zipcode is required";
    }
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };
  // Load existing form data when navigating to a form by ID
  // This ensures users can resume where they left off
  useEffect(() => {
    const loadData = async () => {
      if (id) {
        const [found] = await formDataCollection.find({
          id: id,
        });

        if (found) {
          setFormData({ ...found, id: id, totalSteps: TOTAL_STEPS });
        } else {
          navigate("/");
        }
      }
    };
    loadData();
  }, [id]);

  // Handle success toast after form submission
  useEffect(() => {
    if (location.state?.showToast) {
      showToast(TOAST_CONFIG.SUCCESS);
      setFormData({}); // Clear form after successful submission

      // Clean up the location state after showing toast
      setTimeout(() => {
        dismissToast();
        navigate(location.pathname, { replace: true });
      }, TOAST_LIFESPAN);
    }
  }, [location.state]);

  // submits form data, and includes a submitted flag to identify that it has been submitted
  // this is useful for tracking which forms have been submitted, and which are still in progress
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (validateForm()) {
        await formDataCollection.update({ ...formData, id: id, submitted: true });
        navigate("/", { replace: true, state: { showToast: true } });
        showToast(TOAST_CONFIG.SUCCESS);
      }
    } catch {
      showToast(TOAST_CONFIG.ERROR);
    } finally {
      setTimeout(() => {
        dismissToast();
      }, TOAST_LIFESPAN);
    }
  };

  // Update form data in state as user types
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Navigate to next step and persist all form data
  const stepForward = async () => {
    if (formData.currentStep < TOTAL_STEPS && id) {
      const nextStep = formData.currentStep + 1;
      const updatedData = { ...formData, currentStep: nextStep };
      setFormData(updatedData);

      // Save form data when navigating to next step
      try {
        await formDataCollection.update({ id: id, ...updatedData });
      } catch (error) {
        console.error("Failed to save form progress:", error);
      }
    }
  };

  // Navigate to previous step and persist all form data
  const stepBackward = async () => {
    if (formData.currentStep > 1 && id) {
      const prevStep = formData.currentStep - 1;
      const updatedData = { ...formData, currentStep: prevStep };
      setFormData(updatedData);

      // Save form data when navigating to previous step
      try {
        await formDataCollection.update({ id: id, ...updatedData });
      } catch (error) {
        console.error("Failed to save form progress:", error);
      }
    }
  };

  // Create a new form instance with a unique ID
  // Demonstrates RADFish collection.create() method
  const handleInit = async () => {
    const newForm = {
      id: crypto.randomUUID(),
      currentStep: 1,
      totalSteps: TOTAL_STEPS,
      submitted: false,
    };
    await formDataCollection.create(newForm);
    setFormData(newForm);
    navigate(`/${newForm.id}`);
  };

  if (!id) {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div className="toast-container">
          <Toast toast={toast} />
        </div>
        <Button type="button" onClick={handleInit}>
          Begin Form
        </Button>
      </div>
    );
  }

  if (!formData.currentStep) {
    return (
      <div>
        <p>Invalid Step</p>
      </div>
    );
  }
  // Combine all error messages for display
  const errorMessages = Object.values(errors)
    .filter(Boolean) // Remove empty error messages
    .join(", ");

  return (
    <Form
      className="maxw-full margin-205 padding-205 bg-white radius-8px shadow-2"
      onSubmit={handleSubmit}
    >
      {errorMessages && (
        <div className="text-error">
          <strong>Please correct the following:</strong> {errorMessages}
        </div>
      )}
      <Label className="text-bold" style={{ textAlign: "right" }}>
        Step {formData.currentStep}
      </Label>
      {/* step one */}
      {formData.currentStep === 1 && (
        <FormGroup>
          <Label className="text-bold" htmlFor={fullName}>
            Full Name
          </Label>
          <TextInput
            id={fullName}
            name={fullName}
            type="text"
            placeholder="Full Name"
            value={formData[fullName] || ""}
            onChange={handleChange}
          />
          <Label className="text-bold" htmlFor={fullName}>
            Email
          </Label>
          <TextInput
            id={email}
            name={email}
            type="text"
            placeholder="user@example.com"
            value={formData[email] || ""}
            onChange={handleChange}
          />
          <Grid className="display-flex flex-justify">
            <Button
              type="button"
              className="margin-top-1 margin-right-0 order-last"
              onClick={stepForward}
            >
              Next Step
            </Button>
            <Button
              disabled
              type="button"
              className="margin-top-1"
              onClick={stepBackward}
              data-testid="step-backward"
              id="step-backward"
            >
              Prev Step
            </Button>
          </Grid>
        </FormGroup>
      )}
      {/* step two */}
      {formData.currentStep === 2 && (
        <FormGroup>
          <Label className="text-bold" htmlFor={city}>
            City
          </Label>
          <TextInput
            id={city}
            name={city}
            type="text"
            placeholder="City"
            value={formData[city] || ""}
            onChange={handleChange}
          />
          <Label className="text-bold" htmlFor={state}>
            State
          </Label>
          <Select
            id={state}
            name={state}
            value={formData[state] || ""}
            onChange={handleChange}
            aria-label="Select a state"
          >
            <option value="">Select a state</option>
            {STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </Select>
          <Label className="text-bold" htmlFor={zipcode}>
            Zip Code
          </Label>
          <TextInput
            id={zipcode}
            name={zipcode}
            type="text"
            placeholder="Zipcode"
            value={formData[zipcode] || ""}
            onChange={handleChange}
          />

          <Grid className="display-flex flex-justify">
            <Button type="submit" className="margin-top-1 margin-right-0 order-last">
              Submit
            </Button>
            <Button
              type="button"
              className="margin-top-1"
              onClick={stepBackward}
              data-testid="step-backward"
              id="step-backward"
            >
              Prev Step
            </Button>
          </Grid>
        </FormGroup>
      )}
    </Form>
  );
};

export default HomePage;
