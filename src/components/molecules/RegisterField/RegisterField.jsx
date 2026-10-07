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
      // Deja solamente números
      nuevoValor = nuevoValor.replace(/\D/g, "");

      // Máximo 9 números
      nuevoValor = nuevoValor.slice(0, 9);

      // Agrega el guion automáticamente
      if (nuevoValor.length === 9) {
        nuevoValor =
          nuevoValor.slice(0, 8) +
          "-" +
          nuevoValor.slice(8);
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
            inputMode: isRun ? "numeric" : undefined,
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