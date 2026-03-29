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
import HandymanIcon from "@mui/icons-material/Handyman";
import { useStore } from "../../stores/RootStore";
import { defaultSharedFilters, type SharedFilterValues } from "../../stores/SharedStore";

const SharedFilters = observer(() => {
  const { sharedStore } = useStore();
  const thm = useTheme();
  const isMobile = useMediaQuery(thm.breakpoints.down("sm"));

  const { filters } = sharedStore;

  const update = (patch: Partial<SharedFilterValues>) => {
    sharedStore.setFilters({ ...filters, ...patch });
  };

  const reset = () => {
    sharedStore.setFilters({ ...defaultSharedFilters });
  };

  const categories = sharedStore.uniqueCategories;

  const filteredCategories = useMemo(() => {
    if (filters.types.length === 0) return [];
    return categories.filter((c) => filters.types.includes(c.type));
  }, [categories, filters.types]);

  const selectedCategories = filteredCategories.filter((c) => filters.categoryIds.includes(c.id));

  return (
    <Dialog open={sharedStore.filtersOpen} onClose={sharedStore.closeFilters} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <DialogTitle>Фильтры</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Тип
            </Typography>
            <ToggleButtonGroup
              value={filters.types}
              onChange={(_, val) => {
                const newTypes = val as string[];
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
              <ToggleButton value="TOOL">
                <HandymanIcon sx={{ mr: 0.5, fontSize: 18 }} />
                Инструменты
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

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

          <TextField
            size="small"
            label="Название"
            value={filters.title}
            onChange={(e) => update({ title: e.target.value })}
          />

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

          {sharedStore.uniqueSuppliers.length > 0 && (
            <Autocomplete
              freeSolo
              size="small"
              options={sharedStore.uniqueSuppliers}
              value={filters.supplier}
              onChange={(_, val) => update({ supplier: (val as string) || "" })}
              onInputChange={(_, val) => update({ supplier: val })}
              renderInput={(params) => <TextField {...params} label="Поставщик" />}
            />
          )}

          {sharedStore.uniqueCarriers.length > 0 && (
            <Autocomplete
              freeSolo
              size="small"
              options={sharedStore.uniqueCarriers}
              value={filters.carrier}
              onChange={(_, val) => update({ carrier: (val as string) || "" })}
              onInputChange={(_, val) => update({ carrier: val })}
              renderInput={(params) => <TextField {...params} label="Доставщик" />}
            />
          )}

          {sharedStore.uniqueWorkers.length > 0 && (
            <Autocomplete
              freeSolo
              size="small"
              options={sharedStore.uniqueWorkers}
              value={filters.worker}
              onChange={(_, val) => update({ worker: (val as string) || "" })}
              onInputChange={(_, val) => update({ worker: val })}
              renderInput={(params) => <TextField {...params} label="Работник" />}
            />
          )}

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
        {sharedStore.activeFilterCount > 0 && (
          <Button startIcon={<ClearIcon />} onClick={reset} sx={{ mr: "auto" }}>
            Сбросить ({sharedStore.activeFilterCount})
          </Button>
        )}
        <Button variant="contained" onClick={sharedStore.closeFilters}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default SharedFilters;
