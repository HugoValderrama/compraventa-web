namespace LaguitoLibre.Api.DTOs.Auth;

public class RegistroRequest
{
    public string Run { get; set; } = "";

    public string Nombre1 { get; set; } = "";

    public string? Nombre2 { get; set; }

    public string Apellido1 { get; set; } = "";

    public string? Apellido2 { get; set; }

    public string Correo { get; set; } = "";

    public string Telefono { get; set; } = "";

    public DateOnly Fechanac { get; set; }

    public string Clave { get; set; } = "";

    public string ConfirmarClave { get; set; } = "";

    public string Rol { get; set; } = "";

    public bool AceptaTerminos { get; set; }
}