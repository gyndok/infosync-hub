import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
const debug = import.meta.env.DEV;

if (debug) console.log("React version:", React.version);

createRoot(document.getElementById("root")!).render(<App />);
