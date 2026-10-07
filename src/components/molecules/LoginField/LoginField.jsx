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
      // Solo permite números y guion
      nuevoValor = nuevoValor.replace(/[^0-9-]/g, "");

      // Máximo 10 caracteres: 12345678-9
      nuevoValor = nuevoValor.slice(0, 10);
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