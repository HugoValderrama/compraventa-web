import React from 'react';
import { Container, Box, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '../components/organisms/TopNavBar';
import QuoteCard from '../components/molecules/QuoteCard';

// Datos simulados -- reemplazar por la llamada real al backend cuando exista
const MOCK_COTIZACIONES = [
  {
    id: 1,
    productoNombre: 'Servicio de consultoría en TI',
    fecha: '10 Sep 2024',
    precio: '$150.000',
    oferta: null,
    vendedor: 'TechSolutions SpA',
    costoEnvio: 'Envío: $0',
    imagenLabel: 'TI_PRO',
  },
  {
    id: 2,
    productoNombre: 'Kit de herramientas Pro (Premium)',
    fecha: '08 Sep 2024',
    precio: '$89.900',
    oferta: '-10%',
    vendedor: 'Ferretería Sur',
    costoEnvio: 'Envío: $3.500',
    imagenLabel: 'KIT_PRO',
  },
];

export default function CotizacionesListPage() {
  const navigate = useNavigate();

  const handleVerDetalle = (id) => {
    navigate(`/cotizaciones/${id}`);
  };

  return (
    <Box>
      <TopNavBar activeSection="Cotizaciones" />

      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/cotizaciones/nueva')}
            sx={{ textTransform: 'none', borderRadius: 999 }}
          >
            Solicitar Cotización
          </Button>
        </Stack>

        {MOCK_COTIZACIONES.map((c) => (
          <QuoteCard key={c.id} cotizacion={c} onVerDetalle={handleVerDetalle} />
        ))}
      </Container>
    </Box>
  );
}
