import { observer } from "mobx-react-lite";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import { useStore } from "../../stores/RootStore";

const PurchaseDialog = observer(() => {
  const { expenseStore, projectStore } = useStore();

  const confirm = async () => {
    if (expenseStore.purchasingExpense) {
      await expenseStore.updateExpense(expenseStore.purchasingExpense.id, { planned: false, date: new Date().toISOString() });
      projectStore.loadProject(projectStore.currentProject!.id);
      expenseStore.setPurchasingExpense(null);
    }
  };

  return (
    <Dialog open={!!expenseStore.purchasingExpense} onClose={() => expenseStore.setPurchasingExpense(null)} maxWidth="xs">
      <DialogTitle>Отметить как купленный?</DialogTitle>
      <DialogContent>
        <Typography>
          Расход «{expenseStore.purchasingExpense?.title}» будет переведён из запланированных в фактические.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => expenseStore.setPurchasingExpense(null)} variant="contained">Отмена</Button>
        <Button onClick={confirm} variant="contained" color="success">Купить</Button>
      </DialogActions>
    </Dialog>
  );
});

export default PurchaseDialog;
