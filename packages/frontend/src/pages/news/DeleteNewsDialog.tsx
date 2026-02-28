import { observer } from "mobx-react-lite";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";
import { useStore } from "@/stores/RootStore";

const DeleteNewsDialog = observer(() => {
  const { newsStore } = useStore();

  return (
    <Dialog open={!!newsStore.deletingId} onClose={() => newsStore.setDeletingId(null)}>
      <DialogTitle>Удалить новость?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Эта новость будет удалена без возможности восстановления.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => newsStore.setDeletingId(null)} variant="contained">Отмена</Button>
        <Button onClick={newsStore.confirmDelete} color="error" variant="contained">Удалить</Button>
      </DialogActions>
    </Dialog>
  );
});

export default DeleteNewsDialog;
