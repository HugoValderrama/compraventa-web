import { useNavigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import TopNavBar from '../../components/organisms/TopNavBar';

export default function Pantalla({ children, volver = false, destino = '/productos' }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#3026A6' }}>
      <TopNavBar showBack={volver} onBack={() => navigate(destino)} />
      <Container maxWidth="md" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  );
}