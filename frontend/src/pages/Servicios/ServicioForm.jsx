import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import EncabezadoPagina from '../../components/molecules/EncabezadoPagina'
import FotoServicioInput from '../../components/molecules/FotoServicioInput'
import Pantalla from './Pantalla'
import {
  actualizarServicio,
  CATEGORIAS,
  crearServicio,
  MODALIDADES,
  obtenerServicio,
  RESTRICCIONES_EDAD,
  UNIDADES_COBRO,
} from '../../mocks/servicios'
import { pesos } from '../../utils/formatos'

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

const FORM_VACIO = {
  nombre: '',
  categoria: '',
  modalidad: '',
  descripcion: '',
  precio: '',
  unidadCobro: '',
  condiciones: '',
  ubicacion: '',
  duracion: '',
  cupos: '',
  diasHorario: '',
  proximaFecha: '',
  permiteCotizacion: false,
  restriccionEdad: 'Ninguna',
  foto: '',
}

// Convierte un servicio del modelo en valores de texto para el formulario.
const aFormulario = (s) => ({
  ...FORM_VACIO,
  ...Object.fromEntries(
    Object.keys(FORM_VACIO)
      .filter((clave) => s[clave] != null)
      .map((clave) => [clave, s[clave]])
  ),
  precio: s.precio == null ? '' : String(s.precio),
  cupos: s.cupos == null ? '' : String(s.cupos),
})

// La foto es un data URL enorme: en el log solo se indica si hay imagen.
const resumenParaLog = (datos) => ({
  ...datos,
  foto: datos.foto ? '[imagen adjunta]' : '',
})

const entero = (texto) =>
  String(texto).trim() === '' ? NaN : Number(texto)

// Devuelve { campo: mensaje } con los errores encontrados.
function validar(f) {
  const errores = {}
  const nombre = f.nombre.trim()
  const precio = entero(f.precio)
  const cupos = entero(f.cupos)

  if (!nombre) errores.nombre = 'El nombre es obligatorio.'
  else if (nombre.length > 80) {
    errores.nombre = 'El nombre puede tener hasta 80 caracteres.'
  }

  if (!f.categoria) errores.categoria = 'Elige una categoría.'
  if (!f.modalidad) errores.modalidad = 'Elige una modalidad.'
  if (!f.descripcion.trim()) {
    errores.descripcion = 'La descripción y el alcance son obligatorios.'
  }

  if (!Number.isSafeInteger(precio) || precio < 1) {
    errores.precio = 'El precio debe ser un número entero mayor que cero.'
  }
  if (!f.unidadCobro) errores.unidadCobro = 'Elige una unidad de cobro.'
  if (!f.condiciones.trim()) {
    errores.condiciones = 'Indica las condiciones y la cancelación.'
  }

  if (!f.ubicacion.trim()) errores.ubicacion = 'El lugar de atención es obligatorio.'
  if (!f.duracion.trim()) errores.duracion = 'La duración es obligatoria.'
  if (!Number.isSafeInteger(cupos) || cupos < 1) {
    errores.cupos = 'Los cupos deben ser un número entero mayor que cero.'
  }
  if (!f.diasHorario.trim()) errores.diasHorario = 'Indica los días y el horario.'

  if (f.proximaFecha && Number.isNaN(new Date(f.proximaFecha).getTime())) {
    errores.proximaFecha = 'Elige una fecha válida.'
  }

  if (!f.restriccionEdad) errores.restriccionEdad = 'Elige una restricción de edad.'

  return errores
}

// Convierte el formulario (texto) en los campos del modelo.
const normalizar = (f) => ({
  nombre: f.nombre.trim(),
  categoria: f.categoria,
  descripcion: f.descripcion.trim(),
  modalidad: f.modalidad,
  ubicacion: f.ubicacion.trim(),
  duracion: f.duracion.trim(),
  cupos: Number(f.cupos),
  precio: Number(f.precio),
  unidadCobro: f.unidadCobro,
  restriccionEdad: f.restriccionEdad,
  diasHorario: f.diasHorario.trim(),
  proximaFecha: f.proximaFecha.trim(),
  permiteCotizacion: f.permiteCotizacion,
  foto: f.foto,
  condiciones: f.condiciones.trim(),
})

/* ------------------------------------------------------------------ */
/* Formulario (crear y editar)                                         */
/* ------------------------------------------------------------------ */

