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
import { useStore } from "../stores/RootStore";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

const ProjectsPage = observer(() => {
  const { projectStore } = useStore();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this project and all its expenses?")) {
      await projectStore.deleteProject(id);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">My Projects</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          New Project
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
                    <Tooltip title="Delete project">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => handleDelete(project.id, e)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  {project.description && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {project.description}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Spent: <strong>{formatCurrency(project.totalSpent)}</strong>
                    </Typography>
                    {project.budget != null && (
                      <>
                        <Typography variant="body2">
                          Budget: {formatCurrency(project.budget)}
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
                      Materials: {formatCurrency(project.materialTotal)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Labor: {formatCurrency(project.laborTotal)}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small">View Details</Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}

        {!projectStore.loading && projectStore.projects.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No projects yet
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Create your first project to start tracking expenses
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
                Create Project
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Project</DialogTitle>
        <DialogContent>
          <TextField
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            margin="normal"
            placeholder="e.g., Beach House Build"
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
            margin="normal"
          />
          <TextField
            label="Budget"
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="Optional total budget"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={!name}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
});

export default ProjectsPage;
