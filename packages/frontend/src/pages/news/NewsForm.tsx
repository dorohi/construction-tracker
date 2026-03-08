import { useState, useEffect, useRef } from "react";
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
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuButtonUnderline,
  MenuButtonStrikethrough,
  MenuButtonHighlightToggle,
  MenuButtonBulletedList,
  MenuButtonOrderedList,
  MenuButtonBlockquote,
  MenuSelectHeading,
  MenuDivider,
  MenuControlsContainer,
  RichTextEditor,
  type RichTextEditorRef,
} from "mui-tiptap";
import { useStore } from "@/stores/RootStore";

const extensions = [
  StarterKit,
  Underline,
  Highlight,
];

const NewsForm = observer(() => {
  const { newsStore } = useStore();
  const { formOpen, editingNews } = newsStore;
  const rteRef = useRef<RichTextEditorRef>(null);

  const [title, setTitle] = useState("");
  const [initialContent, setInitialContent] = useState("");

  useEffect(() => {
    if (formOpen) {
      if (editingNews) {
        setTitle(editingNews.title);
        setInitialContent(editingNews.content);
      } else {
        setTitle("");
        setInitialContent("");
      }
    }
  }, [editingNews, formOpen]);

  const handleSubmit = () => {
    const content = rteRef.current?.editor?.getHTML() || "";
    const editing = editingNews;
    newsStore.closeForm();

    if (editing) {
      newsStore.updateNews(editing.id, { title, content });
    } else {
      newsStore.createNews({ title, content });
    }
  };

  const getContent = () => rteRef.current?.editor?.getHTML() || "";
  const isEmpty = () => {
    const html = getContent();
    return !html || html === "<p></p>" || html.trim() === "";
  };

  return (
    <Dialog open={formOpen} onClose={newsStore.closeForm} maxWidth="md" fullWidth>
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
          <Box
            sx={{
              "& .MuiTiptap-RichTextEditor-root": {
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
              },
              "& .MuiTiptap-RichTextContent-root .ProseMirror": {
                minHeight: 200,
                px: 2,
                py: 1,
              },
            }}
          >
            <RichTextEditor
              ref={rteRef}
              key={formOpen ? `open-${editingNews?.id || "new"}` : "closed"}
              extensions={extensions}
              content={initialContent}
              renderControls={() => (
                <MenuControlsContainer>
                  <MenuSelectHeading />
                  <MenuDivider />
                  <MenuButtonBold />
                  <MenuButtonItalic />
                  <MenuButtonUnderline />
                  <MenuButtonStrikethrough />
                  <MenuDivider />
                  <MenuButtonHighlightToggle />
                  <MenuDivider />
                  <MenuButtonBulletedList />
                  <MenuButtonOrderedList />
                  <MenuButtonBlockquote />
                </MenuControlsContainer>
              )}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={newsStore.closeForm}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!title.trim()}>
          {editingNews ? "Сохранить" : "Создать"}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default NewsForm;
