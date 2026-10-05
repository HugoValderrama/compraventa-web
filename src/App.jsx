<<<<<<< HEAD
import { useRef, useState } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import TopNavBar from './components/organisms/TopNavBar'

const CLAVE = 'laguito-libre.cotizaciones.v1'

const CATALOGO = [
  {
    id: 'consultoria-ti',
    nombre: 'Servicio de consultoría en TI',
    precioUnitario: 150000,
  },
  {
    id: 'kit-herramientas',
    nombre: 'Kit de herramientas Pro (Premium)',
    precioUnitario: 89900,
  },
]

const CAMBIOS = {
  Pendiente: ['Respondida', 'Cancelada'],
  Respondida: ['Aceptada', 'Cancelada'],
  Aceptada: [],
  Cancelada: [],
}

const COLORES = {
  Pendiente: 'warning',
  Respondida: 'info',
  Aceptada: 'success',
  Cancelada: 'error',
}

const ACCIONES = {
  Respondida: 'Marcar como respondida',
  Aceptada: 'Aceptar cotización',
  Cancelada: 'Cancelar cotización',
}

const pesos = (valor) =>
  valor.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  })

const fecha = (valor) => new Date(valor).toLocaleDateString('es-CL')

function total(items) {
  return items.reduce((suma, item) => {
    const cantidad = Number(item.cantidad)

    return suma + (
      Number.isSafeInteger(cantidad) && cantidad > 0
        ? cantidad * item.precioUnitario
        : 0
    )
  }, 0)
}

function cargar() {
  try {
    const texto = window.localStorage.getItem(CLAVE)

    const cotizaciones = texto === null
      ? CATALOGO.map((producto, index) => ({
          id: String(index + 1),
          estado: 'Respondida',
          fechaSolicitud: new Date().toISOString(),
          observaciones: '',
          items: [{
            ...producto,
            productoId: producto.id,
            cantidad: 1,
          }],
        }))
      : JSON.parse(texto)

    const invalida = (c) =>
      !c ||
      !Object.hasOwn(CAMBIOS, c.estado) ||
      !c.id ||
      !Array.isArray(c.items) ||
      !c.items.length ||
      !Number.isFinite(Date.parse(c.fechaSolicitud)) ||
      c.items.some((i) =>
        !i ||
        typeof i.nombre !== 'string' ||
        !Number.isSafeInteger(i.precioUnitario) ||
        i.precioUnitario < 0 ||
        !Number.isSafeInteger(Number(i.cantidad)) ||
        Number(i.cantidad) < 1
      )

    if (!Array.isArray(cotizaciones) || cotizaciones.some(invalida)) {
      throw new Error('Datos inválidos')
    }

    return { cotizaciones, error: '' }
  } catch {
    return {
      cotizaciones: [],
      error: 'No se pudo leer el historial. Revisa el almacenamiento del navegador antes de continuar.',
    }
  }
}

function Pantalla({ children, volver = false }) {
  const navigate = useNavigate()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#3026A6' }}>
      <TopNavBar
        showBack={volver}
        onBack={() => navigate('/cotizaciones')}
      />

      <Container maxWidth="md" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  )
}

function Lista({ cotizaciones, error }) {
  const navigate = useNavigate()

  return (
    <Pantalla>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', mb: 3 }}
      >
        <Typography variant="h5" sx={{ color: 'white' }}>
          Mis cotizaciones
        </Typography>

        <Button
          variant="contained"
          disabled={Boolean(error)}
          onClick={() => navigate('/cotizaciones/nueva')}
        >
          Solicitar cotización
        </Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {cotizaciones.map((c) => (
        <Paper key={c.id} sx={{ p: 2, mb: 2 }}>
          <Stack spacing={1}>
            <Typography sx={{ fontWeight: 600 }}>
              {c.items.map((i) => i.nombre).join(' · ')}
            </Typography>

            <Typography variant="body2">
              Fecha: {fecha(c.fechaSolicitud)}
            </Typography>

            <Typography>
              Total: {pesos(total(c.items))}
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Chip
                label={c.estado}
                color={COLORES[c.estado]}
                size="small"
              />

              <Button
                variant="contained"
                onClick={() => navigate(`/cotizaciones/${c.id}`)}
              >
                Ver detalle
              </Button>
            </Stack>
          </Stack>
        </Paper>
      ))}

      {!error && !cotizaciones.length && (
        <Alert severity="info">
          Aún no tienes cotizaciones.
        </Alert>
      )}
    </Pantalla>
  )
}

