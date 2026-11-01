import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Button, Paper, Grid, IconButton, Chip } from "@mui/material";
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaHeart, 
  FaRegHeart, 
  FaCommentAlt, 
  FaBell, 
  FaShoppingCart, 
  FaTools, 
  FaPaintBrush 
} from "react-icons/fa";

export default function PerfilEmprendedor() {
  const [activeTab, setActiveTab] = useState("todo");
  const [isFavorite, setIsFavorite] = useState(false);

  const colors = {
    bgPurple: "#3026A6",
    btnBlue: "#62A7F5", // Ajustado ligeramente al tono de tu captura
    btnHover: "#62A7F5",
    lightBlueBg: "#FFFFFF",
    textDark: "#081A19",
    textGray: "#B5B0B0",
    borderGray: "#FFFFFF"
  };

  return (
    <Box sx={{ bgcolor: colors.bgPurple, minHeight: "100vh", pb: 6, fontFamily: "sans-serif" }}>
      
      {/* HEADER */}
      <Box sx={{ px: { xs: 2, md: 6 }, py: 3 }}>
        <Box sx={{ maxWidth: "1200px", mx: "auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          
          {/* Logo Actualizado */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <Box sx={{ bgcolor: "white", px: 2, py: 1, borderRadius: "20px", display: "flex", alignItems: "center", gap: 1.5, boxShadow: 1 }}>
              <img 
                src="/logo.png" 
                alt="Logo Laguito Libre" 
                style={{ width: "32px", height: "32px", objectFit: "contain", borderRadius: "50%" }} 
              />
              <Typography sx={{ fontWeight: 800, color: colors.textDark, letterSpacing: 1 }}>
                LAGUITO LIBRE
              </Typography>
            </Box>
          </Link>

          {/* Nav pills */}
          <Box sx={{ bgcolor: "white", px: 3, py: 1.5, borderRadius: "30px", display: "flex", gap: 3, boxShadow: 1 }}>
            <Link to="/perfil" style={{ textDecoration: "none", color: colors.textDark, display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, fontSize: "14px" }}>
              👤 Mi perfil
            </Link>
            <Link to="/notificaciones" style={{ textDecoration: "none", color: colors.textDark, display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, fontSize: "14px" }}>
              <FaBell size={16} /> Notificaciones
            </Link>
            <Link to="/carrito" style={{ textDecoration: "none", color: colors.textDark, display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, fontSize: "14px" }}>
              <FaShoppingCart size={16} /> Mi carrito
            </Link>
            <Link to="/lista-deseos" style={{ textDecoration: "none", color: colors.textDark, display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, fontSize: "14px" }}>
              <FaHeart size={16} /> Lista de deseos
            </Link>
          </Box>
        </Box>

        {/* Migas de pan */}
        <Box sx={{ maxWidth: "1200px", mx: "auto", mt: 2, color: "#a5a0d6", fontSize: "12px", display: "flex", gap: 1 }}>
          <Link to="/" style={{ color: "#a5a0d6", textDecoration: "none" }}>Inicio</Link> / 
          <Link to="/catalogo" style={{ color: "#a5a0d6", textDecoration: "none" }}>Tiendas</Link> / 
          <span style={{ color: "white" }}>Taller Tierra</span>
        </Box>
      </Box>

      {/* CONTENIDO PRINCIPAL */}
      <Box sx={{ maxWidth: "1200px", mx: "auto", px: { xs: 2, md: 6 } }}>
        
        {/* Tarjeta de Tienda */}
        <Paper sx={{ borderRadius: "24px", p: 4, display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", mb: 4, boxShadow: 3 }}>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box sx={{ width: 100, height: 100, bgcolor: "transparent", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Typography sx={{ color: colors.btnBlue, fontWeight: 900, fontSize: "40px" }}>TT</Typography>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textDark }}>Taller Tierra</Typography>
              <Typography sx={{ color: "#a0a0a0", mt: 0.5, fontSize: "15px" }}>Cerámica artesanal de gres y experiencias para crear con las manos.</Typography>
              
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2, color: "#a0a0a0", fontSize: "13px" }}>
                <FaMapMarkerAlt /> Valparaíso, Chile • Envíos a todo Chile
              </Box>
              
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Chip label="Piezas hechas a mano" size="small" sx={{ bgcolor: "#f5f5f5", fontWeight: 600, color: "#a0a0a0" }} />
                <Chip label="Talleres presenciales" size="small" sx={{ bgcolor: "#f5f5f5", fontWeight: 600, color: "#a0a0a0" }} />
                <Chip label="A pedido" size="small" sx={{ bgcolor: "#f5f5f5", fontWeight: 600, color: "#a0a0a0" }} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "flex-start", md: "flex-end" }, mt: { xs: 3, md: 0 }, minWidth: "250px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>4,8 / 5</Typography>
              <Box sx={{ color: "#ffb400", display: "flex", gap: 0.5 }}>
                {[...Array(5)].map((_, i) => <FaStar key={i} />)}
              </Box>
            </Box>
            <Typography sx={{ fontSize: "12px", color: colors.btnBlue, mt: 0.5, fontWeight: 600 }}>
              <span style={{ color: "#a0a0a0", fontWeight: 400 }}>24 calificaciones ·</span> Ver opiniones
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mt: "auto", pt: 3, width: "100%" }}>
              <Button variant="contained" fullWidth sx={{ bgcolor: colors.btnBlue, '&:hover': { bgcolor: colors.btnHover }, borderRadius: "12px", textTransform: "none", fontWeight: 700, gap: 1, py: 1, boxShadow: "none" }}>
                <FaCommentAlt /> Contactar tienda
              </Button>
              <IconButton onClick={() => setIsFavorite(!isFavorite)} sx={{ border: `1px solid ${colors.borderGray}`, borderRadius: "12px", color: isFavorite ? "red" : "#a0a0a0", bgcolor: isFavorite ? "#fff0f0" : "transparent" }}>
                {isFavorite ? <FaHeart /> : <FaRegHeart />}
              </IconButton>
            </Box>
          </Box>
        </Paper>

        {/* Catálogo */}
        <Paper sx={{ borderRadius: "24px", p: 4, boxShadow: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: colors.textDark }}>Catálogo de la tienda</Typography>
            <Typography sx={{ color: "#a0a0a0", fontSize: "13px" }}>3 ofertas disponibles</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, mb: 4 }}>
            {["todo", "productos", "servicios"].map((tab) => (
              <Button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                sx={{ 
                  bgcolor: activeTab === tab ? colors.btnBlue : "transparent", 
                  color: activeTab === tab ? "white" : colors.btnBlue,
                  borderRadius: "20px", textTransform: "none", fontWeight: 700, px: 3,
                  '&:hover': { bgcolor: activeTab === tab ? colors.btnHover : colors.lightBlueBg }
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === "todo" ? "(3)" : tab === "productos" ? "(1)" : "(2)"}
              </Button>
            ))}
          </Box>

          <Grid container spacing={3}>
            {/* Florero */}
            {(activeTab === "todo" || activeTab === "productos") && (
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ border: `1px solid ${colors.borderGray}`, borderRadius: "16px", overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
                  <Box sx={{ position: "relative", height: 200, bgcolor: "#f0f0f0" }}>
                    <img src="https://images.unsplash.com/photo-1612196808214-b8e1a6145a5c?auto=format&fit=crop&w=600&q=80" alt="Florero" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <Chip label="Producto · -20%" sx={{ position: "absolute", top: 10, right: 10, bgcolor: "white", fontWeight: 800, color: colors.btnBlue, boxShadow: 1 }} />
                  </Box>
                  <Box sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "18px" }}>Florero Gres Silvestre</Typography>
                    <Typography sx={{ color: "#a0a0a0", fontSize: "13px", mt: 1, flexGrow: 1 }}>Gres artesanal · Tamaños S, M y L<br/>Disponible para envío</Typography>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 2, mb: 3 }}>
                      <Typography sx={{ color: colors.btnBlue, fontWeight: 900, fontSize: "22px" }}>$19.990</Typography>
                      <Typography sx={{ color: "#a0a0a0", textDecoration: "line-through", fontSize: "14px" }}>$24.990</Typography>
                    </Box>
                    <Button variant="contained" fullWidth sx={{ bgcolor: colors.btnBlue, borderRadius: "10px", fontWeight: 700, textTransform: "none", py: 1.2, boxShadow: "none" }}>Ver producto</Button>
                  </Box>
                </Box>
              </Grid>
            )}

            {/* Taller Inicial */}
            {(activeTab === "todo" || activeTab === "servicios") && (
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ border: `1px solid ${colors.borderGray}`, borderRadius: "16px", overflow: "hidden", height: "100%", display: "flex", flexDirection: "column", bgcolor: "#fcfcff" }}>
                  <Box sx={{ position: "relative", height: 200, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <FaTools size={50} color={colors.btnBlue} opacity={0.3} />
                    <Chip label="Servicio · Presencial" sx={{ position: "absolute", top: 10, right: 10, bgcolor: "white", fontWeight: 800, color: colors.btnBlue, boxShadow: 1 }} />
                  </Box>
                  <Box sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "18px" }}>Taller de cerámica inicial</Typography>
                    <Typography sx={{ color: "#a0a0a0", fontSize: "13px", mt: 1, flexGrow: 1 }}>Presencial · Valparaíso · 2 horas<br/>Sábados · 6 cupos por sesión</Typography>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 2, mb: 3 }}>
                      <Typography sx={{ color: colors.btnBlue, fontWeight: 900, fontSize: "22px" }}>$35.000 / persona</Typography>
                    </Box>
                    <Button variant="contained" fullWidth sx={{ bgcolor: colors.btnBlue, borderRadius: "10px", fontWeight: 700, textTransform: "none", py: 1.2, boxShadow: "none" }}>Ver taller</Button>
                  </Box>
                </Box>
              </Grid>
            )}

            {/* Cerámica Personalizada */}
            {(activeTab === "todo" || activeTab === "servicios") && (
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ border: `1px solid ${colors.borderGray}`, borderRadius: "16px", overflow: "hidden", height: "100%", display: "flex", flexDirection: "column", bgcolor: "#fcfcff" }}>
                  <Box sx={{ position: "relative", height: 200, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <FaPaintBrush size={50} color={colors.btnBlue} opacity={0.3} />
                    <Chip label="Servicio · A pedido" sx={{ position: "absolute", top: 10, right: 10, bgcolor: "white", fontWeight: 800, color: colors.btnBlue, boxShadow: 1 }} />
                  </Box>
                  <Box sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "18px" }}>Cerámica personalizada</Typography>
                    <Typography sx={{ color: "#a0a0a0", fontSize: "13px", mt: 1, flexGrow: 1 }}>A pedido · Envíos a Chile<br/>Entrega en 10 días</Typography>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 2, mb: 3 }}>
                      <Typography sx={{ color: colors.btnBlue, fontWeight: 900, fontSize: "22px" }}>Desde $25.000</Typography>
                    </Box>
                    <Button variant="contained" fullWidth sx={{ bgcolor: colors.btnBlue, borderRadius: "10px", fontWeight: 700, textTransform: "none", py: 1.2, boxShadow: "none" }}>Solicitar cotización</Button>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
          
          <Typography sx={{ textAlign: "center", color: "#a0a0a0", fontSize: "12px", mt: 4, pt: 3 }}>
            Precios en pesos chilenos (CLP) · Consulta a Taller Tierra antes de encargar una pieza personalizada.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}