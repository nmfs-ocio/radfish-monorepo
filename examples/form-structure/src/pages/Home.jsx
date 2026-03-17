import "../index.css";
import React, { useEffect, useRef, useState } from "react";
import { DatePicker } from "@nmfs-ocio/react-radfish";
import {
  Button,
  Fieldset,
  Form, 
  Grid,
  GridContainer,
  Label,
  Select,
  TextInput,
} from "@trussworks/react-uswds";


function HomePage() {
  const [resetToggle, setResetToggle] = useState(false);
  const inputFocus = useRef(null);
  // When the page mounts the "permitYear" Select will have focus set.
  useEffect(() => {
    if (inputFocus.current) {
      inputFocus.current.focus();
    }
    setResetToggle(false);
  }, [resetToggle]);

  // The Submit handler iterates over the FormData entries to make the available to inspection.
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const values = {};
    let alertString = "";

    for (const [key, value] of formData.entries()) {
      values[key] = value;
      alertString += `${key}: ${value}\n`;
    }

    window.alert(alertString);
    // Reset for after triggering Submit
    event.target.reset();
    // Set focus on first input after form is submitted.
    setResetToggle(true);
  };

  return (
    <GridContainer>
      <Grid row>
        <Grid col>
          <p className="text-bold text-center">
            If you have questions, please call the Permits Office at{" "}
            <a href="tel:888-555-5555">888-555-5555</a> or email us at{" "}
            <a href="mailto:permits@email.com">permits@email.com</a>.
          </p>
          {/* Several USWDS CSS classes are being used to tweak the layout to meet the forms needs. eg. text-bold, text-center, margin-top-0, etc... */}
          <p className="text-bold text-center">
            Fields marked with a red asterisk (
            <abbr className="usa-hint usa-hint--required text-bold">*</abbr>)
            need to be filled in before submitting your application
          </p>
        </Grid>
      </Grid>
      <Grid row>
        <Grid col>
          {/* When needed custom CSS classes can be defined. See '.app-page-divider' in ../index.css. */}
          <h2 className="app-page-divider text-center">
            Private Recreational Tilefish
          </h2>
        </Grid>
      </Grid>
      {/* The default USWDS Form if too narrow. The "maxw-desktop" USWDS CSS class sets it to be wider */}
      <Form className="maxw-full" onSubmit={handleSubmit}>
        <Grid row className="flex-justify-center">
          <Grid col="auto">
            <Label
              htmlFor="permit-year-select"
              className="text-bold margin-right-1 margin-top-2"
              requiredMarker
            >
              Permit Year:
            </Label>
          </Grid>
          <Grid col="auto">
            <Select
              id="permit-year-select"
              name="permitYear"
              inputRef={inputFocus}
              required
            >
              <option value="">- Select -</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </Select>
          </Grid>
        </Grid>
        <Grid row>
          <Grid col>
            <h2 className="app-page-divider text-center">
              Section 1 - Primary Vessel Owner Information
            </h2>
          </Grid>
        </Grid>
        <Grid row gap="md">
          <Grid tablet={{ col: true }} className="tablet:margin-bottom-3">
            <Fieldset className="app-input-boundary" required>
              <p className="margin-top-0">
                You may enter the name of a business or a person. The owner name
                must match the name on you Coast Guard Documentation or State
                Registration.{" "}
                <abbr className="use-hint usa-hint--required text-bold">
                  {" "}
                  *
                </abbr>
              </p>
              <Label htmlFor="business-name" className="text-bold">
                Business Name:
              </Label>
              <TextInput
                id="business-name"
                name="businessName"
                autoComplete="organization"
              />
              <div className="text-center text-bold margin-top-1">- Or -</div>
              <Label htmlFor="last-name" className="text-bold margin-top-05">
                Last Name:
              </Label>
              <TextInput
                id="last-name"
                name="lastName"
                autoComplete="family-name"
              />
              <Label htmlFor="first-name" className="text-bold">
                First Name:
              </Label>
              <TextInput
                id="first-name"
                name="firstName"
                autoComplete="given-name"
              />
              <Grid row gap>
                <Grid col={8}>
                  <Label htmlFor="middle-name" className="text-bold">
                    Middle Name:
                  </Label>
                  <TextInput
                    id="middle-name"
                    name="middleName"
                    autoComplete="additional-name"
                  />
                </Grid>
                <Grid col={4}>
                  <Label htmlFor="suffix-select" className="text-bold">
                    {" "}
                    Suffix:{" "}
                  </Label>
                  <Select id="suffix-select" name="suffixSelect">
                    <option value="">- Select -</option>
                    <option value="Sr.">Sr.</option>
                    <option value="Jr.">Jr.</option>
                    <option value="III">III</option>
                  </Select>
                </Grid>
              </Grid>
            </Fieldset>
            <Label htmlFor="address1" className="text-bold" requiredMarker>
              Address Line 1:
            </Label>
            <TextInput
              id="address1"
              name="address1"
              autoComplete="street-address"
              required
            />
            <Label htmlFor="address2" className="text-bold" hint=" (optional)">
              Address Line 2:
            </Label>
            <TextInput id="address2" name="address2" />
          </Grid>
          <Grid tablet={{ col: true }} className="margin-bottom-3">
            <Label
              htmlFor="vessel-name"
              className="text-bold tablet:margin-top-0"
              requiredMarker
            >
              Vessel Name (enter "unnamed" if necessary):
            </Label>
            <TextInput id="vessel-name" name="vesselName" required />
            <Label htmlFor="hull-id" className="text-bold" requiredMarker>
              Hull Id (USCG Documentation or State Registration Nbr):
            </Label>
            <TextInput id="hull-id" name="hullId" required />
            <DatePicker
              id="registration-date"
              name="registrationDate"
              className="app-label-bold-text"
              label="USCG Documentation or State Registration Expiration date:"
              required
            ></DatePicker>
            <Fieldset
              className="app-legend-bold-text margin-top-3"
              legend="Home Port (city and state where your vessel is moored)"
            >
              <Grid row gap>
                <Grid col={7}>
                  <Label
                    htmlFor="home-city"
                    className="margin-top-0 text-bold"
                    requiredMarker
                  >
                    Home City:
                  </Label>
                  <TextInput id="home-city" name="homeCity" required />
                </Grid>
                <Grid col={5}>
                  <Label
                    htmlFor="home-state-select"
                    className="margin-top-0 text-bold"
                    requiredMarker
                  >
                    Home State:
                  </Label>
                  <Select id="home-state-select" name="homeStateSelect">
                    <option>- Select - </option>
                    <option value="ME">Maine</option>
                    <option value="MA">Massachusetts</option>
                    <option value="RI">Rhode Island</option>
                  </Select>
                </Grid>
              </Grid>
            </Fieldset>
            <Label htmlFor="tel-number" requiredMarker className="text-bold">
              Telephone Number:
            </Label>
            <TextInput
              id="tel-number"
              name="telNumber"
              autoComplete="tel"
              required
            />
            <Label
              htmlFor="alt-tel-number"
              className="text-bold"
              hint=" (optional)"
            >
              Alternate Telephone Number:
            </Label>
            <TextInput id="alt-tel-number" name="altTelNumber" />
            <Button
              type="submit"
              size="big"
              className="float-right margin-right-0"
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </Form>
    </GridContainer>
  );
}

export default HomePage;
