import React from "react";
import ReactDOM from "react-dom/client";
import TrayMenu from "./TrayMenu";
import "@/index.css";
import "./tray-menu.css";
import "@/i18n";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TrayMenu />
  </React.StrictMode>
);
