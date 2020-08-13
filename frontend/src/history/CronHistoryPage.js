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
  EuiLink,
  EuiIcon,
  EuiButtonEmpty,
  EuiButton,
  EuiPopover,
  EuiToolTip
} from "@elastic/eui";
import { Comparators } from "@elastic/eui/es/services/sort";
import axios from "axios";
import moment from "moment";
import { api } from "../common/APIUtils";
import Status from "../common/Status";
import { platform_options } from "../search/platforms";
import CronPage from "../search/CronPage";
import auth0Client from "../auth/AuthService";

function CronHistoryPage(props) {
  const history = useHistory();

  const [data, setData] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    const result = await axios.get(`${api}/cron`, {
      headers: {
        authorization: auth0Client.getAccessToken(),
      },
    });
    setData(result.data);
  };

  const deleteHandler = async (cronid) => {
    await axios.delete(`${api}/cron/${cronid}`, {
      headers: {
        authorization: auth0Client.getAccessToken(),
      },
    });
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        return obj["collectors"].split(",").map((x) => platform_options[x].prepend);
      },
    },
    {
      field: "enddate",
      name: "Monitor Until",
      width: "15%",
      render: (date) => {
        return moment(date).format("MMM DD YYYY");
      },
    },
    {
      field: "status",
      name: "Status",
      width: "10%",
      render: (status) => <Status status={status} isMonitoring={true} />,
    },
    {
      width: "5%",
      render: (obj) => {
        return (
          <EuiLink>
            <EuiIcon
              type="link"
              onClick={() => history.push(`/cronresults?cronid=${obj.id}`)}
            ></EuiIcon>
          </EuiLink>
        );
      },
    },
    {
      render: (obj) => {
        return (
          <EuiLink>
            <EuiIcon
              type="trash"
              color="danger"
              onClick={() => deleteHandler(obj.id)}
            />
          </EuiLink>
        );
      },
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
  const [isCronPopoverOpen, setIsCronPopoverOpen] = useState(false);
  const onCronButtonClick = () => {
    setIsCronPopoverOpen(!isCronPopoverOpen);
  };
  const closeCronPopover = () => setIsCronPopoverOpen(false);
  const buttonCron = (
    <EuiToolTip
      position="bottom"
      content={
        <p>
          Set up automatic daily collection of sentiments
        </p>
      }
    >
      <EuiButton onClick={onCronButtonClick}>New Monitoring Job</EuiButton>
    </EuiToolTip>
  );

  const onSchedule = () => {
    setIsCronPopoverOpen(false)
    fetchData()
  }
  
  const renderCron = (
    <EuiPopover
      button={buttonCron}
      isOpen={isCronPopoverOpen}
      closePopover={closeCronPopover}
    >
      <CronPage onSchedule={onSchedule}/>
    </EuiPopover>
  );

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
      />
    );
  };

  return (
    <div className="Page">
      <EuiPage>
        <EuiPageBody>
          <EuiPageHeader>
            <EuiPageHeaderSection>{renderCron}</EuiPageHeaderSection>
          </EuiPageHeader>
          <EuiPageContent>
            <EuiPageContentHeader>
              <EuiPageContentHeaderSection>
                <EuiButtonEmpty
                  size="s"
                  isLoading={isRefreshing}
                  iconType="refresh"
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

export default CronHistoryPage;
