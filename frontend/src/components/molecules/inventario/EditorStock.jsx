import { FormHelperText, IconButton, Stack, TextField } from '@mui/material';

const botonSx = { width: 32, height: 32, fontSize: 18 };

export default function EditorStock({
  idCampo,
  nombre,
  valor,
  error,
  puedeBajar,
  puedeSubir,
  deshabilitado = false,
  onCambiar,
  onMenos,
  onMas,
}) {
  const idError = `${idCampo}-error`;

  return (
    <Stack spacing={0.5}>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
        <IconButton
          size="small"
          aria-label={`Disminuir stock de ${nombre}`}
          disabled={deshabilitado || !puedeBajar}
          onClick={onMenos}
          sx={botonSx}
        >
          −
        </IconButton>

        <TextField
          id={idCampo}
          size="small"
          value={valor}
          onChange={(e) => onCambiar(e.target.value)}
          error={Boolean(error)}
          disabled={deshabilitado}
          slotProps={{
            htmlInput: {
              inputMode: 'numeric',
              'aria-label': `Stock de ${nombre}`,
              'aria-describedby': error ? idError : undefined,
            },
          }}
          sx={{ width: 84, '& input': { textAlign: 'center', px: 0.5 } }}
        />

        <IconButton
          size="small"
          aria-label={`Aumentar stock de ${nombre}`}
          disabled={deshabilitado || !puedeSubir}
          onClick={onMas}
          sx={botonSx}
        >
          +
        </IconButton>
      </Stack>

      {error && (
        <FormHelperText error id={idError} sx={{ mx: 0, maxWidth: 220 }}>
          {error}
        </FormHelperText>
      )}
    </Stack>
  );
}