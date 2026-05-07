// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import "./index.css";

import { CityProvider } from "./context/CityContext.jsx";
import { AppearanceProvider } from "./context/AppearanceContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <CityProvider>
        <AppearanceProvider>
          <App />
        </AppearanceProvider>
      </CityProvider>
    </BrowserRouter>
  </React.StrictMode>
);