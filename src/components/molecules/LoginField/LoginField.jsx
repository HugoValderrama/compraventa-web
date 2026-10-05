import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

function LoginField({placeholder, type = "text", icon}) {
    return (
        <TextField
          type={type}
          placeholder={placeholder}
          fullWidth
          variant="outlined"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                    {icon}
                </InputAdornment>
                ),
            },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            height: "74px",
            backgroundColor: "#b5b0b0",
            borderRadius: "12px",
            
            "& fieldset": {
              border: "none",
            },
        },
        "& .MuiOutlinedInput-input": {
           color: "#000000",
           fontSize: "18px",
        },
        
        "& .MuiInputBase-input::placeholder": {
            color: "#000000",
            opacity: 0.6,
        },
      }}
    />
  );
}
export default LoginField;