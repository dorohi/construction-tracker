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
  LinearProgress,
  Tooltip,
  TextField,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Link,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PhoneIcon from "@mui/icons-material/Phone";
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import { useStore } from "../stores/RootStore";
import SupplierForm from "../components/SupplierForm";
import type { Supplier } from "@construction-tracker/shared";

const SuppliersPage = observer(() => {
  const { supplierStore } = useStore();
  const thm = useTheme();
  const isMobile = useMediaQuery(thm.breakpoints.down("md"));

  const [formOpen, setFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supplierStore.loadSuppliers();
  }, [supplierStore]);

  const filteredSuppliers = search
    ? supplierStore.suppliers.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.contactName?.toLowerCase().includes(search.toLowerCase()) ||
          s.phone?.includes(search)
      )
    : supplierStore.suppliers;

  const handleCreate = () => {
    setEditingSupplier(null);
    setFormOpen(true);
  };

  const handleEdit = (supplier: Supplier, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSupplier(supplier);
    setFormOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await supplierStore.deleteSupplier(deletingId);
      setDeletingId(null);
    }
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (editingSupplier) {
      await supplierStore.updateSupplier(editingSupplier.id, data as unknown as Parameters<typeof supplierStore.updateSupplier>[1]);
    } else {
      await supplierStore.createSupplier(data as unknown as Parameters<typeof supplierStore.createSupplier>[0]);
    }
  };

  return (
    <>
      {supplierStore.loading && (
        <LinearProgress
          sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1300 }}
        />
      )}
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant={isMobile ? "h5" : "h4"}>Поставщики</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Добавить
          </Button>
        </Box>

        {supplierStore.suppliers.length > 3 && (
          <TextField
            placeholder="Поиск по названию, контакту или телефону..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            fullWidth
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
        )}

        <Grid container spacing={3}>
          {filteredSuppliers.map((supplier) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={supplier.id}>
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
                      {supplier.name}
                    </Typography>
                    <Box sx={{ flexShrink: 0 }}>
                      <Tooltip title="Редактировать">
                        <IconButton
                          size="small"
                          onClick={(e) => handleEdit(supplier, e)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => handleDelete(supplier.id, e)}
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
                    {supplier.contactName && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PersonIcon
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                        <Typography variant="body2">
                          {supplier.contactName}
                        </Typography>
                      </Box>
                    )}
                    {supplier.phone && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PhoneIcon
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                        <Link
                          href={`tel:${supplier.phone}`}
                          variant="body2"
                          underline="hover"
                        >
                          {supplier.phone}
                        </Link>
                      </Box>
                    )}
                    {supplier.website && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LanguageIcon
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                        <Link
                          href={
                            supplier.website.startsWith("http")
                              ? supplier.website
                              : `https://${supplier.website}`
                          }
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
                            color: supplier.latitude && supplier.longitude
                              ? "error.main"
                              : "text.secondary",
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
                        <LocationOnIcon
                          sx={{ fontSize: 18, color: "error.main" }}
                        />
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
                      sx={{
                        mt: 1.5,
                        fontStyle: "italic",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {supplier.notes}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}

          {!supplierStore.loading && filteredSuppliers.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  {search ? "Ничего не найдено" : "Поставщиков пока нет"}
                </Typography>
                {!search && (
                  <>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      Добавьте поставщиков для удобного выбора при создании
                      расходов
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleCreate}
                    >
                      Добавить поставщика
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          )}
        </Grid>

        <SupplierForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
          supplier={editingSupplier}
        />

        <Dialog
          open={!!deletingId}
          onClose={() => setDeletingId(null)}
          maxWidth="xs"
        >
          <DialogTitle>Удалить поставщика?</DialogTitle>
          <DialogContent>
            <Typography>
              Поставщик будет удалён. Расходы, связанные с ним, сохранятся.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeletingId(null)} variant="contained">
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

export default SuppliersPage;
