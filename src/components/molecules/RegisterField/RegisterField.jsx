import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

function RegisterField({ label, type = "text", helperText = "" }) {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        sx={{
          color: "#808080",
          fontSize: "14px",
          fontWeight: "bold",
          marginBottom: "8px",
        }}
      >
        {label}
      </Typography>

      <TextField
        type={type}
        fullWidth
        variant="outlined"
        sx={{
          "& .MuiOutlinedInput-root": {
            height: "50px",
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",

            "& fieldset": {
              borderColor: "#D9D9D9",
            },

            "&:hover fieldset": {
              borderColor: "#B5B0B0",
            },

            "&.Mui-focused fieldset": {
              borderColor: "#62A7F5",
            },
          },
        }}
      />

      {helperText && (
        <Typography
          sx={{
            color: "#808080",
            fontSize: "13px",
            marginTop: "6px",
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
}

export default RegisterField;