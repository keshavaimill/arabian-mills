// import { createRoot } from "react-dom/client";
// import App from "./App.tsx";
// import "./index.css";
// import "./i18n";

// createRoot(document.getElementById("root")!).render(<App />);


import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

// 👇 ADD THIS IMPORT
import { ChatProvider } from "./floating-bot/ChatContext";

createRoot(document.getElementById("root")!).render(
  <ChatProvider>
    <App />
  </ChatProvider>
);
