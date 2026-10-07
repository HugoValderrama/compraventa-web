import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { validarRun } from "../../../utils/validarRun";

import LoginField from "../../molecules/LoginField/LoginField";
import RememberUser from "../../molecules/RememberUser/RememberUser";

function LoginForm() {
  const navigate = useNavigate();

  const [run, setRun] = useState("");
  const [password, setPassword] = useState("");
  const [errorRun, setErrorRun] = useState("");

  const iniciarSesion = () => {
    // Formato: 8 números + guion + dígito
    const formatoRun = /^\d{8}-\d$/;

    if (!validarRun(run)) {
  setErrorRun("RUN inválido");
  return;
}

    setErrorRun("");

    // Si el RUN tiene el formato correcto, entra al perfil
    navigate("/perfil");
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "337px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        sx={{
          color: "#FFFFFF",
          fontSize: "17px",
          textAlign: "center",
          marginBottom: "22px",
        }}
      >
        Iniciar sesión
      </Typography>

      <LoginField
        placeholder="RUN"
        value={run}
        onChange={setRun}
        isRun={true}
      />

      {errorRun && (
        <Typography
          sx={{
            color: "#FF6B6B",
            fontSize: "13px",
            marginTop: "5px",
          }}
        >
          {errorRun}
        </Typography>
      )}

      <Box sx={{ height: "9px" }} />

      <LoginField
        placeholder="Contraseña"
        type="password"
        value={password}
        onChange={setPassword}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          marginTop: "4px",
          marginBottom: "4px",
        }}
      >
        <RememberUser />
      </Box>

      <Button
        type="button"
        onClick={iniciarSesion}
        sx={{
          backgroundColor: "#B5B0B0",
          color: "#000000",
          height: "62px",
          borderRadius: "12px",
          fontSize: "18px",
          textTransform: "none",

          "&:hover": {
            backgroundColor: "#B5B0B0",
          },
        }}
      >
        Iniciar sesión
      </Button>

      <Typography
        onClick={() => navigate("/registro")}
        sx={{
          color: "#FFFFFF",
          fontSize: "17px",
          textAlign: "center",
          marginTop: "8px",
          cursor: "pointer",
        }}
      >
        Crear cuenta
      </Typography>
    </Box>
  );
}

export default LoginForm;