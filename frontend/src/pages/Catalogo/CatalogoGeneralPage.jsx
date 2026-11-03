import * as React from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  MenuItem,
  Paper,
  Rating,
  Snackbar,
  Stack,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material'
import TopNavBar from '../../components/organisms/TopNavBar'
import {
  CLAVE_PRODUCTOS,
  actualizarFiltro,
  cargarCatalogo,
  filtrarProductos,
  leerFiltros,
  limpiarFiltros,
  obtenerCategorias,
  pesos,
} from './catalogo.js'
import { cargarDeseos, guardarDeseo, quitarDeseo, suscribirDeseos } from '../ListaDeseos/listaDeseos.js'
import { agregarAlCarrito, cargarCarrito, suscribirCarrito } from '../Carrito/carrito.js'

// Coloca este archivo y catalogo.js juntos en src/pages/Catalogo/.
const AZUL = '#62A7F5'

function ImagenProducto({ producto }) {
  const [imagenFallida, setImagenFallida] = React.useState('')
  const mostrarImagen = producto.imagen && producto.imagen !== imagenFallida

  return (
    <Box sx={{ aspectRatio: '4 / 3', bgcolor: '#EEF5FD', display: 'grid', placeItems: 'center' }}>
      {mostrarImagen ? (
        <Box
          component="img"
          src={producto.imagen}
          alt={producto.nombre}
          loading="lazy"
          onError={() => setImagenFallida(producto.imagen)}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 0 }}
        />
      ) : (
        <Typography variant="body2" sx={{ color: '#52677E', p: 2 }}>
          Sin imagen
        </Typography>
      )}
    </Box>
  )
}

function TarjetaProducto({ producto, guardado, onGuardar, deseosDeshabilitados, onAgregar, carritoDeshabilitado }) {
  const tieneDescuento = producto.precioAnterior > producto.precio
  const porcentaje = tieneDescuento
    ? Math.round((1 - producto.precio / producto.precioAnterior) * 100)
    : 0

  return (
    <Paper component="article" elevation={0} sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <ImagenProducto producto={producto} />

      <Stack spacing={1} sx={{ p: 2, flex: 1, overflowWrap: 'anywhere' }}>
        <Typography variant="caption" sx={{ color: '#1F66AE', fontWeight: 700 }}>
          {producto.categoria}
        </Typography>
        <Typography component="h2" sx={{ fontSize: 18, fontWeight: 700 }}>
          {producto.nombre}
        </Typography>
        {producto.vendedor && (
          <Typography variant="body2" color="text.secondary">Por {producto.vendedor}</Typography>
        )}

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
          <Typography sx={{ color: '#1F66AE', fontWeight: 800, fontSize: 23 }}>
            {pesos(producto.precio)}
          </Typography>
          {tieneDescuento && <Chip label={'-' + porcentaje + '%'} size="small" color="error" />}
        </Stack>
        {tieneDescuento && (
          <Typography variant="body2" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
            {pesos(producto.precioAnterior)}
          </Typography>
        )}

        {producto.calificacion === null ? (
          <Typography variant="body2" color="text.secondary">Sin calificaciones</Typography>
        ) : (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Rating
              value={producto.calificacion}
              readOnly
              precision={0.5}
              size="small"
              getLabelText={(valor) => valor + ' de 5 estrellas'}
            />
            <Typography variant="body2">{producto.calificacion.toFixed(1)} / 5</Typography>
          </Stack>
        )}

        {producto.descripcion && (
          <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {producto.descripcion}
          </Typography>
        )}

        <Typography variant="body2" sx={{ pt: 1, color: producto.stock > 0 ? '#24713B' : '#B3261E', fontWeight: 600 }}>
          {producto.stock > 0 ? 'Disponible' : 'Sin stock'}
        </Typography>
        <Button fullWidth variant="contained" disabled={producto.stock === 0 || carritoDeshabilitado} onClick={() => onAgregar(producto.id)} sx={{ textTransform: 'none' }}>
          Agregar al carrito
        </Button>
        <Button
          fullWidth
          variant={guardado ? 'contained' : 'outlined'}
          onClick={() => onGuardar(producto.id)}
          disabled={deseosDeshabilitados}
          aria-pressed={guardado}
          aria-label={(guardado ? 'Quitar de deseos: ' : 'Guardar en deseos: ') + producto.nombre}
          startIcon={
            <SvgIcon viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21 3.4 12.6a5.5 5.5 0 0 1 7.8-7.8L12 5.6l.8-.8a5.5 5.5 0 0 1 7.8 7.8Z" fill={guardado ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </SvgIcon>
          }
          sx={{ textTransform: 'none' }}
        >
          {guardado ? 'Guardado' : 'Guardar en deseos'}
        </Button>
      </Stack>
    </Paper>
  )
}

