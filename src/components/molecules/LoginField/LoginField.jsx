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
  // Convertir K minúscula a mayúscula
  nuevoValor = nuevoValor.toUpperCase();

  // Quitar el guion para procesar el RUN
  nuevoValor = nuevoValor.replace(/-/g, "");

  // Los primeros 8 caracteres solamente pueden ser números
  const cuerpo = nuevoValor
    .slice(0, 8)
    .replace(/\D/g, "");

  // El noveno carácter puede ser un número o K
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