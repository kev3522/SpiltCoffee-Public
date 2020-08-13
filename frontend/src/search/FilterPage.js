import React, { useState } from "react";
import {
  EuiForm,
  EuiFormRow,
  EuiDatePicker,
  EuiDatePickerRange,
  EuiFieldText,
  EuiButton,
} from "@elastic/eui";
import moment from "moment";
import PlatformsFormRow from "./PlatformsFormRow";
import { platform_options } from "./platforms";
import axios from "axios";
import { api } from "../common/APIUtils";
import auth0Client from "../auth/AuthService";

function FilterPage(props) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState(platform_options);
  const [address, setAddress] = useState("San Francisco, CA");
  const [startDate, setStartDate] = useState(moment());
  const [endDate, setEndDate] = useState(moment());
  const [overlayCronId, setOverlayCronId] = useState(0);

  const handleStartChange = (date) => {
    setStartDate(date);
  };
  const handleEndChange = (date) => {
    setEndDate(date);
  };
  const onQueryChange = (e) => {
    setQuery(e.target.value);
  };

  // const onOverlayCronIdChange = (e) => {
  //   setOverlayCronId(e.target.value)
  // }

  const onSubmit = () => {
    axios
      .post(
        `${api}/monitorsearchresult`,
        {
          query: query,
          startDate: startDate,
          endDate: endDate,
          location: address,
          options: options
            .filter((x) => x.checked === "on")
            .map((x) => x.label),
        },
        {
          headers: {
            authorization: auth0Client.getAccessToken(),
          },
        }
      )
      .then((res) => {
        props.onFilterSubmit(res.data["msearch_id"], overlayCronId);
      });
  };

  return (
    <EuiForm className="monitor-page">
      <EuiFormRow label="Query">
        <EuiFieldText
          compressed
          value={query}
          onChange={(e) => onQueryChange(e)}
        />
      </EuiFormRow>
      <PlatformsFormRow options={options} setOptions={setOptions} />
      <EuiFormRow label="Schedule Start/End Date">
        <EuiDatePickerRange
          startDateControl={
            <EuiDatePicker selected={startDate} onChange={handleStartChange} />
          }
          endDateControl={
            <EuiDatePicker selected={endDate} onChange={handleEndChange} />
          }
        />
      </EuiFormRow>
      <EuiButton fullWidth onClick={onSubmit}>
        Submit
      </EuiButton>
    </EuiForm>
  );
}

export default FilterPage;