function PanelFiltros({ filtros, categorias, onCambiar, onLimpiar, activos, deshabilitado }) {
  return (
    <Paper component="aside" aria-label="Filtros del catálogo" elevation={0} sx={{ p: 2.5, alignSelf: 'start', position: { md: 'sticky' }, top: 24 }}>
      <Stack spacing={2.5}>
        <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>Filtros</Typography>

        <TextField
          select
          label="Categoría"
          size="small"
          fullWidth
          value={filtros.categoria}
          onChange={(event) => onCambiar('categoria', event.target.value)}
          disabled={deshabilitado}
        >
          <MenuItem value="">Todas las categorías</MenuItem>
          {categorias.map((categoria) => <MenuItem key={categoria} value={categoria}>{categoria}</MenuItem>)}
        </TextField>

        <Box>
          <Typography sx={{ fontWeight: 600, mb: 1.5 }}>Precio</Typography>
          <Stack spacing={2}>
            <TextField
              label="Mínimo (CLP)"
              size="small"
              fullWidth
              value={filtros.precioMinTexto}
              onChange={(event) => onCambiar('precioMin', event.target.value)}
              error={Boolean(filtros.errores.precioMin)}
              helperText={filtros.errores.precioMin}
              slotProps={{ htmlInput: { inputMode: 'numeric' } }}
              disabled={deshabilitado}
            />
            <TextField
              label="Máximo (CLP)"
              size="small"
              fullWidth
              value={filtros.precioMaxTexto}
              onChange={(event) => onCambiar('precioMax', event.target.value)}
              error={Boolean(filtros.errores.precioMax)}
              helperText={filtros.errores.precioMax}
              slotProps={{ htmlInput: { inputMode: 'numeric' } }}
              disabled={deshabilitado}
            />
          </Stack>
        </Box>

        <TextField
          select
          label="Calificación mínima"
          size="small"
          fullWidth
          value={filtros.calificacion || ''}
          onChange={(event) => onCambiar('calificacion', event.target.value)}
          error={Boolean(filtros.errores.calificacion)}
          helperText={filtros.errores.calificacion}
          disabled={deshabilitado}
        >
          <MenuItem value="">Todas las calificaciones</MenuItem>
          {[5, 4, 3, 2, 1].map((valor) => (
            <MenuItem key={valor} value={valor}>
              {valor === 5 ? '5 estrellas' : valor + (valor === 1 ? ' estrella o más' : ' estrellas o más')}
            </MenuItem>
          ))}
        </TextField>

        <Button variant="outlined" onClick={onLimpiar} disabled={!activos || deshabilitado} sx={{ textTransform: 'none' }}>
          Limpiar filtros
        </Button>
      </Stack>
    </Paper>
  )
}

