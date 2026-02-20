import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { observer } from "mobx-react-lite";
import { StoreContext, rootStore } from "./stores/RootStore";
import { getTheme } from "./theme/theme";
import App from "./App";

const ThemedApp = observer(() => {
  const theme = getTheme(rootStore.themeStore.mode);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StoreContext.Provider value={rootStore}>
      <ThemedApp />
    </StoreContext.Provider>
  </React.StrictMode>
);
