import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { logger } from "./utils/logger";

const root = ReactDOM.createRoot(document.getElementById("root"));

try {
  root.render(<App />);
} catch (error) {
  logger.error("Render failed", error);
}
