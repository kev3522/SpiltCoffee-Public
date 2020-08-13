import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./home/App";
import * as serviceWorker from "./serviceWorker";
// import "@elastic/eui/dist/eui_theme_dark.css";
// import "@elastic/eui/dist/eui_theme_amsterdam_dark.css";
import "../src/themes/spilt_coffee_theme/spilt_coffee_theme.scss";
import "@elastic/charts/dist/theme_only_dark.css";
import { BrowserRouter } from "react-router-dom";
import firebase from "firebase/app";
import "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB9xrTRrEhC14Y9dOtZDi1gdIO04wrBCt0",
  authDomain: "spilt-coffee.firebaseapp.com",
  databaseURL: "https://spilt-coffee.firebaseio.com",
  projectId: "spilt-coffee",
  storageBucket: "spilt-coffee.appspot.com",
  messagingSenderId: "969359277661",
  appId: "1:969359277661:web:7b4f7cab8125a92cc217b4",
  measurementId: "G-2W0WG5YTQK",
};

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
