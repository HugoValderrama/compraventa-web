namespace LaguitoLibre.Api.DTOs.Perfil;

public class RegistrarEmpresaRequest
{
    public string Rut { get; set; } = "";
    public string RazonSocial { get; set; } = "";
    public string Giro { get; set; } = "";
    public string? PaginaWeb { get; set; }
    public string? DireccionLocal { get; set; }
}