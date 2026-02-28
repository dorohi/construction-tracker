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

const CarrierForm = observer(() => {
  const { carrierStore } = useStore();
  const { formOpen, editingCarrier } = carrierStore;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editingCarrier) {
      setName(editingCarrier.name);
      setPhone(editingCarrier.phone || "");
      setWebsite(editingCarrier.website || "");
      setVehicle(editingCarrier.vehicle || "");
      setLicensePlate(editingCarrier.licensePlate || "");
      setNotes(editingCarrier.notes || "");
    } else {
      setName("");
      setPhone("");
      setWebsite("");
      setVehicle("");
      setLicensePlate("");
      setNotes("");
    }
  }, [editingCarrier, formOpen]);

  const handleSubmit = () => {
    const optional = (val: string) => val || (editingCarrier ? "" : undefined);
    const data: Record<string, unknown> = {
      name,
      phone: optional(phone),
      website: optional(website),
      vehicle: optional(vehicle),
      licensePlate: optional(licensePlate),
      notes: optional(notes),
    };

    const editing = editingCarrier;
    carrierStore.closeForm();

    if (editing) {
      carrierStore.updateCarrier(editing.id, data as Parameters<typeof carrierStore.updateCarrier>[1]);
    } else {
      carrierStore.createCarrier(data as unknown as Parameters<typeof carrierStore.createCarrier>[0]);
    }
  };

  return (
    <Dialog open={formOpen} onClose={carrierStore.closeForm} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingCarrier ? "Редактировать водителя" : "Добавить водителя"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Имя водителя" value={name} onChange={(e) => setName(e.target.value)} required fullWidth placeholder="Петров Пётр Петрович" />
          <TextField label="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth placeholder="+7 (999) 123-45-67" />
          <TextField label="Сайт / Telegram" value={website} onChange={(e) => setWebsite(e.target.value)} fullWidth placeholder="https://t.me/username" />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Машина" value={vehicle} onChange={(e) => setVehicle(e.target.value)} sx={{ flex: 1 }} placeholder="ГАЗель, КАМАЗ..." />
            <TextField label="Гос. номер" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} sx={{ flex: 1 }} placeholder="А123БВ 77" />
          </Box>
          <TextField label="Заметки" value={notes} onChange={(e) => setNotes(e.target.value)} multiline rows={3} fullWidth placeholder="Дополнительная информация..." />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={carrierStore.closeForm} variant="contained">Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!name.trim()}>
          {editingCarrier ? "Сохранить" : "Добавить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default CarrierForm;
