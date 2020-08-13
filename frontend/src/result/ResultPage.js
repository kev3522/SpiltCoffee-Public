import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  EuiBasicTable,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiLink,
  EuiPageContent,
  EuiPageContentBody,
  EuiStat,
  EuiPanel,
  EuiText,
  EuiTextAlign,
  EuiDescriptionList,
  EuiSpacer,
  EuiButtonEmpty,
} from "@elastic/eui";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";
import queryString from "query-string";
import axios from "axios";
import { api } from "../common/APIUtils";
import Status from "../common/Status";
import { platform_options } from "../search/platforms";
import auth0Client from "../auth/AuthService";

function ResultPage() {
  let params = queryString.parse(useLocation().search);
  const searchid = params.sid;

  const history = useHistory();

  const columns = [
    {
      field: 'date',
      name: 'Date',
      width: '10%',
      render: (date) => date.split("T")[0]
    },
    {
      field: "content",
      name: "Content",
      width: "65%",
    },
    {
      field: "compound",
      name: "Sentiment",
      width: "10%",
      render: (compound) => {
        let sentiment = "";
        let color = "";
        if (compound < -0.5) {
          sentiment = "Very Negative";
          color = "#ff6666";
        } else if (compound < 0) {
          sentiment = "Negative";
          color = "#ea9b95";
        } else if (compound === 0) {
          sentiment = "Neutral";
          color = "#c6c6c6";
        } else if (compound <= 0.5) {
          sentiment = "Positive";
          color = "#92bdaf";
        } else if (compound <= 1) {
          sentiment = "Very Positive";
          color = "#54B399";
        }
        return <p style={{ color: color }}>{`${sentiment}`}</p>;
      },
    },
    {
      field: "collector_type",
      name: "Platform",
      render: (type) => platform_options[type].prepend,
      width: "8%",
    },
    {
      name: "Score",
      render: (obj) => obj.compound,
    },
  ];

  const generateGraphData = (resultData) => {
    const graphData = [
      { x: "Very Negative", y: 0 },
      { x: "Negative", y: 0 },
      { x: "Neutral", y: 0 },
      { x: "Positive", y: 0 },
      { x: "Very Positive", y: 0 },
    ];
    resultData.forEach((x) => {
      if (x.compound < -0.5) graphData[0]["y"]++;
      else if (x.compound < 0) graphData[1]["y"]++;
      else if (x.compound === 0) graphData[2]["y"]++;
      else if (x.compound < 0.5) graphData[3]["y"]++;
      else if (x.compound <= 1.0) graphData[4]["y"]++;
    });
    return graphData;
  };

  const [data, setData] = useState([]);
  const [graphData, setGraphData] = useState(generateGraphData([]));
  const [searchMeta, setSearchMeta] = useState({});
  const [platformList, setPlatformList] = useState([]);
  const [statLoading, setStatLoading] = useState(true);
  const [negCount, setNegCount] = useState(0);
  const [neuCount, setNeuCount] = useState(0);
  const [posCount, setPosCount] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);

  const doCounts = (resultData) => {
    let negCount = 0;
    let neuCount = 0;
    let posCount = 0;
    resultData.forEach((x) => {
      if (x.compound < 0) negCount++;
      else if (x.compound === 0) neuCount++;
      else posCount++;
    });
    setNegCount(negCount);
    setNeuCount(neuCount);
    setPosCount(posCount);
  };

  const fetchData = async () => {
    const result = await axios.get(`${api}/analysis/${searchid}`, {
      headers: {
        authorization: auth0Client.getAccessToken(),
      },
    });
    doCounts(result.data);
    setData(result.data);
    if (result.data.length > 0) setStatLoading(false);
    setGraphData(generateGraphData(result.data));
  };

  const [extremePos, setExtremePos] = useState([]);
  const [extremeNeg, setExtremeNeg] = useState([]);
  const fetchExtremes = async () => {
    const pos = await axios.get(`${api}/posanalysis/${searchid}`, {
      headers: {
        authorization: auth0Client.getAccessToken(),
      },
    });
    setExtremePos(pos.data);
    const neg = await axios.get(`${api}/neganalysis/${searchid}`, {
      headers: {
        authorization: auth0Client.getAccessToken(),
      },
    });
    setExtremeNeg(neg.data);
  };

  const fetchSearchInfo = async () => {
    const result = await axios.get(`${api}/search/${searchid}`, {
      headers: {
        authorization: auth0Client.getAccessToken(),
      },
    });
    setSearchMeta(result.data);
    setPlatformList(result.data.collectors.split(","));
  };

  useEffect(() => {
    fetchSearchInfo();
    fetchData();
    fetchExtremes();
  }, []);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(7);

  const totalItemCount = data.length;

  const pagination = {
    pageIndex,
    pageSize,
    totalItemCount,
    hidePerPageOptions: true,
  };

  const onTableChange = ({ page = {} }) => {
    const { index: pageIndex, size: pageSize } = page;

    setPageIndex(pageIndex);
    setPageSize(pageSize);
  };

  const getPageItems = () => {
    return data.slice(pageSize * pageIndex, pageSize * (pageIndex + 1));
  };

  const refreshHandler = () => {
    setIsDisabled(true);
    fetchSearchInfo();
    fetchData();
    fetchExtremes();
    setTimeout(function () {
      setIsDisabled(false);
    }, 2000);
  };

  const backHandler = () => {
    history.goBack();
  };

  const deleteHandler = async () => {
    await axios.delete(`${api}/search/${searchid}`);
    history.push("/history");
  };

  const computePercentage = (n, len) => {
    return ((n / len) * 100).toFixed(2);
  };

  const statsBar = (
    <EuiFlexGroup>
      <EuiFlexItem>
        <EuiPanel>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiStat title={data.length} description="Posts Analyzed" />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                title={`${computePercentage(negCount, data.length)}%`}
                description="Negative Sentiment"
                titleColor="danger"
                isLoading={statLoading}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                title={`${computePercentage(neuCount, data.length)}%`}
                description="Neutral Sentiment"
                titleColor="subdued"
                isLoading={statLoading}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                title={`${computePercentage(posCount, data.length)}%`}
                description="Positive Sentiment"
                titleColor="secondary"
                isLoading={statLoading}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  const colors = ["#ff6666", "#ea9b95", "#c6c6c6", "#92bdaf", "#54b399"];

  const platformDisplay = (
    <EuiFlexGroup>
      {platformList.map((x) => {
        return <EuiFlexItem>{platform_options[x].prepend}</EuiFlexItem>;
      })}
    </EuiFlexGroup>
  );
  const renderBarChart = (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={graphData} barSize={100}>
        <Bar type="monotone" dataKey="y">
          {[0,1,2,3,4].map(index => {
            return (
            <Cell key={`cell-${index}`} fill={colors[index]} />
          )})}
        </Bar>
        {/* <Bar type="monotone" dataKey="y" fill="#8884d8" /> */}
        {/* <CartesianGrid strokeDasharray="3 3"/> */}
        <XAxis dataKey="x" />
        <YAxis />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="Page">
      <EuiPage>
        <EuiPageBody>
          <EuiPageHeader>
            <EuiPageHeaderSection>
              <EuiTitle size="l">
                <h1>
                  Results for '{searchMeta.query}' at '{searchMeta.loc}'
                </h1>
              </EuiTitle>
            </EuiPageHeaderSection>
            <EuiPageHeaderSection>
              <EuiFlexGroup>
                <EuiFlexItem>{platformDisplay}</EuiFlexItem>
                <EuiFlexItem>
                  <Status status={searchMeta.status} />
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiLink onClick={backHandler}>Back</EuiLink>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiLink onClick={refreshHandler} disabled={isDisabled}>
                    Refresh
                  </EuiLink>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiLink color="danger" onClick={deleteHandler}>
                    Delete
                  </EuiLink>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiPageHeaderSection>
          </EuiPageHeader>
          <EuiPageContent>
            <EuiPageContentBody>
              {statsBar}
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiPanel>
                    <EuiTitle>
                      <h4>Sentiment Distribution</h4>
                    </EuiTitle>
                    {renderBarChart}
                  </EuiPanel>
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiPanel>
                    <EuiBasicTable
                      items={getPageItems()}
                      columns={columns}
                      pagination={pagination}
                      onChange={onTableChange}
                    />
                  </EuiPanel>
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiPanel>
                    <EuiTitle>
                      <h4 className="negative-color">Very Negative</h4>
                    </EuiTitle>
                    <EuiSpacer size="m" />
                    <EuiDescriptionList
                      listItems={extremeNeg.map((x) => {
                        return { description: x.content };
                      })}
                    />
                  </EuiPanel>
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiPanel>
                    <EuiTitle>
                      <h4 className="positive-color">Very Positive</h4>
                    </EuiTitle>
                    <EuiSpacer size="m" />
                    <EuiDescriptionList
                      listItems={extremePos.map((x) => {
                        return { description: x.content };
                      })}
                    />
                  </EuiPanel>{" "}
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiPageContentBody>
            <EuiSpacer size="l" />
            <EuiText size="s">
              <EuiTextAlign textAlign="center">
                <strong>
                  Powered by{" "}
                  <a target="_blank" href="https://wit.ai/">
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

export default ResultPage;
