import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  EuiPage,
  EuiBasicTable,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiPageContentBody,
  EuiTitle,
  EuiButtonEmpty,
  EuiFlexItem,
} from "@elastic/eui";
import { Comparators } from "@elastic/eui/es/services/sort";
import axios from "axios";
import moment from "moment";
import { api } from "../common/APIUtils";
import Status from "../common/Status";
import { platform_options } from "../search/platforms";
import auth0Client from "../auth/AuthService";

function HistoryPage() {
  const history = useHistory();

  const [data, setData] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    const result = await axios.get(`${api}/search`, {
      headers: {
        authorization: auth0Client.getAccessToken(),
      },
    });
    setData(result.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // TABLE
  const columns = [
    {
      field: "id",
      name: "ID",
      width: "5%",
    },
    {
      field: "query",
      name: "Query",
      width: "25%",
    },
    {
      field: "loc",
      name: "Location",
      width: "15%",
    },
    {
      name: "Platforms",
      width: "10%",
      render: (obj) => {
        try {
          return obj.collectors
            .split(",")
            .map((x) => platform_options[parseInt(x)].prepend);
        } catch {
          return;
        }
      },
    },
    {
      field: "date",
      name: "Date Searched",
      width: "15%",
      render: (date) => {
        return moment(date).format("hh:mma, MMM DD YYYY");
      },
    },
    {
      field: "status",
      name: "Status",
      width: "15%",
      render: (status) => <Status status={status} />,
    },
  ];

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

  const totalItemCount = data.length;

  const getRowProps = (item) => {
    const { id } = item;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => {
        history.push(`results?sid=${id}`);
      },
    };
  };

  const pagination = {
    pageIndex,
    pageSize,
    totalItemCount,
    pageSizeOptions: [5, 15, 50],
  };

  const sorting = {
    sort: {
      field: sortField,
      direction: sortDirection,
    },
    enableAllColumns: true,
  };

  const onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    const { field: sortField, direction: sortDirection } = sort;

    setPageIndex(pageIndex);
    setPageSize(pageSize);
    setSortField(sortField);
    setSortDirection(sortDirection);
  };

  const getPageItems = () => {
    return data
      .slice(0)
      .sort(Comparators.property(sortField, Comparators.default(sortDirection)))
      .slice(pageSize * pageIndex, pageSize * (pageIndex + 1));
  };

  const deleteHandler = async (searchid) => {
    await axios.delete(`${api}/search/${searchid}`);
    fetchData();
  };

  const refreshHandler = () => {
    setIsRefreshing(true);
    fetchData();
    setTimeout(function () {
      setIsRefreshing(false);
    }, 2000);
  };

  const renderTable = () => {
    return (
      <EuiBasicTable
        items={getPageItems()}
        columns={columns}
        pagination={pagination}
        sorting={sorting}
        onChange={onTableChange}
        rowProps={getRowProps}
      />
    );
  };

  // Render
  return (
    <div className="Page">
      <EuiPage>
        <EuiPageBody>
          <EuiPageHeader>
            <EuiPageHeaderSection>
              <EuiFlexItem>
                <EuiTitle size="l">
                  <h1 className="heading-text">Search History</h1>
                </EuiTitle>
              </EuiFlexItem>
            </EuiPageHeaderSection>
          </EuiPageHeader>
          <EuiPageContent>
            <EuiPageContentHeader>
              <EuiPageContentHeaderSection>
                <EuiButtonEmpty
                  size="s"
                  iconType="refresh"
                  isLoading={isRefreshing}
                  onClick={refreshHandler}
                >
                  Refresh
                </EuiButtonEmpty>
              </EuiPageContentHeaderSection>
            </EuiPageContentHeader>
            <EuiPageContentBody>{renderTable()}</EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    </div>
  );
}

export default HistoryPage;
