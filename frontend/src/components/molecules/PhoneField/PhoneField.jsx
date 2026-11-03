
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

function PhoneField({ onValidityChange, onChange }) {
  const [numero, setNumero] = useState("");
  const [tocado, setTocado] = useState(false);

  const telefonoValido = /^\d{8}$/.test(numero);

  useEffect(() => {
    onValidityChange?.(telefonoValido);
  }, [telefonoValido, onValidityChange]);

  const handleChange = (event) => {
    const limpio = event.target.value
      .replace(/\D/g, "")
      .slice(0, 8);

    setNumero(limpio);
    onChange?.(limpio ? `+569${limpio}` : "");
  };

  return (
    <Box>
      <Typography
        sx={{
          color: "#808080",
          fontSize: "14px",
          fontWeight: "bold",
          marginBottom: "8px",
        }}
      >
        Teléfono celular
      </Typography>

      <TextField
        fullWidth
        value={numero}
        onChange={handleChange}
        onBlur={() => setTocado(true)}
        placeholder="12345678"
        error={tocado && !telefonoValido}
        helperText={
          tocado && !telefonoValido
            ? "Ingresa los 8 dígitos de tu celular"
            : telefonoValido
              ? "Teléfono válido ✓"
              : "Ejemplo: +56 9 1234 5678"
        }
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                +56 9
              </InputAdornment>
            ),
          },
          htmlInput: {
            maxLength: 8,
            inputMode: "numeric",
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
            "&.Mui-focused fieldset": {
              borderColor: "#62A7F5",
            },
          },
          "& .MuiFormHelperText-root": {
            marginLeft: 0,
            color: telefonoValido
              ? "green"
              : undefined,
          },
        }}
      />
    </Box>
  );
}

export default PhoneField;
