import React, { useState } from 'react';
import {
  Container,
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Button,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import TopNavBar from '../components/organisms/TopNavBar';

// Dato simulado -- en la version real se busca por :id contra el backend
const MOCK_DETALLE = {
  id: 1,
  estado: 'Respondida',
  fechaSolicitud: '10 Sep 2024',
  validoHasta: '25 Sep 2024',
  diasRestantes: 3,
  items: [
    { id: 'a', nombre: 'Servicio de consultoría en TI', cantidad: 2, precioUnitario: 150000, imagenLabel: 'TI_PRO' },
    { id: 'b', nombre: 'Kit de herramientas Pro (Premium)', cantidad: 1, precioUnitario: 89900, imagenLabel: 'KIT_PRO' },
  ],
};

const formatCLP = (n) => n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

export default function CotizacionDetallePage() {
  const { id } = useParams(); // eslint-disable-line no-unused-vars -- se usara al conectar con el backend
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const cotizacion = MOCK_DETALLE;
  const total = cotizacion.items.reduce((acc, it) => acc + it.cantidad * it.precioUnitario, 0);

  const handleAceptar = () => {
    console.log('Cotización aceptada:', { id: cotizacion.id, total });
  };

  const handleCancelar = () => {
    console.log('Cotización cancelada (delete):', { id: cotizacion.id });
    setConfirmOpen(false);
    navigate('/cotizaciones');
  };

  return (
    <Box>
      <TopNavBar showBack onBack={() => navigate('/cotizaciones')} />

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 0.5 }}>
          <Typography variant="h6">Cotización {cotizacion.id}</Typography>
          <Chip label={cotizacion.estado} color="primary" size="small" />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Fecha de solicitud: {cotizacion.fechaSolicitud}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography fontWeight={600} sx={{ mb: 2 }}>
                Ítems cotizados
              </Typography>

              {cotizacion.items.map((it) => (
                <Box key={it.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box>
                    <Typography variant="body2">{it.nombre}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cant: {it.cantidad} · {formatCLP(it.precioUnitario)} c/u
                    </Typography>
                  </Box>
                  <Typography variant="body2">{formatCLP(it.cantidad * it.precioUnitario)}</Typography>
                </Box>
              ))}

              <Divider sx={{ my: 1.5 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={600}>Total cotizado</Typography>
                <Typography fontWeight={600} color="primary">
                  {formatCLP(total)}
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography fontWeight={600} sx={{ mb: 1 }}>
                Resumen de compra
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Válido hasta: {cotizacion.validoHasta}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Quedan {cotizacion.diasRestantes} días
              </Typography>

              <Button fullWidth variant="contained" onClick={handleAceptar} sx={{ textTransform: 'none', mb: 1 }}>
                Aceptar cotización
              </Button>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Una vez aceptada, se generará una orden de compra
              </Typography>

              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={() => setConfirmOpen(true)}
                sx={{ textTransform: 'none' }}
              >
                Cancelar cotización
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>¿Cancelar esta cotización?</DialogTitle>
        <DialogContent>
          <DialogContentText>Esta acción no se puede deshacer.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} sx={{ textTransform: 'none' }}>
            Volver
          </Button>
          <Button onClick={handleCancelar} color="error" variant="contained" sx={{ textTransform: 'none' }}>
            Sí, cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
