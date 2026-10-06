import Box from "@mui/material/Box";
import Button from '@mui/material/Button';
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

import CustomButton from "../../atoms/Button/CustomButton";
import LoginField from "../../molecules/LoginField/LoginField";
import RememberUser from "../../molecules/RememberUser/RememberUser";

function LoginForm() {
  const navigate = useNavigate();

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

      <LoginField placeholder="RUN" />

      <Box sx={{ height: "9px" }} />

      <LoginField
        placeholder="Contraseña"
        type="password"
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
          type="submit"
          onClick={() => navigate("/perfil")}
          
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