
import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { validarRun } from "../../../utils/validarRun.js";

const estiloCampo = {
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
};



function Campo({
  titulo,
  placeholder,
  obligatorio = false,
  maxLength = 50,
}) {
  const [valor, setValor] = useState("");

  const campoInvalido =
    obligatorio && valor.trim().length === 0;

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
        {titulo}
      </Typography>

      <TextField
        fullWidth
        value={valor}
        onChange={(event) => setValor(event.target.value)}
        placeholder={placeholder}
        error={obligatorio && valor.length > 0 && campoInvalido}
        helperText={
          obligatorio && valor.length > 0 && campoInvalido
            ? "Este campo es obligatorio"
            : ""
        }
        slotProps={{
          htmlInput: { maxLength },
        }}
        sx={estiloCampo}
      />
    </Box>
  );
}

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
        {titulo}
      </Typography>

      <TextField
        fullWidth
        placeholder={placeholder}
        sx={estiloCampo}
      />
    </Box>
  );


function CampoRut({ rutEmpresa, setRutEmpresa }) {
  const numeroRut = Number(rutEmpresa.split("-")[0]);

  const rutValido =
    validarRun(rutEmpresa) &&
    numeroRut >= 50000000;

  const handleRutChange = (event) => {
    const limpio = event.target.value
      .toUpperCase()
      .replace(/[^0-9K]/g, "")
      .slice(0, 9);

    const cuerpo = limpio.slice(0, 8).replace(/\D/g, "");
    const dv = limpio.slice(8);

    setRutEmpresa(dv ? `${cuerpo}-${dv}` : cuerpo);
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
        RUT de la empresa
      </Typography>

      <TextField
        fullWidth
        value={rutEmpresa}
        onChange={handleRutChange}
        placeholder="76123456-7"
        error={rutEmpresa.length === 10 && !rutValido}
        helperText={
          rutEmpresa.length === 10
            ? rutValido
              ? "RUT válido ✓"
              : "RUT inválido"
            : "Debe ser igual o superior a 50.000.000"
        }
        slotProps={{
          htmlInput: {
            maxLength: 10,
          },
        }}
        sx={estiloCampo}
      />
    </Box>
  );
}

function EntrepreneurFields() {
  const [opcionEmpresa, setOpcionEmpresa] = useState("ninguna");
  const [rutEmpresa, setRutEmpresa] = useState("");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "22px",
        marginTop: "30px",
      }}
    >
      <Typography
        sx={{
          fontSize: "18px",
          fontWeight: "bold",
          color: "#000000",
        }}
      >
        Datos del emprendimiento
      </Typography>

      <Campo
        titulo="Página web del emprendimiento (opcional)"
        placeholder="https://miemprendimiento.cl"
      />

      <Box>
        <Typography
          sx={{
            color: "#808080",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          ¿Quieres asociar una empresa?
        </Typography>

        <RadioGroup
          value={opcionEmpresa}
          onChange={(event) => {
            setOpcionEmpresa(event.target.value);
            setRutEmpresa("");
          }}
        >
          <FormControlLabel
            value="ninguna"
            control={<Radio />}
            label="No tengo empresa registrada"
          />

          <FormControlLabel
            value="existente"
            control={<Radio />}
            label="Vincular una empresa existente"
          />

          <FormControlLabel
            value="nueva"
            control={<Radio />}
            label="Registrar una empresa nueva"
          />
        </RadioGroup>
      </Box>

      {opcionEmpresa === "existente" && (
        <CampoRut
          rutEmpresa={rutEmpresa}
          setRutEmpresa={setRutEmpresa}
        />
      )}

      {opcionEmpresa === "nueva" && (
        <>
          <CampoRut
            rutEmpresa={rutEmpresa}
            setRutEmpresa={setRutEmpresa}
          />

          <Campo
  titulo="Razón social"
  placeholder="Ej: Comercial Los Lagos SpA"
  obligatorio
/>

<Campo
  titulo="Giro comercial"
  placeholder="Ej: Venta de productos"
  obligatorio
/>

          <Campo
            titulo="Página web de la empresa (opcional)"
            placeholder="https://miempresa.cl"
          />

          <Campo
            titulo="Dirección del local (opcional)"
            placeholder="Ej: Osorno, Los Lagos"
          />
        </>
      )}
    </Box>
  );
}

export default EntrepreneurFields;
