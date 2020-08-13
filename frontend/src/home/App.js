import React, { useState, useEffect } from "react";
import "./App.css";
import SearchPage from "../search/SearchPage";
import ResultPage from "../result/ResultPage";
import HistoryPage from "../history/HistoryPage";
import Callback from "../callback/Callback";
import Header from "../header/Header";
import SecuredRoute from "../secure/SecuredRoute";
import Profile from "../profile/Profile";
import MonitorResultPage from "../result/MonitorResultPage";
import CronResultPage from "../result/CronResultPage";
import MonitoringPage from "../monitor/MonitoringPage";
import CompetitiveAnalysisPage from "../analysis/CompetitiveAnalysis";
import auth0Client from "../auth/AuthService";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import {EuiGlobalToastList} from '@elastic/eui'

let addToastHandler;
let removeToastHandler;

export function addToast(toast) {
  addToastHandler(toast)
}

export function removeToast(removedToast) {
  removeToastHandler(removedToast)
}


function App() {
  const [toasts, setToasts] = useState([]);
  const [checkingSession, setCheckingSession] = useState(true);

  const checkSession = async () => {
    if (window.location.pathname === "/callback") {
      setCheckingSession(false);
      return;
    }
    try {
      await auth0Client.silentAuth();
      // this.forceUpdate();
    } catch (err) {
      if (err.error !== "login_required") console.log(err.error);
    }
    setCheckingSession(false);
  };

  useEffect(() => {
    checkSession();
  }, []);

  const toastComponent = (
    <EuiGlobalToastList
      toasts={toasts}
      dismissToast={removeToastHandler}
      toastLifeTimeMs={8000}
    />
  )

  addToastHandler = toast => {
    setToasts(toasts.concat(toast));
  }

  removeToastHandler = removedToast => {
    setToasts(toasts.filter(toast => toast.id !== removedToast.id));
  };

  return (
    <div className="App">
      <Router>
        <Route path="" component={Header}></Route>
        <Switch>
          <Route path="/" exact component={SearchPage} />
          {/* TODO render a default results page in a case where no query or searchid is provided */}
          <Route path="/results" exact component={ResultPage} />
          <Route path="/history" exact component={HistoryPage} />
          <Route exact path="/callback" component={Callback} />
          <SecuredRoute path="/profile" component={Profile} />
          <Route path="/monitorresults/" component={MonitorResultPage} />
          <Route path="/cronresults" exact component={CronResultPage} />
          <Route path="/monitoring" exact component={MonitoringPage} />
          <Route
            path="/competitive"
            exact
            component={CompetitiveAnalysisPage}
          />
        </Switch>
      </Router>
      {toastComponent}
    </div>
  );
}

export default App;