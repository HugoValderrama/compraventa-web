namespace LaguitoLibre.Api.DTOs.Auth;

public class LoginRequest
{
    public string Run { get; set; } = "";

    public string Clave { get; set; } = "";

    public string Rol { get; set; } = "";
}