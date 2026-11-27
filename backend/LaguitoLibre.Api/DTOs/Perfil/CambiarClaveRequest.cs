namespace LaguitoLibre.Api.DTOs.Perfil;

public class CambiarClaveRequest
{
    public string Actual { get; set; } = "";
    public string Nueva { get; set; } = "";
    public string Confirmacion { get; set; } = "";
}