function Formulario({ id, inicial }) {
  const navigate = useNavigate()
  const editando = Boolean(id)

  const [form, setForm] = useState(() => aFormulario(inicial ?? {}))
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

    if (Object.keys(encontrados).length > 0) {
      console.log('[Servicios] Formulario con errores en:', Object.keys(encontrados))
      setErrorEnvio('Revisa los campos marcados en rojo antes de publicar.')
      return
    }

    setErrorEnvio('')
    setGuardando(true)

    try {
      const datos = normalizar(form)
      console.log(
        `[Servicios] ${editando ? 'Actualizando' : 'Creando'} servicio`,
        resumenParaLog(datos)
      )

      const guardado = editando
        ? await actualizarServicio(id, datos)
        : await crearServicio(datos)
      console.log('[Servicios] Servicio guardado', {
        id: guardado.id,
        modo: editando ? 'editar' : 'crear',
      })

      navigate('/servicios', {
        replace: true,
        state: {
          mensaje: editando
            ? 'Cambios guardados y servicio publicado.'
            : 'Servicio publicado correctamente.',
        },
      })
    } catch (err) {
      console.log('[Servicios] Error al guardar el servicio:', err.message)
      setErrorEnvio(err.message)
      setGuardando(false)
    }
  }

  const cancelar = () => {
    console.log('[Servicios] Formulario cancelado')
    navigate('/servicios')
  }

  const campo = (name, label, extra = {}) => (
    <TextField
      label={label}
      value={form[name]}
      onChange={cambiar(name)}
      error={Boolean(errores[name])}
      helperText={errores[name]}
      disabled={guardando}
      required
      fullWidth
      {...extra}
    />
  )

  const lista = (name, label, opciones) =>
    campo(name, label, {
      select: true,
      children: opciones.map(({ valor, etiqueta }) => (
        <MenuItem key={valor} value={valor}>
          {etiqueta}
        </MenuItem>
      )),
    })

  const comoOpciones = (textos) =>
    textos.map((t) => ({ valor: t, etiqueta: t }))

  const precio = entero(form.precio)

  return (
    <Paper component="form" noValidate onSubmit={enviar} sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        <Stack spacing={2}>
          {campo('nombre', 'Nombre del servicio', {
            slotProps: { htmlInput: { maxLength: 80 } },
          })}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {lista('categoria', 'Categoría', comoOpciones(CATEGORIAS))}
            {lista('modalidad', 'Modalidad', comoOpciones(MODALIDADES))}
          </Stack>

          {campo('descripcion', 'Descripción y alcance', {
            multiline: true,
            minRows: 3,
            slotProps: { htmlInput: { maxLength: 500 } },
          })}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {campo('precio', 'Precio (CLP)', {
              type: 'number',
              slotProps: { htmlInput: { min: 1 } },
              helperText:
                errores.precio ??
                (Number.isSafeInteger(precio) && precio > 0
                  ? pesos(precio)
                  : undefined),
            })}
            {lista('unidadCobro', 'Unidad de cobro', UNIDADES_COBRO.map((u) => ({
              valor: u.valor,
              etiqueta: u.etiqueta,
            })))}
          </Stack>

          {campo('condiciones', 'Condiciones y cancelación', {
            multiline: true,
            minRows: 2,
            slotProps: { htmlInput: { maxLength: 300 } },
          })}
        </Stack>

        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Agenda y ubicación
          </Typography>

          {campo('ubicacion', 'Lugar de atención')}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {campo('duracion', 'Duración', { placeholder: '2 horas' })}
            {campo('cupos', 'Cupos', {
              type: 'number',
              slotProps: { htmlInput: { min: 1 } },
            })}
          </Stack>

          {campo('diasHorario', 'Días y horario', {
            placeholder: 'Sábados · 10:00 a 12:00',
          })}

          {campo('proximaFecha', 'Próxima fecha disponible', {
            required: false,
            type: 'date',
            slotProps: { inputLabel: { shrink: true } },
            helperText: errores.proximaFecha ?? 'Opcional.',
          })}

          {lista(
            'restriccionEdad',
            'Restricción de edad',
            comoOpciones(RESTRICCIONES_EDAD)
          )}

          <FormControlLabel
            control={
              <Checkbox
                checked={form.permiteCotizacion}
                disabled={guardando}
                onChange={(e) =>
                  setForm((actual) => ({
                    ...actual,
                    permiteCotizacion: e.target.checked,
                  }))
                }
              />
            }
            label="Permitir solicitudes de cotización"
          />

          <FotoServicioInput
            valor={form.foto}
            disabled={guardando}
            onChange={(foto) => setForm((actual) => ({ ...actual, foto }))}
          />
        </Stack>
      </Box>

      <Divider sx={{ my: 3 }} />

      {errorEnvio && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorEnvio}
        </Alert>
      )}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          * Campos obligatorios · Revisa los cupos antes de publicar
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            disabled={guardando}
            onClick={cancelar}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar y publicar'}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}

/* ------------------------------------------------------------------ */
/* Pantalla: decide entre crear y editar según la ruta                 */
/* ------------------------------------------------------------------ */

function Contenido({ id }) {
  const navigate = useNavigate()
  const editando = Boolean(id)
  const [carga, setCarga] = useState({
    cargando: editando,
    servicio: null,
    error: '',
  })

  useEffect(() => {
    if (!id) return undefined
    let vigente = true

    obtenerServicio(id)
      .then((servicio) => {
        if (vigente) setCarga({ cargando: false, servicio, error: '' })
      })
      .catch((err) => {
        if (vigente) {
          setCarga({ cargando: false, servicio: null, error: err.message })
        }
      })

    return () => {
      vigente = false
    }
  }, [id])

  const etiqueta = editando
    ? carga.servicio
      ? `Editando · ${carga.servicio.estado.toLowerCase()}`
      : 'Editando'
    : 'Nuevo servicio'

  return (
    <Pantalla volver>
      <EncabezadoPagina
        titulo={editando ? 'Editar servicio' : 'Crear servicio'}
        accion={<Chip label={etiqueta} color="primary" size="small" />}
      />

      {carga.cargando && (
        <Stack spacing={2} role="status" sx={{ alignItems: 'center', py: 6 }}>
          <CircularProgress sx={{ color: 'white' }} />
          <Typography sx={{ color: 'white' }}>Cargando servicio…</Typography>
        </Stack>
      )}

      {carga.error && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/servicios')}>
              Volver a mis servicios
            </Button>
          }
        >
          {carga.error}
        </Alert>
      )}

      {!carga.cargando && !carga.error && (
        <Formulario id={id} inicial={carga.servicio} />
      )}
    </Pantalla>
  )
}

export default function ServicioForm() {
  const { id } = useParams()
  return <Contenido key={id ?? 'nuevo'} id={id} />
}
