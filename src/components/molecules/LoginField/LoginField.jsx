import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

function LoginField({
  placeholder,
  type = "text",
  icon,
  value,
  onChange,
  isRun = false,
}) {
  const handleChange = (event) => {
    let nuevoValor = event.target.value;

    if (isRun) {
  // Elimina todo lo que no sea número
  nuevoValor = nuevoValor.replace(/\D/g, "");

  // Máximo 9 números
  nuevoValor = nuevoValor.slice(0, 9);

  // Al ingresar el noveno número, agrega el guion automáticamente
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
    <TextField
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      fullWidth
      variant="outlined"
      slotProps={{
        input: {
          startAdornment: icon ? (
            <InputAdornment position="start">
              {icon}
            </InputAdornment>
          ) : null,
        },
        htmlInput: {
          maxLength: isRun ? 10 : undefined,
          inputMode: isRun ? "numeric" : undefined,
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          height: "74px",
          backgroundColor: "#B5B0B0",
          borderRadius: "12px",

          "& fieldset": {
            border: "none",
          },
        },

        "& .MuiOutlinedInput-input": {
          color: "#000000",
          fontSize: "18px",
        },

        "& .MuiInputBase-input::placeholder": {
          color: "#000000",
          opacity: 0.6,
        },
      }}
    />
  );
}

export default LoginField;