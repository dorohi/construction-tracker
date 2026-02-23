import { useState, useEffect } from "react";
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
import type { Expense, Category, ExpenseType, Supplier, Carrier, Worker } from "@construction-tracker/shared/dist";

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  expense?: Expense | null;
  categories: Category[];
  suppliers?: Supplier[];
  carriers?: Carrier[];
  workers?: Worker[];
}

export default function ExpenseForm({
  open,
  onClose,
  onSubmit,
  expense,
  categories,
  suppliers = [],
  carriers = [],
  workers = [],
}: ExpenseFormProps) {
  const [type, setType] = useState<ExpenseType>("MATERIAL");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState("");
  // Material fields
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [supplierId, setSupplierId] = useState<string | null>(null);
  // Labor fields
  const [worker, setWorker] = useState("");
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [hoursWorked, setHoursWorked] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  // Delivery fields
  const [carrier, setCarrier] = useState("");
  const [carrierId, setCarrierId] = useState<string | null>(null);
  // Planned
  const [planned, setPlanned] = useState(false);

  useEffect(() => {
    if (expense) {
      setType(expense.type as ExpenseType);
      setTitle(expense.title);
      setDescription(expense.description || "");
      setAmount(String(expense.amount));
      setDate(expense.date.split("T")[0]);
      setCategoryId(expense.categoryId || "");
      setQuantity(expense.quantity != null ? String(expense.quantity) : "");
      setUnit(expense.unit || "");
      setUnitPrice(expense.unitPrice != null ? String(expense.unitPrice) : "");
      setSupplier(expense.supplier || "");
      setSupplierId(expense.supplierId || null);
      setWorker(expense.worker || "");
      setWorkerId(expense.workerId || null);
      setHoursWorked(expense.hoursWorked != null ? String(expense.hoursWorked) : "");
      setHourlyRate(expense.hourlyRate != null ? String(expense.hourlyRate) : "");
      setCarrier(expense.carrier || "");
      setCarrierId(expense.carrierId || null);
      setPlanned(expense.planned ?? false);
    } else {
      resetForm();
    }
  }, [expense, open]);

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
    }

    onSubmit(data);
    onClose();
  };

  // Auto-calculate amount for materials
  useEffect(() => {
    if (type === "MATERIAL" && quantity && unitPrice) {
      setAmount(String(parseFloat(quantity) * parseFloat(unitPrice)));
    }
  }, [quantity, unitPrice, type]);

  // Auto-calculate amount for labor
  useEffect(() => {
    if (type === "LABOR" && hoursWorked && hourlyRate) {
      setAmount(String(parseFloat(hoursWorked) * parseFloat(hourlyRate)));
    }
  }, [hoursWorked, hourlyRate, type]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{expense ? "Редактировать расход" : "Добавить расход"}</DialogTitle>
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
            control={
              <Switch
                checked={planned}
                onChange={(e) => setPlanned(e.target.checked)}
              />
            }
            label="Запланированный расход"
          />

          <TextField
            label="Название"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
            fullWidth
          />

          <TextField
            label="Категория"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            select
            fullWidth
          >
            <MenuItem value="">Без категории</MenuItem>
            {filteredCategories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
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
                <TextField
                  label="Количество"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Ед. изм."
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="кг, м², шт..."
                  sx={{ flex: 1 }}
                />
              </Box>
              <TextField
                label="Цена за единицу"
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                fullWidth
              />
              <Autocomplete
                freeSolo
                options={suppliers}
                getOptionLabel={(option) =>
                  typeof option === "string" ? option : option.name
                }
                value={
                  supplierId
                    ? suppliers.find((s) => s.id === supplierId) || supplier
                    : supplier
                }
                inputValue={supplier}
                onInputChange={(_, value) => {
                  setSupplier(value);
                  // If the typed text doesn't match any supplier, clear supplierId
                  const match = suppliers.find((s) => s.name === value);
                  if (!match) {
                    setSupplierId(null);
                  }
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
                renderInput={(params) => (
                  <TextField {...params} label="Поставщик" fullWidth />
                )}
              />
            </>
          )}

          {type === "LABOR" && (
            <>
              <Autocomplete
                freeSolo
                options={workers}
                getOptionLabel={(option) =>
                  typeof option === "string" ? option : option.name
                }
                value={
                  workerId
                    ? workers.find((w) => w.id === workerId) || worker
                    : worker
                }
                inputValue={worker}
                onInputChange={(_, value) => {
                  setWorker(value);
                  // If the typed text doesn't match any worker, clear workerId
                  const match = workers.find((s) => s.name === value);
                  if (!match) {
                    setWorkerId(null);
                  }
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
                renderInput={(params) => (
                  <TextField {...params} label="Работник" fullWidth />
                )}
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Отработано часов"
                  type="number"
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Ставка в час"
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  sx={{ flex: 1 }}
                />
              </Box>
            </>
          )}

          {type === "DELIVERY" && (
            <Autocomplete
              freeSolo
              options={carriers}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.name
              }
              value={
                carrierId
                  ? carriers.find((c) => c.id === carrierId) || carrier
                  : carrier
              }
              inputValue={carrier}
              onInputChange={(_, value) => {
                setCarrier(value);
                const match = carriers.find((c) => c.name === value);
                if (!match) {
                  setCarrierId(null);
                }
              }}
              onChange={(_, value) => {
                if (value && typeof value !== "string") {
                  setCarrier(value.name);
                  setCarrierId(value.id);
                } else if (typeof value === "string") {
                  setCarrier(value);
                  setCarrierId(null);
                } else {
                  setCarrier("");
                  setCarrierId(null);
                }
              }}
              renderInput={(params) => (
                <TextField {...params} label="Перевозчик" fullWidth />
              )}
            />
          )}

          <TextField
            label="Итого"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Отмена</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!title || !amount || !date}
        >
          {expense ? "Сохранить" : "Добавить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
