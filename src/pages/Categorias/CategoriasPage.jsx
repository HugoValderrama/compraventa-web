
import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Stack,
  IconButton,
  Chip,
  MenuItem,
  Alert,
  Snackbar,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import TopNavBar from "../../components/organisms/TopNavBar";

const categoriasIniciales = [
  {
    id: 1,
    nombre: "Tecnología",
    padreId: null,
    orden: 1,
    descripcion: "Productos tecnológicos y electrónicos",
    activa: true,
  },
  {
    id: 2,
    nombre: "Celulares",
    padreId: 1,
    orden: 1,
    descripcion: "Teléfonos y accesorios",
    activa: true,
  },
  {
    id: 3,
    nombre: "Computadores",
    padreId: 1,
    orden: 2,
    descripcion: "Computadores y notebooks",
    activa: true,
  },
  {
    id: 4,
    nombre: "Ropa y Vestuario",
    padreId: null,
    orden: 2,
    descripcion: "Prendas de vestir y accesorios",
    activa: true,
  },
  {
    id: 5,
    nombre: "Calzado",
    padreId: 4,
    orden: 1,
    descripcion: "Zapatos y zapatillas",
    activa: true,
  },
  {
    id: 6,
    nombre: "Ropa deportiva",
    padreId: 4,
    orden: 2,
    descripcion: "Vestuario para actividades deportivas",
    activa: true,
  },
  {
    id: 7,
    nombre: "Hogar",
    padreId: null,
    orden: 3,
    descripcion: "Artículos para el hogar",
    activa: true,
  },
];

const formularioVacio = {
  nombre: "",
  padreId: "",
  orden: 1,
  descripcion: "",
};

