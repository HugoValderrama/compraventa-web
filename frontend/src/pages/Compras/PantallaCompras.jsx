import { Alert, Box, Button, CircularProgress, Container, Paper, Stack, Typography } from '@mui/material'
import TopNavBar from '../../components/organisms/TopNavBar'

export default function PantallaCompras({ onBack, children }) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#3026A6' }}>
      <TopNavBar showBack onBack={onBack} />

      <Container maxWidth="md" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  )
}

// Carga, error o compra inexistente
export function SinCompra({ cargando, error, onReintentar, onVolver }) {
  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress sx={{ color: 'white' }} aria-label="Cargando compra" />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={onReintentar}>
            Reintentar
          </Button>
        }
      >
        {error}
      </Alert>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="h6">Compra no encontrada</Typography>
        <Button variant="contained" onClick={onVolver}>
          Volver a mis compras
        </Button>
      </Stack>
    </Paper>
  )
}