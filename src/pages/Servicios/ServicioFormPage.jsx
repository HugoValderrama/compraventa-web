import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, CircularProgress, Stack, Typography } from '@mui/material'
import ServicioForm from '../../components/organisms/ServicioForm'
import Pantalla from './Pantalla'
import {
  actualizarServicio,
  crearServicio,
  obtenerServicio,
} from '../../mocks/servicios'

export function NuevoServicio() {
  const navigate = useNavigate()

  return (
    <Pantalla volver>
      <Typography variant="h5" sx={{ color: 'white', mb: 3 }}>
        Crear servicio
      </Typography>

      <ServicioForm
        textoBoton="Crear servicio"
        onCancelar={() => navigate('/servicios')}
        onGuardar={async (datos) => {
          await crearServicio(datos)
          navigate('/servicios', {
            replace: true,
            state: { mensaje: 'Servicio creado correctamente.' },
          })
        }}
      />
    </Pantalla>
  )
}

export function EditarServicio() {
  const { id } = useParams()
  return <EditarContenido key={id} id={id} />
}

function EditarContenido({ id }) {
  const navigate = useNavigate()
  const [estado, setEstado] = useState({ cargando: true, servicio: null, error: '' })

  useEffect(() => {
    let vigente = true

    obtenerServicio(id)
      .then((servicio) => {
        if (vigente) setEstado({ cargando: false, servicio, error: '' })
      })
      .catch((err) => {
        if (vigente) setEstado({ cargando: false, servicio: null, error: err.message })
      })

    return () => {
      vigente = false
    }
  }, [id])

  return (
    <Pantalla volver>
      <Typography variant="h5" sx={{ color: 'white', mb: 3 }}>
        Editar servicio
      </Typography>

      {estado.cargando && (
        <Stack spacing={2} role="status" sx={{ alignItems: 'center', py: 6 }}>
          <CircularProgress sx={{ color: 'white' }} />
          <Typography sx={{ color: 'white' }}>Cargando servicio…</Typography>
        </Stack>
      )}

      {!estado.cargando && estado.error && (
        <Alert severity="warning">{estado.error}</Alert>
      )}

      {estado.servicio && (
        <ServicioForm
          inicial={estado.servicio}
          textoBoton="Guardar cambios"
          onCancelar={() => navigate('/servicios')}
          onGuardar={async (datos) => {
            await actualizarServicio(id, datos)
            navigate('/servicios', {
              replace: true,
              state: { mensaje: 'Cambios guardados.' },
            })
          }}
        />
      )}
    </Pantalla>
  )
}