function Solicitud({ onCrear, errorLectura }) {
  const navigate = useNavigate()
  const [producto, setProducto] = useState(null)
  const [items, setItems] = useState([])
  const [observaciones, setObservaciones] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const bloqueo = useRef(false)

  const agregar = () => {
    if (!producto) {
      setError('Selecciona un producto o servicio.')
      return
    }

    setItems((actuales) => {
      const existe = actuales.some(
        (item) => item.productoId === producto.id
      )

      if (existe) {
        return actuales.map((item) =>
          item.productoId === producto.id
            ? {
                ...item,
                cantidad: String((Number(item.cantidad) || 0) + 1),
              }
            : item
        )
      }

      return [
        ...actuales,
        {
          ...producto,
          productoId: producto.id,
          cantidad: '1',
        },
      ]
    })

    setProducto(null)
    setError('')
  }

  const enviar = (event) => {
    event.preventDefault()

    if (bloqueo.current) return

    bloqueo.current = true
    setEnviando(true)

    try {
      const nueva = onCrear(items, observaciones)

      navigate(`/cotizaciones/${nueva.id}`, {
        replace: true,
        state: { creada: true },
      })
    } catch (err) {
      setError(err.message)
      bloqueo.current = false
      setEnviando(false)
    }
  }

  return (
    <Pantalla volver>
      <Typography variant="h5" sx={{ color: 'white', mb: 3 }}>
        Solicitud de cotización
      </Typography>

      <Paper
        component="form"
        noValidate
        onSubmit={enviar}
        sx={{ p: 3 }}
      >
        <Stack spacing={2}>
          {errorLectura && (
            <Alert severity="error">{errorLectura}</Alert>
          )}

          <Autocomplete
            options={CATALOGO}
            value={producto}
            getOptionLabel={(p) => p.nombre}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            onChange={(_, value) => setProducto(value)}
            disabled={enviando || Boolean(errorLectura)}
            noOptionsText="No se encontraron productos"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar producto o servicio"
              />
            )}
          />

          <Button
            type="button"
            variant="outlined"
            onClick={agregar}
            disabled={enviando || Boolean(errorLectura)}
          >
            Agregar
          </Button>

          {items.map((item) => (
            <Box
              key={item.productoId}
              sx={{
                p: 2,
                border: '1px solid #ddd',
                borderRadius: 1,
              }}
            >
              <Typography sx={{ mb: 1 }}>
                {item.nombre} · {pesos(item.precioUnitario)} c/u
              </Typography>

              <Stack direction="row" spacing={1}>
                <TextField
                  label="Cantidad"
                  type="number"
                  size="small"
                  value={item.cantidad}
                  disabled={enviando}
                  slotProps={{
                    htmlInput: {
                      min: 1,
                      step: 1,
                      'aria-label': `Cantidad de ${item.nombre}`,
                    },
                  }}
                  onChange={(event) => {
                    setItems((actuales) =>
                      actuales.map((actual) =>
                        actual.productoId === item.productoId
                          ? {
                              ...actual,
                              cantidad: event.target.value,
                            }
                          : actual
                      )
                    )
                  }}
                />

                <Button
                  type="button"
                  color="error"
                  disabled={enviando}
                  onClick={() => {
                    setItems((actuales) =>
                      actuales.filter(
                        (actual) =>
                          actual.productoId !== item.productoId
                      )
                    )
                  }}
                >
                  Quitar
                </Button>
              </Stack>
            </Box>
          ))}

          <TextField
            label="Observaciones (opcional)"
            multiline
            minRows={2}
            value={observaciones}
            disabled={enviando}
            onChange={(event) =>
              setObservaciones(event.target.value)
            }
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />

          <Typography sx={{ fontWeight: 700 }}>
            Valor estimado total: {pesos(total(items))}
          </Typography>

          <Typography variant="body2">
            El vendedor debe confirmar los precios de la solicitud.
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <Button
            type="submit"
            variant="contained"
            disabled={enviando || Boolean(errorLectura)}
          >
            {enviando
              ? 'Guardando…'
              : 'Enviar solicitud de cotización'}
          </Button>
        </Stack>
      </Paper>
    </Pantalla>
  )
}

function DetalleRuta(props) {
  const { id } = useParams()
  return <Detalle key={id} id={id} {...props} />
}

