import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import LoginTemplate from "../../components/templates/LoginTemplate/LoginTemplate";
import logo from "../../assets/logo.png";

function LoginScreen() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#3026a6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxSizing: "border-box",
        paddingTop: "55px",
      }}
    >
      {/* Nombre y logo de Laguito Libre */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <Typography
          sx={{
            color: "black",
            fontSize: "30px",
            fontWeight: "bold",
          }}
        >
          LAGUITO
        </Typography>

        {/* Aquí irá el logo PNG */}
        <Box
            component="img"
            src={logo}
            alt="Logo"
          sx={{
            width: "100px",
            height: "100px",
          }}
        />

        <Typography
          sx={{
            color: "black",
            fontSize: "30px",
            fontWeight: "bold",
          }}
        >
          LIBRE
        </Typography>
      </Box>

      {/* Formulario */}
      <LoginTemplate />
    </Box>
  );
}

export default LoginScreen;