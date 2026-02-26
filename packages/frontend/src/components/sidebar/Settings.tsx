import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useStore } from '@/stores/RootStore';

const Settings = observer((
  {
    showText,
    handleNavigate,
  }: {
    showText: boolean;
    handleNavigate: (path: string) => void;
  },
) => {
  const { authStore } = useStore();
  const isAdmin = authStore.user?.isAdmin ?? false;

  return (
    <List disablePadding>
      <ListItem disablePadding sx={{ display: "block" }}>
        <Tooltip title={showText ? "" : "Новости"} placement="right">
          <ListItemButton
            selected={location.pathname.startsWith("/news")}
            onClick={() => handleNavigate("/news")}
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
              <NewspaperIcon />
            </ListItemIcon>
            <ListItemText
              primary="Новости"
              sx={{ opacity: showText ? 1 : 0 }}
            />
          </ListItemButton>
        </Tooltip>
      </ListItem>
      {isAdmin && (
        <ListItem disablePadding sx={{ display: "block" }}>
          <Tooltip title={showText ? "" : "Админ-панель"} placement="right">
            <ListItemButton
              selected={location.pathname.startsWith("/admin")}
              onClick={() => handleNavigate("/admin")}
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
                <AdminPanelSettingsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Админ-панель"
                sx={{ opacity: showText ? 1 : 0 }}
              />
            </ListItemButton>
          </Tooltip>
        </ListItem>
      )}
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
  );
});

export default Settings;
