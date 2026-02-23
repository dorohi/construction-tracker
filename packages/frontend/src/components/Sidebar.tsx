import { observer } from "mobx-react-lite";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import EngineeringIcon from '@mui/icons-material/Engineering';
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useStore } from "../stores/RootStore";

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 65;

const menuItems = [
  { label: "Проекты", icon: <FolderIcon />, path: "/projects" },
  { label: "Поставщики", icon: <StorefrontIcon />, path: "/suppliers" },
  { label: "Доставщики", icon: <LocalShippingIcon />, path: "/carriers" },
  { label: "Работники", icon: <EngineeringIcon />, path: "/workers" },
];

const Sidebar = observer(() => {
  const { uiStore, authStore, themeStore } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const open = uiStore.sidebarOpen;
  const user = authStore.user;
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const drawerWidth = isMobile ? DRAWER_WIDTH : open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED;

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    setLogoutDialogOpen(false);
    authStore.logout();
    navigate("/login");
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) uiStore.closeSidebar();
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  // On mobile always show text (drawer is full-width overlay)
  const showText = isMobile || open;

  const drawerContent = (
    <>
      <Toolbar />

      {/* Navigation */}
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ display: "block" }}>
              <Tooltip title={showText ? "" : item.label} placement="right">
                <ListItemButton
                  selected={active}
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    minHeight: 48,
                    justifyContent: showText ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: showText ? 2 : "auto",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{ opacity: showText ? 1 : 0 }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Settings */}
      <Divider />
      <List disablePadding>
        <ListItem disablePadding sx={{ display: "block" }}>
          <Tooltip title={showText ? "" : "Настройки"} placement="right">
            <ListItemButton
              selected={location.pathname.startsWith("/settings")}
              onClick={() => handleNavigate("/settings")}
              sx={{
                minHeight: 48,
                justifyContent: showText ? "initial" : "center",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: showText ? 2 : "auto",
                  justifyContent: "center",
                }}
              >
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Настройки"
                sx={{ opacity: showText ? 1 : 0 }}
              />
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>

      {/* Theme toggle */}
      <Divider />
      <List disablePadding>
        <ListItem disablePadding sx={{ display: "block" }}>
          <Tooltip
            title={showText ? "" : (themeStore.mode === "light" ? "Тёмная тема" : "Светлая тема")}
            placement="right"
          >
            <ListItemButton
              onClick={() => themeStore.toggleTheme()}
              sx={{
                minHeight: 48,
                justifyContent: showText ? "initial" : "center",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: showText ? 2 : "auto",
                  justifyContent: "center",
                }}
              >
                {themeStore.mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
              </ListItemIcon>
              <ListItemText
                primary={themeStore.mode === "light" ? "Тёмная тема" : "Светлая тема"}
                sx={{ opacity: showText ? 1 : 0 }}
              />
              {showText && (
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
          p: showText ? 1.5 : 0.5,
          py: 1.5,
          justifyContent: showText ? "flex-start" : "center",
          gap: 1.5,
        }}
      >
        <Tooltip title={showText ? "" : (user?.name ?? "")} placement="right">
          <Avatar sx={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>
            {initials}
          </Avatar>
        </Tooltip>
        {showText && (
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
    </>
  );

  const logoutDialog = (
    <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)} maxWidth="xs">
      <DialogTitle>Выйти из аккаунта?</DialogTitle>
      <DialogContent>
        <Typography>Вы уверены, что хотите выйти?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setLogoutDialogOpen(false)} variant="contained">Отмена</Button>
        <Button onClick={confirmLogout} variant="contained" color="error">Выйти</Button>
      </DialogActions>
    </Dialog>
  );

  if (isMobile) {
    return (
      <>
        <Drawer
          variant="temporary"
          open={open}
          onClose={() => uiStore.closeSidebar()}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          {drawerContent}
        </Drawer>
        {logoutDialog}
      </>
    );
  }

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          whiteSpace: "nowrap",
          "& .MuiDrawer-paper": {
            width: drawerWidth,
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
        {drawerContent}
      </Drawer>
      {logoutDialog}
    </>
  );
});

export default Sidebar;
