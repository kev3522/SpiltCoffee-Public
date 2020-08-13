import React, { useState } from "react";
import {
  EuiHeader,
  EuiHeaderLogo,
  EuiHeaderLink,
  EuiPopover,
  EuiButtonEmpty,
  EuiAvatar,
  EuiToolTip
} from "@elastic/eui";
import { useHistory, useLocation } from "react-router-dom";
import auth0Client from "../auth/AuthService";
import SquarePopover from "../search/SquarePopover";
import coffeeSvg from "../images/logo.svg";

function Header() {
  let active = useLocation().pathname;

  const history = useHistory();

  const signOut = () => {
    auth0Client.signOut();
    history.replace("/");
  };

  const renderLogo = (
    <EuiHeaderLogo
      iconType={coffeeSvg}
      aria-label="Go to home page"
      onClick={(e) => history.push("/")}
    />
  );

  const renderHistoryLink = (
    <EuiToolTip
      position="bottom"
      content={
        <p>
          See your past searches
        </p>
      }
    >
      <EuiHeaderLink
        className={active === "/history" ? "active-header-text" : "header-text"}
        onClick={(e) => {
          history.push("/history");
        }}
      >
        Search History
      </EuiHeaderLink>
    </EuiToolTip>
  );

  const renderMonitoring = (
    <EuiToolTip
      position="bottom"
      content={
        <p>
          Monitor sentiment over time
        </p>
      }
    >
      <EuiHeaderLink
        className={
          active === "/monitoring" ? "active-header-text" : "header-text"
        }
        onClick={(e) => history.push("/monitoring")}
      >
        Monitoring Tools
      </EuiHeaderLink>
    </EuiToolTip>
  );

  const renderCompetitive = (
    <EuiToolTip
      position="bottom"
      content={
        <p>
          Compare sentiments
        </p>
      }
    >
      <EuiHeaderLink
        className={
          active === "/competitive" ? "active-header-text" : "header-text"
        }
        onClick={(e) => history.push("/competitive")}
      >
        Competitive Analysis
      </EuiHeaderLink>
    </EuiToolTip>
  );

  const renderLogIn = (
    <EuiHeaderLink className="header-text" onClick={auth0Client.signIn}>
      LOG IN
    </EuiHeaderLink>
  );

  const renderSignUp = (
    <EuiHeaderLink onClick={auth0Client.signUp}>
      <EuiButtonEmpty className="header-sign-up">SIGN UP</EuiButtonEmpty>
    </EuiHeaderLink>
  );

  const renderProfile = (img) => (
    <EuiHeaderLink onClick={(e) => history.push("/profile")}>
      <EuiAvatar size="m" name="Cat" imageUrl={img} />{" "}
    </EuiHeaderLink>
  );

  const squareLogin = () => {
    if (
      auth0Client.isAuthenticated() &&
      auth0Client.getProfile()["sub"] &&
      auth0Client.getProfile()["sub"].includes("Square") &&
      auth0Client.getProfile()["https://spiltcoffee.com/business"] &&
      auth0Client.getProfile()["https://spiltcoffee.com/business"][0]
    ) {
      return auth0Client.getProfile()["https://spiltcoffee.com/business"][0];
    } else {
      return "Your Business";
    }
  };
  const [isSquarePopoverOpen, setIsSquarePopoverOpen] = useState(false);
  const onSquareButtonClick = () => {
    setIsSquarePopoverOpen(!isSquarePopoverOpen);
  };
  const closeSquarePopover = () => setIsSquarePopoverOpen(false);
  const buttonSquare = (
    <EuiButtonEmpty
      iconSide="left"
      iconType="arrowDown"
      onClick={onSquareButtonClick}
    >
      {squareLogin()}
    </EuiButtonEmpty>
  );

  const renderCronHistoryLink = (
    <EuiHeaderLink
      className="header-text"
      onClick={(e) => history.push("/monitoring")}
    >
      Monitoring Tools
    </EuiHeaderLink>
  );

  const renderSquare = (
    <EuiPopover
      button={buttonSquare}
      isOpen={isSquarePopoverOpen}
      closePopover={closeSquarePopover}
    >
      <SquarePopover />
    </EuiPopover>
  );

  const commonHeaders = [
    renderLogo,
    renderHistoryLink,
    renderMonitoring,
    renderCompetitive,
  ]

  var sections = [];
  if (!auth0Client.isAuthenticated()) {
    sections = [
      {
        items: commonHeaders,
        borders: "right",
      },
      {
        items: [renderLogIn, renderSignUp],
        borders: "left",
      },
    ];
  } else if (auth0Client.getProfile()["sub"].includes("Square")) {
    sections = [
      {
        items: commonHeaders,
        borders: "right",
      },
      {
        items: [renderSquare, renderProfile(auth0Client.getProfile().picture)],
        borders: "left",
      },
    ];
  } else {
    sections = [
      {
        items: commonHeaders,
        borders: "right",
      },
      {
        items: [renderProfile(auth0Client.getProfile().picture)],
        borders: "left",
      },
    ];
  }

  return <EuiHeader className="header" position="fixed" sections={sections} />;
}
export default Header;
