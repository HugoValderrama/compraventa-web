import { useEffect, useRef, useState } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import TopNavBar from '../components/organisms/TopNavBar'

const CLAVE = 'laguito-libre.cotizaciones.v1'
const DIAS_VIGENCIA = 15
const FECHA_EN_CHILE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Santiago',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const CATALOGO = [
  {
    id: 'consultoria-ti',
    nombre: 'Servicio de consultoría en TI',
    tipo: 'servicio',
    precioUnitario: 150000,
  },
  {
    id: 'kit-herramientas',
    nombre: 'Kit de herramientas Pro (Premium)',
    tipo: 'producto',
    precioUnitario: 89900,
  },
]

const CAMBIOS = {
  Pendiente: ['Respondida', 'Cancelada'],
  Respondida: ['Aceptada', 'Cancelada'],
  Aceptada: [],
  Cancelada: [],
  Expirada: [],
}

const COLORES = {
  Pendiente: 'warning',
  Respondida: 'info',
  Aceptada: 'success',
  Cancelada: 'error',
  Expirada: 'default',
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

function validarDiaISO(dia) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia) || dia.startsWith('0000')) {
    throw new Error('La fecha de emisión no es válida.')
  }
  const instante = new Date(`${dia}T00:00:00.000Z`)
  if (!Number.isFinite(instante.getTime()) || instante.toISOString().slice(0, 10) !== dia) {
    throw new Error('La fecha de emisión no es válida.')
  }
  return dia
}

function diaCotizacion(valor) {
  let instante = valor
  if (typeof valor === 'string') {
    const texto = valor.trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return validarDiaISO(texto)

    const fechaLocal = texto.match(/^(\d{2})([-/])(\d{2})\2(\d{4})$/)
    if (fechaLocal) return validarDiaISO(`${fechaLocal[4]}-${fechaLocal[3]}-${fechaLocal[1]}`)

    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/i.test(texto)) {
      throw new Error('La fecha de emisión no es válida.')
    }
    validarDiaISO(texto.slice(0, 10))
    instante = new Date(texto)
  }

  if (!(instante instanceof Date) || !Number.isFinite(instante.getTime())) {
    throw new Error('La fecha de emisión no es válida.')
  }
  const partes = Object.fromEntries(
    FECHA_EN_CHILE.formatToParts(instante).map(({ type, value }) => [type, value])
  )
  return validarDiaISO(`${partes.year.padStart(4, '0')}-${partes.month}-${partes.day}`)
}

function fecha(valor) {
  const [anio, mes, dia] = diaCotizacion(valor).split('-')
  return `${dia}-${mes}-${anio}`
}

function conVigencia(cotizacion) {
  const fechaEmision = diaCotizacion(cotizacion.fechaEmision ?? cotizacion.fechaSolicitud)
  const expiracion = new Date(`${fechaEmision}T00:00:00.000Z`)
  // Suma días de calendario, sin depender del horario del navegador.
  expiracion.setUTCDate(expiracion.getUTCDate() + DIAS_VIGENCIA)
  const fechaExpiracion = validarDiaISO(expiracion.toISOString().slice(0, 10))
  return { ...cotizacion, fechaEmision, fechaExpiracion }
}

function estadoVigente(cotizacion, hoy = diaCotizacion(new Date())) {
  const puedeExpirar = cotizacion.estado === 'Pendiente' || cotizacion.estado === 'Respondida'
  return puedeExpirar && hoy >= cotizacion.fechaExpiracion ? 'Expirada' : cotizacion.estado
}

