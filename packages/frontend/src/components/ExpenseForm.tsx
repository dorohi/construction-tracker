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
} from "@mui/material";
import type { Expense, Category, ExpenseType } from "@construction-tracker/shared";

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  expense?: Expense | null;
  categories: Category[];
}

export default function ExpenseForm({
  open,
  onClose,
  onSubmit,
  expense,
  categories,
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
  // Labor fields
  const [workerName, setWorkerName] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

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
      setWorkerName(expense.workerName || "");
      setHoursWorked(expense.hoursWorked != null ? String(expense.hoursWorked) : "");
      setHourlyRate(expense.hourlyRate != null ? String(expense.hourlyRate) : "");
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
    setWorkerName("");
    setHoursWorked("");
    setHourlyRate("");
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
    };

    if (type === "MATERIAL") {
      if (quantity) data.quantity = parseFloat(quantity);
      if (unit) data.unit = unit;
      if (unitPrice) data.unitPrice = parseFloat(unitPrice);
      if (supplier) data.supplier = supplier;
    } else {
      if (workerName) data.workerName = workerName;
      if (hoursWorked) data.hoursWorked = parseFloat(hoursWorked);
      if (hourlyRate) data.hourlyRate = parseFloat(hourlyRate);
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
          </ToggleButtonGroup>

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
              <TextField
                label="Поставщик"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                fullWidth
              />
            </>
          )}

          {type === "LABOR" && (
            <>
              <TextField
                label="Имя работника"
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
                fullWidth
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
        <Button onClick={onClose}>Отмена</Button>
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
