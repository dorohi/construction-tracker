import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip, Divider } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EngineeringIcon from '@mui/icons-material/Engineering';
import PublicIcon from '@mui/icons-material/Public';

type MenuItem = { label: string; icon: React.ReactNode; path: string; dividerAfter?: boolean };

const menuItems: MenuItem[] = [
  { label: "Проекты", icon: <FolderIcon />, path: "/projects" },
  { label: "Публичные", icon: <PublicIcon />, path: "/shared", dividerAfter: true },
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
        <React.Fragment key={item.path}>
          <ListItem disablePadding sx={{ display: "block" }}>
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
          {item.dividerAfter && <Divider sx={{ my: 0.5 }} />}
        </React.Fragment>
      );
    })}
  </List>
));

export default MenuItems;
