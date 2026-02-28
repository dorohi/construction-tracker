import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useStore } from "../../stores/RootStore";

const ProjectForm = observer(() => {
  const { projectStore } = useStore();
  const { formOpen, editingProject } = projectStore;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name);
      setDescription(editingProject.description || "");
      setBudget(editingProject.budget != null ? String(editingProject.budget) : "");
    } else {
      setName("");
      setDescription("");
      setBudget("");
    }
  }, [editingProject, formOpen]);

  const handleSubmit = () => {
    const editing = editingProject;
    projectStore.closeForm();

    if (editing) {
      projectStore.updateProject(editing.id, {
        name,
        description: description || undefined,
        budget: budget ? parseFloat(budget) : undefined,
      });
    } else {
      projectStore.createProject(name, description || undefined, budget ? parseFloat(budget) : undefined);
    }
  };

  return (
    <Dialog open={formOpen} onClose={projectStore.closeForm} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingProject ? "Редактировать проект" : "Новый проект"}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Название проекта"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          margin="normal"
          placeholder="напр., Строительство дома"
        />
        <TextField
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={2}
          margin="normal"
        />
        <TextField
          label="Бюджет"
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          fullWidth
          margin="normal"
          placeholder="Общий бюджет (необязательно)"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={projectStore.closeForm} variant="contained">Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!name.trim()}>
          {editingProject ? "Сохранить" : "Создать"}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ProjectForm;
