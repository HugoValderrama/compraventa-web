import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Alert, Box, Button, Chip, Container, Paper, Stack, Tab, Tabs, Typography,
} from '@mui/material'
import TopNavBar from '../../components/organisms/TopNavBar'
import { useAuth } from '../../context/AuthContext'
import { cargarCatalogo, CLAVE_PRODUCTOS } from '../Catalogo/catalogo.js'

const CLAVE_TIENDAS_SEGUIDAS = 'laguito-libre.tiendas-seguidas.v1'

function nombreLimpio(nombre) {
  return typeof nombre === 'string' ? nombre.normalize('NFC').trim().replace(/\s+/g, ' ') : ''
}

function claveTienda(nombre) {
  return nombreLimpio(nombre).toLocaleLowerCase('es-CL')
}

function agruparTiendas(productos) {
  const tiendas = new Map()
  for (const producto of productos) {
    const nombre = nombreLimpio(producto?.vendedor)
    if (!nombre) continue
    const id = claveTienda(nombre)
    const tienda = tiendas.get(id)
    if (tienda) tienda.publicaciones += 1
    else tiendas.set(id, { id, nombre, publicaciones: 1 })
  }
  return [...tiendas.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es-CL'))
}

function cargarTiendasSeguidas(almacenamiento) {
  try {
    const storage = almacenamiento ?? window.localStorage
    const texto = storage.getItem(CLAVE_TIENDAS_SEGUIDAS)
    const nombres = texto === null ? [] : JSON.parse(texto)
    if (!Array.isArray(nombres)) throw new Error('Lista inválida')

    const tiendas = new Map()
    for (const valor of nombres) {
      const nombre = nombreLimpio(valor)
      if (!nombre) throw new Error('Tienda inválida')
      const id = claveTienda(nombre)
      if (!tiendas.has(id)) tiendas.set(id, { id, nombre })
    }
    return { tiendas: [...tiendas.values()], error: '' }
  } catch {
    return { tiendas: [], error: 'No se pudo cargar tu lista de tiendas seguidas.' }
  }
}

function guardarSeguimiento(nombreTienda, seguir, almacenamiento) {
  const nombre = nombreLimpio(nombreTienda)
  if (!nombre || typeof seguir !== 'boolean') throw new Error('No se pudo identificar la tienda.')

  const actual = cargarTiendasSeguidas(almacenamiento)
  if (actual.error) throw new Error(actual.error)
  const id = claveTienda(nombre)
  const yaSeguida = actual.tiendas.some((tienda) => tienda.id === id)
  if (yaSeguida === seguir) return actual

  const tiendas = seguir
    ? [...actual.tiendas, { id, nombre }]
    : actual.tiendas.filter((tienda) => tienda.id !== id)
  try {
    const storage = almacenamiento ?? window.localStorage
    storage.setItem(CLAVE_TIENDAS_SEGUIDAS, JSON.stringify(tiendas.map((tienda) => tienda.nombre)))
  } catch {
    throw new Error('No se pudo guardar el cambio. Intenta nuevamente.')
  }
  return { tiendas, error: '' }
}

function enlaceCatalogoDeTienda(nombre) {
  return `/catalogo?${new URLSearchParams({ q: nombreLimpio(nombre) }).toString()}`
}

const MORADO = '#3026A6'
const AZUL = '#5DA4F2'
const botonAzul = {
  bgcolor: AZUL, color: '#111', fontWeight: 700, textTransform: 'none',
  '&:hover': { bgcolor: '#8ABDF6' },
}

function MarcoAcceso({ titulo, descripcion, children }) {
  return (
    <Box sx={{ bgcolor: MORADO, minHeight: '100vh' }}>
      <TopNavBar />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
        <Button component={RouterLink} to="/" sx={{ color: 'white', mb: 1, textTransform: 'none' }}>← Volver al inicio</Button>
        <Typography component="h1" variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 0.75 }}>{titulo}</Typography>
        <Typography sx={{ color: 'white', mb: 2.5 }}>{descripcion}</Typography>
        {children}
      </Container>
    </Box>
  )
}

