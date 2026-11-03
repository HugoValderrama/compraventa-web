import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { PERIODOS } from '../../../utils/dashboard';

export default function SelectorPeriodo({ valor, onChange }) {
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={valor}
      onChange={(_, nuevo) => nuevo && onChange(nuevo)}
      aria-label="Periodo del resumen"
      sx={{ bgcolor: 'background.paper', alignSelf: { xs: 'flex-start', sm: 'auto' } }}
    >
      {PERIODOS.map(({ valor: opcion, texto }) => (
        <ToggleButton key={opcion} value={opcion} sx={{ textTransform: 'none', px: 2 }}>
          {texto}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}