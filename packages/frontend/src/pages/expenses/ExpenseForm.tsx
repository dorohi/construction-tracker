import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
  Switch,
  Autocomplete,
} from "@mui/material";
import type { ExpenseType } from "@construction-tracker/shared/dist";
import { useStore } from "../../stores/RootStore";

const ExpenseForm = observer(() => {
  const { expenseStore, projectStore, supplierStore, carrierStore, workersStore } = useStore();

  const { formOpen, editingExpense, duplicatingExpense } = expenseStore;
  const categories = projectStore.categories;
  const suppliers = supplierStore.suppliers;
  const carriers = carrierStore.carriers;
  const workers = workersStore.workers;

  const [type, setType] = useState<ExpenseType>("MATERIAL");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [worker, setWorker] = useState("");
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [hoursWorked, setHoursWorked] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [carrier, setCarrier] = useState("");
  const [carrierId, setCarrierId] = useState<string | null>(null);
  const [planned, setPlanned] = useState(false);

  useEffect(() => {
    const source = editingExpense || duplicatingExpense;
    if (source) {
      setType(source.type as ExpenseType);
      setTitle(source.title);
      setDescription(source.description || "");
      setAmount(String(source.amount));
      setDate(duplicatingExpense && !editingExpense ? new Date().toISOString().split("T")[0] : source.date.split("T")[0]);
      setCategoryId(source.categoryId || "");
      setQuantity(source.quantity != null ? String(source.quantity) : "");
      setUnit(source.unit || "");
      setUnitPrice(source.unitPrice != null ? String(source.unitPrice) : "");
      setSupplier(source.supplier || "");
      setSupplierId(source.supplierId || null);
      setWorker(source.worker || "");
      setWorkerId(source.workerId || null);
      setHoursWorked(source.hoursWorked != null ? String(source.hoursWorked) : "");
      setHourlyRate(source.hourlyRate != null ? String(source.hourlyRate) : "");
      setCarrier(source.carrier || "");
      setCarrierId(source.carrierId || null);
      setPlanned(source.planned ?? false);
    } else {
      resetForm();
    }
  }, [editingExpense, duplicatingExpense, formOpen]);

  const resetForm = () => {
    setType("MATERIAL");
    setTitle("");
    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setCategoryId("");
    setQuantity("");
    setUnit("");
    setUnitPrice("");
    setSupplier("");
    setSupplierId(null);
    setWorker("");
    setWorkerId(null);
    setHoursWorked("");
    setHourlyRate("");
    setCarrier("");
    setCarrierId(null);
    setPlanned(false);
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const carrierOptions = [
    ...carriers.map((c) => ({ ...c, _group: "Перевозчики" })),
    ...suppliers
      .filter((s) => s.hasDelivery)
      .map((s) => ({ ...s, _group: "Поставщики" })),
  ];

  const handleSubmit = () => {
    const data: Record<string, unknown> = {
      type,
      title,
      description: description || undefined,
      amount: parseFloat(amount),
      date,
      categoryId: categoryId || undefined,
      planned,
    };

    if (type === "MATERIAL") {
      if (quantity) data.quantity = parseFloat(quantity);
      if (unit) data.unit = unit;
      if (unitPrice) data.unitPrice = parseFloat(unitPrice);
      if (supplier) data.supplier = supplier;
      data.supplierId = supplierId || undefined;
    } else if (type === "LABOR") {
      if (worker) data.worker = worker;
      data.workerId = workerId || undefined;
      if (hoursWorked) data.hoursWorked = parseFloat(hoursWorked);
      if (hourlyRate) data.hourlyRate = parseFloat(hourlyRate);
    } else if (type === "DELIVERY") {
      if (carrier) data.carrier = carrier;
      data.carrierId = carrierId || undefined;
      data.supplierId = supplierId || undefined;
    }

    const projectId = projectStore.currentProject!.id;
    const editing = editingExpense;
    expenseStore.closeForm();

    if (editing) {
      expenseStore.updateExpense(editing.id, data).then(() => projectStore.loadProject(projectId));
    } else {
      expenseStore.createExpense(projectId, data as unknown as Parameters<typeof expenseStore.createExpense>[1]).then(() => projectStore.loadProject(projectId));
    }
  };

  useEffect(() => {
    if (type === "MATERIAL" && quantity && unitPrice) {
      setAmount(String(parseFloat(quantity) * parseFloat(unitPrice)));
    }
  }, [quantity, unitPrice, type]);

  useEffect(() => {
    if (type === "LABOR" && hoursWorked && hourlyRate) {
      setAmount(String(parseFloat(hoursWorked) * parseFloat(hourlyRate)));
    }
  }, [hoursWorked, hourlyRate, type]);

  return (
    <Dialog open={formOpen} onClose={expenseStore.closeForm} maxWidth="sm" fullWidth>
      <DialogTitle>{editingExpense ? "Редактировать расход" : "Добавить расход"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={(_, val) => val && setType(val)}
            fullWidth
            size="small"
          >
            <ToggleButton value="MATERIAL">Материал</ToggleButton>
            <ToggleButton value="LABOR">Работа</ToggleButton>
            <ToggleButton value="DELIVERY">Доставка</ToggleButton>
          </ToggleButtonGroup>

          <FormControlLabel
            control={<Switch checked={planned} onChange={(e) => setPlanned(e.target.checked)} />}
            label="Запланированный расход"
          />

          <TextField label="Название" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />

          <TextField label="Описание" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={2} fullWidth />

          <TextField label="Категория" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} select fullWidth>
            <MenuItem value="">Без категории</MenuItem>
            {filteredCategories.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Дата"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />

          {type === "MATERIAL" && (
            <>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField label="Количество" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} sx={{ flex: 1 }} />
                <TextField label="Ед. изм." value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="кг, м², шт..." sx={{ flex: 1 }} />
              </Box>
              <TextField label="Цена за единицу" type="number" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} fullWidth />
              <Autocomplete
                freeSolo
                options={suppliers}
                getOptionLabel={(option) => typeof option === "string" ? option : option.name}
                value={supplierId ? suppliers.find((s) => s.id === supplierId) || supplier : supplier}
                inputValue={supplier}
                onInputChange={(_, value) => {
                  setSupplier(value);
                  const match = suppliers.find((s) => s.name === value);
                  if (!match) setSupplierId(null);
                }}
                onChange={(_, value) => {
                  if (value && typeof value !== "string") {
                    setSupplier(value.name);
                    setSupplierId(value.id);
                  } else if (typeof value === "string") {
                    setSupplier(value);
                    setSupplierId(null);
                  } else {
                    setSupplier("");
                    setSupplierId(null);
                  }
                }}
                renderInput={(params) => <TextField {...params} label="Поставщик" fullWidth />}
              />
            </>
          )}

          {type === "LABOR" && (
            <>
              <Autocomplete
                freeSolo
                options={workers}
                getOptionLabel={(option) => typeof option === "string" ? option : option.name}
                value={workerId ? workers.find((w) => w.id === workerId) || worker : worker}
                inputValue={worker}
                onInputChange={(_, value) => {
                  setWorker(value);
                  const match = workers.find((s) => s.name === value);
                  if (!match) setWorkerId(null);
                }}
                onChange={(_, value) => {
                  if (value && typeof value !== "string") {
                    setWorker(value.name);
                    setWorkerId(value.id);
                  } else if (typeof value === "string") {
                    setWorker(value);
                    setWorkerId(null);
                  } else {
                    setWorker("");
                    setWorkerId(null);
                  }
                }}
                renderInput={(params) => <TextField {...params} label="Работник" fullWidth />}
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField label="Отработано часов" type="number" value={hoursWorked} onChange={(e) => setHoursWorked(e.target.value)} sx={{ flex: 1 }} />
                <TextField label="Ставка в час" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} sx={{ flex: 1 }} />
              </Box>
            </>
          )}

          {type === "DELIVERY" && (
            <Autocomplete
              freeSolo
              options={carrierOptions}
              groupBy={(option) => typeof option === "string" ? "" : option._group}
              getOptionLabel={(option) => typeof option === "string" ? option : option.name}
              value={carrierId || supplierId ? carrierOptions.find((c) => c.id === (carrierId || supplierId)) || carrier : carrier}
              inputValue={carrier}
              onInputChange={(_, value) => {
                setCarrier(value);
                const match = carrierOptions.find((c) => c.name === value);
                if (!match) {
                  setCarrierId(null);
                  setSupplierId(null);
                }
              }}
              onChange={(_, value) => {
                if (value && typeof value !== "string") {
                  setCarrier(value.name);
                  if (value._group === "Поставщики") {
                    setSupplierId(value.id);
                    setCarrierId(null);
                  } else {
                    setCarrierId(value.id);
                    setSupplierId(null);
                  }
                } else if (typeof value === "string") {
                  setCarrier(value);
                  setCarrierId(null);
                  setSupplierId(null);
                } else {
                  setCarrier("");
                  setCarrierId(null);
                  setSupplierId(null);
                }
              }}
              renderInput={(params) => <TextField {...params} label="Перевозчик" fullWidth />}
            />
          )}

          <TextField label="Итого" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required fullWidth />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={expenseStore.closeForm} variant="contained">Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!title || !amount || !date}>
          {editingExpense ? "Сохранить" : "Добавить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ExpenseForm;
