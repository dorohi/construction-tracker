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
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useStore } from "../../stores/RootStore";

const SupplierForm = observer(() => {
  const { supplierStore } = useStore();
  const { formOpen, editingSupplier } = supplierStore;

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
    if (editingSupplier) {
      setName(editingSupplier.name);
      setContactName(editingSupplier.contactName || "");
      setPhone(editingSupplier.phone || "");
      setWebsite(editingSupplier.website || "");
      setAddress(editingSupplier.address || "");
      setLatitude(editingSupplier.latitude != null ? String(editingSupplier.latitude) : "");
      setLongitude(editingSupplier.longitude != null ? String(editingSupplier.longitude) : "");
      setHasDelivery(editingSupplier.hasDelivery ?? false);
      setNotes(editingSupplier.notes || "");
    } else {
      setName("");
      setContactName("");
      setPhone("");
      setWebsite("");
      setAddress("");
      setLatitude("");
      setLongitude("");
      setHasDelivery(false);
      setNotes("");
    }
  }, [editingSupplier, formOpen]);

  const handleSubmit = () => {
    const optional = (val: string) => val || (editingSupplier ? "" : undefined);
    const data: Record<string, unknown> = {
      name,
      contactName: optional(contactName),
      phone: optional(phone),
      website: optional(website),
      address: optional(address),
      latitude: latitude ? parseFloat(latitude) : (editingSupplier ? null : undefined),
      longitude: longitude ? parseFloat(longitude) : (editingSupplier ? null : undefined),
      hasDelivery,
      notes: optional(notes),
    };

    const editing = editingSupplier;
    supplierStore.closeForm();

    if (editing) {
      supplierStore.updateSupplier(editing.id, data as Parameters<typeof supplierStore.updateSupplier>[1]);
    } else {
      supplierStore.createSupplier(data as unknown as Parameters<typeof supplierStore.createSupplier>[0]);
    }
  };

  return (
    <Dialog open={formOpen} onClose={supplierStore.closeForm} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingSupplier ? "Редактировать поставщика" : "Добавить поставщика"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Название фирмы / базы" value={name} onChange={(e) => setName(e.target.value)} required fullWidth placeholder="ООО «СтройМатериал»" />
          <TextField label="Контактное лицо" value={contactName} onChange={(e) => setContactName(e.target.value)} fullWidth placeholder="Иванов Иван Иванович" />
          <TextField label="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth placeholder="+7 (999) 123-45-67" />
          <TextField label="Сайт" value={website} onChange={(e) => setWebsite(e.target.value)} fullWidth placeholder="https://example.com" />
          <TextField label="Адрес" value={address} onChange={(e) => setAddress(e.target.value)} fullWidth placeholder="г. Москва, ул. Строителей, 10" />
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Геолокация (для открытия в Яндекс Картах)
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField label="Широта" type="number" value={latitude} onChange={(e) => setLatitude(e.target.value)} sx={{ flex: 1 }} placeholder="55.7558" slotProps={{ htmlInput: { step: "any" } }} />
              <TextField label="Долгота" type="number" value={longitude} onChange={(e) => setLongitude(e.target.value)} sx={{ flex: 1 }} placeholder="37.6173" slotProps={{ htmlInput: { step: "any" } }} />
            </Box>
          </Box>
          <FormControlLabel
            control={<Switch checked={hasDelivery} onChange={(e) => setHasDelivery(e.target.checked)} />}
            label="Есть доставка"
          />
          <TextField label="Заметки" value={notes} onChange={(e) => setNotes(e.target.value)} multiline rows={3} fullWidth placeholder="Дополнительная информация..." />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={supplierStore.closeForm} variant="contained">Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!name.trim()}>
          {editingSupplier ? "Сохранить" : "Добавить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default SupplierForm;
