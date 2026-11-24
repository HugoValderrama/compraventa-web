using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Telefono
{
    public int Telefono1 { get; set; }

    public string UsuarioId { get; set; } = null!;

    public virtual Usuario Usuario { get; set; } = null!;
}
