import { createTheme } from "@mui/material/styles";

export function getTheme(mode: "light" | "dark") {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#1976d2",
        light: "#42a5f5",
        dark: "#1565c0",
        contrastText: "#fff",
      },
      secondary:
        mode === "light"
          ? { main: "#546e7a", light: "#78909c", dark: "#37474f" }
          : { main: "#90a4ae", light: "#b0bec5", dark: "#78909c" },
      background:
        mode === "light"
          ? { default: "#f8fafc", paper: "#ffffff" }
          : { default: "#0f172a", paper: "#1e293b" },
      success: { main: "#16a34a" },
      error: { main: "#dc2626" },
      warning: { main: "#ea580c" },
      info: { main: "#2563eb" },
    },
    typography: {
      fontFamily: "'Roboto', sans-serif",
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: "none", fontWeight: 600 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow:
              mode === "light"
                ? "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
                : "0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)",
          },
        },
      },
    },
  });
}

const theme = getTheme("light");
export default theme;
