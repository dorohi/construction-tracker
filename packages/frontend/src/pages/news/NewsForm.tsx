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
import type { News } from "@construction-tracker/shared";

interface NewsFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string }) => void;
  news?: News | null;
}

export default function NewsForm({
  open,
  onClose,
  onSubmit,
  news,
}: NewsFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (news) {
      setTitle(news.title);
      setContent(news.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [news, open]);

  const handleSubmit = () => {
    onSubmit({ title, content });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {news ? "Редактировать новость" : "Создать новость"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Заголовок"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Содержание"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            multiline
            rows={6}
            fullWidth
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
          disabled={!title.trim() || !content.trim()}
        >
          {news ? "Сохранить" : "Создать"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
