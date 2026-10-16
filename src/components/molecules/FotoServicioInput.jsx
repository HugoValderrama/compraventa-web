import { useRef, useState } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined'

const MAX_BYTES = 2 * 1024 * 1024

export default function FotoServicioInput({ valor, onChange, disabled = false }) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')

  const elegir = (e) => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return

    if (!archivo.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen (JPG, PNG o WebP).')
      return
    }
    if (archivo.size > MAX_BYTES) {
      setError('La imagen no puede pesar más de 2 MB.')
      return
    }

    // TODO: conectar API (subir la imagen y guardar su URL en vez de un data URL)
    const lector = new FileReader()
    lector.onload = () => {
      setError('')
      onChange(String(lector.result))
    }
    lector.onerror = () => setError('No se pudo leer la imagen. Prueba con otra.')
    lector.readAsDataURL(archivo)
  }

  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={elegir}
      />

      {valor && (
        <Box
          component="img"
          src={valor}
          alt="Foto del servicio"
          sx={{ width: 96, height: 96, borderRadius: 2, objectFit: 'cover' }}
        />
      )}

      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          startIcon={<AddPhotoAlternateOutlinedIcon />}
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {valor ? 'Cambiar foto' : 'Agregar foto del servicio'}
        </Button>

        {valor && (
          <Button color="error" disabled={disabled} onClick={() => onChange('')}>
            Quitar foto
          </Button>
        )}
      </Stack>

      {error && (
        <Typography variant="caption" role="alert" sx={{ color: 'error.main' }}>
          {error}
        </Typography>
      )}
    </Stack>
  )
}