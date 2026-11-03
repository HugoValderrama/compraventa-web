import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  InputBase,
  Paper,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material'
import TopNavBar from '../../components/organisms/TopNavBar'

// Ubicación prevista de este archivo: src/pages/Home/HomePage.jsx.
// /productos ya está registrada en tu App.jsx.
// ProductosPage deberá leer q y precioMax para aplicar búsqueda y precio.
// Los destinos sin ruta registrada quedan desactivados hasta conectarlos.
const RUTAS = {
  catalogo: '/catalogo',
  tiendas: null,
  categorias: '/catalogo',
  ayuda: null,
}

const COLORES = {
  fondo: '#3026A6',
  azul: '#5DA4F2',
  azulHover: '#8ABDF6',
  texto: '#111111',
}

// SVG propios: no se necesita instalar un paquete adicional de iconos.
const ICONOS = {
  buscar: (
    <>
      <circle cx="27" cy="27" r="17" />
      <path d="m40 40 14 14" />
    </>
  ),
  dinero: (
    <>
      <circle cx="32" cy="32" r="25" />
      <path d="M41 21c-3-3-15-4-17 3-3 9 18 7 16 16-2 8-14 8-20 3M32 13v38" />
    </>
  ),
  tienda: (
    <>
      <path d="M9 25h46l-5-12H14ZM12 25v27h40V25M8 25v7a6 6 0 0 0 12 0v-7M20 25v7a6 6 0 0 0 12 0v-7M32 25v7a6 6 0 0 0 12 0v-7M44 25v7a6 6 0 0 0 12 0v-7M26 52V39h12v13" />
    </>
  ),
  categorias: (
    <>
      <path d="m32 8 12 19H20ZM10 38h18v18H10Z" />
      <circle cx="46" cy="47" r="10" />
    </>
  ),
  ayuda: (
    <>
      <circle cx="32" cy="32" r="25" />
      <path d="M24 24c0-11 19-11 19 0 0 7-11 7-11 15" />
      <circle cx="32" cy="46" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  futbol: (
    <>
      <circle cx="32" cy="32" r="25" />
      <path d="m32 21 11 8-4 13H25l-4-13ZM32 7v14M8 25l13 4M16 51l9-9M48 51l-9-9M56 25l-13 4" />
    </>
  ),
  baloncesto: (
    <>
      <circle cx="32" cy="32" r="25" />
      <path d="M7 32h50M32 7v50M14 14c22 12 22 24 0 36M50 14c-22 12-22 24 0 36" />
    </>
  ),
  portatil: (
    <>
      <rect x="13" y="12" width="38" height="31" rx="2" />
      <path d="m13 43-7 9h52l-7-9M25 48h14" />
    </>
  ),
  monitor: (
    <>
      <rect x="7" y="10" width="50" height="34" rx="2" />
      <path d="M32 44v11M22 55h20" />
    </>
  ),
}

function IconoHome({ tipo, sx }) {
  return (
    <SvgIcon viewBox="0 0 64 64" aria-hidden="true" sx={sx}>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {ICONOS[tipo]}
      </g>
    </SvgIcon>
  )
}

function urlCatalogo(parametros = {}) {
  const consulta = new URLSearchParams(parametros).toString()
  return RUTAS.catalogo + (consulta ? '?' + consulta : '')
}

const ACCESOS = [
  {
    titulo: 'Menos de $10.000',
    descripcion: 'Descubre productos con precios más bajos.',
    boton: 'Mostrar productos',
    icono: 'dinero',
    destino: urlCatalogo({ precioMax: '10000' }),
  },
  {
    titulo: 'Tiendas oficiales',
    descripcion: 'Encuentra tus marcas y productos favoritos.',
    boton: 'Mostrar tiendas',
    icono: 'tienda',
    destino: RUTAS.tiendas,
  },
  {
    titulo: 'Nuestras categorías',
    descripcion: 'Encuentra ropa, muebles, computadores y más.',
    boton: 'Ir a categorías',
    icono: 'categorias',
    destino: RUTAS.categorias,
  },
  {
    titulo: '¿Necesitas ayuda?',
    descripcion: 'Resuelve tus dudas sobre compras o ventas.',
    boton: 'Ir a ayuda',
    icono: 'ayuda',
    destino: RUTAS.ayuda,
  },
]

function BannerOferta({ titulo, descuento, iconos }) {
  return (
    <Paper
      elevation={0}
      square
      sx={{
        bgcolor: COLORES.azul,
        color: 'white',
        p: { xs: 2, md: 3 },
        minHeight: { xs: 185, md: 220 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Typography
        component="h2"
        sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 700, whiteSpace: 'pre-line' }}
      >
        {titulo}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <Box sx={{ flexShrink: 0 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>
            HASTA
          </Typography>
          <Typography sx={{ fontSize: { xs: 32, md: 40 }, fontWeight: 700, lineHeight: 1.1 }}>
            {descuento}% OFF
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.5} sx={{ color: COLORES.texto, flexShrink: 0 }}>
          {iconos.map((icono) => (
            <IconoHome key={icono} tipo={icono} sx={{ fontSize: { xs: 42, md: 64 } }} />
          ))}
        </Stack>
      </Stack>
    </Paper>
  )
}

function TarjetaAcceso({ titulo, descripcion, boton, icono, destino }) {
  return (
    <Paper
      component="article"
      elevation={0}
      square
      sx={{
        p: { xs: 2, md: 2.5 },
        bgcolor: 'white',
        color: COLORES.texto,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        minHeight: 280,
        textAlign: 'center',
      }}
    >
      <Typography component="h2" sx={{ fontSize: 16, fontWeight: 700 }}>
        {titulo}
      </Typography>

      <IconoHome tipo={icono} sx={{ fontSize: 76 }} />

      <Typography sx={{ fontSize: 14, fontStyle: 'italic', lineHeight: 1.5 }}>
        {descripcion}
      </Typography>

      <Button
        component={destino ? RouterLink : 'button'}
        to={destino || undefined}
        disabled={!destino}
        variant="contained"
        disableElevation
        sx={{
          mt: 'auto',
          bgcolor: COLORES.azul,
          color: COLORES.texto,
          borderRadius: 0,
          textTransform: 'none',
          fontWeight: 700,
          '&:hover': { bgcolor: COLORES.azulHover },
          '&.Mui-disabled': { bgcolor: COLORES.azul, color: COLORES.texto, opacity: 0.5 },
        }}
      >
        {boton}
      </Button>
    </Paper>
  )
}

export default function HomePage() {
  const [busqueda, setBusqueda] = useState('')
  const navigate = useNavigate()

  const handleBuscar = (event) => {
    event.preventDefault()
    const texto = busqueda.trim()
    navigate(urlCatalogo(texto ? { q: texto } : {}))
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORES.fondo }}>
      {/* Se reutiliza el encabezado existente, como en tu ejemplo. */}
      <TopNavBar />

      <Container component="main" maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
        <Box
          component="h1"
          sx={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' }}
        >
          Bienvenido
        </Box>

        <Paper
          component="form"
          role="search"
          onSubmit={handleBuscar}
          elevation={0}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.75, pl: 1.5, mb: 3, borderRadius: 2 }}
        >
          <IconoHome tipo="buscar" sx={{ fontSize: 24, color: '#333', flexShrink: 0 }} />
          <InputBase
            type="search"
            fullWidth
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar productos y servicios…"
            inputProps={{ 'aria-label': 'Buscar productos y servicios', maxLength: 150 }}
            sx={{ minWidth: 0, fontSize: { xs: 14, md: 16 } }}
          />
          <Button
            type="submit"
            variant="contained"
            disableElevation
            sx={{ bgcolor: COLORES.azul, color: COLORES.texto, textTransform: 'none', fontWeight: 700, flexShrink: 0, '&:hover': { bgcolor: COLORES.azulHover } }}
          >
            Buscar
          </Button>
        </Paper>

        <Box
          component="section"
          aria-label="Ofertas destacadas"
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 3, mb: 3 }}
        >
          <BannerOferta titulo="Solo por hoy" descuento={50} iconos={['futbol', 'baloncesto']} />
          <BannerOferta titulo={'Las mejores ofertas\nde computadores'} descuento={40} iconos={['portatil', 'monitor']} />
        </Box>

        <Box
          component="section"
          aria-label="Explora nuestra plataforma"
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 3 }}
        >
          {ACCESOS.map((acceso) => (
            <TarjetaAcceso key={acceso.icono} {...acceso} />
          ))}
        </Box>
      </Container>
    </Box>
  )
}
