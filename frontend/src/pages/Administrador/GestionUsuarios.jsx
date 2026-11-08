
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { useMemo, useState } from 'react';
import MenuAdmin from '../../components/molecules/MenuAdmin';
import { useAuth } from '../../context/AuthContext';

import logo from '../../assets/logo.png';
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
import PersonIcon from '@mui/icons-material/Person';
import StorefrontIcon from '@mui/icons-material/Storefront';

import { validarRun } from '../../utils/validarRun.js';
import RegisterField from '../../components/molecules/RegisterField/RegisterField';

const MORADO = '#3026A6';
const AZUL = '#0095FF';

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
  const navigate = useNavigate();
  const { cerrarSesion } = useAuth();

const [anclaPerfil, setAnclaPerfil] = useState(null);

const handleCerrarSesion = () => {
  setAnclaPerfil(null);
  cerrarSesion();
  navigate('/');
};

const irA = (destino) => {
  setAnclaPerfil(null);
  navigate(destino);
};
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [dialogoEliminar, setDialogoEliminar] = useState(false);

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modo, setModo] = useState('crear');

  const [formulario, setFormulario] = useState(formularioInicial);
  const [mensaje, setMensaje] = useState('');

  const runValido = validarRun(formulario.run);
  const runCompleto = formulario.run.length === 10;

  const totalClientes = usuarios.filter(
    (usuario) => usuario.tipo === 'Cliente'
  ).length;

  const totalEmprendedores = usuarios.filter(
    (usuario) => usuario.tipo === 'Emprendedor'
  ).length;

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

  const abrirCrear = () => {
    setModo('crear');
    setFormulario(formularioInicial);
    setUsuarioSeleccionado(null);
    setMensaje('');
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

    setMensaje('');
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

    setMensaje('');
    setDialogoAbierto(true);
  };

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));
  };

  const guardarUsuario = (evento) => {
    evento.preventDefault();

    const nombreLimpio = formulario.nombre.trim();

    if (!nombreLimpio) {
      setMensaje('El nombre no puede estar vacío.');
      return;
    }

    if (formulario.nombre !== formulario.nombre.trimStart()) {
      setMensaje('El nombre no puede comenzar con espacios.');
      return;
    }

    if (!validarRun(formulario.run)) {
      setMensaje('El RUN ingresado no es válido.');
      return;
    }

    if (modo === 'crear') {
      const nuevoUsuario = {
        id: Date.now(),
        ...formulario,
        nombre: nombreLimpio,
      };

      setUsuarios((actuales) => [...actuales, nuevoUsuario]);
      setMensaje('Usuario creado correctamente.');
    } else {
      setUsuarios((actuales) =>
        actuales.map((usuario) =>
          usuario.id === usuarioSeleccionado.id
            ? { ...usuario, ...formulario, nombre: nombreLimpio }
            : usuario
        )
      );

      setMensaje('Usuario actualizado correctamente.');
    }

    setDialogoAbierto(false);
  };

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

  const esError =
    mensaje.includes('no es válido') ||
    mensaje.includes('no puede estar vacío') ||
    mensaje.includes('no puede comenzar con espacios');

  const estiloTarjeta = {
    p: 2.5,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    boxShadow: '0 3px 12px rgba(0,0,0,0.08)',
  };

  const estiloBoton = {
    backgroundColor: AZUL,
    borderRadius: 2,
    px: 2.5,
    py: 1,
    fontWeight: 700,
    textTransform: 'none',
    '&:hover': {
      backgroundColor: '#0078D4',
    },
  };

  