function conEstadoActualizado(cotizacion, estado, ahora = new Date()) {
  if (!cotizacion) throw new Error('Cotización no encontrada.')
  const vigente = estadoVigente(cotizacion, diaCotizacion(ahora))
  if (vigente === 'Expirada') throw new Error('La cotización expiró y no admite cambios de estado.')
  if (!CAMBIOS[vigente].includes(estado)) throw new Error('Este cambio de estado no está permitido.')
  return { ...cotizacion, estado, actualizadaEn: ahora.toISOString() }
}

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

    const registros = texto === null
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
      !(typeof c.id === 'string' ? c.id.trim() : Number.isSafeInteger(c.id)) ||
      !Array.isArray(c.items) ||
      !c.items.length ||
      c.items.some((i) =>
        !i ||
        typeof i.nombre !== 'string' ||
        !i.nombre.trim() ||
        !Number.isSafeInteger(i.precioUnitario) ||
        i.precioUnitario < 0 ||
        !Number.isSafeInteger(Number(i.cantidad)) ||
        Number(i.cantidad) < 1
      ) ||
      !Number.isSafeInteger(total(c.items))

    if (!Array.isArray(registros) || registros.some(invalida)) {
      throw new Error('Datos inválidos')
    }

    // Las solicitudes antiguas ya tienen fecha y precios. Se reutilizan sin reemitirlas.
    const cotizaciones = registros.map(conVigencia)
    return { cotizaciones, error: '' }
  } catch {
    return {
      cotizaciones: [],
      error: 'No se pudo leer el historial. Revisa el almacenamiento del navegador antes de continuar.',
    }
  }
}

function emitirCotizacion(seleccion, observaciones, ahora = new Date(), id = crypto.randomUUID()) {
  if (!Array.isArray(seleccion) || !seleccion.length) {
    throw new Error('Agrega al menos un producto o servicio a la solicitud.')
  }

  const nota = observaciones.trim()
  if (nota.length > 500) throw new Error('Las observaciones pueden tener hasta 500 caracteres.')

  const seleccionados = new Map()
  for (const item of seleccion) {
    const cantidad = Number(item.cantidad)
    if (!Number.isSafeInteger(cantidad) || cantidad < 1) {
      throw new Error('Las cantidades deben ser números enteros mayores que cero.')
    }
    const publicacion = CATALOGO.find((p) => p.id === item.productoId)
    if (!publicacion) throw new Error('Un producto o servicio seleccionado ya no está disponible.')
    if (!Number.isSafeInteger(publicacion.precioUnitario) || publicacion.precioUnitario < 0) {
      throw new Error('No se pudo consultar el precio vigente de una publicación.')
    }

    const unidades = (seleccionados.get(publicacion.id)?.cantidad ?? 0) + cantidad
    if (!Number.isSafeInteger(unidades)) throw new Error('La cantidad supera el límite permitido.')
    // El precio se toma del catálogo al emitir y luego se guarda en la solicitud.
    seleccionados.set(publicacion.id, {
      ...publicacion,
      productoId: publicacion.id,
      cantidad: unidades,
    })
  }

  const items = [...seleccionados.values()]
  if (!Number.isSafeInteger(total(items))) throw new Error('El total supera el límite permitido.')

  return conVigencia({
    id,
    estado: 'Pendiente',
    fechaSolicitud: ahora.toISOString(),
    observaciones: nota,
    items,
  })
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

function Lista({ cotizaciones, error, hoy }) {
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

      {cotizaciones.map((c) => {
        const estado = estadoVigente(c, hoy)
        return (
          <Paper key={c.id} sx={{ p: 2, mb: 2 }}>
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 600 }}>
                {c.items.map((i) => i.nombre).join(' · ')}
              </Typography>
              <Typography variant="body2">
                Fecha de emisión: {fecha(c.fechaEmision)}
              </Typography>
              <Typography variant="body2">
                Fecha de expiración: {fecha(c.fechaExpiracion)}
              </Typography>
              <Typography>
                Total: {pesos(total(c.items))}
              </Typography>

              <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip label={estado} color={COLORES[estado]} size="small" />
                <Button variant="contained" onClick={() => navigate(`/cotizaciones/${c.id}`)}>
                  Ver detalle
                </Button>
              </Stack>
            </Stack>
          </Paper>
        )
      })}

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
            noOptionsText="No se encontraron productos o servicios"
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

          <Typography variant="body2" color="text.secondary">
            El documento tendrá una vigencia de {DIAS_VIGENCIA} días corridos desde su emisión.
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

