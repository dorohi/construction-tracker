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
  FormControlLabel,
  Switch,
  Autocomplete,
  IconButton,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useStore } from "../../stores/RootStore";

interface Row {
  id?: string;
  title: string;
  categoryId: string;
  quantity: string;
  unit: string;
  unitPrice: string;
}

const emptyRow = (): Row => ({ title: "", categoryId: "", quantity: "", unit: "", unitPrice: "" });

const InvoiceForm = observer(() => {
  const { invoiceStore, projectStore, supplierStore } = useStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { formOpen, editingInvoice, loadingForm } = invoiceStore;
  const categories = projectStore.categories.filter((c) => c.type === "MATERIAL");
  const suppliers = supplierStore.suppliers;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [supplier, setSupplier] = useState("");
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [planned, setPlanned] = useState(false);
  const [rows, setRows] = useState<Row[]>([emptyRow()]);

  useEffect(() => {
    if (editingInvoice) {
      setTitle(editingInvoice.title);
      setDescription(editingInvoice.description || "");
      setDate(editingInvoice.date.split("T")[0]);
      setSupplier(editingInvoice.supplier || "");
      setSupplierId(editingInvoice.supplierId || null);
      setPlanned(editingInvoice.planned);
      setRows(
        editingInvoice.items.length
          ? editingInvoice.items.map((it) => ({
              id: it.id,
              title: it.title,
              categoryId: it.categoryId || "",
              quantity: it.quantity != null ? String(it.quantity) : "",
              unit: it.unit || "",
              unitPrice: it.unitPrice != null ? String(it.unitPrice) : "",
            }))
          : [emptyRow()]
      );
    } else {
      setTitle("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      setSupplier("");
      setSupplierId(null);
      setPlanned(false);
      setRows([emptyRow()]);
    }
  }, [editingInvoice, formOpen]);

  const updateRow = (i: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (i: number) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  const rowAmount = (r: Row) => (parseFloat(r.quantity) || 0) * (parseFloat(r.unitPrice) || 0);
  const total = rows.reduce((s, r) => s + rowAmount(r), 0);

  const validRows = rows.filter((r) => r.title.trim() && r.quantity && r.unitPrice);
  const canSubmit = Boolean(title.trim() && date && validRows.length > 0);

  const handleSubmit = () => {
    const data = {
      title: title.trim(),
      description: description || undefined,
      date,
      supplier: supplier || undefined,
      supplierId: supplierId || null,
      planned,
      items: validRows.map((r) => ({
        ...(r.id ? { id: r.id } : {}),
        title: r.title.trim(),
        categoryId: r.categoryId || null,
        quantity: parseFloat(r.quantity),
        unit: r.unit || null,
        unitPrice: parseFloat(r.unitPrice),
      })),
    };
    const projectId = projectStore.currentProject!.id;
    const editing = editingInvoice;
    invoiceStore.closeForm();
    if (editing) {
      invoiceStore.updateInvoice(editing.id, data).then(() => projectStore.loadProject(projectId));
    } else {
      invoiceStore.createInvoice(projectId, data).then(() => projectStore.loadProject(projectId));
    }
  };

  return (
    <Dialog open={formOpen} onClose={invoiceStore.closeForm} maxWidth="md" fullWidth fullScreen={isMobile}>
      <DialogTitle>{editingInvoice ? "Редактировать накладную" : "Новая накладная"}</DialogTitle>
      <DialogContent>
        {loadingForm ? (
          <Typography sx={{ py: 4 }}>Загрузка…</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Название" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />
            <TextField
              label="Описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />
            <Box sx={{ display: "flex", gap: 2, flexDirection: isMobile ? "column" : "row" }}>
              <Autocomplete
                sx={{ flex: 1 }}
                freeSolo
                options={suppliers}
                getOptionLabel={(o) => (typeof o === "string" ? o : o.name)}
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
              <TextField
                sx={{ flex: 1 }}
                label="Дата"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
            <FormControlLabel
              control={<Switch checked={planned} onChange={(e) => setPlanned(e.target.checked)} />}
              label="Запланированная накладная"
            />

            <Divider>Позиции</Divider>

            {rows.map((r, i) => (
              <Box
                key={i}
                sx={{ display: "flex", gap: 1, alignItems: "flex-start", flexWrap: isMobile ? "wrap" : "nowrap" }}
              >
                <TextField
                  label="Название"
                  value={r.title}
                  onChange={(e) => updateRow(i, { title: e.target.value })}
                  sx={{ flex: 2, minWidth: 140 }}
                />
                <TextField
                  label="Категория"
                  value={r.categoryId}
                  onChange={(e) => updateRow(i, { categoryId: e.target.value })}
                  select
                  sx={{ flex: 1.2, minWidth: 120 }}
                >
                  <MenuItem value="">Без категории</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Кол-во"
                  type="number"
                  value={r.quantity}
                  onChange={(e) => updateRow(i, { quantity: e.target.value })}
                  sx={{ flex: 0.8, minWidth: 80 }}
                />
                <TextField
                  label="Ед."
                  value={r.unit}
                  onChange={(e) => updateRow(i, { unit: e.target.value })}
                  placeholder="шт"
                  sx={{ flex: 0.7, minWidth: 70 }}
                />
                <TextField
                  label="Цена"
                  type="number"
                  value={r.unitPrice}
                  onChange={(e) => updateRow(i, { unitPrice: e.target.value })}
                  sx={{ flex: 0.9, minWidth: 90 }}
                />
                <TextField
                  label="Сумма"
                  value={rowAmount(r) ? rowAmount(r).toFixed(2) : ""}
                  sx={{ flex: 0.9, minWidth: 90 }}
                  slotProps={{ input: { readOnly: true } }}
                />
                <IconButton onClick={() => removeRow(i)} disabled={rows.length === 1} sx={{ mt: 1 }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Button startIcon={<AddIcon />} onClick={addRow}>
                Добавить строку
              </Button>
              <Typography variant="h6">Итого: {total.toFixed(2)} ₽</Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={invoiceStore.closeForm} variant="contained">
          Отмена
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!canSubmit || loadingForm}>
          {editingInvoice ? "Сохранить" : "Создать"}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default InvoiceForm;
