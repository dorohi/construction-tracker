import { observer } from "mobx-react-lite";
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Switch,
  Divider,
} from "@mui/material";
import { useStore } from "../stores/RootStore";

const SettingsPage = observer(() => {
  const { authStore, themeStore } = useStore();
  const user = authStore.user;

  return (
    <Container maxWidth="sm" sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Настройки
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <List disablePadding>
          <ListItem>
            <ListItemText primary="Имя" secondary={user?.name ?? "—"} />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemText primary="Email" secondary={user?.email ?? "—"} />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemText
              primary="Роль"
              secondary={user?.isAdmin ? "Администратор" : "Пользователь"}
            />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemText
              primary="Дата регистрации"
              secondary={
                user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("ru-RU")
                  : "—"
              }
            />
          </ListItem>
        </List>
      </Paper>

      <Paper>
        <List disablePadding>
          <ListItem>
            <ListItemText
              primary="Тёмная тема"
              secondary={
                themeStore.mode === "dark" ? "Включена" : "Выключена"
              }
            />
            <Switch
              edge="end"
              checked={themeStore.mode === "dark"}
              onChange={() => themeStore.toggleTheme()}
            />
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
});

export default SettingsPage;