const ESTILO_IMPRESION = `
  body { margin: 28px; color: #161616; font: 15px/1.45 system-ui, sans-serif; }
  article { max-width: 900px; margin: 0 auto; overflow-wrap: anywhere; }
  h2 { margin: 12px 0; font-size: 24px; }
  dl { display: flex; flex-wrap: wrap; gap: 12px 28px; margin: 16px 0; }
  dt { font-weight: 700; } dd { margin: 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th, td { padding: 8px; border: 1px solid #aaa; text-align: left; }
  th { background: #f4f4f4; }
  td[align="right"], th[align="right"] { text-align: right; }
  .total-cotizacion { text-align: right; font-weight: 700; }
  .observaciones-cotizacion { white-space: pre-wrap; }
  button { padding: 8px 12px; cursor: pointer; }
  @media print { body { margin: 0; } button { display: none; } thead { display: table-header-group; } tr { break-inside: avoid; } }
`

function abrirImpresion(elemento, folio) {
  const ventana = window.open('about:blank', '_blank')
  if (!ventana) {
    throw new Error('El navegador bloqueó la ventana de impresión. Habilítala para guardar el PDF.')
  }

  try {
    ventana.opener = null
    const doc = ventana.document
    doc.documentElement.lang = 'es-CL'
    doc.title = `Cotización ${folio}`
    const estilo = doc.createElement('style')
    estilo.textContent = ESTILO_IMPRESION
    doc.head.append(estilo)

    const imprimir = doc.createElement('button')
    imprimir.type = 'button'
    imprimir.textContent = 'Imprimir / Guardar PDF'
    imprimir.addEventListener('click', () => ventana.print())
    doc.body.append(imprimir, doc.importNode(elemento, true))
    ventana.focus()
  } catch {
    ventana.close()
    throw new Error('No se pudo abrir el documento para imprimir.')
  }
}

