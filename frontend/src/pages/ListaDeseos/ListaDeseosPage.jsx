import * as React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material'
import TopNavBar from '../../components/organisms/TopNavBar'
import { CLAVE_PRODUCTOS, cargarCatalogo, pesos } from '../Catalogo/catalogo.js'
import {
  anadirALista,
  obtenerDeseosApi,
  obtenerNombresListas,
  quitarDeLista,
  quitarDeseoApi,
} from './listaDeseos.js'

const AZUL = '#62A7F5'

function IconoAccion({ eliminar = false }) {
  return (
    <SvgIcon viewBox="0 0 24 24" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {eliminar ? (
          <>
            <path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6" />
          </>
        ) : (
          <>
            <path d="M8 5h13M8 11h13M8 17h8M19 15v6M16 18h6" />
            <circle cx="3" cy="5" r=".8" fill="currentColor" />
            <circle cx="3" cy="11" r=".8" fill="currentColor" />
            <circle cx="3" cy="17" r=".8" fill="currentColor" />
          </>
        )}
      </g>
    </SvgIcon>
  )
}

function ImagenDeseo({ producto }) {
  const [fallida, setFallida] = React.useState('')
  const src = producto?.imagen ?? ''
  return (
    <Box sx={{ gridArea: 'imagen', width: { xs: 80, md: 90 }, height: { xs: 80, md: 90 }, borderRadius: 1, bgcolor: '#858585', color: 'white', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
      {src && src !== fallida ? (
        <Box component="img" src={src} alt={producto.nombre} loading="lazy" onError={() => setFallida(src)} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <Typography variant="caption" sx={{ p: 1, textAlign: 'center', fontWeight: 700 }}>Sin imagen</Typography>
      )}
    </Box>
  )
}

function FilaDeseo({ item, producto, onAnadir, onQuitar, onQuitarLista }) {
  const descuento = producto?.precioAnterior > producto?.precio
    ? Math.round((1 - producto.precio / producto.precioAnterior) * 100)
    : 0
  const envio = producto?.precioEnvio
  const tienePrecio = typeof producto?.precio === 'number'

  return (
    <Paper
      component="article"
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2,
        display: 'grid',
        gap: 2,
        alignItems: 'center',
        gridTemplateColumns: { xs: '80px minmax(0, 1fr)', md: '90px minmax(0, 1.4fr) minmax(150px, 1fr) auto' },
        gridTemplateAreas: {
          xs: '"imagen info" "precios precios" "acciones acciones"',
          md: '"imagen info precios acciones"',
        },
      }}
    >
      <ImagenDeseo producto={producto} />
      <Box sx={{ gridArea: 'info', minWidth: 0, overflowWrap: 'anywhere' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
          <Typography component="h2" sx={{ fontWeight: 700, fontSize: 18 }}>
            {producto?.nombre ?? 'Elemento no disponible'}
          </Typography>
          <Chip
            label={item.tipo === 'servicio' ? 'Servicio' : 'Producto'}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: 11 }}
          />
        </Stack>
        {producto?.vendedor && <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>{producto.vendedor}</Typography>}
        {producto?.stock === 0 && <Chip label="Sin stock" size="small" color="warning" sx={{ mt: 1 }} />}
        {item.listas.length > 0 && (
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {item.listas.map((lista) => (
              <Chip key={lista} label={lista} size="small" onDelete={() => onQuitarLista(item.id, lista)} />
            ))}
          </Stack>
        )}
      </Box>

      <Stack spacing={0.5} sx={{ gridArea: 'precios' }}>
        <Typography sx={{ fontWeight: 700 }}>{tienePrecio ? pesos(producto.precio) : 'Precio por confirmar'}</Typography>
        {descuento > 0 && (
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F66AE' }}>
            Oferta: {descuento}% de descuento
          </Typography>
        )}
        {item.tipo === 'producto' && (
          <Typography variant="body2" color="text.secondary">
            {envio === 0 ? 'Envío gratis' : Number.isSafeInteger(envio) && envio > 0 ? 'Envío: ' + pesos(envio) : 'Envío por confirmar'}
          </Typography>
        )}
      </Stack>

      <Stack direction={{ xs: 'row', md: 'column' }} spacing={0.5} sx={{ gridArea: 'acciones', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <Button startIcon={<IconoAccion />} onClick={() => onAnadir(item.id)} sx={{ color: '#111', textTransform: 'none', fontWeight: 700 }}>
          Añadir a lista
        </Button>
        <Button startIcon={<IconoAccion eliminar />} onClick={() => onQuitar(item)} sx={{ color: '#111', textTransform: 'none', fontWeight: 700 }}>
          Eliminar
        </Button>
      </Stack>
    </Paper>
  )
}

export default function ListaDeseosPage() {
  const [items, setItems] = React.useState([])
  const [cargando, setCargando] = React.useState(true)
  const [errorCarga, setErrorCarga] = React.useState('')

  const [catalogo, setCatalogo] = React.useState(() => cargarCatalogo())
  const [listaSeleccionada, setListaSeleccionada] = React.useState('')
  const [itemActivoId, setItemActivoId] = React.useState('')
  const [nombreLista, setNombreLista] = React.useState('')
  const [errorLista, setErrorLista] = React.useState('')
  const [aviso, setAviso] = React.useState(null)

  const cargarDesdeApi = React.useCallback(async () => {
    setCargando(true)
    setErrorCarga('')
    try {
      const lista = await obtenerDeseosApi()
      setItems(lista)
    } catch (err) {
      setErrorCarga(err.message)
    } finally {
      setCargando(false)
    }
  }, [])

  React.useEffect(() => {
    cargarDesdeApi()
    const sincronizarProductos = (event) => {
      if (event.key === CLAVE_PRODUCTOS || event.key === null) setCatalogo(cargarCatalogo())
    }
    window.addEventListener('storage', sincronizarProductos)
    return () => {
      window.removeEventListener('storage', sincronizarProductos)
    }
  }, [cargarDesdeApi])

  const listas = obtenerNombresListas(items)
  const opcionesLista = listaSeleccionada && !listas.includes(listaSeleccionada)
    ? [listaSeleccionada, ...listas]
    : listas
  const visibles = items.filter((item) => !listaSeleccionada || item.listas.includes(listaSeleccionada))
  const productosPorId = new Map(catalogo.productos.map((producto) => [String(producto.id), producto]))

  const quitar = async (item) => {
    try {
      await quitarDeseoApi(item.idBien, item.tipo)
      setItems((prev) => prev.filter((x) => x.id !== item.id))
      setAviso({
        mensaje: `${item.tipo === 'servicio' ? 'Servicio' : 'Producto'} eliminado de tus deseos.`,
        severidad: 'success',
      })
    } catch (error) {
      setAviso({ mensaje: error.message, severidad: 'error' })
    }
  }

  const quitarLista = (id, nombre) => {
    try {
      const res = quitarDeLista(id, nombre)
      setItems(res.items)
      setAviso({ mensaje: 'Retirado de la lista ' + nombre + '.', severidad: 'success' })
    } catch (error) {
      setAviso({ mensaje: error.message, severidad: 'error' })
    }
  }

  const abrirLista = (id) => {
    setItemActivoId(id)
    setNombreLista('')
    setErrorLista('')
  }

  const guardarEnLista = (event) => {
    event.preventDefault()
    try {
      const res = anadirALista(itemActivoId, nombreLista)
      setItems(res.items)
      setItemActivoId('')
      setAviso({ mensaje: 'Añadido a la lista.', severidad: 'success' })
    } catch (error) {
      setErrorLista(error.message)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#3026A6' }}>
      <TopNavBar />
      <Container component="main" maxWidth="lg" sx={{ py: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 3 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography component="h1" variant="h5" sx={{ color: 'white', fontWeight: 700 }}>Lista de deseos</Typography>
            {!cargando && !errorCarga && <Chip label={items.length} size="small" sx={{ bgcolor: 'white', fontWeight: 700 }} />}
          </Stack>
          <Button component={RouterLink} to="/catalogo" variant="contained" sx={{ bgcolor: AZUL, color: '#111', textTransform: 'none' }}>Explorar catálogo</Button>
        </Stack>

        {cargando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        ) : errorCarga ? (
          <Alert severity="error" action={<Button color="inherit" onClick={cargarDesdeApi}>Reintentar</Button>}>{errorCarga}</Alert>
        ) : items.length === 0 ? (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Tu lista de deseos está vacía</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>Guarda los productos y servicios que te gusten desde el catálogo.</Typography>
            <Button component={RouterLink} to="/catalogo" variant="contained">Ver productos</Button>
          </Paper>
        ) : (
          <>
            {opcionesLista.length > 0 && (
              <Paper elevation={0} sx={{ p: 1.5, mb: 2 }}>
                <TextField select label="Ver lista" size="small" value={listaSeleccionada} onChange={(event) => setListaSeleccionada(event.target.value)} sx={{ minWidth: 220, maxWidth: '100%', width: { xs: '100%', sm: 280 } }}>
                  <MenuItem value="">Todos mis deseos</MenuItem>
                  {opcionesLista.map((lista) => <MenuItem key={lista} value={lista}>{lista}</MenuItem>)}
                </TextField>
              </Paper>
            )}
            <Stack spacing={1.5}>
              {visibles.map((item) => {
                // Combina datos frescos de PostgreSQL con cualquier dato extra del catálogo local
                const enCatalogo = productosPorId.get(String(item.idBien)) || productosPorId.get(item.id)
                const combinado = { ...enCatalogo, ...item, precio: item.precio ?? enCatalogo?.precio }
                return (
                  <FilaDeseo
                    key={item.id}
                    item={item}
                    producto={combinado}
                    onAnadir={abrirLista}
                    onQuitar={quitar}
                    onQuitarLista={quitarLista}
                  />
                )
              })}
              {visibles.length === 0 && (
                <Paper elevation={0} sx={{ p: 3 }}>
                  <Typography sx={{ mb: 1 }}>Esta lista no tiene elementos.</Typography>
                  <Button onClick={() => setListaSeleccionada('')}>Ver todos mis deseos</Button>
                </Paper>
              )}
            </Stack>
          </>
        )}
      </Container>

      <Dialog open={Boolean(itemActivoId)} onClose={() => setItemActivoId('')} fullWidth maxWidth="xs" aria-labelledby="deseos-lista-titulo">
        <Box component="form" onSubmit={guardarEnLista}>
          <DialogTitle id="deseos-lista-titulo">Añadir a lista</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>Elige una lista existente o escribe un nombre nuevo.</Typography>
            <TextField autoFocus fullWidth label="Nombre de la lista" placeholder="Por ejemplo: Para comprar" value={nombreLista} onChange={(event) => { setNombreLista(event.target.value); setErrorLista('') }} error={Boolean(errorLista)} helperText={errorLista} slotProps={{ htmlInput: { maxLength: 40 } }} sx={{ mt: 1 }} />
            {listas.length > 0 && (
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {listas.map((lista) => <Chip key={lista} label={lista} onClick={() => { setNombreLista(lista); setErrorLista('') }} />)}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setItemActivoId('')}>Cancelar</Button>
            <Button type="submit" variant="contained">Añadir</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Snackbar open={Boolean(aviso)} autoHideDuration={4000} onClose={() => setAviso(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={aviso?.severidad ?? 'success'} variant="filled" onClose={() => setAviso(null)}>{aviso?.mensaje ?? ''}</Alert>
      </Snackbar>
    </Box>
  )
}
