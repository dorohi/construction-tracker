import { observer } from "mobx-react-lite";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import { useStore } from "../../stores/RootStore";

const DeleteExpenseDialog = observer(() => {
  const { expenseStore, projectStore } = useStore();

  const confirm = async () => {
    if (expenseStore.deletingExpense) {
      await expenseStore.deleteExpense(expenseStore.deletingExpense.id);
      projectStore.loadProject(projectStore.currentProject!.id);
      expenseStore.setDeletingExpense(null);
    }
  };

  return (
    <Dialog open={!!expenseStore.deletingExpense} onClose={() => expenseStore.setDeletingExpense(null)} maxWidth="xs">
      <DialogTitle>Удалить расход?</DialogTitle>
      <DialogContent>
        <Typography>
          Расход «{expenseStore.deletingExpense?.title}» будет удалён без возможности восстановления.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => expenseStore.setDeletingExpense(null)} variant="contained">Отмена</Button>
        <Button onClick={confirm} variant="contained" color="error">Удалить</Button>
      </DialogActions>
    </Dialog>
  );
});

export default DeleteExpenseDialog;
