import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { Avatar, Box, IconButton, Tooltip, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthStore } from '@/stores/AuthStore';

const UserBlock = observer((
  {
    showText,
    authStore,
  }: {
    showText: boolean;
    authStore: AuthStore;
  },
) => {
  const { user } = authStore;

  const handleLogout = () => {
    authStore.logoutDialogOpen = true;
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
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        p: 1.5,
        py: 1.5,
        justifyContent: showText ? "flex-start" : "center",
        gap: 1.5,
        height: "68px",
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
  );
});

export default UserBlock;
