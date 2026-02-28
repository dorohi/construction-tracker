import { observer } from "mobx-react-lite";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import type { ExpenseType } from "@construction-tracker/shared/dist";
import { useStore } from "../../stores/RootStore";

const CategoryDialog = observer(() => {
  const { projectStore } = useStore();

  const handleAdd = async () => {
    const projectId = projectStore.currentProject?.id;
    if (projectStore.newCategoryName && projectId) {
      await projectStore.createCategory(projectId, projectStore.newCategoryName, projectStore.newCategoryType);
      projectStore.resetNewCategory();
    }
  };

  return (
    <Dialog open={projectStore.categoryDialogOpen} onClose={projectStore.closeCategoryDialog} maxWidth="sm" fullWidth>
      <DialogTitle>Управление категориями</DialogTitle>
      <DialogContent>
        {(
          [
            { type: "MATERIAL" as const, label: "Материалы", color: "primary" as const },
            { type: "LABOR" as const, label: "Работы", color: "secondary" as const },
            { type: "DELIVERY" as const, label: "Доставки", color: "success" as const },
          ] as const
        ).map(({ type, label, color }) => {
          const cats = projectStore.categories.filter((c) => c.type === type);
          if (!cats.length) return null;
          return (
            <Box key={type} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {label}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {cats.map((cat) => (
                  <Chip
                    key={cat.id}
                    label={cat.name}
                    color={color}
                    size="small"
                    onDelete={() => projectStore.setDeletingCategoryId(cat.id)}
                  />
                ))}
              </Box>
            </Box>
          );
        })}

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          Добавить
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
          <TextField
            label="Название категории"
            value={projectStore.newCategoryName}
            onChange={(e) => projectStore.setNewCategoryName(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
          />
          <TextField
            label="Тип"
            value={projectStore.newCategoryType}
            onChange={(e) => projectStore.setNewCategoryType(e.target.value as ExpenseType)}
            select
            size="small"
            sx={{ width: 150 }}
          >
            <MenuItem value="MATERIAL">Материал</MenuItem>
            <MenuItem value="LABOR">Работа</MenuItem>
            <MenuItem value="DELIVERY">Доставка</MenuItem>
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={projectStore.closeCategoryDialog} variant="contained">Закрыть</Button>
        <Button onClick={handleAdd} variant="contained" disabled={!projectStore.newCategoryName}>
          Добавить
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default CategoryDialog;
