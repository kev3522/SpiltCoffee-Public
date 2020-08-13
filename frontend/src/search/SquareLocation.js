import React, { useState } from "react";

import { EuiSelect } from "@elastic/eui";

export default () => {
  const options = [
    { value: "option_one", text: "Option one" },
    { value: "option_two", text: "Option two" },
    { value: "option_three", text: "Option three" },
  ];

  const [location, setLocation] = useState(options[1].value);

  const onLocationChange = (e) => {
    setLocation(e.target.value);
  };

  return (
    /* DisplayToggles wrapper for Docs only */
    <EuiSelect
      id="selectDocExample"
      options={options}
      value={location}
      onChange={(e) => onLocationChange(e)}
      aria-label="Use aria labels when no actual label is in use"
    />
  );
};
