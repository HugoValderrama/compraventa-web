
import { useState, useEffect } from "react";
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
  valor,
  onChange,
  obligatorio = false,
  maxLength = 50,
}) {
  const [tocado, setTocado] = useState(false);
  const invalido = obligatorio && !valor.trim();

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
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => setTocado(true)}
        placeholder={placeholder}
        error={tocado && invalido}
        helperText={
          tocado && invalido
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

function CampoRut({ rutEmpresa, setRutEmpresa }) {
  const numeroRut = Number(rutEmpresa.split("-")[0]);

  const rutValido =
    rutEmpresa.length === 10 &&
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
          htmlInput: { maxLength: 10 },
        }}
        sx={estiloCampo}
      />
    </Box>
  );
}

function EntrepreneurFields({ onValidityChange }) {
  const [opcionEmpresa, setOpcionEmpresa] = useState("ninguna");
  const [rutEmpresa, setRutEmpresa] = useState("");

  const [paginaEmprendimiento, setPaginaEmprendimiento] =
    useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [giroComercial, setGiroComercial] = useState("");
  const [paginaEmpresa, setPaginaEmpresa] = useState("");
  const [direccionLocal, setDireccionLocal] = useState("");

  const numeroRut = Number(rutEmpresa.split("-")[0]);

  const rutValido =
    rutEmpresa.length === 10 &&
    validarRun(rutEmpresa) &&
    numeroRut >= 50000000;

  const datosEmpresaValidos =
    rutValido &&
    razonSocial.trim().length > 0 &&
    giroComercial.trim().length > 0;

  const emprendedorValido =
    opcionEmpresa === "ninguna" ||
    (opcionEmpresa === "existente" && rutValido) ||
    (opcionEmpresa === "nueva" && datosEmpresaValidos);

  useEffect(() => {
    onValidityChange?.(emprendedorValido);
  }, [emprendedorValido, onValidityChange]);

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
        valor={paginaEmprendimiento}
        onChange={setPaginaEmprendimiento}
        maxLength={30}
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
            valor={razonSocial}
            onChange={setRazonSocial}
            obligatorio
            maxLength={50}
          />

          <Campo
            titulo="Giro comercial"
            placeholder="Ej: Venta de productos"
            valor={giroComercial}
            onChange={setGiroComercial}
            obligatorio
            maxLength={50}
          />

          <Campo
            titulo="Página web de la empresa (opcional)"
            placeholder="https://miempresa.cl"
            valor={paginaEmpresa}
            onChange={setPaginaEmpresa}
            maxLength={30}
          />

          <Campo
            titulo="Dirección del local (opcional)"
            placeholder="Ej: Osorno, Los Lagos"
            valor={direccionLocal}
            onChange={setDireccionLocal}
            maxLength={30}
          />
        </>
      )}
    </Box>
  );
}

export default EntrepreneurFields;
