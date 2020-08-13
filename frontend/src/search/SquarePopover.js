import React, { useState } from "react";
import {
  EuiForm,
  EuiFormRow,
  EuiDatePicker,
  EuiFieldText,
  EuiButton,
  EuiSelect,
  EuiSpacer,
  EuiText,
  EuiTextAlign,
} from "@elastic/eui";
import moment from "moment";
import PlatformsFormRow from "./PlatformsFormRow";
import { platform_options } from "./platforms";
import axios from "axios";
import { api } from "../common/APIUtils";
import { useHistory } from "react-router-dom";
import auth0Client from "../auth/AuthService";

function CronPage() {
  const authObject = auth0Client.getProfile();
  const location_arr = authObject["https://spiltcoffee.com/location"];
  const name_arr = authObject["https://spiltcoffee.com/business"];

  const history = useHistory();
  const [options, setOptions] = useState(platform_options);
  const [endDate, setEndDate] = useState(moment());

  const handleEndChange = (date) => {
    setEndDate(date);
  };

  const BUSINESS_NAME = name_arr[0];

  const location_options = [];
  try {
    location_arr.map((add) => {
      const address =
        add["address_line_1"] +
        ", " +
        add["locality"] +
        ", " +
        add["administrative_district_level_1"] +
        " " +
        add["postal_code"];
      location_options.push({ text: address });
    });
  } catch (error) {
    location_options.push("Please update locations in Square");
  }

  const [location, setLocation] = useState(location_options[0].text);

  const onLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const onSubmit = () => {
    axios
      .post(
        `${api}/cron`,
        {
          query: BUSINESS_NAME,
          enddate: endDate,
          location: location,
          sources: options
            .filter((x) => x.checked === "on")
            .map((x) => x.label),
        },
        {
          headers: {
            authorization: auth0Client.getAccessToken(),
          },
        }
      )
      .then(
        (response) => {
          history.push('/')
          history.push({ pathname: "/monitoring" });
        },
        (error) => {
          console.log(error);
        }
      );
  };

  return (
    <EuiForm>
      <EuiFormRow label="Query">
        <EuiFieldText readOnly placeholder={BUSINESS_NAME} />
      </EuiFormRow>
      <EuiFormRow label="Location">
        <EuiSelect
          options={location_options}
          value={location}
          onChange={(e) => onLocationChange(e)}
        />
      </EuiFormRow>

      <PlatformsFormRow options={options} setOptions={setOptions} />
      <EuiFormRow label="Schedule End Date">
        <EuiDatePicker selected={endDate} onChange={handleEndChange} />
      </EuiFormRow>
      <EuiButton fullWidth onClick={onSubmit}>
        Submit
      </EuiButton>
      <EuiSpacer size="m" />
      <EuiText size="xs">
        <EuiTextAlign textAlign="center">
          <strong>
            Powered by{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://squareup.com/us/en"
            >
              Square
            </a>
            .
          </strong>
        </EuiTextAlign>
      </EuiText>
    </EuiForm>
  );
}

export default CronPage;
