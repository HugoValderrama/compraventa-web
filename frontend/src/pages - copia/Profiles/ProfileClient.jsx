import { useNavigate } from "react-router-dom";
import {
    Avatar,
    Box,
    Button,
    Container,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import TopNavBar from "../../components/organisms/TopNavBar";

function Pantalla({ children }) {
    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#3026A6" }}>
            <TopNavBar activeSection="" />

            <Container maxWidth="md" sx={{ py: 3 }}>
                {children}
            </Container>
        </Box>
    );
}

export default function ProfileClient() {
    const navigate = useNavigate();

    return (
        <Pantalla>
            <Typography variant="h5" sx={{ color: "white", mb: 3 }}>
                Mi perfil
            </Typography>

            <Paper sx={{ p: 3, mb: 6 }}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={3}
                    alignItems={{ xs: "center", sm: "flex-start" }}
                >
                    <Avatar
                        variant="rounded"
                        sx={{
                            width: 140,
                            height: 140,
                            bgcolor: "grey.500",
                            fontSize: "54px",
                        }}
                    >
                    </Avatar>

                    <Stack spacing={1} sx={{ flex: 1, width: "100%" }}>
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={{ xs: 0.5, md: 4 }}
                        >
                            <Typography sx={{ fontWeight: 600 }}>
                                RUN:
                            </Typography>

                            <Typography sx={{ fontWeight: 600 }}>
                                Birthday:
                            </Typography>

                            <Typography sx={{ fontWeight: 600 }}>
                                Registro:
                            </Typography>
                        </Stack>

                        <Typography variant="h6">
                            Name1, Name2, LastName1, LastName2
                        </Typography>

                        <Typography>
                            <strong>Email:</strong> correo@ejemplo.cl
                        </Typography>

                        <Typography>
                            <strong>Dirección:</strong> Current_Address
                        </Typography>
                    </Stack>


                    <Button
                        variant="contained"
                        onClick={() => navigate("/direcciones")}
                        sx={{ whiteSpace: "nowrap" }}
                    >
                        Ver mis direcciones
                    </Button>
                </Stack>


                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    justifyContent="space-between"
                    flexWrap="wrap"
                    sx={{ mt: 3 }}
                >
                    <Button
                        variant="contained"
                        onClick={() => navigate("/perfil/editar")}
                    >
                        Editar perfil
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() => navigate("/telefonos")}
                    >
                        Teléfonos
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() => navigate("/correos")}
                    >
                        Correos
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() => navigate("/cambiar-contrasena")}
                    >
                        Cambiar contraseña
                    </Button>
                </Stack>
            </Paper>


            <Paper sx={{ p: 3, maxWidth: 700, mx: "auto" }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "1fr 1fr",
                        },
                        gap: 3,
                    }}
                >
                    <Button
                        variant="contained"
                        onClick={() => navigate("/compras")}
                    >
                        Mis compras
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() => navigate("/mensajeria")}
                    >
                        Mensajería
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() => navigate("/cotizaciones")}
                    >
                        Mis cotizaciones
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() => navigate("/preguntas")}
                    >
                        Mis preguntas
                    </Button>
                </Box>
            </Paper>
        </Pantalla>
    );
}