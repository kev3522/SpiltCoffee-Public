import React, { useState, Fragment } from "react";
import SingleSearch from "./SingleSearch";
import {
  EuiPage,
  EuiSpacer,
  EuiTextAlign,
  EuiText,
  EuiPageBody,
  EuiPageContent,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
  EuiButton,
  EuiTabbedContent,
} from "@elastic/eui";
import ComparisonGraph from "./ComparisonGraph";

function CompetitiveAnalysis() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const onFormButtonClick = () => setIsFormOpen(!isFormOpen);

  const formButton = (
    <EuiButton onClick={() => onFormButtonClick()}>Create Analysis</EuiButton>
  );

  const tabs = [
    {
      id: "historical",
      name: "Historical Trend Comparison",
      content: (
        <Fragment>
          <EuiSpacer size="l"></EuiSpacer>

          <EuiTitle size="m">
            <h2 className="bold-text">Select searches to compare...</h2>
          </EuiTitle>
          <EuiSpacer size="m"></EuiSpacer>
          <EuiSpacer size="s"></EuiSpacer>
          <EuiFlexGroup>
            <EuiFlexItem>
              <ComparisonGraph />
            </EuiFlexItem>
          </EuiFlexGroup>
        </Fragment>
      ),
    },
    {
      id: "side",
      name: "Side by Side Comparison",
      content: (
        <Fragment>
          <EuiSpacer size="l"></EuiSpacer>

          <EuiTitle size="m">
            <h2 className="bold-text">Select searches to compare...</h2>
          </EuiTitle>
          <EuiSpacer size="m"></EuiSpacer>

          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiPageBody>
                <SingleSearch />
              </EuiPageBody>
            </EuiFlexItem>
            <EuiFlexItem>
              <SingleSearch />
            </EuiFlexItem>
          </EuiFlexGroup>
        </Fragment>
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
                <h1>Competitive Analysis</h1>
              </EuiTitle>
            </EuiPageHeaderSection>
          </EuiPageHeader>
          <EuiPageContent>
            {renderTabs}
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

export default CompetitiveAnalysis;
