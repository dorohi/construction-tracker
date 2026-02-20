import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useStore } from "../stores/RootStore";

const Navbar = observer(() => {
  const { authStore, themeStore } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    authStore.logout();
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <ConstructionIcon sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          sx={{ cursor: "pointer", flexGrow: 1 }}
          onClick={() => navigate("/projects")}
        >
          Construction Tracker
        </Typography>
        <IconButton color="inherit" onClick={() => themeStore.toggleTheme()}>
          {themeStore.mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
        {authStore.isAuthenticated && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2">
              {authStore.user?.name}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
});

export default Navbar;
