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
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
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
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
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

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingProjectId(id);
  };

  const confirmDeleteProject = async () => {
    if (deletingProjectId) {
      await projectStore.deleteProject(deletingProjectId);
      setDeletingProjectId(null);
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
          Новый
        </Button>
      </Box>

      {projectStore.loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3}>
        {projectStore.projects.map((project) => {
          const spentPercent = project.budget
            ? Math.min((project.totalSpent / project.budget) * 100, 100)
            : 0;

          return (
            <Grid size={{ xs: 12, sm: 6, md: 6 }} key={project.id}>
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
                  <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AttachMoneyIcon sx={{ fontSize: 18, width: 24, color: "warning.main" }} />
                      <Typography variant="body2">
                        Потрачено: <strong>{formatCurrency(project.totalSpent)}</strong>
                      </Typography>
                    </Box>
                    {project.plannedTotal > 0 && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PlaylistAddCheckIcon sx={{ fontSize: 18, width: 24, color: "info.main" }} />
                        <Typography variant="body2">
                          Запланировано: <strong>{formatCurrency(project.plannedTotal)}</strong>
                        </Typography>
                      </Box>
                    )}
                    {project.budget != null && (
                      <>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <AccountBalanceIcon sx={{ fontSize: 18, width: 24, color: "info.main" }} />
                          <Typography variant="body2">
                            Бюджет: {formatCurrency(project.budget)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={spentPercent}
                          color={spentPercent > 90 ? "error" : spentPercent > 70 ? "warning" : "primary"}
                          sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                        />
                      </>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, mt: 1, ml: "32px", flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <BuildIcon sx={{ fontSize: 14, color: "primary.main" }} />
                      <Typography variant="caption" color="text.secondary">
                        Материалы: {formatCurrency(project.materialTotal)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <PeopleIcon sx={{ fontSize: 14, color: "secondary.main" }} />
                      <Typography variant="caption" color="text.secondary">
                        Работы: {formatCurrency(project.laborTotal)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <LocalShippingIcon sx={{ fontSize: 14, color: "success.main" }} />
                      <Typography variant="caption" color="text.secondary">
                        Доставки: {formatCurrency(project.deliveryTotal)}
                      </Typography>
                    </Box>
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
          <Button onClick={() => setDialogOpen(false)} variant="contained">Отмена</Button>
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
          <Button onClick={handleEditClose} variant="contained">Отмена</Button>
          <Button onClick={handleEditSave} variant="contained" disabled={!name}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Project Confirmation */}
      <Dialog
        open={!!deletingProjectId}
        onClose={() => setDeletingProjectId(null)}
        maxWidth="xs"
      >
        <DialogTitle>Удалить проект?</DialogTitle>
        <DialogContent>
          <Typography>
            Проект и все его расходы будут удалены без возможности восстановления.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingProjectId(null)} variant="contained">Отмена</Button>
          <Button onClick={confirmDeleteProject} variant="contained" color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
});

export default ProjectsPage;
