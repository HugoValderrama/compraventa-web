import { ButtonBase, Typography } from '@mui/material';

export default function TarjetaResumenStock({ titulo, valor, activa, color = 'text.primary', onClick }) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-pressed={activa}
      sx={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: 1,
        border: '2px solid',
        borderColor: activa ? 'primary.main' : 'transparent',
      }}
    >
      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
        {titulo}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, color }}>
        {valor}
      </Typography>
    </ButtonBase>
  );
}