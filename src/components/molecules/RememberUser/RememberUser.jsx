import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

function RememberUser() {
  return (
    <FormControlLabel
      control={
        <Checkbox
          sx={{
            color: "#FFFFFF",
            "&.Mui-checked": {
              color: "#62A7F5",
            },
          }}
        />
      }
      label="Recuérdame"
      sx={{
        color: "#FFFFFF",

        "& .MuiFormControlLabel-label": {
          fontSize: "17px",
        },
      }}
    />
  );
}

export default RememberUser;