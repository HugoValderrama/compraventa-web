import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

function TermsCheckbox({ checked, onChange }) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          sx={{
            color: "#808080",
            "&.Mui-checked": {
              color: "#62A7F5",
            },
          }}
        />
      }
      label="Acepto los términos y condiciones"
      sx={{
        color: "#000000",
        margin: 0,
        "& .MuiFormControlLabel-label": {
          fontSize: "14px",
        },
      }}
    />
  );
}

export default TermsCheckbox;