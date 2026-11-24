using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Consulta
{
    public string UsuarioId { get; set; } = null!;

    public int ProductoId { get; set; }

    public int PreguntaId { get; set; }

    public virtual Pregunta Pregunta { get; set; } = null!;

    public virtual Producto Producto { get; set; } = null!;

    public virtual Usuario Usuario { get; set; } = null!;
}
