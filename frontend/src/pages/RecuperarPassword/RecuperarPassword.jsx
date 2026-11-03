
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";

function RecuperarPassword() {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [tocado, setTocado] = useState(false);

  const correoValido =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          backgroundColor: "#62A7F5",
          padding: "20px",
          width: "100%",
          maxWidth: "520px",
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#081A19",
            padding: {
              xs: "35px 20px",
              sm: "45px 55px",
            },
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <Typography
            sx={{
              color: "#FFFFFF",
              fontSize: "20px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Recuperar contraseña
          </Typography>

          <Typography
            sx={{
              color: "#B5B0B0",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            Ingresa tu correo electrónico para solicitar
            un enlace de recuperación de contraseña.
          </Typography>

          <TextField
            fullWidth
            type="email"
            placeholder="ejemplo@correo.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            onBlur={() => setTocado(true)}
            error={tocado && !correoValido}
            helperText={
              tocado && !correoValido
                ? "Ingresa un correo electrónico válido"
                : ""
            }
            slotProps={{
              htmlInput: {
                "aria-label": "Correo electrónico",
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
              },
              "& .MuiFormHelperText-root": {
                color: "#FF6B6B",
              },
            }}
          />

          <Button
            fullWidth
            disabled={!correoValido}
            onClick={() => {
              // Se conectará al backend posteriormente
            }}
            sx={{
              backgroundColor: "#62A7F5",
              color: "#FFFFFF",
              height: "50px",
              borderRadius: "8px",
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#3026A6",
              },
              "&.Mui-disabled": {
                backgroundColor: "#B5B0B0",
                color: "#000000",
              },
            }}
          >
            Enviar enlace de recuperación
          </Button>

          <Button
            onClick={() => navigate("/login")}
            sx={{
              color: "#62A7F5",
              textTransform: "none",
              fontSize: "14px",
            }}
          >
            ← Volver a Iniciar sesión
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default RecuperarPassword;
