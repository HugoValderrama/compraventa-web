import { useState } from 'react'
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
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import TopNavBar from '../components/organisms/TopNavBar'

/* ------------------------------------------------------------------ */
/* Datos y utilidades                                                  */
/* ------------------------------------------------------------------ */

const CLAVE = 'laguito-libre.productos.v1'
const AZUL = '#0A84FF'

const INICIALES = [
  {
    id: '1',
    nombre: 'Florero Gres Silvestre',
    categoria: 'Cerámicas artesanales',
    vendedor: 'Taller Tierra',
    precio: 19990,
    precioAnterior: 24990,
    stock: 12,
    tamanos: ['S (Pequeño)', 'M (Mediano)', 'L (Grande)'],
    imagen: '',
    descripcion: 'Florero de gres con acabado rústico, hecho a mano.',
    material: 'Cerámica de alta temperatura (Gres)',
    dimensiones: '15 cm de alto × 10 cm de diámetro',
    peso: '450 gramos',
    origen: 'Elaborado artesanalmente, Valparaíso',
  },
]

const FORM_VACIO = {
  nombre: '',
  categoria: '',
  vendedor: '',
  precio: '',
  precioAnterior: '',
  stock: '',
  tamanos: '',
  imagen: '',
  descripcion: '',
  material: '',
  dimensiones: '',
  peso: '',
  origen: '',
}

const ESPECIFICACIONES = [
  ['material', 'Material'],
  ['dimensiones', 'Dimensiones'],
  ['peso', 'Peso'],
  ['origen', 'Origen'],
]

const pesos = (valor) =>
  valor.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  })

const descuento = (p) =>
  p.precioAnterior > p.precio
    ? Math.round((1 - p.precio / p.precioAnterior) * 100)
    : 0

function cargar() {
  try {
    const texto = window.localStorage.getItem(CLAVE)
    const productos = texto === null ? INICIALES : JSON.parse(texto)

    const invalido = (p) =>
      !p ||
      !p.id ||
      typeof p.nombre !== 'string' ||
      !Number.isSafeInteger(p.precio) ||
      p.precio < 0 ||
      !Number.isSafeInteger(p.stock) ||
      p.stock < 0 ||
      !Array.isArray(p.tamanos)

    if (!Array.isArray(productos) || productos.some(invalido)) {
      throw new Error('Datos inválidos')
    }

    return { productos, error: '' }
  } catch {
    return {
      productos: [],
      error:
        'No se pudo leer el catálogo. Revisa el almacenamiento del navegador antes de continuar.',
    }
  }
}

// Convierte el formulario (todo texto) en un producto válido.
// Lanza un Error con un mensaje claro si algo está mal.
function normalizar(form) {
  const texto = (v) => v.trim()
  const entero = (v) => (v.trim() === '' ? NaN : Number(v))

  const nombre = texto(form.nombre)
  const precio = entero(form.precio)
  const stock = entero(form.stock)
  const precioAnterior =
    form.precioAnterior.trim() === '' ? 0 : Number(form.precioAnterior)

  if (!nombre) throw new Error('El nombre es obligatorio.')
  if (nombre.length > 80) {
    throw new Error('El nombre puede tener hasta 80 caracteres.')
  }
  if (!texto(form.categoria)) throw new Error('La categoría es obligatoria.')
  if (!texto(form.vendedor)) throw new Error('El vendedor es obligatorio.')
  if (!Number.isSafeInteger(precio) || precio < 1) {
    throw new Error('El precio debe ser un número entero mayor que cero.')
  }
  if (
    !Number.isSafeInteger(precioAnterior) ||
    precioAnterior < 0 ||
    (precioAnterior > 0 && precioAnterior <= precio)
  ) {
    throw new Error(
      'El precio anterior debe ser mayor que el precio actual (o dejarse vacío).'
    )
  }
  if (!Number.isSafeInteger(stock) || stock < 0) {
    throw new Error('El stock debe ser un número entero, desde cero.')
  }
  if (texto(form.imagen) && !/^https?:\/\//i.test(texto(form.imagen))) {
    throw new Error('La imagen debe ser un enlace que empiece con http:// o https://')
  }

  return {
    nombre,
    categoria: texto(form.categoria),
    vendedor: texto(form.vendedor),
    precio,
    precioAnterior,
    stock,
    tamanos: form.tamanos
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    imagen: texto(form.imagen),
    descripcion: texto(form.descripcion),
    material: texto(form.material),
    dimensiones: texto(form.dimensiones),
    peso: texto(form.peso),
    origen: texto(form.origen),
  }
}