function TarjetaTienda({ tienda, seguida, onCambiar, bloqueada }) {
  const cantidad = tienda.publicaciones
  return (
    <Paper component="article" elevation={0} sx={{ p: 2.25, borderRadius: 2, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'start', justifyContent: 'space-between' }}>
        <Typography component="h2" sx={{ fontSize: 17, fontWeight: 700, overflowWrap: 'anywhere', minWidth: 0 }}>{tienda.nombre}</Typography>
        {seguida && <Chip size="small" label="Siguiendo" sx={{ bgcolor: '#E7F4FF', color: '#005A9E', fontWeight: 700 }} />}
      </Stack>
      <Typography variant="body2" color="text.secondary">
        {cantidad === null ? 'No se pudieron consultar sus publicaciones.' : cantidad > 0 ? `${cantidad} ${cantidad === 1 ? 'publicación' : 'publicaciones'} en el catálogo` : 'Sin publicaciones en el catálogo.'}
      </Typography>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mt: 'auto', pt: 0.5 }}>
        {cantidad > 0 && <Button component={RouterLink} to={enlaceCatalogoDeTienda(tienda.nombre)} size="small" variant="outlined" sx={{ textTransform: 'none' }}>Buscar en catálogo</Button>}
        <Button type="button" variant="contained" disableElevation size="small" disabled={bloqueada} onClick={() => onCambiar(tienda.nombre, !seguida)} aria-label={seguida ? `Dejar de seguir a ${tienda.nombre}` : `Seguir a ${tienda.nombre}`} sx={botonAzul}>{seguida ? 'Dejar de seguir' : 'Seguir tienda'}</Button>
      </Stack>
    </Paper>
  )
}

export function TiendasQueSigoPage() {
  const [vista, setVista] = useState('seguidas')
  const [catalogo, setCatalogo] = useState(() => cargarCatalogo())
  const [seguimiento, setSeguimiento] = useState(() => cargarTiendasSeguidas())
  const [aviso, setAviso] = useState(null)

  const actualizar = () => {
    setCatalogo(cargarCatalogo())
    setSeguimiento(cargarTiendasSeguidas())
    setAviso(null)
  }

  useEffect(() => {
    const actualizarOtraPestana = (event) => {
      if (event.key === null || event.key === CLAVE_PRODUCTOS) setCatalogo(cargarCatalogo())
      if (event.key === null || event.key === CLAVE_TIENDAS_SEGUIDAS) setSeguimiento(cargarTiendasSeguidas())
    }
    window.addEventListener('storage', actualizarOtraPestana)
    return () => window.removeEventListener('storage', actualizarOtraPestana)
  }, [])

  const disponibles = useMemo(() => agruparTiendas(catalogo.productos), [catalogo.productos])
  const porId = new Map(disponibles.map((tienda) => [tienda.id, tienda]))
  const seguidas = new Set(seguimiento.tiendas.map((tienda) => tienda.id))
  const tiendas = vista === 'seguidas'
    ? seguimiento.tiendas.map((tienda) => porId.get(tienda.id) ?? { ...tienda, publicaciones: catalogo.error ? null : 0 })
    : disponibles

  const cambiar = (nombre, seguir) => {
    try {
      setSeguimiento(guardarSeguimiento(nombre, seguir))
      setAviso({ tipo: 'success', texto: seguir ? `Ahora sigues a ${nombre}.` : `Dejaste de seguir a ${nombre}.` })
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message })
    }
  }

  return (
    <MarcoAcceso titulo="Tiendas que sigo" descripcion="Consulta tus tiendas guardadas o descubre otras en el catálogo.">
      <Paper elevation={0} sx={{ borderRadius: 2, mb: 2 }}>
        <Tabs value={vista} onChange={(_, valor) => { setVista(valor); setAviso(null) }} variant="scrollable" scrollButtons="auto" aria-label="Vistas de tiendas">
          <Tab value="seguidas" id="tiendas-tab-seguidas" aria-controls="tiendas-panel-seguidas" label={`Seguidas (${seguimiento.tiendas.length})`} sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab value="explorar" id="tiendas-tab-explorar" aria-controls="tiendas-panel-explorar" label="Explorar tiendas" sx={{ textTransform: 'none', fontWeight: 700 }} />
        </Tabs>
      </Paper>

      <Box role="tabpanel" id={`tiendas-panel-${vista}`} aria-labelledby={`tiendas-tab-${vista}`}>
        {seguimiento.error && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={actualizar}>Reintentar</Button>}>{seguimiento.error}</Alert>}
        {catalogo.error && <Alert severity="warning" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={actualizar}>Reintentar</Button>}>{catalogo.error}</Alert>}
        {aviso && <Alert severity={aviso.tipo} sx={{ mb: 2 }} onClose={() => setAviso(null)}>{aviso.texto}</Alert>}

        {tiendas.length > 0 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
            {tiendas.map((tienda) => <TarjetaTienda key={tienda.id} tienda={tienda} seguida={seguidas.has(tienda.id)} onCambiar={cambiar} bloqueada={Boolean(seguimiento.error)} />)}
          </Box>
        ) : vista === 'seguidas' && !seguimiento.error ? (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
            <Typography component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>Aún no sigues ninguna tienda</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Explora las tiendas del catálogo y pulsa “Seguir tienda” para guardarlas aquí.</Typography>
            <Button type="button" variant="contained" disableElevation onClick={() => { setVista('explorar'); setAviso(null) }} sx={botonAzul}>Explorar tiendas</Button>
          </Paper>
        ) : vista === 'explorar' && !catalogo.error ? (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}><Typography>No hay publicaciones con tienda asignada en el catálogo.</Typography></Paper>
        ) : null}
      </Box>

      <Typography variant="caption" sx={{ display: 'block', color: 'white', mt: 2 }}>Tu lista se guarda en este navegador.</Typography>
    </MarcoAcceso>
  )
}

