import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Link,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PhoneIcon from "@mui/icons-material/Phone";
import LanguageIcon from "@mui/icons-material/Language";
import BuildIcon from "@mui/icons-material/Build";
import PersonIcon from "@mui/icons-material/Person";
import { useStore } from "../../stores/RootStore";
import type { Worker } from "@construction-tracker/shared/dist";
import AppProgress from '@/components/AppProgress';
import EntityTitleAndAdd from '@/components/EntityTitleAndAdd';
import useSearch from '@/hooks/useSearch';
import WorkerForm from '@/pages/workers/WorkerForm';

const WorkersPage = observer(() => {
  const { workersStore } = useStore();
  const {
    loading,
    workers,
    deletingId,
    loadWorkers,
    deleteWorker,
    updateWorker,
    createWorker,
  } = workersStore;
  const { search, searchField } = useSearch({ placeholder: "Поиск по названию, заметке или телефону..." })

  const [formOpen, setFormOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  useEffect(() => {
    loadWorkers();
  }, [workersStore]);

  const filteredWorker = search
    ? workers.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.notes?.toLowerCase().includes(search.toLowerCase()) ||
          s.phone?.includes(search)
      )
    : workers;

  const handleCreate = () => {
    setEditingWorker(null);
    setFormOpen(true);
  };

  const handleEdit = (worker: Worker, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWorker(worker);
    setFormOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    workersStore.deletingId = id;
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await deleteWorker(deletingId);
      workersStore.deletingId = null;
    }
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (editingWorker) {
      await updateWorker(editingWorker.id, data as unknown as Parameters<typeof updateWorker>[1]);
    } else {
      await createWorker(data as unknown as Parameters<typeof createWorker>[0]);
    }
  };

  return (
    <>
      {loading && <AppProgress />}
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
        <EntityTitleAndAdd title="Работники" handleCreate={handleCreate} />
        {workers.length > 3 && searchField}

        <Grid container spacing={3}>
          {filteredWorker.map((worker) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={worker.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": { boxShadow: 4 },
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography variant="h6" noWrap sx={{ flex: 1 }}>
                      {worker.name}
                    </Typography>
                    <Box sx={{ flexShrink: 0 }}>
                      <Tooltip title="Редактировать">
                        <IconButton
                          size="small"
                          onClick={(e) => handleEdit(worker, e)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => handleDelete(worker.id, e)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      mt: 1.5,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.75,
                    }}
                  >
                    {worker.name && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PersonIcon
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                        <Typography variant="body2">
                          {worker.name}
                        </Typography>
                      </Box>
                    )}
                    {worker.specialty && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <BuildIcon
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                        <Typography variant="body2">
                          {worker.specialty}
                        </Typography>
                      </Box>
                    )}
                    {worker.phone && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PhoneIcon
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                        <Link
                          href={`tel:${worker.phone}`}
                          variant="body2"
                          underline="hover"
                        >
                          {worker.phone}
                        </Link>
                      </Box>
                    )}
                    {worker.website && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LanguageIcon
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                        <Link
                          href={worker.website.startsWith("http") ? worker.website : `https://${worker.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="body2"
                          underline="hover"
                        >
                          {worker.website}
                        </Link>
                      </Box>
                    )}
                  </Box>

                  {worker.notes && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1.5,
                        fontStyle: "italic",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {worker.notes}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}

          {!loading && filteredWorker.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  {search ? "Ничего не найдено" : "Работников пока нет"}
                </Typography>
                {!search && (
                  <>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      Добавьте работников для удобного выбора при создании
                      расходов
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleCreate}
                    >
                      Добавить работника
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          )}
        </Grid>

        <WorkerForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
          worker={editingWorker}
        />

        <Dialog
          open={!!deletingId}
          onClose={() => workersStore.deletingId = null}
          maxWidth="xs"
        >
          <DialogTitle>Удалить работника?</DialogTitle>
          <DialogContent>
            <Typography>
              Работник будет удалён. Расходы, связанные с ним, сохранятся.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => workersStore.deletingId = null} variant="contained">
              Отмена
            </Button>
            <Button onClick={confirmDelete} variant="contained" color="error">
              Удалить
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
});

export default WorkersPage;
