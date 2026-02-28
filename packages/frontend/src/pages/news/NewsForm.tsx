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
import { useStore } from "@/stores/RootStore";

const NewsForm = observer(() => {
  const { newsStore } = useStore();
  const { formOpen, editingNews } = newsStore;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (editingNews) {
      setTitle(editingNews.title);
      setContent(editingNews.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [editingNews, formOpen]);

  const handleSubmit = () => {
    const editing = editingNews;
    newsStore.closeForm();

    if (editing) {
      newsStore.updateNews(editing.id, { title, content });
    } else {
      newsStore.createNews({ title, content });
    }
  };

  return (
    <Dialog open={formOpen} onClose={newsStore.closeForm} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingNews ? "Редактировать новость" : "Создать новость"}
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
        <Button onClick={newsStore.closeForm} variant="contained">Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!title.trim() || !content.trim()}>
          {editingNews ? "Сохранить" : "Создать"}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default NewsForm;
