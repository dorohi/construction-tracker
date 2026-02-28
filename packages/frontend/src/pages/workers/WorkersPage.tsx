import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  IconButton,
  Tooltip,
  Link,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import PhoneIcon from "@mui/icons-material/Phone";
import LanguageIcon from "@mui/icons-material/Language";
import BuildIcon from "@mui/icons-material/Build";
import PersonIcon from "@mui/icons-material/Person";
import { useStore } from "../../stores/RootStore";
import AppProgress from "@/components/AppProgress";
import EntityTitleAndAdd from "@/components/EntityTitleAndAdd";
import useSearch from "@/hooks/useSearch";
import WorkerForm from "./WorkerForm";
import DeleteWorkerDialog from "./DeleteWorkerDialog";

const WorkersPage = observer(() => {
  const { workersStore } = useStore();
  const { loading, workers } = workersStore;
  const { search, searchField } = useSearch({ placeholder: "Поиск по названию, заметке или телефону..." });

  useEffect(() => {
    workersStore.loadWorkers();
  }, [workersStore]);

  const filteredWorkers = search
    ? workers.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.notes?.toLowerCase().includes(search.toLowerCase()) ||
          s.phone?.includes(search),
      )
    : workers;

  return (
    <>
      {loading && <AppProgress />}
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
        <EntityTitleAndAdd title="Работники" handleCreate={workersStore.openAddForm} />
        {workers.length > 3 && searchField}

        <Grid container spacing={3}>
          {filteredWorkers.map((worker) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={worker.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", "&:hover": { boxShadow: 4 } }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Typography variant="h6" noWrap sx={{ flex: 1 }}>
                      {worker.name}
                    </Typography>
                    <Box sx={{ flexShrink: 0 }}>
                      <Tooltip title={worker.isFavorite ? "Убрать из избранного" : "В избранное"}>
                        <IconButton
                          size="small"
                          onClick={() => workersStore.toggleFavorite(worker.id)}
                          sx={{ color: worker.isFavorite ? "warning.main" : "action.disabled" }}
                        >
                          {worker.isFavorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Редактировать">
                        <IconButton size="small" onClick={() => workersStore.openEditForm(worker)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton size="small" color="error" onClick={() => workersStore.setDeletingId(worker.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 0.75 }}>
                    {worker.name && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PersonIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="body2">{worker.name}</Typography>
                      </Box>
                    )}
                    {worker.specialty && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <BuildIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="body2">{worker.specialty}</Typography>
                      </Box>
                    )}
                    {worker.phone && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Link href={`tel:${worker.phone}`} variant="body2" underline="hover">
                          {worker.phone}
                        </Link>
                      </Box>
                    )}
                    {worker.website && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LanguageIcon sx={{ fontSize: 18, color: "text.secondary" }} />
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
                      sx={{ mt: 1.5, fontStyle: "italic", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                    >
                      {worker.notes}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}

          {!loading && filteredWorkers.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  {search ? "Ничего не найдено" : "Работников пока нет"}
                </Typography>
                {!search && (
                  <>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      Добавьте работников для удобного выбора при создании расходов
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={workersStore.openAddForm}>
                      Добавить работника
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          )}
        </Grid>

        <WorkerForm />
        <DeleteWorkerDialog />
      </Container>
    </>
  );
});

export default WorkersPage;