return (
  <>
    {/* BARRA SUPERIOR BLANCA */}
    <Box
      sx={{
        width: '100%',
        height: 74,
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 3 },
        boxSizing: 'border-box',
      }}
    >
      {/* LOGO, FLECHA Y TÍTULO */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
      >
        <Box
          component="img"
          src={logo}
          alt="Logo Ulagito Libre"
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />

        <IconButton
          onClick={() => navigate(-1)}
          sx={{ color: '#111111' }}
        >
          <ArrowBackIcon sx={{ fontSize: 28 }} />
        </IconButton>

        <Typography
          sx={{
            color: '#111111',
            fontSize: { xs: 17, md: 23 },
            fontWeight: 700,
          }}
        >
          Gestión de Usuarios
        </Typography>
      </Stack>

      {/* MI PERFIL */}
      {/* MI PERFIL */}
<>
  <Button
    onClick={(e) => setAnclaPerfil(e.currentTarget)}
    startIcon={<AccountCircleOutlinedIcon />}
    sx={{
      color: '#111111',
      textTransform: 'none',
      fontWeight: 500,
      fontSize: 16,
    }}
  >
    Mi perfil
  </Button>

  <MenuAdmin
    anchorEl={anclaPerfil}
    onClose={() => setAnclaPerfil(null)}
    onNavegar={irA}
    onCerrarSesion={handleCerrarSesion}
  />
</>
    </Box>

    {/* CONTENIDO MORADO */}
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: MORADO,
        px: { xs: 2, md: 4 },
        py: 3,
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{ maxWidth: 1360, mx: 'auto' }}>


        {/* ENCABEZADO */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Typography
            variant="h4"
            sx={{
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: { xs: 27, md: 34 },
            }}
          >
            Gestión de Usuarios
          </Typography>

          <Chip
            label="Administración de usuarios"
            sx={{
              backgroundColor: '#FFFFFF',
              color: AZUL,
              fontWeight: 600,
              borderRadius: 5,
            }}
          />
        </Stack>

        <Typography
          sx={{
            color: '#FFFFFF',
            mb: 2.5,
            fontSize: 14,
          }}
        >
          Administra los clientes y emprendedores registrados en la plataforma.
        </Typography>

        {/* MENSAJES */}
        {mensaje && (
          <Alert
            severity={esError ? 'error' : 'success'}
            sx={{
              mb: 2.5,
              borderRadius: 2,
            }}
            onClose={() => setMensaje('')}
          >
            {mensaje}
          </Alert>
        )}

        {/* TARJETAS DE RESUMEN */}
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
          <Paper sx={estiloTarjeta}>
            <Stack direction="row" spacing={2} alignItems="center">
              <PeopleIcon sx={{ fontSize: 40, color: MORADO }} />

              <Box>
                <Typography color="text.secondary" variant="body2">
                  Total de usuarios
                </Typography>

                <Typography variant="h4" fontWeight={800}>
                  {usuarios.length}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper sx={estiloTarjeta}>
            <Stack direction="row" spacing={2} alignItems="center">
              <PersonIcon sx={{ fontSize: 40, color: AZUL }} />

              <Box>
                <Typography color="text.secondary" variant="body2">
                  Clientes
                </Typography>

                <Typography variant="h4" fontWeight={800} color={MORADO}>
                  {totalClientes}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper sx={estiloTarjeta}>
            <Stack direction="row" spacing={2} alignItems="center">
              <StorefrontIcon sx={{ fontSize: 40, color: AZUL }} />

              <Box>
                <Typography color="text.secondary" variant="body2">
                  Emprendedores
                </Typography>

                <Typography variant="h4" fontWeight={800} color={MORADO}>
                  {totalEmprendedores}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>

        {/* TABLA */}
        <Paper
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 3px 12px rgba(0,0,0,0.10)',
          }}
        >
          {/* CABECERA DE TABLA */}
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', md: 'center' }}
              spacing={2}
              sx={{ mb: 2.5 }}
            >
              <Typography variant="h6" fontWeight={800}>
                Usuarios registrados
              </Typography>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={abrirCrear}
                sx={estiloBoton}
              >
                Crear usuario
              </Button>
            </Stack>

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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#FFFFFF',
                },
              }}
            />
          </Box>

          {/* FILTROS */}
          <Tabs
            value={filtro}
            onChange={(_, valor) => setFiltro(valor)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              borderBottom: '1px solid #E5E7EB',
              '& .MuiTabs-indicator': {
                backgroundColor: MORADO,
                height: 3,
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
              },
              '& .Mui-selected': {
                color: MORADO,
              },
            }}
          >
            <Tab label="Todos" value="Todos" />
            <Tab label="Clientes" value="Cliente" />
            <Tab label="Emprendedores" value="Emprendedor" />
          </Tabs>

          {/* CONTENIDO DE TABLA */}
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 750 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F5F6FA' }}>
                  <TableCell sx={{ fontWeight: 800 }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>RUN</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>
                    Correo electrónico
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>
                    Tipo de usuario
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {usuariosFiltrados.map((usuario) => (
                  <TableRow
                    key={usuario.id}
                    hover
                    sx={{
                      '&:last-child td': {
                        borderBottom: 0,
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>
                      {usuario.nombre}
                    </TableCell>

                    <TableCell>{usuario.run}</TableCell>

                    <TableCell>{usuario.correo}</TableCell>

                    <TableCell>
                      <Chip
                        label={usuario.tipo}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          backgroundColor:
                            usuario.tipo === 'Cliente'
                              ? '#E4F2FF'
                              : '#E6F5EB',
                          color:
                            usuario.tipo === 'Cliente'
                              ? '#0875C9'
                              : '#218344',
                        }}
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
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">
                        No se encontraron usuarios.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* PIE DE TABLA */}
          <Box
            sx={{
              p: 2,
              borderTop: '1px solid #E5E7EB',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios.
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* DIÁLOGO CREAR / EDITAR / VER */}
      <Dialog
        open={dialogoAbierto}
        onClose={() => setDialogoAbierto(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <Box component="form" onSubmit={guardarUsuario}>
          <DialogTitle
            sx={{
              fontWeight: 800,
              color: MORADO,
              pb: 1,
            }}
          >
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
                onChange={(e) => {
                  const valor = e.target.value;

                  if (/^\s/.test(valor)) return;

                  manejarCambio(e);
                }}
                disabled={modo === 'ver'}
                required
              />

              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
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
                        fontSize: 13,
                        fontWeight: 'bold',
                      }}
                    >
                      {runValido ? 'RUN válido ✓' : 'RUN inválido X'}
                    </Typography>
                  )}
                </Stack>

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

          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={() => setDialogoAbierto(false)}
              sx={{
                color: '#666666',
                textTransform: 'none',
              }}
            >
              {modo === 'ver' ? 'Cerrar' : 'Cancelar'}
            </Button>

            {modo !== 'ver' && (
              <Button
                type="submit"
                variant="contained"
                sx={estiloBoton}
              >
                {modo === 'crear' ? 'Crear usuario' : 'Guardar cambios'}
              </Button>
            )}
          </DialogActions>
        </Box>
      </Dialog>

      {/* DIÁLOGO ELIMINAR */}
      <Dialog
        open={dialogoEliminar}
        onClose={() => setDialogoEliminar(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle fontWeight={800}>
          Eliminar usuario
        </DialogTitle>

        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar a{' '}
            <strong>{usuarioSeleccionado?.nombre}</strong>?
          </Typography>

          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            Esta acción eliminará el usuario de la lista.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setDialogoEliminar(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={eliminarUsuario}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </>
  );
}
