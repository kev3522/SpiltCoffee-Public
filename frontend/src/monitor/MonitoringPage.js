import React, { useState, useEffect, Fragment } from "react";
import {
  EuiTabbedContent,
  EuiFormRow,
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiPageContent,
  EuiPageContentBody,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiSpacer,
  EuiText,
  EuiTextAlign,
  EuiFieldText,
  EuiDatePicker,
  EuiDatePickerRange,
  EuiButton,
  EuiSuperSelect,
  EuiPopover,
  EuiToolTip
} from "@elastic/eui";
import CronHistoryPage from "../history/CronHistoryPage";
import PlatformsFormRow from "../search/PlatformsFormRow";
import Status from "../common/Status";
import auth0Client from "../auth/AuthService";
import { platform_options } from "../search/platforms";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import moment from "moment";
import axios from "axios";
import { api } from "../common/APIUtils";

const strokeMap = {
  'Yelp': "#FF3333",
  'Twitter': "#33CEFF",
  'News': "#FFF333",
  'cron': "#FFFFFF"
}

function MonitoringPage() {
  useEffect(() => {
    fetchCronJobs();
    fetchQueryList()
  }, []);

  const [pastAggData, setPastAggData] = useState([]);
  const [cronData, setCronData] = useState([]);
  const [platformList, setPlatformList] = useState([])

  const [cronid, setCronid] = useState(-1);
  const [showOverlay, setShowOverlay] = useState(false);

  const fetchQueryList = async () => {
    const result = await axios.get(`${api}/querylist`, {
      headers: {
        authorization: auth0Client.getAccessToken()
      }
    })
    let list = result.data.map((item) => {
      return {
        value: item.query,
        inputDisplay:
          <EuiFlexGroup>
            <EuiFlexItem>{item.query}</EuiFlexItem>
          </EuiFlexGroup>
        }
    })
    setQueryOptions(list)
  }

  const fetchPastAggData = async () => {
    const result = await axios.post(`${api}/historicalanalysis`, {
      query: query,
      start: startDate,
      end: endDate,
      platforms: options
                  .filter((x) => x.checked === "on")
                  .map((x) => x.label),
    },
    {
      headers: {
        authorization: auth0Client.getAccessToken()
      }
    })
    result.data["results"].forEach(point => {
      point['time'] = point['time'].split("T")[0]
    })
    setPastAggData(result.data["results"]);
    setPlatformList(result.data['platforms'])
  };

  const fetchSuperimposition = async () => {
    const result = await axios.post(`${api}/superimposedanalysis`, {
      query: query,
      start: startDate,
      end: endDate,
      platforms: options
                  .filter((x) => x.checked === "on")
                  .map((x) => x.label),
      cron: cronid
    },
    {
      headers: {
        authorization: auth0Client.getAccessToken(),
      },
    });
    setShowOverlay(true);
    result.data.forEach(point => {
      point['time'] = point['time'].split('T')[0]
    })
    setCronData(result.data);
  };

  const fetchCronJobs = async () => {
    const result = await axios.get(`${api}/cron`, {
      headers: {
        authorization: auth0Client.getAccessToken(),
      },
    });
    setCronOptions(
      result.data.map((cronobj) => {
        return {
          value: cronobj.id,
          inputDisplay: (
            <EuiFlexGroup>
              <EuiFlexItem>{cronobj.query}</EuiFlexItem>
              <EuiFlexItem>Start: {cronobj.startdate}</EuiFlexItem>
              <EuiFlexItem>End: {cronobj.enddate}</EuiFlexItem>
              <EuiFlexItem>
                <Status isMonitoring status={cronobj.status} />
              </EuiFlexItem>
            </EuiFlexGroup>
          ),
        };
      })
    );
  };

  const [query, setQuery] = useState("");
  const [startDate, setStartDate] = useState(moment().subtract(14, "days"));
  const [endDate, setEndDate] = useState(moment());
  const [options, setOptions] = useState(platform_options);
  const [location, setLocation] = useState("");
  const [queryOptions, setQueryOptions] = useState([])

  const handleStartChange = (date) => {
    setStartDate(date);
  };
  const handleEndChange = (date) => {
    setEndDate(date);
  };


  const onAnalysisSubmit = () => {
    fetchPastAggData()
    if (cronid > 0) {
      fetchSuperimposition(0, cronid);
    }
    setIsFormOpen(false);
  };

  const [cronOptions, setCronOptions] = useState([]);

  const cronDropdownList = (
    <EuiSuperSelect
      fullWidth
      options={cronOptions}
      valueOfSelected={cronid}
      onChange={(selectedCron) => setCronid(selectedCron)}
    />
  );

  const queryDropdownList = (
    <EuiSuperSelect
      options={queryOptions}
      valueOfSelected={query}
      onChange={(chosenQuery) => setQuery(chosenQuery)}
    />
  )

  const analysisForm = (
    <Fragment>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiFormRow label="Query">
            {queryDropdownList}
          </EuiFormRow>

        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow label="Schedule Start/End Date">
            <EuiDatePickerRange
              startDateControl={
                <EuiDatePicker
                  selected={startDate}
                  onChange={handleStartChange}
                />
              }
              endDateControl={
                <EuiDatePicker selected={endDate} onChange={handleEndChange} />
              }
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiFormRow fullWidth label="Overlay Monitoring Jobs">
            {cronDropdownList}
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup>
        <EuiFlexItem>
          <PlatformsFormRow options={options} setOptions={setOptions} />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup>
        <EuiFlexItem></EuiFlexItem>
        <EuiFlexItem>
          <EuiButton onClick={onAnalysisSubmit}>Submit</EuiButton>
        </EuiFlexItem>
        <EuiFlexItem></EuiFlexItem>
      </EuiFlexGroup>
    </Fragment>
  );

  const historicalChart = (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={pastAggData}>
        <XAxis dataKey="time" />
        <YAxis type="number" domain={[-1, 1]} />
        <Legend />
        <Tooltip />
        {platformList.map(platform => {
          return <Line
                    key={platform}
                    type="monotone"
                    dataKey={`${query} (${platform})`}
                    connectNulls={true}
                    stroke={strokeMap[platform] || '#FFFFFF'}
                    dot={false}
                  />
        })}
      </LineChart>
    </ResponsiveContainer>
  );

  const superimposedChart = (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={cronData}>
        <XAxis dataKey="time" />
        <YAxis type="number" domain={[-1, 1]} />
        <Legend />
        <Tooltip />
        {platformList.map(platform => {
          return <Line
                    key={platform}
                    type="monotone"
                    dataKey={`${platform}`}
                    connectNulls={true}
                    stroke={strokeMap[platform] || '#FFFFFF'}
                    dot={false}
                  />
        })}
        {cronid > 0 &&
          <Line
            type="monotone"
            dataKey="Monitor"
            stroke={strokeMap['cron']}
            strokeDasharray="5 5"
            dot={false}
          />
        }
      </LineChart>
    </ResponsiveContainer>
  );

  const renderAnalysisChart = () => {
    if (pastAggData.length == 0) return
    if (showOverlay) {
      return (
        <EuiPageContent>
          <EuiPageContentBody>
            <EuiTitle>
              <h4>Analysis Chart</h4>
            </EuiTitle>
            <EuiSpacer />
            <EuiButton size="s" onClick={() => setShowOverlay(!showOverlay)}>
              Toggle Monitoring Overlay
            </EuiButton>
            <EuiSpacer />
            {superimposedChart}
          </EuiPageContentBody>
        </EuiPageContent>
      );
    } else {
      return (
        <EuiPageContent>
          <EuiPageContentBody>
            <EuiTitle>
              <h4>Analysis Chart</h4>
            </EuiTitle>
            <EuiSpacer />
            <EuiButton size="s" onClick={() => setShowOverlay(!showOverlay)}>
              Toggle Monitoring Overlay
            </EuiButton>
            <EuiSpacer />
            {historicalChart}
          </EuiPageContentBody>
        </EuiPageContent>
      );
    }
  };

  const formButton = (
    <EuiToolTip
      position="bottom"
      content={
        <p>
          Graph past sentiment trends and compare with results from a currently
          running monitoring job.
        </p>
      }
    >
      <EuiButton onClick={() => onFormButtonClick()}>Create Analysis</EuiButton>
    </EuiToolTip>
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const onFormButtonClick = () => setIsFormOpen(!isFormOpen);

  const tabs = [
    {
      id: "jobs",
      name: "Scheduled Jobs",
      content: <CronHistoryPage />,
    },
    {
      id: "hist",
      name: "Historical Analysis",
      content: (
        <EuiPage>
          <EuiPageBody>
            <EuiPageHeader>
              <EuiPageHeaderSection>
                <EuiPopover
                  button={formButton}
                  isOpen={isFormOpen}
                  closePopover={() => setIsFormOpen(false)}
                >
                  {analysisForm}
                </EuiPopover>
              </EuiPageHeaderSection>
            </EuiPageHeader>
            {renderAnalysisChart()}
          </EuiPageBody>
        </EuiPage>
      ),
    },

  ];

  const renderTabs = (
    <EuiTabbedContent tabs={tabs} initialSelectedTab={tabs[0]} />
  );

  return (
    <div className="Page">
      <EuiPage>
        <EuiPageBody>
          <EuiPageHeader>
            <EuiPageHeaderSection>
              <EuiTitle size="l">
                <h1>Monitoring Tools</h1>
              </EuiTitle>
            </EuiPageHeaderSection>
          </EuiPageHeader>
          <EuiPageContent>
            <EuiPageContentBody>{renderTabs}</EuiPageContentBody>
            <EuiSpacer size="l" />
            <EuiText size="s">
              <EuiTextAlign textAlign="center">
                <strong>
                  Powered by{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://wit.ai/"
                  >
                    wit.ai
                  </a>
                  .
                </strong>
              </EuiTextAlign>
            </EuiText>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    </div>
  );
}

export default MonitoringPage;
