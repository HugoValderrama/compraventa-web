import { useState } from 'react'
import { Alert, Button, MenuItem, Paper, Stack, TextField } from '@mui/material'
import {
  MODALIDADES,
  RESTRICCIONES_EDAD,
  UNIDADES_COBRO,
} from '../../mocks/servicios'

const FORM_VACIO = {
  nombre: '',
  categoria: '',
  descripcion: '',
  modalidad: 'Presencial',
  ubicacion: '',
  duracion: '',
  cupos: '',
  precio: '',
  unidadCobro: 'persona',
  restriccionEdad: 'Todas las edades',
}

// Convierte un servicio del modelo en valores de texto para el formulario.
const aFormulario = (s = {}) => ({
  ...FORM_VACIO,
  nombre: s.nombre ?? '',
  categoria: s.categoria ?? '',
  descripcion: s.descripcion ?? '',
  modalidad: s.modalidad ?? FORM_VACIO.modalidad,
  ubicacion: s.ubicacion ?? '',
  duracion: s.duracion ?? '',
  cupos: s.cupos == null ? '' : String(s.cupos),
  precio: s.precio == null ? '' : String(s.precio),
  unidadCobro: s.unidadCobro ?? FORM_VACIO.unidadCobro,
  restriccionEdad: s.restriccionEdad ?? FORM_VACIO.restriccionEdad,
})

// Devuelve un objeto { campo: mensaje } con los errores encontrados.
function validar(f) {
  const errores = {}
  const nombre = f.nombre.trim()
  const precio = f.precio.trim() === '' ? NaN : Number(f.precio)

  if (!nombre) errores.nombre = 'El nombre es obligatorio.'
  else if (nombre.length > 80) {
    errores.nombre = 'El nombre puede tener hasta 80 caracteres.'
  }

  if (!f.categoria.trim()) errores.categoria = 'La categoría es obligatoria.'
  if (!f.descripcion.trim()) errores.descripcion = 'La descripción es obligatoria.'
  if (!f.ubicacion.trim()) errores.ubicacion = 'La ubicación es obligatoria.'

  if (!Number.isSafeInteger(precio) || precio < 1) {
    errores.precio = 'El precio debe ser un número entero mayor que cero.'
  }

  if (f.cupos.trim() !== '') {
    const cupos = Number(f.cupos)
    if (!Number.isSafeInteger(cupos) || cupos < 1) {
      errores.cupos = 'Los cupos deben ser un número entero mayor que cero.'
    }
  }

  return errores
}

// Convierte el formulario (todo texto) en los campos del modelo.
const normalizar = (f) => ({
  nombre: f.nombre.trim(),
  categoria: f.categoria.trim(),
  descripcion: f.descripcion.trim(),
  modalidad: f.modalidad,
  ubicacion: f.ubicacion.trim(),
  duracion: f.duracion.trim(),
  cupos: f.cupos.trim() === '' ? null : Number(f.cupos),
  precio: Number(f.precio),
  unidadCobro: f.unidadCobro,
  restriccionEdad: f.restriccionEdad,
})

export default function ServicioForm({ inicial, textoBoton, onGuardar, onCancelar }) {
  const [form, setForm] = useState(() => aFormulario(inicial))
  const [errores, setErrores] = useState({})
  const [errorEnvio, setErrorEnvio] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cambiar = (campo) => (e) => {
    setForm((actual) => ({ ...actual, [campo]: e.target.value }))
    setErrores((actual) => ({ ...actual, [campo]: undefined }))
  }

  const enviar = async (e) => {
    e.preventDefault()
    if (guardando) return

    const encontrados = validar(form)
    setErrores(encontrados)
    setErrorEnvio('')
    if (Object.keys(encontrados).length > 0) return

    setGuardando(true)
    try {
      await onGuardar(normalizar(form))
    } catch (err) {
      setErrorEnvio(err.message)
      setGuardando(false)
    }
  }

  const campo = (name, label, extra = {}) => (
    <TextField
      label={label}
      value={form[name]}
      onChange={cambiar(name)}
      error={Boolean(errores[name])}
      helperText={errores[name]}
      disabled={guardando}
      fullWidth
      {...extra}
    />
  )

  return (
    <Paper component="form" noValidate onSubmit={enviar} sx={{ p: 3 }}>
      <Stack spacing={2}>
        {campo('nombre', 'Nombre del servicio', {
          required: true,
          slotProps: { htmlInput: { maxLength: 80 } },
        })}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {campo('categoria', 'Categoría', { required: true })}
          {campo('modalidad', 'Modalidad', {
            select: true,
            children: MODALIDADES.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            )),
          })}
        </Stack>

        {campo('descripcion', 'Descripción corta', {
          required: true,
          helperText: errores.descripcion ?? 'Se muestra bajo el nombre de la tarjeta.',
          slotProps: { htmlInput: { maxLength: 500 } },
        })}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {campo('ubicacion', 'Ubicación', { required: true })}
          {campo('duracion', 'Duración (opcional)', {
            placeholder: '3 horas',
          })}
          {campo('cupos', 'Cupos (opcional)', { type: 'number' })}
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {campo('precio', 'Precio (CLP)', { required: true, type: 'number' })}
          {campo('unidadCobro', 'Tipo de cobro', {
            select: true,
            children: UNIDADES_COBRO.map((u) => (
              <MenuItem key={u.valor} value={u.valor}>
                {u.etiqueta}
              </MenuItem>
            )),
          })}
        </Stack>

        {campo('restriccionEdad', 'Restricción de edad', {
          select: true,
          children: RESTRICCIONES_EDAD.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          )),
        })}

        {errorEnvio && <Alert severity="error">{errorEnvio}</Alert>}

        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={onCancelar} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={guardando}>
            {guardando ? 'Guardando…' : textoBoton}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}