import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { AuthStore } from '@/stores/AuthStore';
import { useNavigate } from 'react-router-dom';

const LogoutDialog = observer((
  {
    authStore,
  }: {
    authStore: AuthStore;
  },
) => {
  const navigate = useNavigate();
  const { logoutDialogOpen, logout } = authStore;

  const confirmLogout = () => {
    cancelLogout();
    logout();
    navigate("/login");
  };

  const cancelLogout = () => {
    authStore.logoutDialogOpen = false;
  }

  return (
    <Dialog open={logoutDialogOpen} onClose={cancelLogout} maxWidth="xs">
      <DialogTitle>Выйти из аккаунта?</DialogTitle>
      <DialogContent>
        <Typography>Вы уверены, что хотите выйти?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelLogout} variant="contained">Отмена</Button>
        <Button onClick={confirmLogout} variant="contained" color="error">Выйти</Button>
      </DialogActions>
    </Dialog>
  )
});

export default LogoutDialog;
