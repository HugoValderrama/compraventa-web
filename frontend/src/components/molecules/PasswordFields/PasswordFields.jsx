import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function PasswordFields({ onValidityChange }) {
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  // Mínimo 8 caracteres, al menos una letra y un número
  const passwordValida =
    password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password);

  const coinciden =
    confirmarPassword.length > 0 &&
    password === confirmarPassword;
    const passwordsValidas = passwordValida && coinciden;

useEffect(() => {
  if (onValidityChange) {
    onValidityChange(passwordsValidas);
  }
}, [passwordsValidas, onValidityChange]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "22px",
      }}
    >
      {/* Contraseña */}
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <Typography
            sx={{
              color: "#808080",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Contraseña
          </Typography>

          {password.length > 0 && (
            <Typography
              sx={{
                color: passwordValida ? "green" : "#FF0000",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              {passwordValida
                ? "Contraseña válida ✓"
                : "Contraseña inválida"}
            </Typography>
          )}
        </Box>

        <TextField
          type={mostrarPassword ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          fullWidth
          variant="outlined"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      setMostrarPassword(!mostrarPassword)
                    }
                    edge="end"
                    aria-label={
                      mostrarPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {mostrarPassword ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: "50px",
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",

              "& fieldset": {
                borderColor: "#D9D9D9",
              },

              "&:hover fieldset": {
                borderColor: "#B5B0B0",
              },

              "&.Mui-focused fieldset": {
                borderColor: "#62A7F5",
              },
            },
          }}
        />

        <Typography
          sx={{
            color: "#808080",
            fontSize: "12px",
            marginTop: "5px",
          }}
        >
          Mínimo 8 caracteres, una letra y un número
        </Typography>
      </Box>

      {/* Confirmar contraseña */}
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <Typography
            sx={{
              color: "#808080",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Confirmar contraseña
          </Typography>

          {confirmarPassword.length > 0 && (
            <Typography
              sx={{
                color: coinciden ? "green" : "#FF0000",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              {coinciden
                ? "Las contraseñas coinciden ✓"
                : "Las contraseñas no coinciden"}
            </Typography>
          )}
        </Box>

        <TextField
          type={mostrarConfirmar ? "text" : "password"}
          value={confirmarPassword}
          onChange={(event) =>
            setConfirmarPassword(event.target.value)
          }
          fullWidth
          variant="outlined"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      setMostrarConfirmar(!mostrarConfirmar)
                    }
                    edge="end"
                    aria-label={
                      mostrarConfirmar
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {mostrarConfirmar ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: "50px",
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",

              "& fieldset": {
                borderColor: "#D9D9D9",
              },

              "&:hover fieldset": {
                borderColor: "#B5B0B0",
              },

              "&.Mui-focused fieldset": {
                borderColor: "#62A7F5",
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}

export default PasswordFields;