const aFormulario = (p) => ({
  ...FORM_VACIO,
  ...p,
  precio: String(p.precio),
  precioAnterior: p.precioAnterior ? String(p.precioAnterior) : '',
  stock: String(p.stock),
  tamanos: p.tamanos.join(', '),
})

/* ------------------------------------------------------------------ */
/* Piezas visuales                                                     */
/* ------------------------------------------------------------------ */

function Pantalla({ children, volver = false, destino = '/productos' }) {
  const navigate = useNavigate()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#3026A6' }}>
      <TopNavBar showBack={volver} onBack={() => navigate(destino)} />
      <Container maxWidth="md" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  )
}

function Imagen({ producto, sx }) {
  const base = {
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: 2,
    objectFit: 'cover',
    bgcolor: '#E9E4F7',
    ...sx,
  }

  return producto.imagen ? (
    <Box
      component="img"
      src={producto.imagen}
      alt={producto.nombre}
      sx={base}
    />
  ) : (
    <Box
      role="img"
      aria-label={`Sin imagen para ${producto.nombre}`}
      sx={{
        ...base,
        display: 'grid',
        placeItems: 'center',
        color: '#6B5FC7',
        textAlign: 'center',
        p: 1,
      }}
    >
      <Typography variant="caption">Sin imagen</Typography>
    </Box>
  )
}

function Precio({ producto, grande = false }) {
  const pct = descuento(producto)

  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
      <Typography
        sx={{ color: AZUL, fontWeight: 800, fontSize: grande ? 28 : 18 }}
      >
        {pesos(producto.precio)}
      </Typography>

      {pct > 0 && (
        <>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', textDecoration: 'line-through' }}
          >
            {pesos(producto.precioAnterior)}
          </Typography>
          <Chip label={`-${pct}%`} size="small" color="error" />
        </>
      )}
    </Stack>
  )
}

function Stock({ stock }) {
  const color =
    stock === 0 ? 'error.main' : stock <= 5 ? 'warning.main' : 'success.main'

  return (
    <Typography variant="body2" sx={{ color, fontWeight: 600 }}>
      {stock === 0
        ? 'Sin stock'
        : `${stock} ${stock === 1 ? 'unidad disponible' : 'unidades disponibles'} en stock`}
    </Typography>
  )
}

/* ------------------------------------------------------------------ */
/* READ: lista                                                         */
/* ------------------------------------------------------------------ */

function Lista({ productos, error }) {
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')

  const visibles = productos.filter((p) =>
    `${p.nombre} ${p.categoria} ${p.vendedor}`
      .toLowerCase()
      .includes(busqueda.trim().toLowerCase())
  )

  return (
    <Pantalla>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', mb: 3 }}
      >
        <Typography variant="h5" sx={{ color: 'white' }}>
          Mis productos
        </Typography>

        <Button
          variant="contained"
          disabled={Boolean(error)}
          onClick={() => navigate('/productos/nuevo')}
        >
          Publicar producto
        </Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {!error && productos.length > 0 && (
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por nombre, categoría o vendedor"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          sx={{ mb: 2, bgcolor: 'white', borderRadius: 1 }}
        />
      )}

      {visibles.map((p) => (
        <Paper key={p.id} sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={2}>
            <Imagen producto={p} sx={{ width: 96, height: 96, flexShrink: 0 }} />

            <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="caption"
                sx={{ color: AZUL, fontWeight: 700 }}
              >
                {p.categoria}
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>{p.nombre}</Typography>
              <Precio producto={p} />
              <Stock stock={p.stock} />
            </Stack>

            <Button
              variant="contained"
              sx={{ alignSelf: 'center' }}
              onClick={() => navigate(`/productos/${p.id}`)}
            >
              Ver detalle
            </Button>
          </Stack>
        </Paper>
      ))}

      {!error && !productos.length && (
        <Alert severity="info">
          Aún no tienes productos. Publica el primero con “Publicar producto”.
        </Alert>
      )}

      {!error && productos.length > 0 && !visibles.length && (
        <Alert severity="info">No hay productos que coincidan con la búsqueda.</Alert>
      )}
    </Pantalla>
  )
}

/* ------------------------------------------------------------------ */
/* CREATE / UPDATE: formulario compartido                              */
/* ------------------------------------------------------------------ */

