
import { useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';

import { validarRun } from '../../utils/validarRun.js';
import RegisterField from '../../components/molecules/RegisterField/RegisterField';

// Datos de prueba
const usuariosIniciales = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    run: '12345678-9',
    correo: 'juan@gmail.com',
    tipo: 'Cliente',
  },
  {
    id: 2,
    nombre: 'María González',
    run: '98765432-1',
    correo: 'maria@gmail.com',
    tipo: 'Emprendedor',
  },
  {
    id: 3,
    nombre: 'Pedro Soto',
    run: '11222333-4',
    correo: 'pedro@gmail.com',
    tipo: 'Cliente',
  },
];

const formularioInicial = {
  nombre: '',
  run: '',
  correo: '',
  tipo: 'Cliente',
};

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState(usuariosIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('Todos');

  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [dialogoEliminar, setDialogoEliminar] = useState(false);

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modo, setModo] = useState('crear');

  const [formulario, setFormulario] = useState(formularioInicial);
  const [mensaje, setMensaje] = useState('');

  // Validación del RUN
  const runValido = validarRun(formulario.run);
  const runCompleto = formulario.run.length === 10;

  // Contadores
  const totalClientes = usuarios.filter(
    (usuario) => usuario.tipo === 'Cliente'
  ).length;

  const totalEmprendedores = usuarios.filter(
    (usuario) => usuario.tipo === 'Emprendedor'
  ).length;

  // Buscador y filtros
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((usuario) => {
      const coincideFiltro =
        filtro === 'Todos' || usuario.tipo === filtro;

      const texto = busqueda.toLowerCase();

      const coincideBusqueda =
        usuario.nombre.toLowerCase().includes(texto) ||
        usuario.run.toLowerCase().includes(texto) ||
        usuario.correo.toLowerCase().includes(texto);

      return coincideFiltro && coincideBusqueda;
    });
  }, [usuarios, filtro, busqueda]);

  // Abrir formulario
  const abrirCrear = () => {
    setModo('crear');
    setFormulario(formularioInicial);
    setUsuarioSeleccionado(null);
    setDialogoAbierto(true);
  };

  const abrirEditar = (usuario) => {
    setModo('editar');
    setUsuarioSeleccionado(usuario);

    setFormulario({
      nombre: usuario.nombre,
      run: usuario.run,
      correo: usuario.correo,
      tipo: usuario.tipo,
    });

    setDialogoAbierto(true);
  };

  const abrirVer = (usuario) => {
    setModo('ver');
    setUsuarioSeleccionado(usuario);

    setFormulario({
      nombre: usuario.nombre,
      run: usuario.run,
      correo: usuario.correo,
      tipo: usuario.tipo,
    });

    setDialogoAbierto(true);
  };

  // Cambios del formulario
  const manejarCambio = (evento) => {
    const { name, value } = evento.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));
  };

  // Crear o actualizar usuario
  const guardarUsuario = (evento) => {
    evento.preventDefault();

    if (!validarRun(formulario.run)) {
      setMensaje('El RUN ingresado no es válido.');
      return;
    }

    if (modo === 'crear') {
      const nuevoUsuario = {
        id: Date.now(),
        ...formulario,
      };

      setUsuarios((actuales) => [...actuales, nuevoUsuario]);
      setMensaje('Usuario creado correctamente.');
    } else {
      setUsuarios((actuales) =>
        actuales.map((usuario) =>
          usuario.id === usuarioSeleccionado.id
            ? { ...usuario, ...formulario }
            : usuario
        )
      );

      setMensaje('Usuario actualizado correctamente.');
    }

    setDialogoAbierto(false);
  };

  // Eliminar usuario
  const eliminarUsuario = () => {
    setUsuarios((actuales) =>
      actuales.filter(
        (usuario) => usuario.id !== usuarioSeleccionado.id
      )
    );

    setDialogoEliminar(false);
    setUsuarioSeleccionado(null);
    setMensaje('Usuario eliminado correctamente.');
  };

  return (
    <Box sx={{ width: '100%', pb: 4 }}>

      {/* Encabezado */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Gestión de Usuarios
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Administra los clientes y emprendedores de la plataforma.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={abrirCrear}
          sx={{
            backgroundColor: '#3026A6',
            '&:hover': { backgroundColor: '#241d82' },
          }}
        >
          Crear usuario
        </Button>
      </Stack>

      {/* Mensajes */}
      {mensaje && (
        <Alert
          severity={
            mensaje.includes('no es válido') ? 'error' : 'success'
          }
          sx={{ mb: 2 }}
          onClose={() => setMensaje('')}
        >
          {mensaje}
        </Alert>
      )}

      {/* Resumen */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Paper sx={{ p: 2.5, borderRadius: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <PeopleIcon sx={{ fontSize: 38, color: '#3026A6' }} />

            <Box>
              <Typography color="text.secondary" variant="body2">
                Total de usuarios
              </Typography>

              <Typography variant="h4" fontWeight={700}>
                {usuarios.length}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography color="text.secondary" variant="body2">
            Clientes
          </Typography>

          <Typography variant="h4" fontWeight={700} color="#3026A6">
            {totalClientes}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography color="text.secondary" variant="body2">
            Emprendedores
          </Typography>

          <Typography variant="h4" fontWeight={700} color="#3026A6">
            {totalEmprendedores}
          </Typography>
        </Paper>
      </Box>

      {/* Tabla de usuarios */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Usuarios registrados
          </Typography>

          <TextField
            fullWidth
            placeholder="Buscar por nombre, RUN o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              ),
            }}
          />
        </Box>

        <Tabs
          value={filtro}
          onChange={(_, valor) => setFiltro(valor)}
          sx={{
            px: 2,
            '& .MuiTabs-indicator': {
              backgroundColor: '#3026A6',
            },
          }}
        >
          <Tab label="Todos" value="Todos" />
          <Tab label="Clientes" value="Cliente" />
          <Tab label="Emprendedores" value="Emprendedor" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                <TableCell><strong>Nombre</strong></TableCell>
                <TableCell><strong>RUN</strong></TableCell>
                <TableCell><strong>Correo electrónico</strong></TableCell>
                <TableCell><strong>Tipo de usuario</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {usuariosFiltrados.map((usuario) => (
                <TableRow key={usuario.id} hover>
                  <TableCell>{usuario.nombre}</TableCell>
                  <TableCell>{usuario.run}</TableCell>
                  <TableCell>{usuario.correo}</TableCell>

                  <TableCell>
                    <Chip
                      label={usuario.tipo}
                      color={
                        usuario.tipo === 'Cliente' ? 'info' : 'success'
                      }
                      size="small"
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Stack
                      direction="row"
                      justifyContent="center"
                      spacing={0.5}
                    >
                      <IconButton
                        color="primary"
                        onClick={() => abrirVer(usuario)}
                        title="Ver usuario"
                      >
                        <VisibilityOutlinedIcon />
                      </IconButton>

                      <IconButton
                        color="primary"
                        onClick={() => abrirEditar(usuario)}
                        title="Editar usuario"
                      >
                        <EditOutlinedIcon />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() => {
                          setUsuarioSeleccionado(usuario);
                          setDialogoEliminar(true);
                        }}
                        title="Eliminar usuario"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

              {usuariosFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    No se encontraron usuarios.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios.
          </Typography>
        </Box>
      </Paper>

      {/* Diálogo crear, ver y editar */}
      <Dialog
        open={dialogoAbierto}
        onClose={() => setDialogoAbierto(false)}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={guardarUsuario}>
          <DialogTitle>
            {modo === 'crear'
              ? 'Crear usuario'
              : modo === 'editar'
                ? 'Editar usuario'
                : 'Información del usuario'}
          </DialogTitle>

          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Nombre completo"
                name="nombre"
                value={formulario.nombre}
                onChange={manejarCambio}
                disabled={modo === 'ver'}
                required
              />

              {/* RUN: mismo componente que Crear Cuenta */}
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography
                    fontWeight="bold"
                    color="#808080"
                    fontSize="14px"
                  >
                    RUN
                  </Typography>

                  {runCompleto && (
                    <Typography
                      sx={{
                        color: runValido ? 'green' : '#FF0000',
                        fontSize: '13px',
                        fontWeight: 'bold',
                      }}
                    >
                      {runValido ? 'RUN válido ✓' : 'RUN inválido X'}
                    </Typography>
                  )}
                </Box>

                <RegisterField
                  value={formulario.run}
                  onChange={(valor) =>
                    setFormulario((actual) => ({
                      ...actual,
                      run: valor,
                    }))
                  }
                  isRun={true}
                  helperText="Ej: 12.345.678-9"
                  disabled={modo === 'ver'}
                />
              </Box>

              <TextField
                fullWidth
                type="email"
                label="Correo electrónico"
                name="correo"
                value={formulario.correo}
                onChange={manejarCambio}
                disabled={modo === 'ver'}
                required
              />

              <TextField
                select
                fullWidth
                label="Tipo de usuario"
                name="tipo"
                value={formulario.tipo}
                onChange={manejarCambio}
                disabled={modo === 'ver'}
                required
              >
                <MenuItem value="Cliente">Cliente</MenuItem>
                <MenuItem value="Emprendedor">Emprendedor</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogoAbierto(false)}>
              {modo === 'ver' ? 'Cerrar' : 'Cancelar'}
            </Button>

            {modo !== 'ver' && (
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: '#3026A6',
                  '&:hover': { backgroundColor: '#241d82' },
                }}
              >
                {modo === 'crear' ? 'Crear usuario' : 'Guardar cambios'}
              </Button>
            )}
          </DialogActions>
        </Box>
      </Dialog>

      {/* Confirmación de eliminación */}
      <Dialog
        open={dialogoEliminar}
        onClose={() => setDialogoEliminar(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Eliminar usuario</DialogTitle>

        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar a{' '}
            <strong>{usuarioSeleccionado?.nombre}</strong>?
          </Typography>

          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            Esta acción eliminará el usuario de la lista.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogoEliminar(false)}>
            Cancelar
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={eliminarUsuario}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
