namespace LaguitoLibre.API.DTOs.Perfil;

public class ActualizarEmpresaRequest
{
    public string Rut { get; set; } = "";
    public string RazonSocial { get; set; } = "";
    public string Giro { get; set; } = "";
    public string? PaginaWeb { get; set; }
    public string? DireccionLocal { get; set; }
}