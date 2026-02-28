import { observer } from "mobx-react-lite";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import { useStore } from "../../stores/RootStore";

const DeleteWorkerDialog = observer(() => {
  const { workersStore } = useStore();

  return (
    <Dialog open={!!workersStore.deletingId} onClose={() => workersStore.setDeletingId(null)} maxWidth="xs">
      <DialogTitle>Удалить работника?</DialogTitle>
      <DialogContent>
        <Typography>
          Работник будет удалён. Расходы, связанные с ним, сохранятся.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => workersStore.setDeletingId(null)} variant="contained">Отмена</Button>
        <Button onClick={workersStore.confirmDelete} variant="contained" color="error">Удалить</Button>
      </DialogActions>
    </Dialog>
  );
});

export default DeleteWorkerDialog;