function Detalle({
  id,
  cotizaciones,
  errorLectura,
  onActualizar,
}) {
  const location = useLocation()
  const cotizacion = cotizaciones.find(
    (c) => String(c.id) === id
  )

  const [destino, setDestino] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const confirmar = () => {
    try {
      onActualizar(id, destino)
      setMensaje(`Estado actualizado a ${destino}.`)
      setError('')
    } catch (err) {
      setError(err.message)
    }

    setDestino(null)
  }

  return (
    <Pantalla volver>
      {errorLectura ? (
        <Alert severity="error">{errorLectura}</Alert>
      ) : !cotizacion ? (
        <Alert severity="warning">
          Cotización no encontrada
        </Alert>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            {location.state?.creada && !mensaje && (
              <Alert severity="success">
                Solicitud de cotización creada correctamente.
              </Alert>
            )}

            {mensaje && (
              <Alert severity="success">{mensaje}</Alert>
            )}

            {error && (
              <Alert severity="error">{error}</Alert>
            )}

            <Typography variant="h5">
              Detalle de cotización
            </Typography>

            <Chip
              label={cotizacion.estado}
              color={COLORES[cotizacion.estado]}
              sx={{ alignSelf: 'flex-start' }}
            />

            <Typography>
              Fecha de solicitud: {fecha(cotizacion.fechaSolicitud)}
            </Typography>

            {cotizacion.items.map((item) => (
              <Typography key={item.productoId}>
                {item.nombre} — Cantidad: {item.cantidad} —{' '}
                {pesos(item.precioUnitario * item.cantidad)}
              </Typography>
            ))}

            <Typography sx={{ fontWeight: 700 }}>
              Total: {pesos(total(cotizacion.items))}
            </Typography>

            {cotizacion.observaciones && (
              <Typography
                sx={{
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                }}
              >
                {cotizacion.observaciones}
              </Typography>
            )}

            <Typography sx={{ fontWeight: 600 }}>
              Cambiar estado
            </Typography>

            {CAMBIOS[cotizacion.estado].map((estado) => (
              <Button
                key={estado}
                variant={
                  estado === 'Cancelada'
                    ? 'outlined'
                    : 'contained'
                }
                color={
                  estado === 'Cancelada'
                    ? 'error'
                    : 'primary'
                }
                onClick={() => setDestino(estado)}
              >
                {ACCIONES[estado]}
              </Button>
            ))}

            {!CAMBIOS[cotizacion.estado].length && (
              <Typography>
                Esta cotización está{' '}
                {cotizacion.estado.toLowerCase()} y no admite
                más cambios de estado.
              </Typography>
            )}
          </Stack>
        </Paper>
      )}

      <Dialog
        open={Boolean(destino)}
        onClose={() => setDestino(null)}
        aria-labelledby="confirmar-titulo"
      >
        <DialogTitle id="confirmar-titulo">
          ¿Cambiar el estado a {destino}?
        </DialogTitle>

        <DialogContent>
          <Typography>
            El cambio quedará registrado. Las cotizaciones
            canceladas se conservan en el historial.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDestino(null)}>
            Volver
          </Button>

          <Button variant="contained" onClick={confirmar}>
            Confirmar cambio
          </Button>
        </DialogActions>
      </Dialog>
    </Pantalla>
  )
}

export default function App() {
  const [datos, setDatos] = useState(cargar)

  const guardar = (cotizaciones) => {
    if (datos.error) {
      throw new Error(datos.error)
    }

    try {
      window.localStorage.setItem(
        CLAVE,
        JSON.stringify(cotizaciones)
      )
    } catch {
      throw new Error(
        'No se pudo guardar. Revisa el almacenamiento del navegador.'
      )
    }

    setDatos({ cotizaciones, error: '' })
  }

  const crear = (items, observaciones) => {
    if (!items.length) {
      throw new Error(
        'Agrega al menos un producto o servicio a la solicitud.'
      )
    }

    if (
      items.some(
        (item) =>
          !Number.isSafeInteger(Number(item.cantidad)) ||
          Number(item.cantidad) < 1
      )
    ) {
      throw new Error(
        'Las cantidades deben ser números enteros mayores que cero.'
      )
    }

    if (observaciones.trim().length > 500) {
      throw new Error(
        'Las observaciones pueden tener hasta 500 caracteres.'
      )
    }

    if (!Number.isSafeInteger(total(items))) {
      throw new Error('El total supera el límite permitido.')
    }

    const nueva = {
      id: crypto.randomUUID(),
      estado: 'Pendiente',
      fechaSolicitud: new Date().toISOString(),
      observaciones: observaciones.trim(),
      items: items.map((item) => ({
        ...item,
        cantidad: Number(item.cantidad),
      })),
    }

    guardar([nueva, ...datos.cotizaciones])
    return nueva
  }

  const actualizar = (id, estado) => {
    const seleccionada = datos.cotizaciones.find(
      (c) => String(c.id) === id
    )

    if (
      !seleccionada ||
      !CAMBIOS[seleccionada.estado].includes(estado)
    ) {
      throw new Error(
        'Este cambio de estado no está permitido.'
      )
    }

    guardar(
      datos.cotizaciones.map((c) =>
        c === seleccionada
          ? {
              ...c,
              estado,
              actualizadaEn: new Date().toISOString(),
            }
          : c
      )
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/cotizaciones" replace />}
      />

      <Route
        path="/cotizaciones"
        element={<Lista {...datos} />}
      />

      <Route
        path="/cotizaciones/nueva"
        element={
          <Solicitud
            onCrear={crear}
            errorLectura={datos.error}
          />
        }
      />

      <Route
        path="/cotizaciones/:id"
        element={
          <DetalleRuta
            cotizaciones={datos.cotizaciones}
            onActualizar={actualizar}
            errorLectura={datos.error}
          />
        }
      />

      <Route
        path="*"
        element={<Navigate to="/cotizaciones" replace />}
      />
    </Routes>
  )
}
=======
import LoginScreen from "./pages/Login/LoginScreen.jsx";

function App() {
    return <LoginScreen />;
}

export default App;
>>>>>>> de10e782cc4329856504810b538cbf15b211a0a4
