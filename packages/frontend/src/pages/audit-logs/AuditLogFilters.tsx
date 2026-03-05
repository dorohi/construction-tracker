import { useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Collapse,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
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
  const [action, setAction] = useState(auditLogStore.filters.action || "");
  const [entity, setEntity] = useState(auditLogStore.filters.entity || "");
  const [dateFrom, setDateFrom] = useState(auditLogStore.filters.dateFrom || "");
  const [dateTo, setDateTo] = useState(auditLogStore.filters.dateTo || "");

  const hasFilters = action || entity || dateFrom || dateTo;

  const applyFilters = () => {
    auditLogStore.setFilters({
      action: action || undefined,
      entity: entity || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  };

  const clearFilters = () => {
    setAction("");
    setEntity("");
    setDateFrom("");
    setDateTo("");
    auditLogStore.clearFilters();
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
        <Button
          size="small"
          startIcon={<FilterListIcon />}
          onClick={auditLogStore.toggleFilters}
          variant={auditLogStore.filtersOpen ? "contained" : "outlined"}
        >
          Фильтры
        </Button>
        {hasFilters && (
          <Button size="small" startIcon={<ClearIcon />} onClick={clearFilters} color="secondary">
            Сбросить
          </Button>
        )}
      </Box>

      <Collapse in={auditLogStore.filtersOpen}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1, mb: 1 }}>
          <TextField
            select
            label="Действие"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            {ACTIONS.map((a) => (
              <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Сущность"
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            {ENTITIES.map((e) => (
              <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Дата от"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 150 }}
          />

          <TextField
            label="Дата до"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 150 }}
          />

          <Button variant="contained" size="small" onClick={applyFilters}>
            Применить
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
});

export default AuditLogFilters;
