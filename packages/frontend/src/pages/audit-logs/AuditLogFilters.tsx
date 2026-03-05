import { observer } from "mobx-react-lite";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { useStore } from "@/stores/RootStore";

const ACTIONS = [
  { value: "", label: "Все" },
  { value: "LOGIN", label: "Вход" },
  { value: "REGISTER", label: "Регистрация" },
  { value: "LOGOUT", label: "Выход" },
  { value: "CREATE", label: "Создание" },
  { value: "UPDATE", label: "Обновление" },
  { value: "DELETE", label: "Удаление" },
  { value: "TRANSFER", label: "Перенос" },
];

const ENTITIES = [
  { value: "", label: "Все" },
  { value: "session", label: "Сессия" },
  { value: "project", label: "Проект" },
  { value: "expense", label: "Расход" },
  { value: "category", label: "Категория" },
  { value: "supplier", label: "Поставщик" },
  { value: "carrier", label: "Доставщик" },
  { value: "worker", label: "Работник" },
  { value: "news", label: "Новость" },
];

const AuditLogFilters = observer(() => {
  const { auditLogStore } = useStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { filters } = auditLogStore;

  const update = (patch: Partial<typeof filters>) => {
    auditLogStore.setFilters({ ...filters, ...patch });
  };

  const reset = () => {
    auditLogStore.clearFilters();
  };

  return (
    <Dialog open={auditLogStore.filtersOpen} onClose={auditLogStore.closeFilters} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <DialogTitle>Фильтры</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          <TextField
            select
            label="Действие"
            value={filters.action || ""}
            onChange={(e) => update({ action: e.target.value || undefined })}
            size="small"
            fullWidth
          >
            {ACTIONS.map((a) => (
              <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Сущность"
            value={filters.entity || ""}
            onChange={(e) => update({ entity: e.target.value || undefined })}
            size="small"
            fullWidth
          >
            {ENTITIES.map((e) => (
              <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Дата с"
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) => update({ dateFrom: e.target.value || undefined })}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Дата по"
              type="date"
              value={filters.dateTo || ""}
              onChange={(e) => update({ dateTo: e.target.value || undefined })}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {auditLogStore.activeFilterCount > 0 && (
          <Button startIcon={<ClearIcon />} onClick={reset} sx={{ mr: "auto" }}>
            Сбросить ({auditLogStore.activeFilterCount})
          </Button>
        )}
        <Button variant="contained" onClick={auditLogStore.closeFilters}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default AuditLogFilters;