function DocumentoCotizacion({ cotizacion, estado }) {
  const hoja = useRef(null)
  const [errorImpresion, setErrorImpresion] = useState('')

  const handleImprimir = () => {
    if (!hoja.current) return
    setErrorImpresion('')
    try {
      abrirImpresion(hoja.current, cotizacion.id)
    } catch (error) {
      setErrorImpresion(error.message)
    }
  }

  return (
    <Stack spacing={2}>
      <Paper component="article" ref={hoja} variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography component="h2" variant="h5" sx={{ fontWeight: 700 }}>
          Documento de cotización
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere', mt: 0.5 }}>
          Folio: {cotizacion.id}
        </Typography>

        <Box component="dl" sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 4, rowGap: 1.5, my: 2, '& dt': { fontWeight: 700 }, '& dd': { m: 0 } }}>
          <div><dt>Fecha de emisión</dt><dd>{fecha(cotizacion.fechaEmision)}</dd></div>
          <div><dt>Fecha de expiración</dt><dd>{fecha(cotizacion.fechaExpiracion)}</dd></div>
          <div><dt>Estado de la solicitud</dt><dd><Chip label={estado} color={COLORES[estado]} size="small" /></dd></div>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Vigencia: {DIAS_VIGENCIA} días corridos desde la emisión. Valores en pesos chilenos (CLP).
        </Typography>

        <TableContainer>
          <Table size="small" aria-label="Productos y servicios cotizados">
            <TableHead>
              <TableRow>
                <TableCell scope="col">Producto o servicio</TableCell>
                <TableCell scope="col" align="right">Cantidad</TableCell>
                <TableCell scope="col" align="right">Valor unitario</TableCell>
                <TableCell scope="col" align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cotizacion.items.map((item, indice) => (
                <TableRow key={`${item.productoId ?? item.id ?? 'item'}:${indice}`}>
                  <TableCell component="th" scope="row">{item.nombre}</TableCell>
                  <TableCell align="right">{item.cantidad}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{pesos(item.precioUnitario)}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{pesos(item.precioUnitario * Number(item.cantidad))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography className="total-cotizacion" sx={{ textAlign: 'right', mt: 2, fontWeight: 700 }}>
          Total cotizado: {pesos(total(cotizacion.items))}
        </Typography>

        {typeof cotizacion.observaciones === 'string' && cotizacion.observaciones && (
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>Observaciones</Typography>
            <Typography className="observaciones-cotizacion" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {cotizacion.observaciones}
            </Typography>
          </Box>
        )}
      </Paper>

      {errorImpresion && <Alert severity="warning" onClose={() => setErrorImpresion('')}>{errorImpresion}</Alert>}
      <Button type="button" variant="outlined" onClick={handleImprimir} sx={{ alignSelf: 'flex-end' }}>
        Imprimir / Guardar PDF
      </Button>
    </Stack>
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
  hoy,
}) {
  const location = useLocation()
  const cotizacion = cotizaciones.find(
    (c) => String(c.id) === id
  )
  const estado = cotizacion ? estadoVigente(cotizacion, hoy) : ''
  const acciones = CAMBIOS[estado] ?? []

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

            <DocumentoCotizacion cotizacion={cotizacion} estado={estado} />

            {acciones.length > 0 && <Typography sx={{ fontWeight: 600 }}>Cambiar estado</Typography>}

            {acciones.map((destinoEstado) => (
              <Button
                key={destinoEstado}
                variant={
                  destinoEstado === 'Cancelada'
                    ? 'outlined'
                    : 'contained'
                }
                color={
                  destinoEstado === 'Cancelada'
                    ? 'error'
                    : 'primary'
                }
                onClick={() => setDestino(destinoEstado)}
              >
                {ACCIONES[destinoEstado]}
              </Button>
            ))}

            {!acciones.length && (
              <Alert severity={estado === 'Expirada' ? 'warning' : 'info'}>
                {estado === 'Expirada'
                  ? 'El plazo de 15 días terminó. Esta cotización queda disponible en el historial.'
                  : `Esta cotización está ${estado.toLowerCase()} y no admite más cambios de estado.`}
              </Alert>
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

          <Button variant="contained" onClick={confirmar} disabled={!acciones.includes(destino)}>
            Confirmar cambio
          </Button>
        </DialogActions>
      </Dialog>
    </Pantalla>
  )
}

export default function CotizacionesPage() {
  const [datos, setDatos] = useState(cargar)
  const [hoy, setHoy] = useState(() => diaCotizacion(new Date()))

  useEffect(() => {
    const actualizarDia = () => setHoy(diaCotizacion(new Date()))
    const actualizarHistorial = (event) => {
      if (event.key === CLAVE || event.key === null) {
        setDatos(cargar())
        actualizarDia()
      }
    }

    const intervalo = window.setInterval(actualizarDia, 60_000)
    window.addEventListener('focus', actualizarDia)
    window.addEventListener('storage', actualizarHistorial)
    return () => {
      window.clearInterval(intervalo)
      window.removeEventListener('focus', actualizarDia)
      window.removeEventListener('storage', actualizarHistorial)
    }
  }, [])

  const leerHistorial = () => {
    const actual = cargar()
    if (actual.error) throw new Error(actual.error)
    return actual.cotizaciones
  }

  const guardar = (cotizaciones) => {
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
    setHoy(diaCotizacion(new Date()))
  }

  const crear = (items, observaciones) => {
    const cotizaciones = leerHistorial()
    const nueva = emitirCotizacion(items, observaciones)
    guardar([nueva, ...cotizaciones])
    return nueva
  }

  const actualizar = (id, estado) => {
    const cotizaciones = leerHistorial()
    const seleccionada = cotizaciones.find((c) => String(c.id) === id)
    const actualizada = conEstadoActualizado(seleccionada, estado)
    guardar(cotizaciones.map((c) => c === seleccionada ? actualizada : c))
  }

  return (
    <Routes>
      <Route index element={<Lista {...datos} hoy={hoy} />} />

      <Route
        path="nueva"
        element={<Solicitud onCrear={crear} errorLectura={datos.error} />}
      />

      <Route
        path=":id"
        element={
          <DetalleRuta
            cotizaciones={datos.cotizaciones}
            onActualizar={actualizar}
            errorLectura={datos.error}
            hoy={hoy}
          />
        }
      />

      <Route path="*" element={<Navigate to="/cotizaciones" replace />} />
    </Routes>
  )
}
