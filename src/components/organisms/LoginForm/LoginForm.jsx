import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import CustomButton from "../../atoms/Button/CustomButton";
import LoginField from "../../molecules/LoginField/LoginField";
import RememberUser from "../../molecules/RememberUser/RememberUser";

function LoginForm() {
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
      />

      <Box sx={{ height: "9px" }} />

      <LoginField
        placeholder="Contraseña"
        type="password"
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          marginTop: "4px",
          marginBottom: "4px",
        }}
      >
        <RememberUser />
      </Box>

      <CustomButton type="submit">
        Iniciar sesión
      </CustomButton>

      <Typography
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