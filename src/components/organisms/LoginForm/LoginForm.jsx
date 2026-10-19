
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
  const [errorPassword, setErrorPassword] = useState("");

  const iniciarSesion = () => {
    console.log("[Login] Intento de inicio de sesión");

    let hayError = false;
    const runValido = validarRun(run);
    const passwordIngresada = password.trim() !== "";

    if (!runValido) {
      setErrorRun("RUN inválido");
      hayError = true;
    } else {
      setErrorRun("");
    }

    if (!passwordIngresada) {
      setErrorPassword("Debes ingresar tu contraseña");
      hayError = true;
    } else {
      setErrorPassword("");
    }

    if (hayError) {
      console.log("[Login] Validación fallida:", {
        formularioValido: false,
        runValido,
        passwordIngresada,
      });

      return;
    }

    console.log("[Login] Formulario validado:", {
      formularioValido: true,
      accion: "inicio_sesion",
    });

    // Navegación temporal hasta conectar el backend.
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

      {errorPassword && (
        <Typography
          sx={{
            color: "#FF6B6B",
            fontSize: "13px",
            marginTop: "5px",
          }}
        >
          {errorPassword}
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "8px",
          marginTop: "4px",
          marginBottom: "8px",
          width: "100%",
        }}
      >
        <RememberUser />

        <Typography
          component="button"
          type="button"
          onClick={() => {
            console.log("[Login] Navegación a recuperar contraseña");
            navigate("/recuperar-password");
          }}
          sx={{
            background: "none",
            border: "none",
            padding: 0,
            color: "#62A7F5",
            fontSize: "12px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            cursor: "pointer",
            textAlign: "right",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          ¿Olvidaste tu contraseña?
        </Typography>
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
        onClick={() => {
          console.log("[Login] Navegación a crear cuenta");
          navigate("/registro");
        }}
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
