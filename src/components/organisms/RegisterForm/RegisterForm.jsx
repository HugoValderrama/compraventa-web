import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import RegisterField from "../../molecules/RegisterField/RegisterField";
import BirthDate from "../../molecules/BirthDate/BirthDate";
import TermsCheckbox from "../../molecules/TerminosCheck/TerminosCheck";
import { useNavigate } from "react-router-dom";

function RegisterForm() {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: "100%" }}>
      {/* Formulario en dos columnas */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: "35px",
        }}
      >
        {/* Columna izquierda */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "22px",
          }}
        >
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  color: "#808080",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                RUN
              </Typography>

              <Typography
                sx={{
                  color: "green",
                  fontSize: "13px",
                }}
              >
                RUN válido ✓
              </Typography>
            </Box>

            <RegisterField helperText="Ej: 12.345.678-9" />
          </Box>

          <RegisterField label="Nombre completo" />

          <RegisterField label="Email" type="email" />
        </Box>

        {/* Columna derecha */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "22px",
          }}
        >
          <BirthDate />

          <RegisterField label="Contraseña" type="password" />

          <RegisterField
            label="Confirmar contraseña"
            type="password"
          />
        </Box>
      </Box>

      {/* Términos */}
      <Box sx={{ marginTop: "25px" }}>
        <TermsCheckbox />
      </Box>

      {/* Botón crear cuenta */}
      <Button
        variant="contained"
        fullWidth
        sx={{
          marginTop: "20px",
          height: "50px",
          backgroundColor: "#62A7F5",
          color: "#FFFFFF",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "bold",
          textTransform: "none",
          boxShadow: "none",

          "&:hover": {
            backgroundColor: "#62A7F5",
            boxShadow: "none",
          },
        }}
      >
        Crear cuenta →
      </Button>

      {/* Volver al login */}
     <Typography
  onClick={() => navigate("/")}
  sx={{
    color: "#62A7F5",
    textAlign: "center",
    fontSize: "14px",
    fontWeight: "bold",
    marginTop: "15px",
    cursor: "pointer",
  }}
>
  Iniciar sesión
</Typography>
    </Box>
  );
}

export default RegisterForm;