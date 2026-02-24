import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const Settings = observer((
  {
    showText,
    handleNavigate,
  }: {
    showText: boolean;
    handleNavigate: (path: string) => void;
  },
) => (
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
));

export default Settings;
