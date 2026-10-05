import Box from "@mui/material/Box";
import LoginForm from "../../organisms/LoginForm/LoginForm";

function LoginTemplate() {
  return (
    <Box
      sx={{
        backgroundColor: "#62A7F5",
        padding: "20px",
        width: "100%",
        maxWidth: "520px",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          backgroundColor: "#081A19",
          minHeight: "420px",
          padding: "45px 55px",
          boxSizing: "border-box",

          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <LoginForm />
      </Box>
    </Box>
  );
}

export default LoginTemplate;