import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { platform_options } from "./platforms";
import {
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiButtonEmpty,
  EuiPopover,
  EuiSpacer,
  EuiContextMenu,
  EuiIcon,
  EuiFormRow,
  EuiSelectable,
  EuiSuggest,
  EuiToolTip
} from "@elastic/eui";
import axios from "axios";
import { api } from "../common/APIUtils";
import { search_statuses } from "../common/Enums";
import { ReactComponent as MainLogo } from "../images/spilt_coffee.svg";
import auth0Client from "../auth/AuthService";
import { addToast } from "../home/App";
import twitterSvg from "../images/twitter.svg";
import yelpSvg from "../images/yelp.svg";
import newsSvg from "../images/newspaper.svg";
import {v4 as uuid} from "uuid";

function loadScript(src, position, id) {
  if (!position) {
    return;
  }

  const script = document.createElement("script");
  script.setAttribute("async", "");
  script.setAttribute("id", id);
  script.src = src;
  position.appendChild(script);
}

function SearchPage() {
  const history = useHistory();

  const [isLoading, setIsLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isLocationsOpen, setIsLocationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAddress = () => {
    if (localStorage.address) {
      return JSON.parse(localStorage.address);
    }
    return "San Francisco, CA";
  };

  const fetchLat = () => {
    if (localStorage.lat) {
      return JSON.parse(localStorage.lat);
    }
    return 37.7749; //lat for sf
  };
  const fetchLng = () => {
    if (localStorage.lng) {
      return JSON.parse(localStorage.lng);
    }
    return 122.4194; //lng for sf
  };

  const fetchSources = () => {
    if (localStorage.sources) {
      return JSON.parse(localStorage.sources);
    }
    return platform_options;
  };
  const [options, setOptions] = useState(platform_options);
  const [locOptions, setLocOptions] = React.useState([]);
  const [locValue, setLocValue] = useState(fetchAddress());

  useEffect(() => {
    if (locValue === "") {
      setLocValue("San Francisco, CA");
    }
  }, []);

  useEffect(() => {
    localStorage.address = JSON.stringify(locValue);
  }, [locValue]);

  useEffect(() => {
    localStorage.sources = JSON.stringify(Array.from(options));
  }, [options]);

  const openPopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  const [session, setSession] = useState(null);

  const [searchOptions, setSearchOptions] = React.useState([]);
  const [status, setStatus] = useState("unchanged");
  const [mapping, setMapping] = useState([]);
  const [lat, setLat] = useState(fetchLat); //lat of sf
  const [lng, setLng] = useState(fetchLng); //lng of sf

  useEffect(() => {
    localStorage.lat = JSON.stringify(lat);
  }, [lat]);

  useEffect(() => {
    localStorage.lng = JSON.stringify(lng);
  }, [lng]);

  const fetchCoords = async (loc) => {
    const coords = await axios.post(`${api}/convertloc`, {
      loc: loc,
      session: session,
    });
    setLat(coords["data"]["lat"]);
    setLng(coords["data"]["lng"]);
  };

  const fetchAutocompleteInfo = async (query) => {
    const suggestions = await axios.post(`${api}/autocomplete`, {
      query: query,
      lat: lat,
      lng: lng,
      session: session,
    });
    setMapping(suggestions["data"]);
    // setSearchOptions(suggestions["data"].map(x => Object.keys(x)[0]));
    setSearchOptions(Object.keys(suggestions["data"]));
    // console.log(searchOptions);
    // setSearchOptions((searchOptions) => [
    //   ...searchOptions,
    //   "powered by Google",
    // ]);
  };
  const fetchLocation = async (query) => {
    const suggestions = await axios.post(`${api}/autocompleteloc`, {
      query: query,
      session: session,
    });
    setLocOptions(suggestions["data"]);
  };

  const triggerPopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  const triggerLocation = () => {
    setIsLocationsOpen(!isLocationsOpen);
  };

  const closeLocation = () => {
    setIsLocationsOpen(false);
  };

  const goToSearchResult = () => {
    if (locValue === "") {
      setLocValue("San Francisco, CA");
    }
    if (searchQuery.length === 0) return;
    setIsLoading(true);
    setStatus("loading");
    axios
      .post(
        `${api}/search`,
        {
          query: searchQuery,
          sources: options
            .filter((x) => x.checked === "on")
            .map((x) => x.label),
          location: locValue,
        },
        {
          headers: {
            authorization: auth0Client.getAccessToken(),
          },
        }
      )
      .then((res) => {
        if (res.data["status"] === search_statuses["COMPLETED"]) {
          showSearchCompleteToast(res.data["search_id"]);
        }
        if (res.data["status"] === search_statuses["NOTFOUND"]) {
          showFailedSearchToast();
        }
        setIsLoading(false);
        setStatus("unchanged");
      })
      .catch((err) => {
        console.log(err);
      });
    showSearchWaitingToast();
  };

  const showFailedSearchToast = () => {
    const toast = {
      title: "No results found!",
      color: "danger",
    };
    addToast(toast);
  };

  const showSearchWaitingToast = () => {
    const toast = {
      title: "Spilling the Coffee",
      color: "warning",
      text: (
        <>
          <p>
            We're completing your search, we'll notify you when it's done! Feel
            free to browse your search history while you wait.
          </p>
          <EuiButtonEmpty onClick={() => history.push("/history")}>
            Go To Search History
          </EuiButtonEmpty>
        </>
      ),
    };
    addToast(toast);
  };

  const goToResults = (search_id) => {
    if (history.location.pathname === "/") {
      history.push(`/results?sid=${search_id}`);
    }
  };

  const showSearchCompleteToast = (search_id) => {
    const toast = {
      title: "Search Complete!",
      color: "success",
      text: (
        <>
          <EuiButtonEmpty
            onClick={() => history.push(`/results?sid=${search_id}`)}
          >
            Go To Results
            {goToResults(search_id)}
          </EuiButtonEmpty>
        </>
      ),
    };
    addToast(toast);
  };

  const renderOptions = () => {
    let selected = [];
    options.map((op) => {
      if (op.checked) {
        selected.push(op.label);
      }
    });
    return (
      <>
        <span className="icon-left"></span>
        {selected.includes("Yelp") ? (
          <span className="icon-margin ">
            <EuiIcon type={yelpSvg} />
          </span>
        ) : null}
        {selected.includes("Twitter") ? (
          <span className="icon-margin">
            {" "}
            <EuiIcon type={twitterSvg} />{" "}
          </span>
        ) : null}
        {selected.includes("News") ? (
          <span className="icon-margin ">
            <EuiIcon type={newsSvg} />
          </span>
        ) : null}
      </>
    );
  };

  const platformBtn = (
    <EuiToolTip
      position="bottom"
      content={
        <p>
          Platforms to collect sentiment from
        </p>
      }
    >
      <EuiButtonEmpty
        // color="warning"
        iconType="arrowDown"
        iconSide="left"
        onClick={openPopover}
        // onMouseEnter={openPopover}
        // onMouseLeave={openPopover}
        className="accent-text"
      >
        On {renderOptions()}
      </EuiButtonEmpty>
    </EuiToolTip>
  );

  const locationBtn = (
    <EuiButtonEmpty
      // color="warning"
      iconType="arrowDown"
      iconSide="left"
      onClick={triggerLocation}
      className="accent-text"
      // disabled={options.filter(x => x.label === "Yelp").checked !== "on"}
      isDisabled
    >
      Near <span className="location-text">{locValue}</span>
    </EuiButtonEmpty>
  );

  const PlatformsFormRow = () => {
    return (
      <EuiFormRow label="Platforms">
        <EuiSelectable
          options={options}
          onChange={(newOptions) => {
            setOptions(newOptions);
          }}
        >
          {(list) => list}
        </EuiSelectable>
      </EuiFormRow>
    );
  };

  const panels = [
    {
      title: "Select Platforms",
      id: 0,
      content: <PlatformsFormRow />,
    },
  ];

  const searchBarButton = () => {
    return (
      <EuiButton className={"search-button"} fill onClick={goToSearchResult}>
        Search
      </EuiButton>
    );
  };

  const searchIcon = () => {
    return <EuiIcon className="search-icon" type="search"></EuiIcon>;
  };

  const onItemClick = (item) => {
    setSearchQuery(mapping[item.label]["main"]);
    setLocValue(mapping[item.label]["secondary"]);
    setSearchOptions([]);
  };

  const onMouseDown = () => {
    setSession(uuid());
  };

  const getInputValue = (val) => {
    setSearchQuery(val.value);
    fetchAutocompleteInfo(val.value);
  };

  const onLocItemClick = (item) => {
    setLocValue(item.label);
    setLocOptions([]);
    fetchCoords(item.label);
  };

  const getLocInputValue = (val) => {
    setLocValue(val.value);
    fetchLocation(val.value);
  };

  const locationPanels = [
    {
      title: "Enter Location",
      id: 0,
      content: (
        <EuiSuggest
          value={locValue}
          onInputChange={getLocInputValue}
          onItemClick={onLocItemClick}
          status={status}
          // onSearch={goToSearchResult}
          placeholder="address, city, state or zip"
          fullWidth
          suggestions={locOptions}
          onMouseDown={onMouseDown}
        />
      ),
    },
  ];

  return (
    <EuiForm className="Search">
      <EuiFlexGroup justifyContent="spaceAround" className="main-logo">
        <MainLogo />
      </EuiFlexGroup>
      <EuiSpacer size="m" />
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiSuggest
            value={searchQuery}
            onInputChange={getInputValue}
            onItemClick={onItemClick}
            status={status}
            onSearch={goToSearchResult}
            placeholder="How do people feel about..."
            fullWidth
            icon="search"
            className="search-icon"
            append={searchBarButton()}
            suggestions={searchOptions.map((x) => {
              return {
                label: x,
                type: { iconType: "visMapCoordinate" },
              };
            })}
            onMouseDown={onMouseDown}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      <EuiFlexGroup justifyContent="center" gutterSize="xl">
        <EuiFlexItem grow={false}>
          <EuiPopover
            button={locationBtn}
            isOpen={isLocationsOpen}
            closePopover={closeLocation}
            anchorPosition="downLeft"
          >
            <EuiContextMenu initialPanelId={0} panels={locationPanels} />
          </EuiPopover>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiPopover
            button={platformBtn}
            isOpen={isPopoverOpen}
            closePopover={closePopover}
            anchorPosition="downLeft"
            // onMouseLeave={closePopover}
          >
            <EuiContextMenu initialPanelId={0} panels={panels} />
          </EuiPopover>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiForm>
  );
}

export default SearchPage;
