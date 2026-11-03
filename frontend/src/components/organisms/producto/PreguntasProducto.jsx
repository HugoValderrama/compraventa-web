import { useState } from 'react';
import { Alert, Button, CircularProgress, Divider, Stack, TextField, Typography } from '@mui/material';
import { formatearFecha } from '../../../utils/formatos';

const MAX_PREGUNTA = 100;

// modo: 'formulario' (cliente) | 'login' (visitante) | 'ninguno'
export default function PreguntasProducto({ preguntas, cargando, fallo, onReintentar, modo, onEnviar, onLogin }) {
  const [texto, setTexto] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    const limpio = texto.trim();
    if (!limpio) {
      setError('Escribe tu pregunta.');
      return;
    }
    if (limpio.length > MAX_PREGUNTA) {
      setError(`La pregunta puede tener hasta ${MAX_PREGUNTA} caracteres.`);
      return;
    }

    setEnviando(true);
    try {
      await onEnviar(limpio);
      setTexto('');
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudo enviar la pregunta. Inténtalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Stack spacing={2}>
      {modo === 'formulario' && (
        <Stack component="form" noValidate onSubmit={enviar} spacing={1}>
          <TextField
            label="Haz una pregunta al vendedor"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setError('');
            }}
            error={Boolean(error)}
            helperText={error || `${texto.length}/${MAX_PREGUNTA}`}
            slotProps={{ htmlInput: { maxLength: MAX_PREGUNTA } }}
            multiline
            minRows={2}
            fullWidth
          />
          <Button type="submit" variant="contained" disabled={enviando} sx={{ alignSelf: 'flex-end' }}>
            {enviando ? 'Enviando…' : 'Preguntar'}
          </Button>
        </Stack>
      )}

      {modo === 'login' && (
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={onLogin}>
              Iniciar sesión
            </Button>
          }
        >
          Inicia sesión como cliente para hacer una pregunta.
        </Alert>
      )}

      <Divider />

      {cargando && <CircularProgress size={24} aria-label="Cargando preguntas" />}

      {!cargando && fallo && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={onReintentar}>
              Reintentar
            </Button>
          }
        >
          No pudimos cargar las preguntas.
        </Alert>
      )}

      {!cargando && !fallo && preguntas.length === 0 && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Aún no hay preguntas sobre este producto.
        </Typography>
      )}

      {!cargando &&
        !fallo &&
        preguntas.map((p) => (
          <Stack key={p.id} spacing={0.5}>
            <Typography sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{p.texto}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {p.autor} · {formatearFecha(p.fecha)}
            </Typography>
            {p.respuesta ? (
              <Typography
                variant="body2"
                sx={{ pl: 2, borderLeft: '3px solid', borderColor: 'primary.main', overflowWrap: 'anywhere' }}
              >
                {p.respuesta}
              </Typography>
            ) : (
              <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                Sin respuesta aún
              </Typography>
            )}
          </Stack>
        ))}
    </Stack>
  );
}