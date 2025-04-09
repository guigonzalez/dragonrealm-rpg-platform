import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Import i18n (must be imported before any component that uses translations)
import './i18n';

createRoot(document.getElementById("root")!).render(
  <App />
);
