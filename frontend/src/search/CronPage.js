import React, { useState } from "react";
import {
  EuiForm,
  EuiFormRow,
  EuiDatePicker,
  EuiFieldText,
  EuiButton,
} from "@elastic/eui";
import moment from "moment";
import LocationFormRow from "./LocationFormRow";
import PlatformsFormRow from "./PlatformsFormRow";
import { platform_options } from "./platforms";
import axios from "axios";
import { api } from "../common/APIUtils";
import { useHistory } from "react-router-dom";
import auth0Client from "../auth/AuthService";
import {addToast} from '../home/App'

function CronPage(props) {
  const history = useHistory();
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState(platform_options);
  const [address, setAddress] = useState("San Francisco, CA");
  const [endDate, setEndDate] = useState(moment());

  const handleEndChange = (date) => {
    setEndDate(date);
  };
  const onQueryChange = (e) => {
    setQuery(e.target.value);
  };

  const onSubmit = () => {
    axios
      .post(
        `${api}/cron`,
        {
          query: query,
          enddate: endDate,
          location: address,
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
          props.onSchedule()
          showScheduleToast()
        },
        (error) => {
          console.log(error);
        }
      );
  };

  const showScheduleToast = () => {
    const toast = {
      title: 'Monitoring Scheduled!',
      color: 'success',
      text: (
        "Check in daily to see the progress!"
      )
    }
    addToast(toast)
  }

  return (
    <EuiForm>
      <EuiFormRow label="Query">
        <EuiFieldText value={query} onChange={(e) => onQueryChange(e)} />
      </EuiFormRow>
      <PlatformsFormRow options={options} setOptions={setOptions} />
      <LocationFormRow address={address} setAddress={setAddress} />
      <EuiFormRow label="Schedule End Date">
        <EuiDatePicker selected={endDate} onChange={handleEndChange} />
      </EuiFormRow>
      <EuiButton fullWidth onClick={onSubmit}>
        Submit
      </EuiButton>
    </EuiForm>
  );
}

export default CronPage;
