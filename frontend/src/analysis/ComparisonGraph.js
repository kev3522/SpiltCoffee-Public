import React, { Fragment, useState, useEffect } from "react";
import {
  EuiSelectable,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiDatePickerRange,
  EuiDatePicker,
  EuiPage,
  EuiText,
  EuiTextColor,
  EuiHighlight,
} from "@elastic/eui";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { platforms } from "../common/Enums";
import {platform_options} from '../search/platforms'
import axios from "axios";
import { api } from "../common/APIUtils";
import moment from "moment";
import auth0Client from "../auth/AuthService";

function ComparisonGraph() {
  const [options, setOptions] = useState([]);
  const [graphPoints, setGraphPoints] = useState([]);
  const [startDate, setStartDate] = useState(moment().subtract(14, "days"));
  const [endDate, setEndDate] = useState(moment());
  const [graphKeys, setGraphKeys] = useState([]);
  const [platformOptions, setPlatformOptions] = useState(platform_options.map(x => x.prepend))
  let COLORS = new Map();

  useEffect(() => {
    fetchSearches();
    if (localStorage.colors) {
      COLORS = new Map(JSON.parse(localStorage.colors));
    }
  }, []);

  useEffect(() => {
    fetchGraphPoints();
  }, [startDate, endDate, options]);

  const generateColor = (key) => {
    if (localStorage.colors) {
      COLORS = new Map(JSON.parse(localStorage.colors));
    }

    if (!COLORS.get(key)) {
      // add color for this ID and push to local storage
      let randColor = "#" + Math.random().toString(16).substr(-6);
      COLORS.set(key, randColor);
      localStorage.colors = JSON.stringify(Array.from(COLORS.entries()));
    }

    return COLORS.get(key);
  };

  const fetchSearches = async () => {
    const result = await axios.get(`${api}/uniquesearch`, {
      headers: {
        authorization: auth0Client.getAccessToken(),
      },
    });
    let dataMapped = result.data.map((search) => {
      let icons = search.collectors
                  .split(",")
                  .map(idx => {
                    return platformOptions[idx]
                  })
      return {
        label: `${search.query}`,
        key: search.id.toString(),
        platformlist: search.collectors
          .split(",")
          .map((platformEnum) => platforms.reverse[parseInt(platformEnum)]),
        append: (<Fragment>{icons}</Fragment>),
        date: search.date
      }
    });
    let maxID;
    if (result.data.length > 0) {
      maxID = Math.max.apply(
        null,
        result.data.map((search) => search.id)
      );
      dataMapped.forEach((selection) => {
        if (selection.key === maxID.toString()) {
          selection["checked"] = "on";
        }
      });
    }
    if (result.data.length > 1) {
      const maxID2 = Math.max.apply(
        null,
        result.data
          .filter((search) => search.id != maxID)
          .map((search) => search.id)
      );
      dataMapped.forEach((selection) => {
        if (selection.key === maxID2.toString()) {
          selection["checked"] = "on";
        }
      });
    }
    setOptions(dataMapped);
  };

  const fetchGraphPoints = async () => {
    const result = await axios.post(
      `${api}/manygraphs`,
      {
        req_list: options
          .filter((option) => option.checked === "on")
          .map((option) => option.key),
        start: startDate,
        end: endDate,
      },
      {
        headers: {
          authorization: auth0Client.getAccessToken(),
        },
      }
    );
    result.data.forEach((point) => {
      point["time"] = point["time"].split("T")[0];
    });
    setGraphPoints(result.data);
    if (result.data.length > 0) {
      setGraphKeys(Object.keys(result.data[0]).filter((key) => key != "time"));
    } else if (result.data.length == 0) {
      setGraphKeys([])
    }
  };

  const renderSearchOption = (option, searchValue) => {
    return (<Fragment>
      <EuiHighlight search={searchValue}>{option.label}</EuiHighlight>
      <br />
      <EuiTextColor color="subdued">
        <small>Searched {option.date.split("T")[0]}</small>
      </EuiTextColor>
    </Fragment>)
  }
  
  const searchSelectProps = (
    {
      listProps: {
        rowHeight: 50,
      }
    }
  )

  const searchSelect = (
    <EuiSelectable
      options={options}
      onChange={(newOptions) => {
        setOptions(newOptions);
      }}
      renderOption={renderSearchOption}
      {...searchSelectProps}
    >
      {(list) => list}
    </EuiSelectable>
  );

  const dateSelect = (
    <EuiDatePickerRange
      startDateControl={
        <EuiDatePicker
          selected={startDate}
          onChange={(date) => {
            setStartDate(date);
          }}
        />
      }
      endDateControl={
        <EuiDatePicker
          selected={endDate}
          onChange={(date) => {
            setEndDate(date);
          }}
        />
      }
    />
  );

  const graph = (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={graphPoints}>
        <XAxis dataKey="time" />
        <YAxis type="number" domain={[-1, 1]} />
        {graphKeys.length > 0 && <Legend />}
        <Tooltip />
        {graphKeys.map((key) => {
          return (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              connectNulls={true}
              stroke={generateColor(key)}
              dot={false}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <Fragment>
      <EuiPage>
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            <EuiText>Query</EuiText>
            <EuiSpacer size="s"></EuiSpacer>
            {searchSelect}
            <EuiSpacer size="s"></EuiSpacer>
            {dateSelect}
            <EuiSpacer size="l"></EuiSpacer>
          </EuiFlexItem>
          <EuiFlexItem>{graph}</EuiFlexItem>
        </EuiFlexGroup>
      </EuiPage>
    </Fragment>
  );
}

export default ComparisonGraph;
