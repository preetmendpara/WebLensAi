import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/tokens.css";
import { probeFrameHealth } from "./animations/frameHealth";

// Measure whether this environment renders frames before any component
// decides to animate its content in from opacity 0.
probeFrameHealth();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
