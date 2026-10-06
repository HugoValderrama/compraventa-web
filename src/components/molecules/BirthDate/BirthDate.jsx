import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

function BirthDate() {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        sx={{
          color: "#808080",
          fontSize: "14px",
          fontWeight: "bold",
          marginBottom: "8px",
        }}
      >
        Fecha de nacimiento
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: "10px",
        }}
      >
        {/* Día */}
        <Select
          defaultValue="01"
          sx={{
            width: "90px",
            height: "50px",
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
          }}
        >
          {Array.from({ length: 31 }, (_, i) => {
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
          defaultValue="Enero"
          sx={{
            flex: 1,
            height: "50px",
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
          }}
        >
          <MenuItem value="Enero">Enero</MenuItem>
          <MenuItem value="Febrero">Febrero</MenuItem>
          <MenuItem value="Marzo">Marzo</MenuItem>
          <MenuItem value="Abril">Abril</MenuItem>
          <MenuItem value="Mayo">Mayo</MenuItem>
          <MenuItem value="Junio">Junio</MenuItem>
          <MenuItem value="Julio">Julio</MenuItem>
          <MenuItem value="Agosto">Agosto</MenuItem>
          <MenuItem value="Septiembre">Septiembre</MenuItem>
          <MenuItem value="Octubre">Octubre</MenuItem>
          <MenuItem value="Noviembre">Noviembre</MenuItem>
          <MenuItem value="Diciembre">Diciembre</MenuItem>
        </Select>

        {/* Año */}
        <Select
          defaultValue={2000}
          sx={{
            width: "110px",
            height: "50px",
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
          }}
        >
          {Array.from({ length: 87 }, (_, i) => {
            const year = 2008 - i;

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
          color: "#808080",
          fontSize: "13px",
          marginTop: "6px",
        }}
      >
        Debes ser mayor de 18 años para registrarte
      </Typography>
    </Box>
  );
}

export default BirthDate;