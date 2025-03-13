import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Find the root element safely
const rootElement = document.getElementById("root");

// Ensure the root element exists before rendering
if (!rootElement) {
  console.error("Could not find root element to mount React application");
} else {
  const root = createRoot(rootElement);
  root.render(<App />);
}
