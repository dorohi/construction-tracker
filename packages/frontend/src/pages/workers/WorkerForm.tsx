import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import type { Worker } from "@construction-tracker/shared/dist";

interface WorkerFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  worker?: Worker | null;
}

export default function WorkerForm({
  open,
  onClose,
  onSubmit,
  worker,
}: WorkerFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (worker) {
      setName(worker.name);
      setPhone(worker.phone || "");
      setWebsite(worker.website || "");
      setSpecialty(worker.specialty || "");
      setNotes(worker.notes || "");
    } else {
      resetForm();
    }
  }, [worker, open]);

  const resetForm = () => {
    setName("");
    setPhone("");
    setWebsite("");
    setSpecialty("");
    setNotes("");
  };

  const handleSubmit = () => {
    const optional = (val: string) => val || (worker ? "" : undefined);
    const data: Record<string, unknown> = {
      name,
      phone: optional(phone),
      website: optional(website),
      specialty: optional(specialty),
      notes: optional(notes),
    };
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {worker ? "Редактировать работника" : "Добавить работника"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="ФИО"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            placeholder="Иванов Иван Иванович"
          />
          <TextField
            label="Телефон"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            placeholder="+7 (999) 123-45-67"
          />
          <TextField
            label="Сайт / Telegram"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            fullWidth
            placeholder="https://t.me/username"
          />
          <TextField
            label="Специальность"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            fullWidth
            placeholder="Электрик, сварщик, плиточник..."
          />
          <TextField
            label="Заметки"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={3}
            fullWidth
            placeholder="Дополнительная информация..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!name.trim()}
        >
          {worker ? "Сохранить" : "Добавить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
