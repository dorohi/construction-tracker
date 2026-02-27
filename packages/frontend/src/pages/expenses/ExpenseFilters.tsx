import { useMemo } from "react";
import { observer } from "mobx-react-lite";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import type { ExpenseType, Category, Supplier, Carrier, Worker } from "@construction-tracker/shared/dist";

export interface ExpenseFilterValues {
  types: ExpenseType[];
  categoryIds: string[];
  title: string;
  dateFrom: string | null;
  dateTo: string | null;
  amountFrom: number | null;
  amountTo: number | null;
  supplier: string;
  carrier: string;
  worker: string;
  plannedStatus: "all" | "planned" | "actual";
}

export const defaultFilters: ExpenseFilterValues = {
  types: [],
  categoryIds: [],
  title: "",
  dateFrom: null,
  dateTo: null,
  amountFrom: null,
  amountTo: null,
  supplier: "",
  carrier: "",
  worker: "",
  plannedStatus: "all",
};

export function countActiveFilters(f: ExpenseFilterValues): number {
  let count = 0;
  if (f.types.length > 0) count++;
  if (f.categoryIds.length > 0) count++;
  if (f.title) count++;
  if (f.dateFrom) count++;
  if (f.dateTo) count++;
  if (f.amountFrom !== null) count++;
  if (f.amountTo !== null) count++;
  if (f.supplier) count++;
  if (f.carrier) count++;
  if (f.worker) count++;
  if (f.plannedStatus !== "all") count++;
  return count;
}

interface ExpenseFiltersProps {
  open: boolean;
  onClose: () => void;
  filters: ExpenseFilterValues;
  onChange: (filters: ExpenseFilterValues) => void;
  categories: Category[];
  suppliers: Supplier[];
  carriers: Carrier[];
  workers: Worker[];
}

const ExpenseFilters = observer(({ open, onClose, filters, onChange, categories, suppliers, carriers, workers }: ExpenseFiltersProps) => {
  const thm = useTheme();
  const isMobile = useMediaQuery(thm.breakpoints.down("sm"));

  const update = (patch: Partial<ExpenseFilterValues>) => {
    onChange({ ...filters, ...patch });
  };

  const reset = () => {
    onChange({ ...defaultFilters });
  };

  const activeCount = countActiveFilters(filters);

  const filteredCategories = useMemo(() => {
    if (filters.types.length === 0) return [];
    return categories.filter((c) => filters.types.includes(c.type));
  }, [categories, filters.types]);

  const selectedCategories = filteredCategories.filter((c) => filters.categoryIds.includes(c.id));

  const supplierNames = useMemo(() => [...new Set(suppliers.map((s) => s.name))], [suppliers]);
  const carrierNames = useMemo(() => [...new Set(carriers.map((c) => c.name))], [carriers]);
  const workerNames = useMemo(() => [...new Set(workers.map((w) => w.name))], [workers]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <DialogTitle>Фильтры</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          {/* Тип */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Тип
            </Typography>
            <ToggleButtonGroup
              value={filters.types}
              onChange={(_, val) => {
                const newTypes = val as ExpenseType[];
                const validCategoryIds = newTypes.length === 0
                  ? []
                  : filters.categoryIds.filter((id) => {
                      const cat = categories.find((c) => c.id === id);
                      return cat && newTypes.includes(cat.type);
                    });
                update({ types: newTypes, categoryIds: validCategoryIds });
              }}
              size="small"
              fullWidth
            >
              <ToggleButton value="MATERIAL">
                <BuildIcon sx={{ mr: 0.5, fontSize: 18 }} />
                Материалы
              </ToggleButton>
              <ToggleButton value="LABOR">
                <PeopleIcon sx={{ mr: 0.5, fontSize: 18 }} />
                Работы
              </ToggleButton>
              <ToggleButton value="DELIVERY">
                <LocalShippingIcon sx={{ mr: 0.5, fontSize: 18 }} />
                Доставка
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Категория */}
          <Autocomplete
            multiple
            size="small"
            options={filteredCategories}
            getOptionLabel={(o) => o.name}
            value={selectedCategories}
            onChange={(_, val) => update({ categoryIds: val.map((c) => c.id) })}
            disabled={filters.types.length === 0}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Категория"
                placeholder={filters.types.length === 0 ? "Сначала выберите тип" : undefined}
              />
            )}
          />

          {/* Название */}
          <TextField
            size="small"
            label="Название"
            value={filters.title}
            onChange={(e) => update({ title: e.target.value })}
          />

          {/* Даты */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              size="small"
              label="Дата с"
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) => update({ dateFrom: e.target.value || null })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              size="small"
              label="Дата по"
              type="date"
              value={filters.dateTo || ""}
              onChange={(e) => update({ dateTo: e.target.value || null })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>

          {/* Суммы */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              size="small"
              label="Сумма от"
              type="number"
              value={filters.amountFrom ?? ""}
              onChange={(e) => update({ amountFrom: e.target.value ? Number(e.target.value) : null })}
            />
            <TextField
              size="small"
              label="Сумма до"
              type="number"
              value={filters.amountTo ?? ""}
              onChange={(e) => update({ amountTo: e.target.value ? Number(e.target.value) : null })}
            />
          </Box>

          {/* Поставщик */}
          <Autocomplete
            freeSolo
            size="small"
            options={supplierNames}
            value={filters.supplier}
            onChange={(_, val) => update({ supplier: (val as string) || "" })}
            onInputChange={(_, val) => update({ supplier: val })}
            renderInput={(params) => <TextField {...params} label="Поставщик" />}
          />

          {/* Доставщик */}
          <Autocomplete
            freeSolo
            size="small"
            options={carrierNames}
            value={filters.carrier}
            onChange={(_, val) => update({ carrier: (val as string) || "" })}
            onInputChange={(_, val) => update({ carrier: val })}
            renderInput={(params) => <TextField {...params} label="Доставщик" />}
          />

          {/* Работник */}
          <Autocomplete
            freeSolo
            size="small"
            options={workerNames}
            value={filters.worker}
            onChange={(_, val) => update({ worker: (val as string) || "" })}
            onInputChange={(_, val) => update({ worker: val })}
            renderInput={(params) => <TextField {...params} label="Работник" />}
          />

          {/* Запланированные */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Статус
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={filters.plannedStatus}
              onChange={(_, val) => {
                if (val !== null) update({ plannedStatus: val });
              }}
              size="small"
              fullWidth
            >
              <ToggleButton value="all">Все</ToggleButton>
              <ToggleButton value="planned">Запланированные</ToggleButton>
              <ToggleButton value="actual">Фактические</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {activeCount > 0 && (
          <Button startIcon={<ClearIcon />} onClick={reset} sx={{ mr: "auto" }}>
            Сбросить ({activeCount})
          </Button>
        )}
        <Button variant="contained" onClick={onClose}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ExpenseFilters;
