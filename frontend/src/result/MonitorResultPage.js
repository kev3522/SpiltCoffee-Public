import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPage,
  EuiPageBody,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiPageContent,
  EuiPageContentBody,
} from "@elastic/eui";

function ResultPage(props) {
  return (
    <div className="Page">
      <EuiPage>
        <EuiPageBody>
          <EuiPageContent>
            <EuiPageContentHeader>
              <EuiPageContentHeaderSection>
                <EuiTitle>
                  <h1>
                    Results for '{props.query}' for platforms: '
                    {props.platstring}'
                  </h1>
                </EuiTitle>
              </EuiPageContentHeaderSection>
            </EuiPageContentHeader>
            <EuiPageContentBody>
              <EuiFlexGroup>
                <EuiFlexItem>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={props.data}>
                      <XAxis dataKey="time" />
                      <YAxis type="number" domain={[-1, 1]} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Yelp score"
                        connectNulls={true}
                        stroke="#FF3333"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="Twitter score"
                        connectNulls={true}
                        stroke="#33CEFF"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="cron score"
                        stroke="#FFFFFF"
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    </div>
  );
}

export default ResultPage;
