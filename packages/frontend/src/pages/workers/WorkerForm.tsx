import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { useStore } from "../../stores/RootStore";

const WorkerForm = observer(() => {
  const { workersStore } = useStore();
  const { formOpen, editingWorker } = workersStore;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editingWorker) {
      setName(editingWorker.name);
      setPhone(editingWorker.phone || "");
      setWebsite(editingWorker.website || "");
      setSpecialty(editingWorker.specialty || "");
      setNotes(editingWorker.notes || "");
    } else {
      setName("");
      setPhone("");
      setWebsite("");
      setSpecialty("");
      setNotes("");
    }
  }, [editingWorker, formOpen]);

  const handleSubmit = () => {
    const optional = (val: string) => val || (editingWorker ? "" : undefined);
    const data: Record<string, unknown> = {
      name,
      phone: optional(phone),
      website: optional(website),
      specialty: optional(specialty),
      notes: optional(notes),
    };

    const editing = editingWorker;
    workersStore.closeForm();

    if (editing) {
      workersStore.updateWorker(editing.id, data as Parameters<typeof workersStore.updateWorker>[1]);
    } else {
      workersStore.createWorker(data as unknown as Parameters<typeof workersStore.createWorker>[0]);
    }
  };

  return (
    <Dialog open={formOpen} onClose={workersStore.closeForm} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingWorker ? "Редактировать работника" : "Добавить работника"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="ФИО" value={name} onChange={(e) => setName(e.target.value)} required fullWidth placeholder="Иванов Иван Иванович" />
          <TextField label="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth placeholder="+7 (999) 123-45-67" />
          <TextField label="Сайт / Telegram" value={website} onChange={(e) => setWebsite(e.target.value)} fullWidth placeholder="https://t.me/username" />
          <TextField label="Специальность" value={specialty} onChange={(e) => setSpecialty(e.target.value)} fullWidth placeholder="Электрик, сварщик, плиточник..." />
          <TextField label="Заметки" value={notes} onChange={(e) => setNotes(e.target.value)} multiline rows={3} fullWidth placeholder="Дополнительная информация..." />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={workersStore.closeForm} variant="contained">Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!name.trim()}>
          {editingWorker ? "Сохранить" : "Добавить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default WorkerForm;
