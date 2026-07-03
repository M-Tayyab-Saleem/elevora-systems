import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { store, persistor } from "./store/index";
import { TimeLogProvider } from "./pages/people/TimeLogContext";
import { PersistGate } from "redux-persist/integration/react";
import { injectStore } from "./axios";

import ErrorBoundary from "./components/ErrorBoundary";

injectStore(store);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Router>
      <ThemeProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <TimeLogProvider>
              <ErrorBoundary>
                <App />
              </ErrorBoundary>
            </TimeLogProvider>
          </PersistGate>
        </Provider>
      </ThemeProvider>
    </Router>
  </React.StrictMode>
);