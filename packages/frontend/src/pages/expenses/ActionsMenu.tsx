import { observer } from "mobx-react-lite";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import type { Expense } from "@construction-tracker/shared/dist";
import { useStore } from "../../stores/RootStore";

const ActionsMenu = observer(() => {
  const { expenseStore } = useStore();

  const handleAction = (action: (expense: Expense) => void) => {
    if (expenseStore.menuExpense) action(expenseStore.menuExpense);
    expenseStore.closeMenu();
  };

  return (
    <Menu
      anchorEl={expenseStore.menuAnchor}
      open={Boolean(expenseStore.menuAnchor)}
      onClose={expenseStore.closeMenu}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      {expenseStore.menuExpense?.planned && (
        <MenuItem onClick={() => handleAction(expenseStore.setPurchasingExpense)}>
          <ListItemIcon><ShoppingCartIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>Купить</ListItemText>
        </MenuItem>
      )}
      <MenuItem onClick={() => handleAction(expenseStore.openEditForm)}>
        <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
        <ListItemText>Редактировать</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => handleAction(expenseStore.openDuplicateForm)}>
        <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
        <ListItemText>Дублировать</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => handleAction(expenseStore.setDeletingExpense)}>
        <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
        <ListItemText sx={{ color: "error.main" }}>Удалить</ListItemText>
      </MenuItem>
    </Menu>
  );
});

export default ActionsMenu;
