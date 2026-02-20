import { useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link,
} from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import { useStore } from "../stores/RootStore";

const RegisterPage = observer(() => {
  const { authStore } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await authStore.register(name, email, password);
    if (authStore.isAuthenticated) {
      navigate("/projects");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <ConstructionIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
        <Typography variant="h5" gutterBottom>
          Учёт стройки
        </Typography>
        <Paper sx={{ p: 3, width: "100%", mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Регистрация
          </Typography>
          {authStore.error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => authStore.clearError()}>
              {authStore.error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Эл. почта"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              margin="normal"
              helperText="Минимум 6 символов"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={authStore.loading}
            >
              {authStore.loading ? "Регистрация..." : "Зарегистрироваться"}
            </Button>
          </Box>
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Link component={RouterLink} to="/login">
              Уже есть аккаунт? Войти
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
});

export default RegisterPage;
