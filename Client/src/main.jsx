import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./Context/AppContext.jsx";
import { SocketProvider } from "./CameraSecurity/context/SocketProvider.jsx";

createRoot(document.getElementById("root")).render(
  <>
    <BrowserRouter>
      <AppProvider>
        <SocketProvider>
        <App />
        </SocketProvider>
      </AppProvider>
    </BrowserRouter>
  </>
);
