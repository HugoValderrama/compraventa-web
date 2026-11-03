import Button from '@mui/material/Button';

function CustomButton({children, type = "button"}){
  return(
    <Button
      type={type}
      variant="contained"
      fullWidth
      sx={{
        backgroundColor: "#B5B0B0",
        color: "#000000",
        height: "62px",
        borderRadius: "12px", 
        fontSize: "18px",
        textTransform: "none",
        boxShadow: "none",
        '&:hover': {
          backgroundColor: "#B5B0B0",
          boxShadow: "none",
        },
      }}
    >
      {children}
    </Button>
  ); 

} 
export default CustomButton;