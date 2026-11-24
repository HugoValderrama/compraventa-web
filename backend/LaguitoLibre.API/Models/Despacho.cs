using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("despacho")]
	public class Despacho
	{
		[Key]
		public int idseguimiento { get; set; }

		public int empresatransporte_id { get; set; }
		[ForeignKey("empresatransporte_id")]
		public EmpresaTransporte? EmpresaTransporte { get; set; }

		public int direccion_id { get; set; }
		[ForeignKey("direccion_id")]
		public Direccion? Direccion { get; set; }
		
		public string estadoenvio { get; set; }
		
		public DateOnly fechasalida { get; set; }

		public DateOnly fechallegada { get; set; }
		
		public int costoenvioproyectado { get; set; }
	}
}
