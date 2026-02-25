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
import type { Carrier } from "@construction-tracker/shared/dist";

interface CarrierFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  carrier?: Carrier | null;
}

export default function CarrierForm({
  open,
  onClose,
  onSubmit,
  carrier,
}: CarrierFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (carrier) {
      setName(carrier.name);
      setPhone(carrier.phone || "");
      setWebsite(carrier.website || "");
      setVehicle(carrier.vehicle || "");
      setLicensePlate(carrier.licensePlate || "");
      setNotes(carrier.notes || "");
    } else {
      resetForm();
    }
  }, [carrier, open]);

  const resetForm = () => {
    setName("");
    setPhone("");
    setWebsite("");
    setVehicle("");
    setLicensePlate("");
    setNotes("");
  };

  const handleSubmit = () => {
    const data: Record<string, unknown> = {
      name,
      phone: phone || undefined,
      website: website || undefined,
      vehicle: vehicle || undefined,
      licensePlate: licensePlate || undefined,
      notes: notes || undefined,
    };
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {carrier ? "Редактировать водителя" : "Добавить водителя"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Имя водителя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            placeholder="Петров Пётр Петрович"
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
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Машина"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              sx={{ flex: 1 }}
              placeholder="ГАЗель, КАМАЗ..."
            />
            <TextField
              label="Гос. номер"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              sx={{ flex: 1 }}
              placeholder="А123БВ 77"
            />
          </Box>
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
          {carrier ? "Сохранить" : "Добавить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
