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
    // Si el usuario borra todo, limpiar el campo
    if (nuevoValor === "" || nuevoValor === "-") {
      onChange?.("");
      return;
    }

    // Permitir borrar el último dígito cuando aparece "9-"
    if (
      value &&
      /^[0-9K]-$/.test(value) &&
      nuevoValor === value.slice(0, -1)
    ) {
      onChange?.("");
      return;
    }

    // Quitar puntos y guion
    const caracteres = nuevoValor
      .toUpperCase()
      .replace(/[^0-9K]/g, "")
      .slice(0, 9);

    if (caracteres.length === 0) {
      onChange?.("");
      return;
    }

    // Separar cuerpo y dígito verificador
    const cuerpo = caracteres.slice(0, -1);
    const digitoVerificador = caracteres.slice(-1);

    // Agregar puntos automáticamente
    const cuerpoFormateado = cuerpo.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      "."
    );

    // Construir el RUN
    nuevoValor = cuerpoFormateado
      ? `${cuerpoFormateado}-${digitoVerificador}`
      : `${digitoVerificador}-`;
  }

  onChange?.(nuevoValor);
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
            maxLength: isRun ? 12 : undefined,
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