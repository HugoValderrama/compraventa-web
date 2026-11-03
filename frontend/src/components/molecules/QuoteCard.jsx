import React from 'react';
import { Card, CardContent, Box, Avatar, Typography, Chip, Button, Stack } from '@mui/material';

export default function QuoteCard({ cotizacion, onVerDetalle }) {
  const { id, productoNombre, fecha, precio, oferta, vendedor, costoEnvio, imagenLabel } = cotizacion;

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Avatar
          variant="rounded"
          sx={{ width: 56, height: 56, bgcolor: 'grey.300', color: 'grey.700', fontSize: 11 }}
        >
          {imagenLabel}
        </Avatar>

        <Box sx={{ flexGrow: 1, minWidth: 160 }}>
          <Typography fontWeight={600}>{productoNombre}</Typography>
          <Typography variant="body2" color="text.secondary">
            {fecha}
          </Typography>
        </Box>

        <Stack spacing={0.5} sx={{ minWidth: 140 }}>
          <Typography variant="body2">{precio}</Typography>
          {oferta && (
            <Chip label={oferta} size="small" color="warning" variant="outlined" sx={{ width: 'fit-content' }} />
          )}
          <Typography variant="caption" color="text.secondary">
            {vendedor}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {costoEnvio}
          </Typography>
        </Stack>

        <Button
          variant="contained"
          onClick={() => onVerDetalle(id)}
          sx={{ textTransform: 'none', whiteSpace: 'nowrap', borderRadius: 999 }}
        >
          Ver Detalle
        </Button>
      </CardContent>
    </Card>
  );
}
