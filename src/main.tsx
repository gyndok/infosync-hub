import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import logger from "@/lib/logger";

logger.debug("React version:", React.version);

createRoot(document.getElementById("root")!).render(<App />);
