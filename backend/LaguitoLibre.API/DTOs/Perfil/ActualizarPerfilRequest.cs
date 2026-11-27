namespace LaguitoLibre.API.DTOs.Perfil;

public class ActualizarPerfilRequest
{
    public string Nombre1 { get; set; } = "";

    public string? Nombre2 { get; set; }

    public string Apellido1 { get; set; } = "";

    public string? Apellido2 { get; set; }

    public DateOnly FechaNacimiento { get; set; }
}