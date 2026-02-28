import { observer } from "mobx-react-lite";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import { useStore } from "../../stores/RootStore";

const DeleteSupplierDialog = observer(() => {
  const { supplierStore } = useStore();

  return (
    <Dialog open={!!supplierStore.deletingId} onClose={() => supplierStore.setDeletingId(null)} maxWidth="xs">
      <DialogTitle>Удалить поставщика?</DialogTitle>
      <DialogContent>
        <Typography>
          Поставщик будет удалён. Расходы, связанные с ним, сохранятся.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => supplierStore.setDeletingId(null)} variant="contained">Отмена</Button>
        <Button onClick={supplierStore.confirmDelete} variant="contained" color="error">Удалить</Button>
      </DialogActions>
    </Dialog>
  );
});

export default DeleteSupplierDialog;
