import { observer } from "mobx-react-lite";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import { useStore } from "../../stores/RootStore";

const DeleteCategoryDialog = observer(() => {
  const { projectStore } = useStore();

  const confirm = async () => {
    const projectId = projectStore.currentProject?.id;
    if (projectStore.deletingCategoryId && projectId) {
      await projectStore.deleteCategory(projectId, projectStore.deletingCategoryId);
      projectStore.setDeletingCategoryId(null);
      projectStore.loadProject(projectId);
    }
  };

  return (
    <Dialog open={!!projectStore.deletingCategoryId} onClose={() => projectStore.setDeletingCategoryId(null)} maxWidth="xs">
      <DialogTitle>Удалить категорию?</DialogTitle>
      <DialogContent>
        <Typography>
          Категория будет удалена. Расходы, привязанные к ней, останутся без категории.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => projectStore.setDeletingCategoryId(null)} variant="contained">Отмена</Button>
        <Button onClick={confirm} variant="contained" color="error">Удалить</Button>
      </DialogActions>
    </Dialog>
  );
});

export default DeleteCategoryDialog;
