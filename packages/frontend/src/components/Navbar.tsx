import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
} from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import MenuIcon from "@mui/icons-material/Menu";
import { useStore } from "../stores/RootStore";

const Navbar = observer(() => {
  const { authStore, uiStore } = useStore();
  const navigate = useNavigate();

  return (
    <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
      <Toolbar>
        {authStore.isAuthenticated && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => uiStore.toggleSidebar()}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <ConstructionIcon sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          sx={{ cursor: "pointer", flexGrow: 1 }}
          onClick={() => navigate("/projects")}
        >
          Учёт стройки
        </Typography>
      </Toolbar>
    </AppBar>
  );
});

export default Navbar;
