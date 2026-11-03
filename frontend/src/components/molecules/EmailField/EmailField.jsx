import { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function EmailField({ onValidityChange }) {
  const [email, setEmail] = useState("");

  // Validar formato del correo
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  useEffect(() => {
  if (onValidityChange) {
    onValidityChange(emailValido);
  }
}, [emailValido, onValidityChange]);

  // Mostrar mensaje solo cuando el usuario ya escribió @
  const mostrarValidacion = email.includes("@");

  const obtenerSugerencias = () => {
    if (!email.includes("@")) {
      return [];
    }

    const nombre = email.split("@")[0];

    if (!nombre) {
      return [];
    }

    return [
      `${nombre}@gmail.com`,
      `${nombre}@hotmail.com`,
      `${nombre}@outlook.com`,
    ];
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Título y validación */}
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
          Email
        </Typography>

        {mostrarValidacion && (
          <Typography
            sx={{
              color: emailValido ? "green" : "#FF0000",
              fontSize: "13px",
              fontWeight: "bold",
            }}
          >
            {emailValido ? "Email válido ✓" : "Email inválido"}
          </Typography>
        )}
      </Box>

      <Autocomplete
        freeSolo
        options={obtenerSugerencias()}
        inputValue={email}
        onInputChange={(event, nuevoValor) => {
          setEmail(nuevoValor);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            type="email"
            variant="outlined"
            placeholder="ejemplo@gmail.com"
            sx={{
              "& .MuiOutlinedInput-root": {
                minHeight: "50px",
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
        )}
      />
    </Box>
  );
}

export default EmailField;