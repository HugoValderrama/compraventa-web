import { Button, Stack, Typography } from '@mui/material';

// vista: 'visitante' | 'cliente' | 'dueno' | 'lectura' (emprendedor que no es dueño)
export default function AccionesProducto({
  vista,
  sinStock,
  ocupado,
  onCarrito,
  onDeseos,
  onMisPreguntas,
  onLogin,
  onEditar,
  onEliminar,
  onVolver,
}) {
  if (vista === 'dueno') {
    return (
      <Stack spacing={1}>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" sx={{ flex: 1 }} onClick={onEditar}>
            Editar
          </Button>
          <Button variant="outlined" color="error" sx={{ flex: 1 }} onClick={onEliminar}>
            Eliminar
          </Button>
        </Stack>
        <Button variant="text" onClick={onVolver}>
          Volver a mis productos
        </Button>
      </Stack>
    );
  }

  if (vista === 'cliente') {
    return (
      <Stack spacing={1}>
        <Button variant="contained" disabled={sinStock || ocupado} onClick={onCarrito}>
          Agregar al carrito
        </Button>
        <Button variant="outlined" disabled={ocupado} onClick={onDeseos}>
          Agregar a lista de deseos
        </Button>
        <Button variant="text" onClick={onMisPreguntas}>
          Mis preguntas
        </Button>
      </Stack>
    );
  }

  if (vista === 'visitante') {
    return (
      <Stack spacing={1}>
        <Button variant="contained" disabled={sinStock} onClick={onLogin}>
          Agregar al carrito
        </Button>
        <Button variant="outlined" onClick={onLogin}>
          Lista de deseos
        </Button>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Inicia sesión para comprar o guardar este producto.
        </Typography>
      </Stack>
    );
  }

  return null;
}