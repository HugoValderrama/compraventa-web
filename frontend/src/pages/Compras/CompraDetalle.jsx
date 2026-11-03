import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Avatar, Box, Button, Divider, Paper, Snackbar, Stack, Typography } from '@mui/material'
import EstadoChip from '../../components/atoms/EstadoChip'
import FilaDato from '../../components/molecules/FilaDato'
import { ESTADOS_COMPRA } from '../../mocks/compras'
import { formatearFecha, pesos } from '../../utils/formatos'
import PantallaCompras, { SinCompra } from './PantallaCompras'
import useCompra from './useCompra'

export default function CompraDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { compra, cargando, error, reintentar } = useCompra(id)
  const [aviso, setAviso] = useState('')

  const volver = () => navigate('/compras')

  return (
    <PantallaCompras onBack={volver}>
      {!compra ? (
        <SinCompra
          cargando={cargando}
          error={error}
          onReintentar={reintentar}
          onVolver={volver}
        />
      ) : (
        <>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack
              direction="row"
              spacing={2}
              sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}
            >
              <Box>
                <Typography variant="h6">
                  Compra #{compra.id} · {formatearFecha(compra.fecha)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vendido por {compra.vendedor}
                </Typography>
              </Box>
              <EstadoChip estado={compra.estado} />
            </Stack>
          </Paper>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 7fr) minmax(0, 5fr)' },
              alignItems: 'start',
            }}
          >
            <Stack spacing={2}>
              {compra.items.map((item) => (
                <Paper key={item.id} sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2}>
                    <Avatar
                      variant="rounded"
                      src={item.imagen || undefined}
                      alt={item.nombre}
                      sx={{ width: 80, height: 80 }}
                    >
                      {item.nombre[0]}
                    </Avatar>

                    <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
                        {item.nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.variante}
                      </Typography>
                      <Typography variant="body2">
                        Cantidad: {item.cantidad} · Precio unitario: {pesos(item.precioUnitario)}
                      </Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        Precio total: {pesos(item.cantidad * item.precioUnitario)}
                      </Typography>

                      {compra.estado === ESTADOS_COMPRA.ENTREGADO && (
                        
<Button
  variant="contained"
  sx={{ alignSelf: "flex-end" }}
  onClick={() => {
    console.log("[Compras] Calificar producto (pendiente):", {
      compraId: compra.id,
      itemId: item.id,
    });

    setAviso("Próximamente");
  }}
>
  Calificar
</Button>

                      )}
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>

            <Paper sx={{ p: 3 }}>
              <Stack spacing={1.5}>
                <Typography variant="h6">Resumen de compra</Typography>

                <FilaDato etiqueta="Valor neto" valor={pesos(compra.valorNeto)} />
                <FilaDato etiqueta="IVA (19%)" valor={pesos(compra.iva)} />
                <FilaDato etiqueta="Envío" valor={pesos(compra.envio)} />
                <Divider />
                <FilaDato etiqueta="Total" valor={pesos(compra.total)} destacado />
                <Divider />
                <FilaDato etiqueta="Medio de pago" valor={compra.medioPago} />
                <FilaDato
                  etiqueta="Despacho"
                  valor={
                    <>
                      {compra.direccionEntrega.nombre}
                      <br />
                      {compra.direccionEntrega.telefono}
                      <br />
                      {compra.direccionEntrega.direccion}
                    </>
                  }
                />

                <Button
                  variant="contained"
                  onClick={() => navigate(`/compras/${compra.id}/seguimiento`)}
                >
                  Ver seguimiento
                </Button>
              </Stack>
            </Paper>
          </Box>
        </>
      )}

      <Snackbar
        open={Boolean(aviso)}
        autoHideDuration={3000}
        onClose={() => setAviso('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" variant="filled" onClose={() => setAviso('')}>
          {aviso}
        </Alert>
      </Snackbar>
    </PantallaCompras>
  )
}