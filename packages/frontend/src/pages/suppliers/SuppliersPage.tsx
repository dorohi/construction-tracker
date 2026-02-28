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
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import { useStore } from "../../stores/RootStore";
import AppProgress from "@/components/AppProgress";
import EntityTitleAndAdd from "@/components/EntityTitleAndAdd";
import useSearch from "@/hooks/useSearch";
import SupplierForm from "./SupplierForm";
import DeleteSupplierDialog from "./DeleteSupplierDialog";

const SuppliersPage = observer(() => {
  const { supplierStore } = useStore();
  const { loading, suppliers } = supplierStore;
  const { search, searchField } = useSearch({ placeholder: "Поиск по названию, контакту или телефону..." });

  useEffect(() => {
    supplierStore.loadSuppliers();
  }, [supplierStore]);

  const filteredSuppliers = search
    ? suppliers.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.contactName?.toLowerCase().includes(search.toLowerCase()) ||
          s.phone?.includes(search),
      )
    : suppliers;

  return (
    <>
      {loading && <AppProgress />}
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
        <EntityTitleAndAdd title="Поставщики" handleCreate={supplierStore.openAddForm} />
        {suppliers.length > 3 && searchField}

        <Grid container spacing={3}>
          {filteredSuppliers.map((supplier) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={supplier.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", "&:hover": { boxShadow: 4 } }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Typography variant="h6" noWrap sx={{ flex: 1 }}>
                      {supplier.name}
                    </Typography>
                    <Box sx={{ flexShrink: 0 }}>
                      <Tooltip title={supplier.isFavorite ? "Убрать из избранного" : "В избранное"}>
                        <IconButton
                          size="small"
                          onClick={() => supplierStore.toggleFavorite(supplier.id)}
                          sx={{ color: supplier.isFavorite ? "warning.main" : "action.disabled" }}
                        >
                          {supplier.isFavorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Редактировать">
                        <IconButton size="small" onClick={() => supplierStore.openEditForm(supplier)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton size="small" color="error" onClick={() => supplierStore.setDeletingId(supplier.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 0.75 }}>
                    {supplier.contactName && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PersonIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="body2">{supplier.contactName}</Typography>
                      </Box>
                    )}
                    {supplier.phone && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Link href={`tel:${supplier.phone}`} variant="body2" underline="hover">
                          {supplier.phone}
                        </Link>
                      </Box>
                    )}
                    {supplier.website && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LanguageIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Link
                          href={supplier.website.startsWith("http") ? supplier.website : `https://${supplier.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="body2"
                          underline="hover"
                          noWrap
                        >
                          {supplier.website}
                        </Link>
                      </Box>
                    )}
                    {supplier.address && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LocationOnIcon
                          sx={{
                            fontSize: 18,
                            color: supplier.latitude && supplier.longitude ? "error.main" : "text.secondary",
                          }}
                        />
                        {supplier.latitude && supplier.longitude ? (
                          <Link
                            href={`https://yandex.ru/maps/?pt=${supplier.longitude},${supplier.latitude}&z=17&l=map`}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="body2"
                            underline="hover"
                          >
                            {supplier.address}
                          </Link>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {supplier.address}
                          </Typography>
                        )}
                      </Box>
                    )}
                    {!supplier.address && supplier.latitude && supplier.longitude && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 18, color: "error.main" }} />
                        <Link
                          href={`https://yandex.ru/maps/?pt=${supplier.longitude},${supplier.latitude}&z=17&l=map`}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="body2"
                          underline="hover"
                        >
                          Открыть на карте
                        </Link>
                      </Box>
                    )}
                  </Box>

                  {supplier.notes && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1.5, fontStyle: "italic", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                    >
                      {supplier.notes}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}

          {!loading && filteredSuppliers.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  {search ? "Ничего не найдено" : "Поставщиков пока нет"}
                </Typography>
                {!search && (
                  <>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      Добавьте поставщиков для удобного выбора при создании расходов
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={supplierStore.openAddForm}>
                      Добавить поставщика
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          )}
        </Grid>

        <SupplierForm />
        <DeleteSupplierDialog />
      </Container>
    </>
  );
});

export default SuppliersPage;
