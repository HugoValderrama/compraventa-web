import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Select,
  Typography,
} from '@mui/material'
import EstadoChip from '../../components/atoms/EstadoChip'
import { formatearFechaHora } from '../../utils/formatos'

export default function SolicitudesList({
  solicitudes,
  filtros,
  filtro,
  onFiltro,
  seleccionadaId,
  cargando,
  error,
  onReintentar,
  onVer,
}) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="h6">Solicitudes</Typography>

        <Select
        variant="standard"
        disableUnderline
        size="small"
        value={filtro}
        onChange={(event) => onFiltro(event.target.value)}
        inputProps={{ 'aria-label': 'Filtrar solicitudes' }}
        >
        {filtros.map((f) => (
            <MenuItem key={f} value={f}>
            {f}
            </MenuItem>
        ))}
        </Select>
        </Stack>

        {cargando && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress aria-label="Cargando solicitudes" />
          </Box>
        )}

        {error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={onReintentar}>
                Reintentar
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {!cargando && !error && !solicitudes.length && (
          <Alert severity="info">No hay solicitudes para este filtro.</Alert>
        )}

        {!cargando &&
        !error &&
        solicitudes.map((s) => {
            const activa = s.id === seleccionadaId

            return (
            <Box
                key={s.id}
                sx={{
                p: 2,
                borderRadius: 1,
                border: '1px solid',
                borderColor: activa ? 'primary.light' : 'transparent',
                bgcolor: activa ? '#E3F2FD' : 'grey.100',
                }}
            >
                <Stack spacing={0.5}>
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <Typography sx={{ fontWeight: 600 }}>{s.cliente.nombre}</Typography>
                    <EstadoChip estado={s.estado} />
                </Stack>

                <Typography variant="body2">
                    #{s.codigo} · {s.titulo}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                    {formatearFechaHora(s.fecha)}
                </Typography>

                {activa ? (
                    <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    Seleccionada
                    </Typography>
                ) : (
                    <Button
                    size="small"
                    variant="text"
                    onClick={() => onVer(s)}
                    sx={{ alignSelf: 'flex-start', p: 0, minWidth: 0, textTransform: 'none' }}
                    >
                    Ver solicitud →
                    </Button>
                )}
                </Stack>
            </Box>
            )
        })}

        <Typography variant="caption" color="text.secondary">
          Responde con precio final y una fecha de entrega. El cliente podrá aceptar tu
          propuesta.
        </Typography>
      </Stack>
    </Paper>
  )
}