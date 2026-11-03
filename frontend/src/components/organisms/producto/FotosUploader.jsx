import { useRef, useState } from 'react';
import { Box, Button, Chip, IconButton, Typography } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { MAX_FOTOS, nuevoId, validarArchivoFoto } from '../../../utils/formularioProducto';

export default function FotosUploader({ fotos, onChange, disabled = false }) {
  const inputRef = useRef(null);
  const [rechazos, setRechazos] = useState([]);

  const agregar = (e) => {
    const archivos = Array.from(e.target.files ?? []);
    e.target.value = ''; // permite volver a elegir el mismo archivo

    const aceptadas = [];
    const nuevosRechazos = [];
    archivos.forEach((archivo) => {
      const mensaje = validarArchivoFoto(archivo, fotos.length + aceptadas.length);
      if (mensaje) {
        nuevosRechazos.push(mensaje);
      } else {
        // TODO: conectar API (subir el archivo; hoy se usa una URL local)
        aceptadas.push({ id: nuevoId('f'), url: URL.createObjectURL(archivo), archivo });
      }
    });

    setRechazos(nuevosRechazos);
    if (aceptadas.length) onChange([...fotos, ...aceptadas]);
  };

  const quitar = (foto) => {
    if (foto.archivo) URL.revokeObjectURL(foto.url);
    setRechazos([]);
    onChange(fotos.filter((f) => f.id !== foto.id));
  };

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        hidden
        onChange={agregar}
      />

      <Button
        variant="outlined"
        disabled={disabled || fotos.length >= MAX_FOTOS}
        onClick={() => inputRef.current?.click()}
      >
        Subir fotografías
      </Button>

      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
        JPG o PNG, máximo 5 MB cada una, hasta {MAX_FOTOS} ({fotos.length}/{MAX_FOTOS}). La primera
        es la foto principal.
      </Typography>

      {rechazos.map((mensaje) => (
        <Typography key={mensaje} variant="caption" sx={{ display: 'block', color: 'error.main' }}>
          {mensaje}
        </Typography>
      ))}

      {fotos.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
            gap: 2,
            mt: 2,
          }}
        >
          {fotos.map((foto, i) => (
            <Box key={foto.id} sx={{ position: 'relative' }}>
              <Box
                component="img"
                src={foto.url}
                alt={`Fotografía ${i + 1}`}
                sx={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  objectFit: 'cover',
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
              <IconButton
                size="small"
                aria-label={`Quitar fotografía ${i + 1}`}
                disabled={disabled}
                onClick={() => quitar(foto)}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  bgcolor: 'white',
                  '&:hover': { bgcolor: 'grey.200' },
                }}
              >
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
              {i === 0 && (
                <Chip
                  label="Principal"
                  size="small"
                  color="primary"
                  sx={{ position: 'absolute', bottom: 8, left: 8 }}
                />
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}