function CategoriasPage() {
  const [categorias, setCategorias] = useState(categoriasIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [expandidas, setExpandidas] = useState([1, 4, 7]);
  const [seleccionadaId, setSeleccionadaId] = useState(1);
  const [modoNuevo, setModoNuevo] = useState(false);
  const [formulario, setFormulario] = useState({
    ...categoriasIniciales[0],
    padreId: "",
  });
  const [mensaje, setMensaje] = useState("");

  const categoriaSeleccionada = categorias.find(
    (categoria) => categoria.id === seleccionadaId
  );

  const seleccionarCategoria = (categoria) => {
    setSeleccionadaId(categoria.id);
    setModoNuevo(false);
    setFormulario({
      ...categoria,
      padreId: categoria.padreId ?? "",
    });
  };

  const nuevaCategoria = () => {
    setModoNuevo(true);
    setSeleccionadaId(null);
    setFormulario({ ...formularioVacio });
  };

  const cancelar = () => {
    if (categoriaSeleccionada) {
      seleccionarCategoria(categoriaSeleccionada);
    } else {
      setModoNuevo(false);
      setFormulario({ ...formularioVacio });
    }
  };

  const cambiarCampo = (campo, valor) => {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  const guardar = () => {
    const nombre = formulario.nombre.trim();
    const descripcion = formulario.descripcion.trim();
    const orden = Number(formulario.orden);
    const padreId =
      formulario.padreId === ""
        ? null
        : Number(formulario.padreId);

    if (!nombre) {
      setMensaje("Debes ingresar un nombre para la categoría.");
      return;
    }

    if (!Number.isInteger(orden) || orden < 1) {
      setMensaje("El orden debe ser un número entero mayor que cero.");
      return;
    }

    const nombreDuplicado = categorias.some(
      (categoria) =>
        categoria.id !== seleccionadaId &&
        categoria.padreId === padreId &&
        categoria.nombre.toLowerCase() === nombre.toLowerCase()
    );

    if (nombreDuplicado) {
      setMensaje("Ya existe una categoría con ese nombre en este nivel.");
      return;
    }

    if (modoNuevo) {
      const nuevoId =
        Math.max(0, ...categorias.map((categoria) => categoria.id)) + 1;

      const nueva = {
        id: nuevoId,
        nombre,
        descripcion,
        padreId,
        orden,
        activa: true,
      };

      setCategorias((anteriores) => [...anteriores, nueva]);
      seleccionarCategoria(nueva);

      if (padreId !== null) {
        setExpandidas((anteriores) => [...new Set([...anteriores, padreId])]);
      }

      console.log("[Categorías] Categoría creada:", {
        id: nuevoId,
        nombre,
      });

      setMensaje("Categoría creada correctamente.");
    } else {
      const actualizada = {
        ...categoriaSeleccionada,
        nombre,
        descripcion,
        padreId,
        orden,
      };

      setCategorias((anteriores) =>
        anteriores.map((categoria) =>
          categoria.id === seleccionadaId ? actualizada : categoria
        )
      );

      seleccionarCategoria(actualizada);

      console.log("[Categorías] Categoría actualizada:", {
        id: seleccionadaId,
        nombre,
      });

      setMensaje("Cambios guardados correctamente.");
    }
  };

  const cambiarEstado = () => {
    if (!categoriaSeleccionada) return;

    const nuevoEstado = !categoriaSeleccionada.activa;

    const actualizada = {
      ...categoriaSeleccionada,
      activa: nuevoEstado,
    };

    setCategorias((anteriores) =>
      anteriores.map((categoria) =>
        categoria.id === seleccionadaId ? actualizada : categoria
      )
    );

    seleccionarCategoria(actualizada);

    console.log("[Categorías] Estado actualizado:", {
      id: seleccionadaId,
      activa: nuevoEstado,
    });

    setMensaje(
      nuevoEstado
        ? "Categoría activada."
        : "Categoría desactivada."
    );
  };

  const alternarExpansion = (id) => {
    setExpandidas((anteriores) =>
      anteriores.includes(id)
        ? anteriores.filter((actual) => actual !== id)
        : [...anteriores, id]
    );
  };

  const coincideBusqueda = (categoria) => {
    if (!busqueda.trim()) return true;

    const termino = busqueda.toLowerCase();

    if (categoria.nombre.toLowerCase().includes(termino)) {
      return true;
    }

    return categorias.some(
      (hija) =>
        hija.padreId === categoria.id &&
        coincideBusqueda(hija)
    );
  };

  const dibujarArbol = (padreId = null, nivel = 0) => {
    return categorias
      .filter((categoria) => categoria.padreId === padreId)
      .filter(coincideBusqueda)
      .sort((a, b) => a.orden - b.orden)
      .map((categoria) => {
        const tieneHijas = categorias.some(
          (hija) => hija.padreId === categoria.id
        );

        const expandida =
          expandidas.includes(categoria.id) || busqueda.trim() !== "";

        return (
          <Box key={categoria.id}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                pl: nivel * 2,
                borderRadius: "8px",
                backgroundColor:
                  seleccionadaId === categoria.id && !modoNuevo
                    ? "#EAF3FF"
                    : "transparent",
              }}
            >
              <IconButton
                size="small"
                disabled={!tieneHijas}
                onClick={() => alternarExpansion(categoria.id)}
              >
                {tieneHijas ? (
                  expandida ? <ExpandMoreIcon /> : <ChevronRightIcon />
                ) : (
                  <Box sx={{ width: 24 }} />
                )}
              </IconButton>

              <Button
                onClick={() => seleccionarCategoria(categoria)}
                sx={{
                  flex: 1,
                  justifyContent: "flex-start",
                  textTransform: "none",
                  color: "#081A19",
                  fontWeight:
                    seleccionadaId === categoria.id ? 700 : 400,
                }}
              >
                {categoria.nombre}
              </Button>

              {!categoria.activa && (
                <Chip label="Inactiva" size="small" />
              )}
            </Box>

            {tieneHijas && expandida && dibujarArbol(categoria.id, nivel + 1)}
          </Box>
        );
      });
  };

  const idsDescendientes = (id) => {
    const hijas = categorias.filter(
      (categoria) => categoria.padreId === id
    );

    return hijas.flatMap((hija) => [
      hija.id,
      ...idsDescendientes(hija.id),
    ]);
  };

  const padresDisponibles = categorias.filter(
    (categoria) =>
      categoria.id !== seleccionadaId &&
      !(
        seleccionadaId !== null &&
        idsDescendientes(seleccionadaId).includes(categoria.id)
      )
  );

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#3026A6" }}>
      <TopNavBar />

      <Box sx={{ maxWidth: "1250px", mx: "auto", p: { xs: 2, md: 4 } }}>
        <Typography
          variant="h4"
          sx={{ color: "#FFFFFF", fontWeight: "bold", mb: 3 }}
        >
          Gestión de Categorías
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(300px, 4fr) minmax(0, 6fr)",
            },
            gap: 3,
          }}
        >
          <Paper sx={{ p: 3, borderRadius: "14px" }}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight="bold">
                Árbol de categorías
              </Typography>

              <TextField
                fullWidth
                size="small"
                placeholder="Buscar categoría..."
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <SearchIcon sx={{ color: "#B5B0B0", mr: 1 }} />
                    ),
                  },
                }}
              />

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={nuevaCategoria}
                sx={{
                  backgroundColor: "#62A7F5",
                  textTransform: "none",
                  fontWeight: "bold",
                }}
              >
                Nueva categoría
              </Button>

              <Box sx={{ maxHeight: 550, overflowY: "auto" }}>
                {dibujarArbol()}
              </Box>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: "14px" }}>
            <Stack spacing={2.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <EditOutlinedIcon sx={{ color: "#3026A6" }} />
                <Typography variant="h6" fontWeight="bold">
                  {modoNuevo ? "Nueva categoría" : "Editar categoría"}
                </Typography>
              </Stack>

              <TextField
                label="Nombre de la categoría"
                fullWidth
                required
                value={formulario.nombre}
                onChange={(event) =>
                  cambiarCampo("nombre", event.target.value)
                }
                slotProps={{ htmlInput: { maxLength: 50 } }}
              />

              <TextField
                select
                label="Categoría superior"
                fullWidth
                value={formulario.padreId}
                onChange={(event) =>
                  cambiarCampo("padreId", event.target.value)
                }
              >
                <MenuItem value="">Sin categoría superior</MenuItem>
                {padresDisponibles.map((categoria) => (
                  <MenuItem key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Orden"
                type="number"
                fullWidth
                value={formulario.orden}
                onChange={(event) =>
                  cambiarCampo("orden", event.target.value)
                }
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
              />

              <TextField
                label="Descripción"
                fullWidth
                multiline
                minRows={3}
                value={formulario.descripcion}
                onChange={(event) =>
                  cambiarCampo("descripcion", event.target.value)
                }
              />

              {!modoNuevo && categoriaSeleccionada && (
                <Chip
                  label={
                    categoriaSeleccionada.activa
                      ? "Categoría activa"
                      : "Categoría inactiva"
                  }
                  color={categoriaSeleccionada.activa ? "success" : "default"}
                  sx={{ alignSelf: "flex-start" }}
                />
              )}

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  variant="contained"
                  onClick={guardar}
                  sx={{
                    backgroundColor: "#62A7F5",
                    textTransform: "none",
                    fontWeight: "bold",
                  }}
                >
                  {modoNuevo ? "Crear categoría" : "Guardar cambios"}
                </Button>

                <Button
                  variant="outlined"
                  onClick={cancelar}
                  sx={{ textTransform: "none" }}
                >
                  Cancelar
                </Button>

                {!modoNuevo && categoriaSeleccionada && (
                  <Button
                    color={categoriaSeleccionada.activa ? "error" : "success"}
                    onClick={cambiarEstado}
                    sx={{ textTransform: "none" }}
                  >
                    {categoriaSeleccionada.activa
                      ? "Desactivar"
                      : "Activar"}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={Boolean(mensaje)}
        autoHideDuration={3500}
        onClose={() => setMensaje("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" onClose={() => setMensaje("")}>
          {mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CategoriasPage;