export default function CatalogoGeneralPage() {
  const [datos, setDatos] = React.useState(() => cargarCatalogo())
  const [deseos, setDeseos] = React.useState(() => cargarDeseos())
  const [carrito, setCarrito] = React.useState(() => cargarCarrito())
  const [avisoDeseos, setAvisoDeseos] = React.useState(null)
  const [parametros, setParametros] = useSearchParams()
  const filtros = leerFiltros(parametros)
  const visibles = filtrarProductos(datos.productos, filtros)
  const categorias = obtenerCategorias(datos.productos)
  const filtrosInvalidos = Object.keys(filtros.errores).length > 0
  const hayFiltros = ['q', 'categoria', 'precioMin', 'precioMax', 'calificacion'].some((campo) => Boolean(parametros.get(campo)))
  const idsDeseos = new Set(deseos.items.map((item) => item.id))

  // Un enlace con una categoría inexistente permanece seleccionable y muestra cero resultados.
  if (filtros.categoria && !categorias.includes(filtros.categoria)) categorias.unshift(filtros.categoria)

  React.useEffect(() => {
    const sincronizar = (event) => {
      if (event.key === CLAVE_PRODUCTOS || event.key === null) setDatos(cargarCatalogo())
    }
    window.addEventListener('storage', sincronizar)
    return () => window.removeEventListener('storage', sincronizar)
  }, [])

  React.useEffect(() => suscribirDeseos(() => setDeseos(cargarDeseos())), [])
  React.useEffect(() => suscribirCarrito(() => setCarrito(cargarCarrito())), [])

  const agregar = (id) => {
    try {
      setCarrito(agregarAlCarrito(id))
      setAvisoDeseos({ mensaje: 'Producto añadido al carrito.', severidad: 'success' })
    } catch (error) {
      setAvisoDeseos({ mensaje: error.message, severidad: 'error' })
    }
  }

  const alternarDeseo = (id) => {
    try {
      const actuales = cargarDeseos()
      if (actuales.error) throw new Error(actuales.error)
      const guardado = actuales.items.some((item) => item.id === id)
      setDeseos(guardado ? quitarDeseo(id) : guardarDeseo(id))
      setAvisoDeseos({ mensaje: guardado ? 'Producto eliminado de tus deseos.' : 'Producto guardado en tus deseos.', severidad: 'success' })
    } catch (error) {
      setAvisoDeseos({ mensaje: error.message, severidad: 'error' })
    }
  }

  const cambiar = (campo, valor) => {
    const esPrecio = campo === 'precioMin' || campo === 'precioMax'
    if (esPrecio && !/^\d*$/.test(valor)) return

    setParametros((actuales) => actualizarFiltro(actuales, campo, valor), { replace: true })
  }

  const limpiar = () => {
    setParametros((actuales) => limpiarFiltros(actuales), { replace: true })
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#3026A6' }}>
      <TopNavBar />

      <Container component="main" maxWidth="lg" sx={{ py: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Typography component="h1" variant="h5" sx={{ color: 'white', fontWeight: 700 }}>Catálogo general</Typography>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            <Button component={RouterLink} to="/carrito" variant="contained" sx={{ bgcolor: 'white', color: '#3026A6', textTransform: 'none' }}>
              {'Mi carrito' + (carrito.error ? '' : ' (' + carrito.items.length + ')')}
            </Button>
            <Button component={RouterLink} to="/lista-deseos" variant="contained" sx={{ bgcolor: 'white', color: '#3026A6', textTransform: 'none' }}>
              {'Lista de deseos' + (deseos.error ? '' : ' (' + deseos.items.length + ')')}
            </Button>
            <Button component={RouterLink} to="/" variant="contained" sx={{ bgcolor: AZUL, color: '#111', textTransform: 'none' }}>
              Volver al inicio
            </Button>
          </Stack>
        </Stack>

        <Paper elevation={0} sx={{ p: 1.5, mb: 3 }}>
          <TextField
            label="Buscar productos"
            placeholder="Nombre, categoría o vendedor"
            type="search"
            size="small"
            fullWidth
            value={filtros.q}
            onChange={(event) => cambiar('q', event.target.value)}
            disabled={Boolean(datos.error)}
          />
        </Paper>

        {deseos.error && (
          <Alert severity="warning" sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => setDeseos(cargarDeseos())}>Reintentar</Button>}>
            {deseos.error}
          </Alert>
        )}
        {carrito.error && (
          <Alert severity="warning" sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => setCarrito(cargarCarrito())}>Reintentar</Button>}>
            {carrito.error}
          </Alert>
        )}

        {datos.error ? (
          <Alert severity="error" action={<Button color="inherit" onClick={() => setDatos(cargarCatalogo())}>Reintentar</Button>}>
            {datos.error}
          </Alert>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '260px minmax(0, 1fr)' }, gap: 3, alignItems: 'start' }}>
            <PanelFiltros filtros={filtros} categorias={categorias} onCambiar={cambiar} onLimpiar={limpiar} activos={hayFiltros} deshabilitado={false} />

            <Box component="section" aria-label="Productos del catálogo" sx={{ minWidth: 0 }}>
              <Typography aria-live="polite" sx={{ color: 'white', mb: 2 }}>
                {filtrosInvalidos ? 'Revisa los filtros seleccionados' : visibles.length + (visibles.length === 1 ? ' producto encontrado' : ' productos encontrados')}
              </Typography>

              {filtrosInvalidos ? (
                <Alert severity="warning">Corrige los filtros indicados para ver los resultados.</Alert>
              ) : visibles.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 2.5 }}>
                  {visibles.map((producto) => (
                    <TarjetaProducto key={producto.id} producto={producto} guardado={idsDeseos.has(producto.id)} onGuardar={alternarDeseo} deseosDeshabilitados={Boolean(deseos.error)} onAgregar={agregar} carritoDeshabilitado={Boolean(carrito.error)} />
                  ))}
                </Box>
              ) : (
                <Paper elevation={0} sx={{ p: 3 }}>
                  <Typography sx={{ mb: 1 }}>
                    {datos.productos.length === 0 ? 'Todavía no hay productos publicados.' : 'No encontramos productos que coincidan con los filtros.'}
                  </Typography>
                  {hayFiltros && <Button onClick={limpiar} sx={{ textTransform: 'none' }}>Limpiar filtros</Button>}
                </Paper>
              )}
            </Box>
          </Box>
        )}
      </Container>
      <Snackbar open={Boolean(avisoDeseos)} autoHideDuration={4000} onClose={() => setAvisoDeseos(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={avisoDeseos?.severidad ?? 'success'} variant="filled" onClose={() => setAvisoDeseos(null)}>{avisoDeseos?.mensaje ?? ''}</Alert>
      </Snackbar>
    </Box>
  )
}
