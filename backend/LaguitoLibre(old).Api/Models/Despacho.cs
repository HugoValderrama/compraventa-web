using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Despacho
{
    public int Idseguimiento { get; set; }

    public string EmpresatransporteId { get; set; } = null!;

    public int DireccionId { get; set; }

    public string Estadoenvio { get; set; } = null!;

    public DateTime? Fechasalida { get; set; }

    public DateTime? Fechallegada { get; set; }

    public int? Costoenvioproyectado { get; set; }

    public virtual Direccion Direccion { get; set; } = null!;

    public virtual Empresatransporte Empresatransporte { get; set; } = null!;

    public virtual ICollection<Ventum> Venta { get; set; } = new List<Ventum>();
}
