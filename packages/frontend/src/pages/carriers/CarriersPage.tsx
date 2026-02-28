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
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { useStore } from "../../stores/RootStore";
import AppProgress from "@/components/AppProgress";
import EntityTitleAndAdd from "@/components/EntityTitleAndAdd";
import useSearch from "@/hooks/useSearch";
import CarrierForm from "./CarrierForm";
import DeleteCarrierDialog from "./DeleteCarrierDialog";

const CarriersPage = observer(() => {
  const { carrierStore } = useStore();
  const { loading, carriers } = carrierStore;
  const { search, searchField } = useSearch({ placeholder: "Поиск по имени, телефону, машине или номеру..." });

  useEffect(() => {
    carrierStore.loadCarriers();
  }, [carrierStore]);

  const filteredCarriers = search
    ? carriers.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone?.includes(search) ||
          c.licensePlate?.toLowerCase().includes(search.toLowerCase()) ||
          c.vehicle?.toLowerCase().includes(search.toLowerCase()),
      )
    : carriers;

  return (
    <>
      {loading && <AppProgress />}
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
        <EntityTitleAndAdd title="Доставщики" handleCreate={carrierStore.openAddForm} />
        {carriers.length > 3 && searchField}

        <Grid container spacing={3}>
          {filteredCarriers.map((carrier) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={carrier.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", "&:hover": { boxShadow: 4 } }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Typography variant="h6" noWrap sx={{ flex: 1 }}>
                      {carrier.name}
                    </Typography>
                    <Box sx={{ flexShrink: 0 }}>
                      <Tooltip title={carrier.isFavorite ? "Убрать из избранного" : "В избранное"}>
                        <IconButton
                          size="small"
                          onClick={() => carrierStore.toggleFavorite(carrier.id)}
                          sx={{ color: carrier.isFavorite ? "warning.main" : "action.disabled" }}
                        >
                          {carrier.isFavorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Редактировать">
                        <IconButton size="small" onClick={() => carrierStore.openEditForm(carrier)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton size="small" color="error" onClick={() => carrierStore.setDeletingId(carrier.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 0.75 }}>
                    {carrier.phone && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Link href={`tel:${carrier.phone}`} variant="body2" underline="hover">
                          {carrier.phone}
                        </Link>
                      </Box>
                    )}
                    {carrier.website && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LanguageIcon sx={{ fontSize: 18, color: "text.secondary" }} />
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
                        <DirectionsCarIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="body2">
                          {[carrier.vehicle, carrier.licensePlate].filter(Boolean).join(" — ")}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {carrier.notes && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1.5, fontStyle: "italic", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
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
                      Добавьте водителей для удобного выбора при создании расходов на доставку
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={carrierStore.openAddForm}>
                      Добавить водителя
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          )}
        </Grid>

        <CarrierForm />
        <DeleteCarrierDialog />
      </Container>
    </>
  );
});

export default CarriersPage;
