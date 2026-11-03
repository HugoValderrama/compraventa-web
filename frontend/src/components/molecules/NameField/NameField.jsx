import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

function NameField({ onValidityChange }) {
  const [nombre, setNombre] = useState("");

  // Solo letras (incluyendo tildes y ñ) y espacios
  const formatoNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;

  const nombreValido =
    nombre.trim().length >= 2 &&
    formatoNombre.test(nombre);
    useEffect(() => {
  if (onValidityChange) {
    onValidityChange(nombreValido);
  }
}, [nombreValido, onValidityChange]);

  const mostrarValidacion = nombre.length > 0;

  const handleChange = (event) => {
    const nuevoNombre = event.target.value;

    // Impedir números y símbolos directamente
    if (
      nuevoNombre === "" ||
      /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(nuevoNombre)
    ) {
      setNombre(nuevoNombre);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
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
          Nombre completo
        </Typography>

        {mostrarValidacion && (
          <Typography
            sx={{
              color: nombreValido ? "green" : "#FF0000",
              fontSize: "13px",
              fontWeight: "bold",
            }}
          >
            {nombreValido ? "Nombre válido ✓" : "Nombre inválido"}
          </Typography>
        )}
      </Box>

      <TextField
        value={nombre}
        onChange={handleChange}
        fullWidth
        variant="outlined"
        placeholder="Ej: Pablo González"
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
  );
}

export default NameField;