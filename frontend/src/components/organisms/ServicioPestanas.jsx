import { useState } from 'react'
import { Box, Rating, Stack, Tab, Tabs, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import { precioServicio } from '../../utils/formatos'
import { formatearFecha } from '../../utils/formatos'

function Preguntas({ preguntas }) {
  if (preguntas.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Aún no hay preguntas para este servicio.
      </Typography>
    )
  }

  return (
    <Stack spacing={2}>
      {preguntas.map((p) => (
        <Box key={p.id}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}
          >
            <Typography sx={{ fontWeight: 600 }}>{p.pregunta}</Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
            >
              por {p.autor}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'flex-start', mt: 0.5 }}>
            <CheckIcon fontSize="small" sx={{ color: 'success.main' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {p.respuesta}
            </Typography>
          </Stack>
        </Box>
      ))}
    </Stack>
  )
}

function Especificaciones({ servicio }) {
  const filas = [
    ['Categoría', servicio.categoria],
    ['Modalidad', servicio.modalidad],
    ['Ubicación', servicio.ubicacion],
    ['Duración', servicio.duracion],
    ['Cupos', servicio.cupos],
    ['Precio', precioServicio(servicio)],
    ['Días y horario', servicio.diasHorario],
    ['Próxima fecha disponible', formatearFecha(servicio.ProximaFecha)],
    ['Incluye', servicio.incluye],
    ['Restricción de edad', servicio.restriccionEdad],
    ['Condiciones y cancelación', servicio.condiciones],
  ].filter(([, valor]) => valor !== '' && valor != null)

  return (
    <Stack spacing={2}>
      {servicio.descripcion && (
        <Typography variant="body2">{servicio.descripcion}</Typography>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        {filas.map(([etiqueta, valor]) => (
          <Typography key={etiqueta} variant="body2">
            <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>
              {etiqueta}:
            </Box>
            {valor}
          </Typography>
        ))}
      </Box>
    </Stack>
  )
}

function Resenas({ resenas }) {
  if (resenas.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Aún no hay reseñas para este servicio.
      </Typography>
    )
  }

  return (
    <Stack spacing={2}>
      {resenas.map((r) => (
        <Box key={r.id}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}
          >
            <Typography sx={{ fontWeight: 600 }}>{r.autor}</Typography>
            <Rating
              value={r.estrellas}
              readOnly
              size="small"
              aria-label={`${r.estrellas} de 5 estrellas`}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {formatearFecha(servicio.proximaFecha)}
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {r.comentario}
          </Typography>
        </Box>
      ))}
    </Stack>
  )
}

export default function ServicioPestanas({ servicio }) {
  const [pestana, setPestana] = useState('preguntas')
  const preguntas = servicio.preguntas ?? []
  const resenas = servicio.resenas ?? []

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={pestana}
          onChange={(_, valor) => setPestana(valor)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Información del servicio"
        >
          <Tab
            value="preguntas"
            label={`Preguntas (${preguntas.length})`}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            value="especificaciones"
            label="Especificaciones"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            value="resenas"
            label={`Reseñas (${resenas.length})`}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      <Box role="tabpanel">
        {pestana === 'preguntas' && <Preguntas preguntas={preguntas} />}
        {pestana === 'especificaciones' && <Especificaciones servicio={servicio} />}
        {pestana === 'resenas' && <Resenas resenas={resenas} />}
      </Box>
    </Box>
  )
}