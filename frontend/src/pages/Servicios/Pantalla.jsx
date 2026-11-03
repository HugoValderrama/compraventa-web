import { Box, Container } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import TopNavBar from '../../components/organisms/TopNavBar'
import { FONDO } from '../../constants/colores'

export default function Pantalla({ children, volver = false, destino = '/servicios' }) {
  const navigate = useNavigate()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: FONDO }}>
      <TopNavBar showBack={volver} onBack={() => navigate(destino)} />
      <Container maxWidth="md" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  )
}