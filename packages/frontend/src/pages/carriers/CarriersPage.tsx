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
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { useStore } from "../../stores/RootStore";
import CarrierForm from "./CarrierForm";
import type { Carrier } from "@construction-tracker/shared/dist";
import AppProgress from '@/components/AppProgress';
import EntityTitleAndAdd from '@/components/EntityTitleAndAdd';
import useSearch from '@/hooks/useSearch';

const CarriersPage = observer(() => {
  const { carrierStore } = useStore();
  const {
    loading,
    carriers,
    deletingId,
    loadCarriers,
    deleteCarrier,
    updateCarrier,
    createCarrier,
  } = carrierStore;
  const { search, searchField } = useSearch({ placeholder: "Поиск по имени, телефону, машине или номеру..." })

  const [formOpen, setFormOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);

  useEffect(() => {
    loadCarriers();
  }, [carrierStore]);

  const filteredCarriers = search
    ? carriers.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone?.includes(search) ||
          c.licensePlate?.toLowerCase().includes(search.toLowerCase()) ||
          c.vehicle?.toLowerCase().includes(search.toLowerCase())
      )
    : carriers;

  const handleCreate = () => {
    setEditingCarrier(null);
    setFormOpen(true);
  };

  const handleEdit = (carrier: Carrier, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCarrier(carrier);
    setFormOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    carrierStore.deletingId = id;
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await deleteCarrier(deletingId);
      carrierStore.deletingId = null;
    }
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (editingCarrier) {
      await updateCarrier(editingCarrier.id, data as unknown as Parameters<typeof updateCarrier>[1]);
    } else {
      await createCarrier(data as unknown as Parameters<typeof createCarrier>[0]);
    }
  };

  return (
    <>
      {loading && <AppProgress />}
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
        <EntityTitleAndAdd title="Доставщики" handleCreate={handleCreate} />
        {carriers.length > 3 && searchField}
        <Grid container spacing={3}>
          {filteredCarriers.map((carrier) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={carrier.id}>
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
                      {carrier.name}
                    </Typography>
                    <Box sx={{ flexShrink: 0 }}>
                      <Tooltip title="Редактировать">
                        <IconButton
                          size="small"
                          onClick={(e) => handleEdit(carrier, e)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => handleDelete(carrier.id, e)}
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
                    {carrier.phone && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PhoneIcon
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                        <Link
                          href={`tel:${carrier.phone}`}
                          variant="body2"
                          underline="hover"
                        >
                          {carrier.phone}
                        </Link>
                      </Box>
                    )}
                    {carrier.website && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LanguageIcon
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                        <Link
                          href={carrier.website.startsWith("http") ? carrier.website : `https://${carrier.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="body2"
                          underline="hover"
                        >
                          {carrier.website}
                        </Link>
                      </Box>
                    )}
                    {(carrier.vehicle || carrier.licensePlate) && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <DirectionsCarIcon
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                        <Typography variant="body2">
                          {[carrier.vehicle, carrier.licensePlate]
                            .filter(Boolean)
                            .join(" — ")}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {carrier.notes && (
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
                      {carrier.notes}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}

          {!loading && filteredCarriers.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  {search ? "Ничего не найдено" : "Водителей пока нет"}
                </Typography>
                {!search && (
                  <>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      Добавьте водителей для удобного выбора при создании
                      расходов на доставку
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleCreate}
                    >
                      Добавить водителя
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          )}
        </Grid>

        <CarrierForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
          carrier={editingCarrier}
        />

        <Dialog
          open={!!deletingId}
          onClose={() => carrierStore.deletingId = null}
          maxWidth="xs"
        >
          <DialogTitle>Удалить водителя?</DialogTitle>
          <DialogContent>
            <Typography>
              Водитель будет удалён. Расходы, связанные с ним, сохранятся.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => carrierStore.deletingId = null} variant="contained">
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

export default CarriersPage;
