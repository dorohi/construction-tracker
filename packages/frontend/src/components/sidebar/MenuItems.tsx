import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EngineeringIcon from '@mui/icons-material/Engineering';

const menuItems = [
  { label: "Проекты", icon: <FolderIcon />, path: "/projects" },
  { label: "Поставщики", icon: <StorefrontIcon />, path: "/suppliers" },
  { label: "Доставщики", icon: <LocalShippingIcon />, path: "/carriers" },
  { label: "Работники", icon: <EngineeringIcon />, path: "/workers" },
];

const MenuItems = observer((
  {
    showText,
    handleNavigate,
  }: {
    showText: boolean;
    handleNavigate: (path: string) => void;
  },
) => (
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
));

export default MenuItems;
