import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useStore } from "../stores/RootStore";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
  }).format(amount);
}

const ProjectsPage = observer(() => {
  const { projectStore } = useStore();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");

  useEffect(() => {
    projectStore.loadProjects();
  }, [projectStore]);

  const handleCreate = async () => {
    await projectStore.createProject(
      name,
      description || undefined,
      budget ? parseFloat(budget) : undefined
    );
    setDialogOpen(false);
    setName("");
    setDescription("");
    setBudget("");
  };

  const handleEditOpen = (project: (typeof projectStore.projects)[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setEditProjectId(project.id);
    setName(project.name);
    setDescription(project.description || "");
    setBudget(project.budget != null ? String(project.budget) : "");
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditProjectId(null);
    setName("");
    setDescription("");
    setBudget("");
  };

  const handleEditSave = async () => {
    if (!editProjectId) return;
    await projectStore.updateProject(editProjectId, {
      name,
      description: description || undefined,
      budget: budget ? parseFloat(budget) : undefined,
    });
    handleEditClose();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Удалить этот проект и все его расходы?")) {
      await projectStore.deleteProject(id);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Мои проекты</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Новый проект
        </Button>
      </Box>

      {projectStore.loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3}>
        {projectStore.projects.map((project) => {
          const spentPercent = project.budget
            ? Math.min((project.totalSpent / project.budget) * 100, 100)
            : 0;

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
              <Card
                sx={{ cursor: "pointer", "&:hover": { boxShadow: 4 }, height: "100%" }}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="h6" noWrap>
                      {project.name}
                    </Typography>
                    <Box>
                      <Tooltip title="Редактировать проект">
                        <IconButton
                          size="small"
                          onClick={(e) => handleEditOpen(project, e)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить проект">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => handleDelete(project.id, e)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  {project.description && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {project.description}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Потрачено: <strong>{formatCurrency(project.totalSpent)}</strong>
                    </Typography>
                    {project.budget != null && (
                      <>
                        <Typography variant="body2">
                          Бюджет: {formatCurrency(project.budget)}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={spentPercent}
                          color={spentPercent > 90 ? "error" : spentPercent > 70 ? "warning" : "primary"}
                          sx={{ mt: 1, height: 6, borderRadius: 3 }}
                        />
                      </>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Материалы: {formatCurrency(project.materialTotal)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Работы: {formatCurrency(project.laborTotal)}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small">Подробнее</Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}

        {!projectStore.loading && projectStore.projects.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                Проектов пока нет
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Создайте первый проект для учёта расходов
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
                Создать проект
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Новый проект</DialogTitle>
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
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleCreate} variant="contained" disabled={!name}>
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать проект</DialogTitle>
        <DialogContent>
          <TextField
            label="Название проекта"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            margin="normal"
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Отмена</Button>
          <Button onClick={handleEditSave} variant="contained" disabled={!name}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
});

export default ProjectsPage;
