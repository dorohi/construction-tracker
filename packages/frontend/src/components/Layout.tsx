import { Outlet } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";
import { observer } from "mobx-react-lite";
import Navbar from "./Navbar";
import Sidebar from "./sidebar/Sidebar";
import AppSnackbar from "./AppSnackbar";

const Layout = observer(() => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Navbar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          pt: 3,
          pb: 3,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
      <AppSnackbar />
    </Box>
  );
});

export default Layout;
