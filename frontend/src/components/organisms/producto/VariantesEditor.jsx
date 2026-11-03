import { Button, IconButton, MenuItem, Stack, TextField, Tooltip } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { TIPOS_VARIANTE } from '../../../utils/formularioProducto';

export default function VariantesEditor({
  tipoSel,
  tipoOtro,
  variantes,
  errores,
  disabled = false,
  onTipoSel,
  onTipoOtro,
  onCambiar, // (idVariante, campo, valor)
  onAgregar,
  onQuitar, // (idVariante)
}) {
  const etiquetaCampo = tipoSel === 'Otro' ? tipoOtro.trim() || 'Variante' : tipoSel;
  const soloUna = variantes.length <= 1;

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          select
          label="Tipo de variante"
          value={tipoSel}
          onChange={(e) => onTipoSel(e.target.value)}
          disabled={disabled}
          fullWidth
        >
          {TIPOS_VARIANTE.map((tipo) => (
            <MenuItem key={tipo} value={tipo}>
              {tipo}
            </MenuItem>
          ))}
        </TextField>

        {tipoSel === 'Otro' && (
          <TextField
            label="Nombre del tipo"
            placeholder="Ej: Sabor"
            value={tipoOtro}
            onChange={(e) => onTipoOtro(e.target.value)}
            error={Boolean(errores.tipoOtro)}
            helperText={errores.tipoOtro}
            disabled={disabled}
            fullWidth
          />
        )}
      </Stack>

      {variantes.map((v) => {
        const ev = errores.variantes?.[v.id] ?? {};

        return (
          <Stack
            key={v.id}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { sm: 'flex-start' } }}
          >
            <TextField
              label={etiquetaCampo}
              value={v.etiqueta}
              onChange={(e) => onCambiar(v.id, 'etiqueta', e.target.value)}
              error={Boolean(ev.etiqueta)}
              helperText={ev.etiqueta || (soloUna ? 'Opcional con una sola variante' : undefined)}
              disabled={disabled}
              fullWidth
            />
            <TextField
              label="SKU"
              value={v.sku}
              onChange={(e) => onCambiar(v.id, 'sku', e.target.value)}
              error={Boolean(ev.sku)}
              helperText={ev.sku}
              disabled={disabled}
              fullWidth
            />
            <TextField
              label="Stock"
              type="number"
              value={v.stock}
              onChange={(e) => onCambiar(v.id, 'stock', e.target.value)}
              error={Boolean(ev.stock)}
              helperText={ev.stock}
              disabled={disabled}
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
              fullWidth
            />
            <Tooltip title={soloUna ? 'Debes mantener al menos una variante' : 'Quitar variante'}>
              <span>
                <IconButton
                  aria-label="Quitar variante"
                  disabled={disabled || soloUna}
                  onClick={() => onQuitar(v.id)}
                  sx={{ mt: { sm: 1 } }}
                >
                  <DeleteOutlinedIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        );
      })}

      <Button variant="outlined" onClick={onAgregar} disabled={disabled} sx={{ alignSelf: 'flex-start' }}>
        Agregar variante
      </Button>
    </Stack>
  );
}