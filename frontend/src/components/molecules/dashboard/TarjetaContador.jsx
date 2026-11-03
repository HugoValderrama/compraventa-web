import { Link as RouterLink } from 'react-router-dom';
import { ButtonBase, Typography } from '@mui/material';

export default function TarjetaContador({ titulo, valor, to, color = 'text.primary' }) {
  return (
    <ButtonBase
      component={RouterLink}
      to={to}
      sx={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
        {titulo}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, color }}>
        {valor}
      </Typography>
    </ButtonBase>
  );
}