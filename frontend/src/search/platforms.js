import React from "react";
import { EuiIcon } from "@elastic/eui";

import twitterSvg from "../images/twitter.svg";
import yelpSvg from "../images/yelp.svg";
import redditSvg from "../images/reddit.svg";
import newsSvg from "../images/newspaper.svg";

export const platform_options = [
  {
    label: "Yelp",
    prepend: <EuiIcon key="yelp" type={yelpSvg} />,
    checked: "on",
  },
  {
    label: "Twitter",
    prepend: <EuiIcon key="twitter" type={twitterSvg} />,
    checked: "on",
  },
  {
    label: "News",
    prepend: <EuiIcon key="news" type={newsSvg} />,
    checked: "on",
  },
];
