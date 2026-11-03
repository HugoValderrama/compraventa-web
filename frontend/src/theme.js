import { createTheme } from '@mui/material/styles'

// Ajustar paleta y tipografía con los valores del prototipo de Figma
const theme = createTheme({
  palette: {
    mode: 'light',
  },
  typography: {
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
  },
})

export default theme
