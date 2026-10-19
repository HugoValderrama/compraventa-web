import { Button, Paper, Stack, Typography } from '@mui/material';
import DatoPerfil from '../../molecules/DatoPerfil';

export default function TiendaCard({ empresa, onEditar, onVerPublica }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Mi tienda
      </Typography>

      <Stack spacing={1}>
        <DatoPerfil etiqueta="Razón social" valor={empresa.razonSocial} />
        <DatoPerfil etiqueta="RUT" valor={empresa.rut} />
        <DatoPerfil etiqueta="Giro" valor={empresa.giro} />
        <DatoPerfil etiqueta="Página web" valor={empresa.paginaWeb} />
        <DatoPerfil etiqueta="Tienda física" valor={empresa.direccionLocal || 'Sin completar'} />
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mt: 3, justifyContent: 'space-between', flexWrap: 'wrap' }}
      >
        <Button variant="contained" onClick={onEditar}>
          Editar tienda
        </Button>
        <Button variant="contained" onClick={onVerPublica}>
          Ver mi tienda pública
        </Button>
      </Stack>
    </Paper>
  );
}