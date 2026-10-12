import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

function BirthDate({ onValidityChange }) {
  const [dia, setDia] = useState("01");
  const [mes, setMes] = useState(1);
  const [anio, setAnio] = useState(2000);

  // Cantidad correcta de días según mes y año
  const diasDelMes = new Date(anio, mes, 0).getDate();

  // Si cambia el mes y el día deja de existir
  const diaSeleccionado = Math.min(Number(dia), diasDelMes);

  // Calcular edad real
  const calcularEdad = () => {
    const hoy = new Date();

    let edad = hoy.getFullYear() - anio;

    const aunNoCumple =
      hoy.getMonth() + 1 < mes ||
      (hoy.getMonth() + 1 === mes &&
        hoy.getDate() < diaSeleccionado);

    if (aunNoCumple) {
      edad--;
    }

    return edad;
  };

  const edad = calcularEdad();
  const edadValida = edad >= 18;
  useEffect(() => {
  if (onValidityChange) {
    onValidityChange(edadValida);
  }
}, [edadValida, onValidityChange]);

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <Typography
          sx={{
            color: "#808080",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          Fecha de nacimiento
        </Typography>

        <Typography
          sx={{
            color: edadValida ? "green" : "#FF0000",
            fontSize: "13px",
            fontWeight: "bold",
          }}
        >
          {edadValida ? "Edad válida ✓" : "Menor de 18 años"}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: "10px",
        }}
      >
        {/* Día */}
        <Select
          value={String(diaSeleccionado).padStart(2, "0")}
          onChange={(event) => setDia(event.target.value)}
          sx={{
            width: "90px",
            height: "50px",
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
          }}
        >
          {Array.from({ length: diasDelMes }, (_, i) => {
            const day = String(i + 1).padStart(2, "0");

            return (
              <MenuItem key={day} value={day}>
                {day}
              </MenuItem>
            );
          })}
        </Select>

        {/* Mes */}
        <Select
          value={mes}
          onChange={(event) => setMes(Number(event.target.value))}
          sx={{
            flex: 1,
            height: "50px",
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
          }}
        >
          {meses.map((nombreMes, index) => (
            <MenuItem key={nombreMes} value={index + 1}>
              {nombreMes}
            </MenuItem>
          ))}
        </Select>

        {/* Año */}
        <Select
          value={anio}
          onChange={(event) => setAnio(Number(event.target.value))}
          sx={{
            width: "110px",
            height: "50px",
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
          }}
        >
          {Array.from({ length: 100 }, (_, i) => {
            const year = new Date().getFullYear() - i;

            return (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            );
          })}
        </Select>
      </Box>

      <Typography
        sx={{
          color: edadValida ? "#808080" : "#FF0000",
          fontSize: "13px",
          marginTop: "6px",
        }}
      >
        Debes tener 18 años o más para registrarte
      </Typography>
    </Box>
  );
}

export default BirthDate;