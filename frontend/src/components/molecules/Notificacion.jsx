import { Alert, Snackbar } from '@mui/material';

export default function Notificacion({ open, mensaje, severidad = 'success', onClose }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={(_, motivo) => {
        if (motivo !== 'clickaway') onClose();
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severidad} variant="filled" sx={{ width: '100%' }}>
        {mensaje}
      </Alert>
    </Snackbar>
  );
}