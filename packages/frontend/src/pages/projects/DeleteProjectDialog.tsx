import { observer } from "mobx-react-lite";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import { useStore } from "../../stores/RootStore";

const DeleteProjectDialog = observer(() => {
  const { projectStore } = useStore();

  return (
    <Dialog open={!!projectStore.deletingProjectId} onClose={() => projectStore.setDeletingProjectId(null)} maxWidth="xs">
      <DialogTitle>Удалить проект?</DialogTitle>
      <DialogContent>
        <Typography>
          Проект и все его расходы будут удалены без возможности восстановления.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => projectStore.setDeletingProjectId(null)} variant="contained">Отмена</Button>
        <Button onClick={projectStore.confirmDeleteProject} variant="contained" color="error">Удалить</Button>
      </DialogActions>
    </Dialog>
  );
});

export default DeleteProjectDialog;
