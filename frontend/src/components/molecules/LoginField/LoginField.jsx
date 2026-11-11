
import { useState } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

function LoginField({
  placeholder,
  type = "text",
  icon,
  value,
  onChange,
  isRun = false,
}) {
  // Controlar visibilidad de la contraseña
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const esPassword = type === "password";

  


const handleChange = (event) => {
  let nuevoValor = event.target.value;

  if (isRun) {
    // Permitir borrar completamente
    if (nuevoValor === "" || nuevoValor === "-") {
      onChange?.("");
      return;
    }

    // Permitir borrar el primer número
    if (
      value &&
      /^\d-$/.test(value) &&
      nuevoValor === value.slice(0, -1)
    ) {
      onChange?.("");
      return;
    }

    const caracteres = nuevoValor
      .toUpperCase()
      .replace(/[^0-9K]/g, "");

    // Solo números y una K al final
    if (!/^\d{1,9}K?$/.test(caracteres)) {
      return;
    }

    // Máximo 8 números + verificador
    if (caracteres.length > 9) {
      return;
    }

    // K solo como dígito verificador
    if (
      caracteres.includes("K") &&
      !/^\d{7,8}K$/.test(caracteres)
    ) {
      return;
    }

    const cuerpo = caracteres.slice(0, -1);
    const digitoVerificador = caracteres.slice(-1);

    const cuerpoFormateado = cuerpo.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      "."
    );

    nuevoValor = cuerpoFormateado
      ? `${cuerpoFormateado}-${digitoVerificador}`
      : `${digitoVerificador}-`;
  }

  onChange?.(nuevoValor);
};



  return (
    <TextField
      type={
        esPassword
          ? mostrarPassword
            ? "text"
            : "password"
          : type
      }
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

          // Ojito para mostrar u ocultar contraseña
          endAdornment: esPassword ? (
            <InputAdornment position="end">
              <IconButton
                type="button"
                onClick={() =>
                  setMostrarPassword((anterior) => !anterior)
                }
                onMouseDown={(event) => event.preventDefault()}
                edge="end"
                aria-label={
                  mostrarPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
                sx={{
                  color: "#000000",
                }}
              >
                {mostrarPassword ? (
                  <VisibilityOffIcon />
                ) : (
                  <VisibilityIcon />
                )}
              </IconButton>
            </InputAdornment>
          ) : null,
        },

        htmlInput: {
          maxLength: isRun ? 12 : undefined,
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
