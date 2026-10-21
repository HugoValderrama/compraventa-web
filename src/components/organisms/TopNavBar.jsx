
import React from "react";
import {
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Button,
  Box,
  IconButton,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import LoginIcon from "@mui/icons-material/Login";

import { useLocation, useNavigate } from "react-router-dom";

const SECTIONS = [
  { label: "Cotizaciones", path: "/cotizaciones" },
  { label: "Perfil", path: "/perfilE" },
  { label: "Productos", path: "/productos" },
  { label: "Servicios", path: "/servicios" },
  { label: "Mensajería", path: "/mensajeria" },
  { label: "Categorías", path: "/categorias" },
  { label: "Mis Preguntas", path: "/mis-preguntas" },
  { label: "Preguntas recibidas", path: "/preguntas-recibidas" },
];

export default function TopNavBar({
  showBack = false,
  onBack,
  title = "",
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const active = SECTIONS.find(
    (section) =>
      pathname === section.path ||
      pathname.startsWith(section.path + "/")
  );

  const activeSection = active ? active.label : false;

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          py: 1,
        }}
      >
        {/* Navegación izquierda */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
            maxWidth: "100%",
            flex: "1 1 420px",
          }}
        >
          {showBack && (
            <IconButton
              aria-label="Volver"
              onClick={onBack}
              size="small"
            >
              <ArrowBackIcon />
            </IconButton>
          )}

          <Box
            component="img"
            src="/logo.png"
            alt="Logo de Laguito Libre"
            sx={{
              width: 36,
              height: 36,
              objectFit: "contain",
              display: "block",
              flexShrink: 0,
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          />

          {showBack || title ? (
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: title ? 22 : 16,
                minWidth: 0,
                overflowWrap: "anywhere",
              }}
            >
              {title || (active ? active.label : "")}
            </Typography>
          ) : (
            <Tabs
              value={activeSection}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              aria-label="Secciones principales"
              slotProps={{
                indicator: {
                  sx: { display: "none" },
                },
              }}
              sx={{
                flex: 1,
                minWidth: 0,
                minHeight: 36,
                maxWidth: {
                  xs: 260,
                  sm: 450,
                  md: 650,
                  lg: 750,
                },
              }}
            >
              {SECTIONS.map((section) => (
                <Tab
                  key={section.label}
                  value={section.label}
                  label={section.label}
                  onClick={() => navigate(section.path)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    minHeight: 36,
                    borderRadius: 999,
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                    },
                  }}
                />
              ))}
            </Tabs>
          )}
        </Box>

        {/* Navegación derecha */}
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Botón de inicio de sesión */}
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={() => {
              console.log("[Navegación] Ir a inicio de sesión");
              navigate("/login");
            }}
            sx={{
              backgroundColor: "#62A7F5",
              color: "#000000",
              textTransform: "none",
              fontWeight: "bold",
              borderRadius: "8px",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#62A7F5",
                boxShadow: "none",
              },
            }}
          >
            Iniciar sesión
          </Button>

          <Button
            startIcon={<AccountCircleOutlinedIcon />}
            color="inherit"
            sx={{ textTransform: "none" }}
            onClick={() => navigate("/perfilE")}
          >
            Mi perfil
          </Button>

          <Button
            startIcon={<NotificationsNoneOutlinedIcon />}
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Notificaciones
          </Button>

          <Button
            startIcon={<ShoppingCartOutlinedIcon />}
            color="inherit"
            sx={{ textTransform: "none" }}
            onClick={() => navigate("/carrito")}
          >
            Mi carrito
          </Button>

          <Button
            startIcon={<FavoriteBorderOutlinedIcon />}
            color="inherit"
            sx={{ textTransform: "none" }}
            onClick={() => navigate("/lista-deseos")}
          >
            Lista de deseos
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
