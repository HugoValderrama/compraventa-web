import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

import RegisterForm from "../../organisms/RegisterForm/RegisterForm";

function RegisterTemplate() {
  return (
    <Box
      sx={{
        width: "95%",
        maxWidth: "1100px",
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Encabezado */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "22px 35px",
        }}
      >
        <Typography
          sx={{
            color: "#000000",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          Crear cuenta
        </Typography>

        {/* Cliente / Emprendedor */}
        <Box
          sx={{
            display: "flex",
            gap: "8px",
          }}
        >
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#62A7F5",
              color: "#FFFFFF",
              textTransform: "none",
              boxShadow: "none",
              borderRadius: "8px",
              padding: "8px 22px",
              "&:hover": {
                backgroundColor: "#62A7F5",
                boxShadow: "none",
              },
            }}
          >
            Cliente
          </Button>

          <Button
            variant="outlined"
            sx={{
              borderColor: "#62A7F5",
              color: "#62A7F5",
              textTransform: "none",
              borderRadius: "8px",
              padding: "8px 22px",
              "&:hover": {
                borderColor: "#62A7F5",
              },
            }}
          >
            Emprendedor
          </Button>
        </Box>
      </Box>

      <Divider />

      {/* Formulario */}
      <Box
        sx={{
          padding: {
            xs: "25px",
            md: "35px 55px",
          },
        }}
      >
        <RegisterForm />
      </Box>
    </Box>
  );
}

export default RegisterTemplate;