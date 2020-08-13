import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  EuiPanel,
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
  EuiTreeView,
  EuiIcon,
} from "@elastic/eui";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import queryString from "query-string";
import axios from "axios";
import { api } from "../common/APIUtils";
import Status from "../common/Status";
import { platform_options } from "../search/platforms";
import auth0Client from "../auth/AuthService";

function CronResultPage(props) {
  let params = queryString.parse(useLocation().search);
  const cronid = params.cronid;

  const history = useHistory();

  const [data, setData] = useState({ related: [], graphdata: [] });
  const [collectors, setCollectors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios.get(`${api}/cron/${cronid}`, {
        headers: {
          authorization: auth0Client.getAccessToken(),
        },
      });
      setData(result.data);
      setCollectors(result.data.collectors.split(","));
    };

    fetchData();
  }, []);

  // const backHandler = () => {
  //   history.goBack()
  // }

  const deleteHandler = async () => {
    await axios.delete(`${api}/cron/${cronid}`);
    history.push("/history");
  };

  const platformDisplay = (
    <EuiFlexGroup>
      {collectors.map((x) => {
        return <EuiFlexItem>{platform_options[x].prepend}</EuiFlexItem>;
      })}
    </EuiFlexGroup>
  );

  const renderLineChart = (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart width={730} height={250} data={data.graphdata}>
        <XAxis dataKey="x" />
        <YAxis domain={[-1, 1]} />
        <Line type="monotone" dataKey="y" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );

  const relatedItems = [
    {
      label: "Related Searches",
      icon: <EuiIcon type="folderClosed" />,
      iconWhenExpanded: <EuiIcon type="folderOpen" />,
      isExpanded: false,
      children: data.related.map((sid) => {
        return { label: `Search ${sid}` };
      }),
    },
  ];

  const renderRelatedTree = <EuiTreeView items={relatedItems} />;

  return (
    <div className="Page">
      <EuiPage>
        <EuiPageBody>
          <EuiPageHeader>
            <EuiPageHeaderSection>
              <EuiTitle size="l">
                <h1>
                  Monitoring for '{data.query}' at '{data.loc}'
                </h1>
              </EuiTitle>
            </EuiPageHeaderSection>
            <EuiPageHeaderSection>
              <EuiFlexGroup>
                <EuiFlexItem>{platformDisplay}</EuiFlexItem>
                <EuiFlexItem>
                  <Status status={data.status} isMonitoring={true} />
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
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiPanel>
                    <EuiTitle>
                      <h1>Sentiment Trend</h1>
                    </EuiTitle>
                    {renderLineChart}
                  </EuiPanel>
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiFlexGroup>
                <EuiFlexItem>{renderRelatedTree}</EuiFlexItem>
              </EuiFlexGroup>
            </EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    </div>
  );
}

export default CronResultPage;
