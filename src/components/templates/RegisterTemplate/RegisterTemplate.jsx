import { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

import RegisterForm from "../../organisms/RegisterForm/RegisterForm";

function RegisterTemplate() {
  const [tipoUsuario, setTipoUsuario] = useState("cliente");

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
            onClick={() => setTipoUsuario("cliente")}
            variant={
              tipoUsuario === "cliente"
                ? "contained"
                : "outlined"
            }
            sx={{
              backgroundColor:
                tipoUsuario === "cliente"
                  ? "#62A7F5"
                  : "#FFFFFF",

              color:
                tipoUsuario === "cliente"
                  ? "#FFFFFF"
                  : "#62A7F5",

              borderColor: "#62A7F5",
              textTransform: "none",
              boxShadow: "none",
              borderRadius: "8px",
              padding: "8px 22px",

              "&:hover": {
                backgroundColor:
                  tipoUsuario === "cliente"
                    ? "#62A7F5"
                    : "#FFFFFF",

                borderColor: "#62A7F5",
                boxShadow: "none",
              },
            }}
          >
            Cliente
          </Button>

          <Button
            onClick={() => setTipoUsuario("emprendedor")}
            variant={
              tipoUsuario === "emprendedor"
                ? "contained"
                : "outlined"
            }
            sx={{
              backgroundColor:
                tipoUsuario === "emprendedor"
                  ? "#62A7F5"
                  : "#FFFFFF",

              color:
                tipoUsuario === "emprendedor"
                  ? "#FFFFFF"
                  : "#62A7F5",

              borderColor: "#62A7F5",
              textTransform: "none",
              boxShadow: "none",
              borderRadius: "8px",
              padding: "8px 22px",

              "&:hover": {
                backgroundColor:
                  tipoUsuario === "emprendedor"
                    ? "#62A7F5"
                    : "#FFFFFF",

                borderColor: "#62A7F5",
                boxShadow: "none",
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