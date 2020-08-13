import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  EuiPage,
  EuiBasicTable,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiPageContentBody,
  EuiButtonEmpty,
} from "@elastic/eui";
import { Comparators } from "@elastic/eui/es/services/sort";
import axios from "axios";
import moment from "moment";
import { api } from "../common/APIUtils";
import Status from "../common/Status";
import { platform_options } from "../search/platforms";
import auth0Client from "../auth/AuthService";
import SingleResult from "./SingleResult";

function SingleSearch() {
  const [data, setData] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [id, setId] = useState(-1);

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
      field: "query",
      name: "Query",
      width: "25%",
    },
    {
      field: "loc",
      name: "Location",
      width: "20%",
    },
    {
      name: "Platforms",
      width: "10%",
      render: (obj) => {
        try {
          return obj.platforms
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
      width: "25%",
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

  const refreshHandler = () => {
    setIsRefreshing(true);
    fetchData();
    setTimeout(function () {
      setIsRefreshing(false);
    }, 2000);
  };

  const getRowProps = (item) => {
    const { id } = item;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => setId(id),
    };
  };

  //   useEffect(() => {
  //     document.title = `You clicked ${count} times`;
  //   }, [id]);

  const renderPage = () => {
    if (id < 0) {
      return renderTable();
    } else {
      return renderSearchResult(id);
    }
  };

  const backHandler = () => {
    setId(-1);
  };

  const renderSearchResult = (id) => {
    return <SingleResult id={id} backHandler={backHandler} />;
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
            <EuiPageContentBody>{renderPage()}</EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    </div>
  );
}

export default SingleSearch;