function Formulario({ titulo, inicial, textoBoton, errorLectura, onGuardar, volverA }) {
  const [form, setForm] = useState(inicial)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cambiar = (campo) => (e) =>
    setForm((actual) => ({ ...actual, [campo]: e.target.value }))

  const enviar = (e) => {
    e.preventDefault()
    if (guardando) return

    setGuardando(true)
    try {
      onGuardar(form)
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  const campo = (name, label, extra = {}) => (
    <TextField
      label={label}
      value={form[name]}
      onChange={cambiar(name)}
      disabled={guardando}
      fullWidth
      {...extra}
    />
  )

  return (
    <Pantalla volver destino={volverA}>
      <Typography variant="h5" sx={{ color: 'white', mb: 3 }}>
        {titulo}
      </Typography>

      <Paper component="form" noValidate onSubmit={enviar} sx={{ p: 3 }}>
        <Stack spacing={2}>
          {errorLectura && <Alert severity="error">{errorLectura}</Alert>}

          {campo('nombre', 'Nombre del producto', {
            slotProps: { htmlInput: { maxLength: 80 } },
          })}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {campo('categoria', 'Categoría')}
            {campo('vendedor', 'Vendedor o taller')}
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {campo('precio', 'Precio (CLP)', { type: 'number' })}
            {campo('precioAnterior', 'Precio anterior (opcional)', {
              type: 'number',
            })}
            {campo('stock', 'Stock', { type: 'number' })}
          </Stack>

          {campo('tamanos', 'Tamaños (separados por coma)', {
            placeholder: 'S (Pequeño), M (Mediano), L (Grande)',
          })}

          {campo('imagen', 'Enlace de la imagen (opcional)', {
            placeholder: 'https://…',
          })}

          {campo('descripcion', 'Descripción (opcional)', {
            multiline: true,
            minRows: 2,
            slotProps: { htmlInput: { maxLength: 500 } },
          })}

          <Divider>
            <Typography variant="caption">Especificaciones</Typography>
          </Divider>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {campo('material', 'Material')}
            {campo('dimensiones', 'Dimensiones')}
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {campo('peso', 'Peso')}
            {campo('origen', 'Origen')}
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          <Button
            type="submit"
            variant="contained"
            disabled={guardando || Boolean(errorLectura)}
          >
            {guardando ? 'Guardando…' : textoBoton}
          </Button>
        </Stack>
      </Paper>
    </Pantalla>
  )
}

function Nuevo({ onCrear, errorLectura }) {
  const navigate = useNavigate()

  return (
    <Formulario
      titulo="Publicar producto"
      textoBoton="Publicar producto"
      inicial={FORM_VACIO}
      errorLectura={errorLectura}
      volverA="/productos"
      onGuardar={(form) => {
        const nuevo = onCrear(form)
        navigate(`/productos/${nuevo.id}`, {
          replace: true,
          state: { mensaje: 'Producto publicado correctamente.' },
        })
      }}
    />
  )
}

function EditarRuta({ productos, errorLectura, onActualizar }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const producto = productos.find((p) => p.id === id)

  if (!producto) {
    return (
      <Pantalla volver>
        <Alert severity="warning">Producto no encontrado</Alert>
      </Pantalla>
    )
  }

  return (
    <Formulario
      key={id}
      titulo="Editar producto"
      textoBoton="Guardar cambios"
      inicial={aFormulario(producto)}
      errorLectura={errorLectura}
      volverA={`/productos/${id}`}
      onGuardar={(form) => {
        onActualizar(id, form)
        navigate(`/productos/${id}`, {
          replace: true,
          state: { mensaje: 'Cambios guardados.' },
        })
      }}
    />
  )
}

/* ------------------------------------------------------------------ */
/* READ: detalle (como en la imagen) + DELETE                          */
/* ------------------------------------------------------------------ */

function DetalleRuta(props) {
  const { id } = useParams()
  return <Detalle key={id} id={id} {...props} />
}

function Detalle({ id, productos, errorLectura, onEliminar, mensajeInicial }) {
  const navigate = useNavigate()
  const producto = productos.find((p) => p.id === id)

  const [tamano, setTamano] = useState(null)
  const [pestana, setPestana] = useState(0)
  const [confirmando, setConfirmando] = useState(false)
  const [error, setError] = useState('')

  const eliminar = () => {
    try {
      onEliminar(id)
      navigate('/productos', { replace: true })
    } catch (err) {
      setError(err.message)
      setConfirmando(false)
    }
  }

  const especificaciones = producto
    ? ESPECIFICACIONES.filter(([clave]) => producto[clave])
    : []

  return (
    <Pantalla volver>
      {errorLectura ? (
        <Alert severity="error">{errorLectura}</Alert>
      ) : !producto ? (
        <Alert severity="warning">Producto no encontrado</Alert>
      ) : (
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            {mensajeInicial && <Alert severity="success">{mensajeInicial}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <Imagen producto={producto} />
              </Box>

              <Stack spacing={1.5} sx={{ flex: 1 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography
                    variant="caption"
                    sx={{ color: AZUL, fontWeight: 700 }}
                  >
                    {producto.categoria}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Por: {producto.vendedor}
                  </Typography>
                </Stack>

                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {producto.nombre}
                </Typography>

                <Precio producto={producto} grande />

                {producto.tamanos.length > 0 && (
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Tamaño:
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                      {producto.tamanos.map((t) => (
                        <Chip
                          key={t}
                          label={t}
                          size="small"
                          variant={tamano === t ? 'filled' : 'outlined'}
                          color={tamano === t ? 'primary' : 'default'}
                          onClick={() => setTamano(t)}
                        />
                      ))}
                    </Stack>
                  </Stack>
                )}

                <Stock stock={producto.stock} />

                <Button
                  variant="contained"
                  disabled={producto.stock === 0}
                  sx={{ bgcolor: AZUL }}
                >
                  Agregar al carrito
                </Button>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    sx={{ flex: 1 }}
                    onClick={() => navigate(`/productos/${id}/editar`)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    sx={{ flex: 1 }}
                    onClick={() => setConfirmando(true)}
                  >
                    Eliminar
                  </Button>
                </Stack>
              </Stack>
            </Stack>

            <Tabs value={pestana} onChange={(_, v) => setPestana(v)}>
              <Tab label="Especificaciones" />
              <Tab label="Descripción" />
            </Tabs>
            <Divider sx={{ mt: '-16px !important' }} />

            {pestana === 0 &&
              (especificaciones.length ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2,
                  }}
                >
                  {especificaciones.map(([clave, etiqueta]) => (
                    <Typography key={clave} variant="body2">
                      <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>
                        {etiqueta}:
                      </Box>
                      {producto[clave]}
                    </Typography>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2">
                  Este producto no tiene especificaciones.
                </Typography>
              ))}

            {pestana === 1 && (
              <Typography
                variant="body2"
                sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
              >
                {producto.descripcion || 'Este producto no tiene descripción.'}
              </Typography>
            )}
          </Stack>
        </Paper>
      )}

      <Dialog
        open={confirmando}
        onClose={() => setConfirmando(false)}
        aria-labelledby="eliminar-titulo"
      >
        <DialogTitle id="eliminar-titulo">
          ¿Eliminar “{producto?.nombre}”?
        </DialogTitle>
        <DialogContent>
          <Typography>Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmando(false)}>Volver</Button>
          <Button color="error" variant="contained" onClick={eliminar}>
            Eliminar producto
          </Button>
        </DialogActions>
      </Dialog>
    </Pantalla>
  )
}

/* ------------------------------------------------------------------ */
/* Página: estado + operaciones CRUD + rutas                           */
/* ------------------------------------------------------------------ */

export default function ProductosPage() {
  const [datos, setDatos] = useState(cargar)

  const guardar = (productos) => {
    if (datos.error) throw new Error(datos.error)

    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(productos))
    } catch {
      throw new Error('No se pudo guardar. Revisa el almacenamiento del navegador.')
    }

    setDatos({ productos, error: '' })
  }

  // CREATE
  const crear = (form) => {
    const nuevo = { id: crypto.randomUUID(), ...normalizar(form) }
    guardar([nuevo, ...datos.productos])
    return nuevo
  }

  // UPDATE
  const actualizar = (id, form) => {
    if (!datos.productos.some((p) => p.id === id)) {
      throw new Error('El producto ya no existe.')
    }

    const cambios = normalizar(form)
    guardar(datos.productos.map((p) => (p.id === id ? { ...p, ...cambios } : p)))
  }

  // DELETE
  const eliminar = (id) => {
    if (!datos.productos.some((p) => p.id === id)) {
      throw new Error('El producto ya no existe.')
    }

    guardar(datos.productos.filter((p) => p.id !== id))
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/productos" replace />} />

      <Route path="/productos" element={<Lista {...datos} />} />

      <Route
        path="/productos/nuevo"
        element={<Nuevo onCrear={crear} errorLectura={datos.error} />}
      />

      <Route
        path="/productos/:id"
        element={
          <DetalleRutaConMensaje
            productos={datos.productos}
            errorLectura={datos.error}
            onEliminar={eliminar}
          />
        }
      />

      <Route
        path="/productos/:id/editar"
        element={
          <EditarRuta
            productos={datos.productos}
            errorLectura={datos.error}
            onActualizar={actualizar}
          />
        }
      />

      <Route path="*" element={<Navigate to="/productos" replace />} />
    </Routes>
  )
}

// Lee el mensaje que dejan "crear" y "editar" al navegar al detalle.
function DetalleRutaConMensaje(props) {
  const location = useLocation()
  return <DetalleRuta {...props} mensajeInicial={location.state?.mensaje} />
}