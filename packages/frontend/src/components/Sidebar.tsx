import { observer } from "mobx-react-lite";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Switch,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useStore } from "../stores/RootStore";

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 65;

const menuItems = [
  { label: "Проекты", icon: <FolderIcon />, path: "/projects" },
  { label: "Настройки", icon: <SettingsIcon />, path: "/settings" },
];

const Sidebar = observer(() => {
  const { uiStore, authStore, themeStore } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const open = uiStore.sidebarOpen;
  const width = open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED;
  const user = authStore.user;

  const handleLogout = () => {
    authStore.logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        whiteSpace: "nowrap",
        "& .MuiDrawer-paper": {
          width,
          transition: (t) =>
            t.transitions.create("width", {
              easing: t.transitions.easing.sharp,
              duration: open
                ? t.transitions.duration.enteringScreen
                : t.transitions.duration.leavingScreen,
            }),
          overflowX: "hidden",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Toolbar />

      {/* Navigation */}
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ display: "block" }}>
              <Tooltip title={open ? "" : item.label} placement="right">
                <ListItemButton
                  selected={active}
                  onClick={() => navigate(item.path)}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : "auto",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Theme toggle */}
      <Divider />
      <List disablePadding>
        <ListItem disablePadding sx={{ display: "block" }}>
          <Tooltip
            title={open ? "" : (themeStore.mode === "light" ? "Тёмная тема" : "Светлая тема")}
            placement="right"
          >
            <ListItemButton
              onClick={() => themeStore.toggleTheme()}
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : "auto",
                  justifyContent: "center",
                }}
              >
                {themeStore.mode === "light" ? (
                  <DarkModeIcon />
                ) : (
                  <LightModeIcon />
                )}
              </ListItemIcon>
              <ListItemText
                primary={themeStore.mode === "light" ? "Тёмная тема" : "Светлая тема"}
                sx={{ opacity: open ? 1 : 0 }}
              />
              {open && (
                <Switch
                  size="small"
                  checked={themeStore.mode === "dark"}
                  tabIndex={-1}
                  disableRipple
                  sx={{ ml: 1 }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>

      {/* User block */}
      <Divider />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: open ? 1.5 : 0.5,
          py: 1.5,
          justifyContent: open ? "flex-start" : "center",
          gap: 1.5,
        }}
      >
        <Tooltip title={open ? "" : (user?.name ?? "")} placement="right">
          <Avatar sx={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>
            {initials}
          </Avatar>
        </Tooltip>
        {open && (
          <>
            <Box sx={{ overflow: "hidden", flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap fontWeight={600}>
                {user?.name}
              </Typography>
              <Typography variant="caption" noWrap color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Tooltip title="Выйти">
              <IconButton size="small" onClick={handleLogout} sx={{ flexShrink: 0 }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </Drawer>
  );
});

export default Sidebar;
