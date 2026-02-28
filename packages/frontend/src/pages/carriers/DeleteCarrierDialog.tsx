import { observer } from "mobx-react-lite";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import { useStore } from "../../stores/RootStore";

const DeleteCarrierDialog = observer(() => {
  const { carrierStore } = useStore();

  return (
    <Dialog open={!!carrierStore.deletingId} onClose={() => carrierStore.setDeletingId(null)} maxWidth="xs">
      <DialogTitle>Удалить водителя?</DialogTitle>
      <DialogContent>
        <Typography>
          Водитель будет удалён. Расходы, связанные с ним, сохранятся.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => carrierStore.setDeletingId(null)} variant="contained">Отмена</Button>
        <Button onClick={carrierStore.confirmDelete} variant="contained" color="error">Удалить</Button>
      </DialogActions>
    </Dialog>
  );
});

export default DeleteCarrierDialog;
