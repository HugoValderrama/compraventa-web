import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Link,
  Paper,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
  Stack,
  Typography,
} from '@mui/material'
import FilaDato from '../../components/molecules/FilaDato'
import { ESTADOS_COMPRA } from '../../mocks/compras'
import { formatearFecha, formatearFechaHora } from '../../utils/formatos'
import PantallaCompras, { SinCompra } from './PantallaCompras'
import useCompra from './useCompra'

const PASOS = [
  ESTADOS_COMPRA.RECIBIDO,
  ESTADOS_COMPRA.PREPARACION,
  ESTADOS_COMPRA.ENVIADO,
  ESTADOS_COMPRA.ENTREGADO,
]

const o = (valor, formato = (x) => x) => (valor ? formato(valor) : '—')

export default function CompraSeguimiento() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { compra, cargando, error, reintentar } = useCompra(id)
  const [aviso, setAviso] = useState(null)

  const volver = () => navigate(`/compras/${id}`)

  const copiarNumero = async (numero) => {
    try {
      await navigator.clipboard.writeText(numero)
      setAviso({ tipo: 'success', mensaje: 'Número de seguimiento copiado' })
    } catch {
      setAviso({ tipo: 'error', mensaje: 'No se pudo copiar el número' })
    }
  }

  const d = compra?.despacho
  const pasoActual = compra ? PASOS.indexOf(compra.estado) : 0
  // Entregado: todos los pasos completados
  const activeStep = compra?.estado === ESTADOS_COMPRA.ENTREGADO ? PASOS.length : pasoActual

  return (
    <PantallaCompras onBack={volver}>
      {!compra ? (
        <SinCompra
          cargando={cargando}
          error={error}
          onReintentar={reintentar}
          onVolver={() => navigate('/compras')}
        />
      ) : (
        <Stack spacing={2}>
          <Typography variant="h5" sx={{ color: 'white' }}>
            Seguimiento · Compra #{compra.id}
          </Typography>

          <Paper sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <FilaDato
                etiqueta="Empresa de transporte"
                valor={d.empresaTransporte ?? 'Por asignar'}
              />
              <FilaDato
                etiqueta="Número de seguimiento"
                valor={
                  d.numeroSeguimiento ? (
                    <Link
                      component="button"
                      type="button"
                      underline="hover"
                      onClick={() => copiarNumero(d.numeroSeguimiento)}
                      sx={{ fontWeight: 700 }}
                    >
                      {d.numeroSeguimiento}
                    </Link>
                  ) : (
                    <Typography component="span" color="text.secondary">
                      Se asignará cuando se despache
                    </Typography>
                  )
                }
              />
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Typography variant="h6">Estado del envío</Typography>

              <Stepper activeStep={activeStep} alternativeLabel>
                {PASOS.map((paso) => (
                  <Step key={paso}>
                    <StepLabel>{paso}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <FilaDato
                etiqueta="Fecha estimada de entrega"
                valor={o(d.fechaEstimada, formatearFecha)}
              />
              <FilaDato
                etiqueta="Última actualización"
                valor={o(d.ultimaActualizacion, formatearFechaHora)}
              />
              <FilaDato etiqueta="Ubicación actual" valor={o(d.ubicacionActual)} />
            </Stack>
          </Paper>
        </Stack>
      )}

      <Snackbar
        open={Boolean(aviso)}
        autoHideDuration={3000}
        onClose={() => setAviso(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {aviso ? (
          <Alert severity={aviso.tipo} variant="filled" onClose={() => setAviso(null)}>
            {aviso.mensaje}
          </Alert>
        ) : undefined}
      </Snackbar>
    </PantallaCompras>
  )
}