import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material";
import type { Supplier } from "@construction-tracker/shared/dist";

interface SupplierFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  supplier?: Supplier | null;
}

export default function SupplierForm({
  open,
  onClose,
  onSubmit,
  supplier,
}: SupplierFormProps) {
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [hasDelivery, setHasDelivery] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (supplier) {
      setName(supplier.name);
      setContactName(supplier.contactName || "");
      setPhone(supplier.phone || "");
      setWebsite(supplier.website || "");
      setAddress(supplier.address || "");
      setLatitude(supplier.latitude != null ? String(supplier.latitude) : "");
      setLongitude(supplier.longitude != null ? String(supplier.longitude) : "");
      setHasDelivery(supplier.hasDelivery ?? false);
      setNotes(supplier.notes || "");
    } else {
      resetForm();
    }
  }, [supplier, open]);

  const resetForm = () => {
    setName("");
    setContactName("");
    setPhone("");
    setWebsite("");
    setAddress("");
    setLatitude("");
    setLongitude("");
    setHasDelivery(false);
    setNotes("");
  };

  const handleSubmit = () => {
    const data: Record<string, unknown> = {
      name,
      contactName: contactName || undefined,
      phone: phone || undefined,
      website: website || undefined,
      address: address || undefined,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      hasDelivery,
      notes: notes || undefined,
    };
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {supplier ? "Редактировать поставщика" : "Добавить поставщика"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Название фирмы / базы"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            placeholder="ООО «СтройМатериал»"
          />
          <TextField
            label="Контактное лицо"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
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
            label="Сайт"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            fullWidth
            placeholder="https://example.com"
          />
          <TextField
            label="Адрес"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            fullWidth
            placeholder="г. Москва, ул. Строителей, 10"
          />
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Геолокация (для открытия в Яндекс Картах)
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Широта"
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                sx={{ flex: 1 }}
                placeholder="55.7558"
                slotProps={{ htmlInput: { step: "any" } }}
              />
              <TextField
                label="Долгота"
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                sx={{ flex: 1 }}
                placeholder="37.6173"
                slotProps={{ htmlInput: { step: "any" } }}
              />
            </Box>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={hasDelivery}
                onChange={(e) => setHasDelivery(e.target.checked)}
              />
            }
            label="Есть доставка"
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
          {supplier ? "Сохранить" : "Добавить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
