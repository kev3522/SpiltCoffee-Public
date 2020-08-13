import React from "react";
import { EuiFieldSearch, EuiFormRow } from "@elastic/eui";

function LocationFormRow(props) {
  return (
    <EuiFormRow grow={false} label="City, State, and/or Zipcode">
      <EuiFieldSearch
        value={props.address}
        onChange={(e) => props.setAddress(e.target.value)}
        compressed
      />
    </EuiFormRow>
  );
}

export default LocationFormRow;
