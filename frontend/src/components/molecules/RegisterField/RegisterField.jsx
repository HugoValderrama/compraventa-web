import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

function RegisterField({
  label,
  type = "text",
  helperText = "",
  value,
  onChange,
  isRun = false,
}) {
  const handleChange = (event) => {
    let nuevoValor = event.target.value;

    if (isRun) {
      // Convertir K minúscula a mayúscula
      nuevoValor = nuevoValor.toUpperCase();

      // Quitar el guion para procesar el RUN
      nuevoValor = nuevoValor.replace(/-/g, "");

      // Los primeros 8 caracteres solamente pueden ser números
      const cuerpo = nuevoValor
        .slice(0, 8)
        .replace(/\D/g, "");

      // El noveno carácter puede ser número o K
      let digitoVerificador = "";

      if (nuevoValor.length > 8) {
        const ultimo = nuevoValor.charAt(8);

        if (/^[0-9K]$/.test(ultimo)) {
          digitoVerificador = ultimo;
        }
      }

      // Construir el RUN
      nuevoValor = cuerpo;

      if (cuerpo.length === 8 && digitoVerificador) {
        nuevoValor = cuerpo + "-" + digitoVerificador;
      }
    }

    if (onChange) {
      onChange(nuevoValor);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {label && (
        <Typography
          sx={{
            color: "#808080",
            fontSize: "14px",
            fontWeight: "bold",
            marginBottom: "8px",
          }}
        >
          {label}
        </Typography>
      )}

      <TextField
        type={type}
        value={value}
        onChange={handleChange}
        fullWidth
        variant="outlined"
        slotProps={{
          htmlInput: {
            maxLength: isRun ? 10 : undefined,
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

      {helperText && (
        <Typography
          sx={{
            color: "#808080",
            fontSize: "13px",
            marginTop: "6px",
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
}

export default RegisterField;