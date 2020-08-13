import React from "react";
import { EuiSelectable, EuiFormRow } from "@elastic/eui";

function PlatformsFormRow(props) {
  return (
    <EuiFormRow label="Platforms">
      <EuiSelectable
        options={props.options}
        onChange={(newOptions) => {
          props.setOptions(newOptions);
        }}
      >
        {(list) => list}
      </EuiSelectable>
    </EuiFormRow>
  );
}

export default PlatformsFormRow;
