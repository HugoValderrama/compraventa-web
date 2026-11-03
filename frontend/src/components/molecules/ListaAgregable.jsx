import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Tooltip,
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

export default function ListaAgregable({
  items,
  etiquetaCampo,
  placeholder,
  tipoInput = 'text',
  validar, // (valorNormalizado, items) => '' | mensaje
  normalizar = (v) => v.trim(),
  formatear = (v) => v,
  onAgregar, // async (valorNormalizado) => boolean
  onQuitar, // async (item) => boolean
  ocupado = false,
}) {
  const [valor, setValor] = useState('');
  const [error, setError] = useState('');

  const agregar = async (e) => {
    e.preventDefault();
    const normal = normalizar(valor);
    const mensaje = validar(normal, items);
    if (mensaje) {
      setError(mensaje);
      return;
    }
    const ok = await onAgregar(normal);
    if (ok) {
      setValor('');
      setError('');
    }
  };

  const soloUno = items.length <= 1;

  return (
    <Box>
      <List dense disablePadding>
        {items.map((item, i) => (
          <ListItem
            key={item}
            divider
            secondaryAction={
              <Tooltip title={soloUno ? 'Debes mantener al menos uno' : 'Quitar'}>
                <span>
                  <IconButton
                    edge="end"
                    aria-label={`Quitar ${formatear(item)}`}
                    disabled={soloUno || ocupado}
                    onClick={() => onQuitar(item)}
                  >
                    <DeleteOutlinedIcon />
                  </IconButton>
                </span>
              </Tooltip>
            }
          >
            <ListItemText primary={formatear(item)} sx={{ overflowWrap: 'anywhere', pr: 4 }} />
            {i === 0 && <Chip label="Principal" size="small" color="primary" sx={{ mr: 4 }} />}
          </ListItem>
        ))}
      </List>

      <Box
        component="form"
        onSubmit={agregar}
        noValidate
        sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'flex-start' }}
      >
        <TextField
          label={etiquetaCampo}
          placeholder={placeholder}
          type={tipoInput}
          value={valor}
          onChange={(e) => {
            setValor(e.target.value);
            setError('');
          }}
          error={Boolean(error)}
          helperText={error}
          size="small"
          fullWidth
          disabled={ocupado}
        />
        <Button type="submit" variant="contained" disabled={ocupado} sx={{ whiteSpace: 'nowrap' }}>
          Agregar
        </Button>
      </Box>
    </Box>
  );
}