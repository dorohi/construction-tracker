import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Divider,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import type { Category } from "@construction-tracker/shared";
import { useStore } from "../../stores/RootStore";
import { categoriesApi } from "../../services/api";

const TransferDialog = observer(() => {
  const { expenseStore, projectStore } = useStore();
  const expense = expenseStore.transferringExpense;

  const [targetProjectId, setTargetProjectId] = useState("");
  const [targetCategoryId, setTargetCategoryId] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const isSameProject = targetProjectId === expense?.projectId;

  useEffect(() => {
    if (expense) {
      setTargetProjectId(expense.projectId);
      setTargetCategoryId("");
      setQuantity("");
      setDescription("");
    }
  }, [expense]);

  useEffect(() => {
    if (targetProjectId) {
      categoriesApi.list(targetProjectId).then(setCategories).catch(() => setCategories([]));
    } else {
      setCategories([]);
    }
  }, [targetProjectId]);

  const filteredCategories = categories.filter((c) => c.type === "MATERIAL");

  const maxQty = expense?.quantity || 0;
  const remainingQty = typeof quantity === "number" ? maxQty - quantity : maxQty;

  const isValid =
    targetProjectId &&
    typeof quantity === "number" &&
    quantity > 0 &&
    quantity <= maxQty &&
    (!isSameProject || description.trim());

  const handleClose = () => expenseStore.setTransferringExpense(null);

  const handleSubmit = async () => {
    if (!expense || !isValid) return;
    setLoading(true);
    const result = await expenseStore.transferExpense(expense.id, {
      targetProjectId,
      targetType: "MATERIAL",
      targetCategoryId: targetCategoryId || undefined,
      quantity: quantity as number,
      description: description.trim() || undefined,
    });
    setLoading(false);
    if (result) {
      projectStore.loadProject(expense.projectId);
      handleClose();
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!expense) return null;

  const sourceFields = (
    <Stack spacing={2}>
      <Typography variant="subtitle2" color="text.secondary">Источник</Typography>
      <TextField fullWidth label="Проект" value={projectStore.currentProject?.name || ""} disabled />
      <TextField fullWidth label="Категория" value={expense.category?.name || "—"} disabled />
      <TextField fullWidth label="Остаток количества" value={remainingQty} disabled />
    </Stack>
  );

  const targetFields = (
    <Stack spacing={2}>
      <Typography variant="subtitle2" color="text.secondary">Назначение</Typography>
      <FormControl fullWidth>
        <InputLabel>Проект</InputLabel>
        <Select
          value={targetProjectId}
          label="Проект"
          onChange={(e) => {
            setTargetProjectId(e.target.value);
            setTargetCategoryId("");
          }}
        >
          {projectStore.projects.map((p) => (
            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Категория</InputLabel>
        <Select
          value={targetCategoryId}
          label="Категория"
          onChange={(e) => setTargetCategoryId(e.target.value)}
        >
          <MenuItem value="">Без категории</MenuItem>
          {filteredCategories.map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        label="Количество"
        type="number"
        value={quantity}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") { setQuantity(""); return; }
          const num = Number(v);
          setQuantity(num > maxQty ? maxQty : num);
        }}
        inputProps={{ min: 0.01, max: maxQty, step: "any" }}
        helperText={`Макс: ${maxQty}`}
      />
    </Stack>
  );

  return (
    <Dialog open={!!expense} onClose={handleClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <DialogTitle>Трансфер затраты</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Название"
          value={expense.title}
          disabled
          sx={{ mt: 1, mb: 2 }}
        />

        <Divider sx={{ mb: 2 }} />

        {isMobile ? (
          <Stack spacing={3}>
            {sourceFields}
            {targetFields}
          </Stack>
        ) : (
          <Grid container spacing={3}>
            <Grid size={6}>{sourceFields}</Grid>
            <Grid size={6}>{targetFields}</Grid>
          </Grid>
        )}

        <TextField
          fullWidth
          label={isSameProject ? "Описание (обязательно)" : "Описание"}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required={isSameProject}
          multiline
          rows={2}
          sx={{ mt: 3 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained">Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!isValid || loading}>
          Перенести
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default TransferDialog;
