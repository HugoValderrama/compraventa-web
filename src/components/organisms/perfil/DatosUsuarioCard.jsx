import { Avatar, Button, Paper, Stack, Typography } from '@mui/material';
import DatoPerfil from '../../molecules/DatoPerfil';
import { formatearTelefono } from '../../../utils/validaciones';
import { formatearFecha } from '../../../utils/formatos';

const iniciales = (u) => `${u.nombres?.[0] ?? ''}${u.apellidos?.[0] ?? ''}`.toUpperCase();

export default function DatosUsuarioCard({ usuario, onEditar, onTelefonos, onCorreos, onClave }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{ alignItems: { xs: 'center', sm: 'flex-start' } }}
      >
        <Avatar
          variant="rounded"
          sx={{ width: 140, height: 140, bgcolor: 'grey.500', fontSize: '54px' }}
        >
          {iniciales(usuario)}
        </Avatar>

        <Stack spacing={1} sx={{ flex: 1, width: '100%', minWidth: 0 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 0.5, md: 4 }}>
            <DatoPerfil etiqueta="RUN" valor={usuario.run} />
            <DatoPerfil
              etiqueta="Fecha de nacimiento"
              valor={formatearFecha(usuario.fechaNacimiento)}
            />
            <DatoPerfil etiqueta="Registro" valor={formatearFecha(usuario.fechaRegistro)} />
          </Stack>

          <Typography variant="h6">
            {usuario.nombres} {usuario.apellidos}
          </Typography>

          <DatoPerfil etiqueta="Correo" valor={usuario.correos[0]} />
          <DatoPerfil etiqueta="Teléfono" valor={formatearTelefono(usuario.telefonos[0])} />
          <DatoPerfil etiqueta="Dirección" valor={usuario.direccionPrincipal} />
        </Stack>
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mt: 3, justifyContent: 'space-between', flexWrap: 'wrap' }}
      >
        <Button variant="contained" onClick={onEditar}>
          Editar perfil
        </Button>
        <Button variant="contained" onClick={onTelefonos}>
          Teléfonos
        </Button>
        <Button variant="contained" onClick={onCorreos}>
          Correos
        </Button>
        <Button variant="contained" onClick={onClave}>
          Cambiar contraseña
        </Button>
      </Stack>
    </Paper>
  );
}