const PREGUNTAS = [
  { id: 'buscar', pregunta: '¿Cómo encuentro un producto?', respuesta: 'Usa el buscador del inicio o entra al catálogo para buscar por nombre, categoría o vendedor.', enlace: '/catalogo', boton: 'Ir al catálogo' },
  { id: 'tiendas', pregunta: '¿Cómo sigo una tienda?', respuesta: 'En modo Cliente, entra a Tiendas que sigo, abre Explorar tiendas y pulsa Seguir tienda. Puedes dejar de seguirla desde tu lista.', rol: 'cliente', enlace: '/tiendas-que-sigo', boton: 'Ver mis tiendas' },
  { id: 'compras', pregunta: '¿Dónde reviso mis compras?', respuesta: 'En modo Cliente, abre Mis compras para consultar tus pedidos y ver su detalle.', rol: 'cliente', enlace: '/compras', boton: 'Ver mis compras' },
  { id: 'ventas', pregunta: '¿Dónde reviso los pedidos de mi tienda?', respuesta: 'En modo Emprendedor, abre Pedidos para revisar los pedidos de tu tienda y su estado.', rol: 'emprendedor', enlace: '/pedidos', boton: 'Ver pedidos' },
  { id: 'cuenta', pregunta: '¿Qué hago si olvidé mi contraseña?', respuesta: 'Abre Recuperar contraseña y sigue los pasos que aparecen en esa pantalla.', enlace: '/recuperar-password', boton: 'Recuperar contraseña' },
]

export function AyudaPage() {
  const { modo } = useAuth()

  return (
    <MarcoAcceso titulo="Centro de ayuda" descripcion="Resuelve dudas sobre tus compras, ventas y cuenta.">
      <Typography component="h2" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>Preguntas frecuentes</Typography>
      <Stack spacing={1}>
        {PREGUNTAS.map((item) => (
          <Paper key={item.id} component="details" elevation={0} sx={{ borderRadius: 2 }}>
            <Box component="summary" sx={{ p: 2, cursor: 'pointer', fontWeight: 700 }}>{item.pregunta}</Box>
            <Box sx={{ px: 2, pb: 2 }}>
              <Typography variant="body2" color="text.secondary">{item.respuesta}</Typography>
              {(!item.rol || item.rol === modo) && <Button component={RouterLink} to={item.enlace} size="small" sx={{ mt: 1, textTransform: 'none' }}>{item.boton}</Button>}
            </Box>
          </Paper>
        ))}
      </Stack>
    </MarcoAcceso>
  )
}
