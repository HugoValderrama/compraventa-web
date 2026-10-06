import Box from "@mui/material/Box";

import RegisterTemplate from "../../components/templates/RegisterTemplate/RegisterTemplate";

function RegistroScreen() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#3026A6",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxSizing: "border-box",
        padding: "35px 20px",
      }}
    >
      <RegisterTemplate />
    </Box>
  );
}

export default RegistroScreen;