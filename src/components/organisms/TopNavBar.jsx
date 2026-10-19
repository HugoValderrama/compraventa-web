import React from 'react';
import { AppBar, Toolbar, Tabs, Tab, Button, Box, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import { useLocation, useNavigate } from 'react-router-dom';

// Agregar aca el resto de las secciones del menu principal a medida que el
// equipo las vaya terminando (Catalogo, Mis Compras, etc.)
const SECTIONS = [
  { label: 'Cotizaciones', path: '/cotizaciones' },
  { label: 'Perfil', path: '/perfilE' },
  { label: 'Productos', path: '/productos' },
  { label: 'Servicios', path: '/servicios' },
  { label: 'Mensajería', path: '/mensajeria' },
];

export default function TopNavBar({ showBack = false, onBack, title = '' }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = SECTIONS.find(
    (section) => pathname === section.path || pathname.startsWith(section.path + '/')
  );
  const activeSection = active ? active.label : false;

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {showBack && (
            <IconButton aria-label="Volver" onClick={onBack} size="small">
              <ArrowBackIcon />
            </IconButton>
          )}
          <Box component="img" src="/logo.png" alt="Logo de Laguito Libre" sx={{ width: 36, height: 36, objectFit: 'contain', display: 'block', flexShrink: 0 }} />
          {showBack || title ? (
            <Typography sx={{ fontWeight: 700, fontSize: title ? 22 : 16 }}>
              {title || (active ? active.label : '')}
            </Typography>
          ) : (
            <Tabs value={activeSection} slotProps={{ indicator: { sx: { display: 'none' } } }}>
              {SECTIONS.map((section) => (
                <Tab
                  key={section.label}
                  value={section.label}
                  label={section.label}
                  onClick={() => navigate(section.path)}
                  sx={{ textTransform: 'none', fontWeight: 600, minHeight: 36, borderRadius: 999, '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText' } }}
                />
              ))}
            </Tabs>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Button startIcon={<AccountCircleOutlinedIcon />} color="inherit" sx={{ textTransform: 'none' }} onClick={() => navigate('/perfilE')}>Mi perfil</Button>
          <Button startIcon={<NotificationsNoneOutlinedIcon />} color="inherit" sx={{ textTransform: 'none' }}>Notificaciones</Button>
          <Button startIcon={<ShoppingCartOutlinedIcon />} color="inherit" sx={{ textTransform: 'none' }} onClick={() => navigate('/carrito')}>Mi carrito</Button>
          <Button startIcon={<FavoriteBorderOutlinedIcon />} color="inherit" sx={{ textTransform: 'none' }} onClick={() => navigate('/lista-deseos')}>Lista de deseos</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
