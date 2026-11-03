
import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { validarRun } from "../../../utils/validarRun.js";

import RegisterField from "../../molecules/RegisterField/RegisterField";
import BirthDate from "../../molecules/BirthDate/BirthDate";
import TermsCheckbox from "../../molecules/TerminosCheck/TerminosCheck";
import EmailField from "../../molecules/EmailField/EmailField";
import NameField from "../../molecules/NameField/NameField";
import PasswordFields from "../../molecules/PasswordFields/PasswordFields";
import EntrepreneurFields from "../../molecules/EntrepreneurFields/EntrepreneurFields";
import PhoneField from "../../molecules/PhoneField/PhoneField";

function RegisterForm({ tipoUsuario }) {
  const navigate = useNavigate();

  const [run, setRun] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [nombreValido, setNombreValido] = useState(false);
  const [emailValido, setEmailValido] = useState(false);
  const [edadValida, setEdadValida] = useState(false);
  const [passwordsValidas, setPasswordsValidas] = useState(false);
  const [emprendedorValido, setEmprendedorValido] = useState(true);
  const [telefono, setTelefono] = useState("");
  const [telefonoValido, setTelefonoValido] = useState(false);

  // Validar RUN del usuario
  const runValido = validarRun(run);

  // Verificar si el RUN está completo
  const runCompleto = run.length === 10;

  // Validar formulario completo
  const formularioValido =
    runValido &&
    nombreValido &&
    emailValido &&
    telefonoValido &&
    edadValida &&
    passwordsValidas &&
    aceptaTerminos &&
    (tipoUsuario !== "emprendedor" || emprendedorValido);

  // Registrar evento de creación de cuenta
  const crearCuenta = () => {
    if (!formularioValido) return;

    console.log("[Registro] Formulario validado:", {
      tipoUsuario,
      formularioValido: true,
      accion: "crear_cuenta",
    });

    // Navegación temporal hasta conectar el backend.
    if (tipoUsuario === "emprendedor") {
      console.log("[Registro] Navegación al perfil emprendedor");
      navigate("/perfilE");
    } else {
      console.log("[Registro] Navegación al perfil cliente");
      navigate("/perfil");
    }
  };

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
          {/* RUN */}
          <Box>
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
                RUN
              </Typography>

              {runCompleto && (
                <Typography
                  sx={{
                    color: runValido ? "green" : "#FF0000",
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  {runValido ? "RUN válido ✓" : "RUN inválido X"}
                </Typography>
              )}
            </Box>

            <RegisterField
              value={run}
              onChange={setRun}
              isRun={true}
              helperText="Ej: 12.345.678-9"
            />
          </Box>

          <NameField onValidityChange={setNombreValido} />

          <EmailField onValidityChange={setEmailValido} />

          <PhoneField
            onValidityChange={setTelefonoValido}
            onChange={setTelefono}
          />
        </Box>

        {/* Columna derecha */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "22px",
          }}
        >
          <BirthDate onValidityChange={setEdadValida} />

          <PasswordFields onValidityChange={setPasswordsValidas} />
        </Box>
      </Box>

      {/* Campos adicionales del emprendedor */}
      {tipoUsuario === "emprendedor" && (
        <EntrepreneurFields
          onValidityChange={setEmprendedorValido}
        />
      )}

      {/* Términos y condiciones */}
      <Box sx={{ marginTop: "25px" }}>
        <TermsCheckbox
          checked={aceptaTerminos}
          onChange={setAceptaTerminos}
        />
      </Box>

      {/* Botón Crear cuenta */}
      <Button
        variant="contained"
        fullWidth
        disabled={!formularioValido}
        onClick={crearCuenta}
        sx={{
          "&.Mui-disabled": {
            backgroundColor: "#B5B0B0",
            color: "#FFFFFF",
          },
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

      {/* Volver al Login */}
      <Typography
        onClick={() => {
          console.log("[Registro] Navegación a inicio de sesión");
          navigate("/");
        }}
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
