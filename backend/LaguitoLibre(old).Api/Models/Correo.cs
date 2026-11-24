using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Correo
{
    public string Correo1 { get; set; } = null!;

    public string UsuarioId { get; set; } = null!;

    public virtual Usuario Usuario { get; set; } = null!;
}
