import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { ThemeStore } from '@/stores/ThemeStore';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Switch, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const ThemeToggle = observer((
  {
    showText,
    themeStore,
  }: {
    showText: boolean;
    themeStore: ThemeStore;
  },
) => (
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
));

export default ThemeToggle;
